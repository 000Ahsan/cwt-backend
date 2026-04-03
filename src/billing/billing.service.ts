import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { GenerateContractorBillingDto } from './dto/generate-contractor-billing.dto';
import { BillingType, BillingStatus, WorkLogStatus, Prisma } from '@prisma/client';

@Injectable()
export class BillingService {
    constructor(private prisma: PrismaService) {}

    async getBillingRecords(contractorId: string, filters: any) {
        const { workerId, projectId, status, billingType, startDate, endDate, page = 1, limit = 20 } = filters;
        
        const where: Prisma.BillingWhereInput = {
            worker: { contractorId },
            ...(workerId && { workerId }),
            ...(projectId && { projectId }),
            ...(status && { status }),
            ...(billingType && { billingType }),
            ...(startDate || endDate ? {
                date: {
                    ...(startDate && { gte: new Date(startDate) }),
                    ...(endDate && { lte: new Date(endDate) }),
                }
            } : {})
        };

        const skip = (page - 1) * limit;

        const [total, data] = await Promise.all([
            this.prisma.billing.count({ where }),
            this.prisma.billing.findMany({
                where,
                include: {
                    worker: { select: { id: true, name: true } },
                    project: { select: { id: true, name: true } },
                    workCategory: { select: { id: true, name: true } },
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

    async getStats(contractorId: string) {
        const stats = await this.prisma.billing.groupBy({
            by: ['status', 'billingType'],
            where: { worker: { contractorId } },
            _sum: { amount: true }
        });

        let totalDue = 0;
        let totalPaid = 0;
        let totalProjectBilling = 0;
        let totalContractorBilling = 0;

        for (const stat of stats) {
            const amount = stat._sum.amount || 0;
            if (stat.status === BillingStatus.DUE) totalDue += amount;
            if (stat.status === BillingStatus.PAID) totalPaid += amount;
            
            if (stat.billingType === BillingType.PROJECT) totalProjectBilling += amount;
            if (stat.billingType === BillingType.CONTRACTOR) totalContractorBilling += amount;
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
        if (billing.worker.contractorId !== contractorId) throw new BadRequestException('Unauthorized');

        return this.prisma.billing.update({
            where: { id },
            data: {
                status: BillingStatus.PAID,
                paidAt: new Date()
            }
        });
    }

    async calculateContractorBillingPreview(contractorId: string, dto: GenerateContractorBillingDto) {
        const { workerId, startDate, endDate } = dto;
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        // Check if already generated
        const existing = await this.prisma.billing.findFirst({
            where: {
                workerId,
                billingType: BillingType.CONTRACTOR,
                date: { gte: start, lte: end }
            }
        });

        if (existing) {
            throw new BadRequestException('Contractor billing already generated for a date in this range.');
        }

        const worker = await this.prisma.user.findUnique({ where: { id: workerId } });
        if (!worker || worker.contractorId !== contractorId) {
            throw new BadRequestException('Worker not found or unauthorized');
        }

        const defaultRate = worker.defaultHourlyRate || 0;

        // Get Attendance Hours
        const attendances = await this.prisma.attendance.findMany({
            where: {
                userId: workerId,
                loginTime: { gte: start, lte: end },
                logoutTime: { not: null }
            }
        });

        let totalAttendanceHours = 0;
        for (const act of attendances) {
            const ms = act.logoutTime!.getTime() - act.loginTime.getTime();
            totalAttendanceHours += ms / 3600000;
        }

        // Get Project Hours (from already generated project billings in date range)
        // Wait, the prompt says: "approved project work hours in same date range"
        const approvedBillings = await this.prisma.billing.findMany({
            where: {
                workerId,
                billingType: BillingType.PROJECT,
                date: { gte: start, lte: end }
            }
        });

        const totalProjectHours = approvedBillings.reduce((sum, b) => sum + b.hours, 0);
        let contractorHours = totalAttendanceHours - totalProjectHours;
        if (contractorHours < 0) contractorHours = 0;

        return {
            totalAttendanceHours,
            totalProjectHours,
            contractorHours,
            hourlyRate: defaultRate,
            payableAmount: contractorHours * defaultRate
        };
    }

    async generateContractorBilling(contractorId: string, dto: GenerateContractorBillingDto) {
        const preview = await this.calculateContractorBillingPreview(contractorId, dto);
        
        if (preview.contractorHours <= 0) {
            throw new BadRequestException('No remaining contractor hours to bill for this period.');
        }

        // We use the endDate as the date for this summary billing record
        const date = new Date(dto.endDate);

        return this.prisma.billing.create({
            data: {
                workerId: dto.workerId,
                billingType: BillingType.CONTRACTOR,
                hours: preview.contractorHours,
                hourlyRate: preview.hourlyRate,
                amount: preview.payableAmount,
                status: BillingStatus.DUE,
                date: date
            }
        });
    }
}
