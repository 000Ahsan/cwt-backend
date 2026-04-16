import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { GenerateContractorBillingDto } from './dto/generate-contractor-billing.dto';
import { BillingStatus, WorkLogStatus, Prisma } from '@prisma/client';

@Injectable()
export class BillingService {
    constructor(private prisma: PrismaService) {}

    async getBillingRecords(contractorId: string, filters: any) {
        const { workerId, status, startDate, endDate, page = 1, limit = 20 } = filters;
        
        const where: any = {
            worker: { contractorId: contractorId }
        };

        if (workerId) where.workerId = workerId;
        if (status) where.status = status;

        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }

        const skip = (page - 1) * limit;

        const [total, data] = await Promise.all([
            this.prisma.billing.count({ where }),
            this.prisma.billing.findMany({
                where,
                include: {
                    worker: { select: { id: true, name: true } },
                },
                skip,
                take: Number(limit),
                orderBy: { date: 'desc' }
            })
        ]);

        return {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
            data
        };
    }

    async getStats(contractorId: string, filters: any = {}) {
        const { workerId, status, startDate, endDate } = filters;
        
        const where: any = {
            worker: { contractorId: contractorId }
        };

        if (workerId) where.workerId = workerId;
        if (status) where.status = status;

        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }

        const billings = await this.prisma.billing.findMany({
            where,
            select: {
                projectTotal: true,
                contractorTotal: true,
                grandTotal: true,
                status: true,
            }
        });

        let totalDue = 0;
        let totalPaid = 0;
        let totalProjectBilling = 0;
        let totalContractorBilling = 0;

        for (const billing of billings) {
            const amount = billing.grandTotal || 0;
            if (billing.status === BillingStatus.DUE) totalDue += amount;
            if (billing.status === BillingStatus.PAID) totalPaid += amount;
            
            totalProjectBilling += (billing.projectTotal || 0);
            totalContractorBilling += (billing.contractorTotal || 0);
        }

        return {
            totalDue,
            totalPaid,
            totalProjectBilling,
            totalContractorBilling
        };
    }

    async markPaid(id: string, contractorId: string) {
        const billing = await this.prisma.billing.findUnique({
            where: { id },
            include: { worker: true }
        });

        if (!billing) throw new NotFoundException('Billing record not found');
        if (billing.worker.contractorId !== contractorId) throw new ForbiddenException('Unauthorized');

        return this.prisma.billing.update({
            where: { id },
            data: {
                status: BillingStatus.PAID,
                paidAt: new Date()
            }
        });
    }

    async getBatchBillingPreview(contractorId: string, dto: GenerateContractorBillingDto) {
        const { workerId, startDate, endDate } = dto;
        const start = new Date(startDate);
        const adjustedEnd = new Date(endDate);
        adjustedEnd.setHours(23, 59, 59, 999);

        const worker = await this.prisma.user.findUnique({ 
            where: { id: workerId },
            include: { contractor: true }
        });
        
        if (!worker || (worker.contractorId !== contractorId && worker.id !== contractorId)) {
            throw new BadRequestException('Worker not found or unauthorized');
        }

        const defaultRate = worker.defaultHourlyRate || 0;

        // 1. Get ALL approved work logs in range that are not yet billed
        const unbilledLogs = await this.prisma.workLog.findMany({
            where: {
                workSession: {
                    workerId,
                    date: { gte: start, lte: adjustedEnd }
                },
                status: WorkLogStatus.APPROVED,
                billingId: null
            },
            include: {
                workSession: {
                    include: {
                        project: true,
                        workCategory: true
                    }
                }
            }
        });

        const projectSummary: any[] = [];
        let totalProjectHours = 0;
        let totalProjectAmount = 0;

        const grouping: Record<string, any> = {};

        for (const log of unbilledLogs) {
            const hours = (log.workSession.totalMinutes || 0) / 60;
            const rate = log.workSession.hourlyRateAtTime || 0;
            const amount = hours * rate;
            
            const key = `${log.workSession.projectId}-${log.workSession.workCategoryId}`;
            if (!grouping[key]) {
                grouping[key] = {
                    projectId: log.workSession.projectId,
                    projectName: log.workSession.project.name,
                    categoryId: log.workSession.workCategoryId,
                    categoryName: log.workSession.workCategory?.name || 'Uncategorized',
                    hours: 0,
                    amount: 0
                };
            }
            grouping[key].hours += hours;
            grouping[key].amount += amount;
            totalProjectHours += hours;
            totalProjectAmount += amount;
        }

        for (const key in grouping) {
            projectSummary.push(grouping[key]);
        }

        // 2. Calculate Contractor Hours
        const attendances = await this.prisma.attendance.findMany({
            where: {
                userId: workerId,
                loginTime: { gte: start, lte: adjustedEnd },
                logoutTime: { not: null }
            }
        });

        let totalAttendanceHours = 0;
        for (const act of attendances) {
            const ms = act.logoutTime!.getTime() - act.loginTime.getTime();
            totalAttendanceHours += ms / 3600000;
        }

        const allProjectSessionsInRange = await this.prisma.workSession.findMany({
            where: {
                workerId,
                date: { gte: start, lte: adjustedEnd }
            }
        });
        const totalProjectHoursInRange = allProjectSessionsInRange.reduce((sum, s) => sum + ((s.totalMinutes || 0) / 60), 0);

        let contractorHours = totalAttendanceHours - totalProjectHoursInRange;
        if (contractorHours < 0) contractorHours = 0;
        const contractorAmount = contractorHours * defaultRate;

        return {
            workerName: worker.name,
            startDate,
            endDate,
            projectSummary,
            totalProjectHours,
            totalProjectAmount,
            contractorHours,
            contractorRate: defaultRate,
            contractorAmount,
            totalPayable: totalProjectAmount + contractorAmount,
            unbilledLogIds: unbilledLogs.map(l => l.id)
        };
    }

    async createBatchBilling(contractorId: string, dto: GenerateContractorBillingDto) {
        const preview = await this.getBatchBillingPreview(contractorId, dto);
        
        if (preview.totalPayable <= 0) {
            throw new BadRequestException('No unbilled work or contractor hours found for this period.');
        }

        const billing = await this.prisma.billing.create({
            data: {
                workerId: dto.workerId,
                projectHours: preview.totalProjectHours,
                contractorHours: preview.contractorHours,
                projectTotal: preview.totalProjectAmount,
                contractorTotal: preview.contractorAmount,
                grandTotal: preview.totalPayable,
                status: BillingStatus.DUE,
                date: new Date(dto.endDate),
            }
        });

        if (preview.unbilledLogIds.length > 0) {
            await this.prisma.workLog.updateMany({
                where: {
                    id: { in: preview.unbilledLogIds }
                },
                data: {
                    billingId: billing.id
                }
            });
        }

        return billing;
    }

    async getBillingDetails(id: string, contractorId: string) {
        const billing = await this.prisma.billing.findUnique({
            where: { id },
            include: {
                worker: true,
                workLogs: {
                    include: {
                        workSession: {
                            include: {
                                project: true,
                                workCategory: true
                            }
                        }
                    }
                }
            }
        });

        if (!billing) throw new NotFoundException('Billing record not found');
        if (billing.worker.contractorId !== contractorId) throw new ForbiddenException('Unauthorized');

        const projectSummary: any[] = [];
        const grouping: Record<string, any> = {};

        for (const log of billing.workLogs) {
            const hours = (log.workSession.totalMinutes || 0) / 60;
            const rate = log.workSession.hourlyRateAtTime || 0;
            const amount = hours * rate;
            
            const key = `${log.workSession.projectId}-${log.workSession.workCategoryId}`;
            if (!grouping[key]) {
                grouping[key] = {
                    projectName: log.workSession.project.name,
                    categoryName: log.workSession.workCategory?.name || 'Uncategorized',
                    hours: 0,
                    rate: rate,
                    amount: 0
                };
            }
            grouping[key].hours += hours;
            grouping[key].amount += amount;
        }

        for (const key in grouping) {
            projectSummary.push(grouping[key]);
        }

        return {
            ...billing,
            projectSummary
        };
    }

    async deleteBilling(id: string, contractorId: string) {
        const billing = await this.prisma.billing.findUnique({
            where: { id },
            include: { worker: true }
        });

        if (!billing) throw new NotFoundException('Billing record not found');
        if (billing.worker.contractorId !== contractorId) throw new ForbiddenException('Unauthorized');
        if (billing.status === BillingStatus.PAID) throw new BadRequestException('Cannot delete a paid billing record');

        await this.prisma.workLog.updateMany({
            where: { billingId: id },
            data: { billingId: null }
        });

        return this.prisma.billing.delete({
            where: { id }
        });
    }

    async getWorkerBillings(workerId: string, filters: any) {
        const { status, startDate, endDate, page = 1, limit = 20 } = filters;
        
        const where: any = {
            workerId: workerId
        };

        if (status) where.status = status;

        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }

        const skip = (page - 1) * limit;

        const [total, data] = await Promise.all([
            this.prisma.billing.count({ where }),
            this.prisma.billing.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { date: 'desc' }
            })
        ]);

        return {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
            data
        };
    }

    async getWorkerStats(workerId: string, filters: any = {}) {
        const { status, startDate, endDate } = filters;
        
        const where: any = {
            workerId: workerId
        };

        if (status) where.status = status;

        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }

        const billings = await this.prisma.billing.findMany({
            where,
            select: {
                grandTotal: true,
                status: true,
            }
        });

        let totalDue = 0;
        let totalPaid = 0;
        let totalBillings = 0;

        for (const billing of billings) {
            const amount = billing.grandTotal || 0;
            totalBillings += amount;
            if (billing.status === BillingStatus.DUE) totalDue += amount;
            if (billing.status === BillingStatus.PAID) totalPaid += amount;
        }

        return {
            totalDue,
            totalPaid,
            totalBillings
        };
    }
}
