import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { WorkLog, WorkPhoto, WorkLogStatus } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WorkLogsService {
    constructor(private prisma: PrismaService) { }

    async createLog(workerId: string, data: { sessionId: string; description: string; photos?: any[] }): Promise<any> {
        // Verify session belongs to worker and is active
        const session = await this.prisma.workSession.findUnique({
            where: { id: data.sessionId },
        });
        if (!session || session.workerId !== workerId) throw new BadRequestException('Invalid session');
        if (session.endTime) throw new BadRequestException('Cannot add logs to a closed session');

        const workLog = await this.prisma.workLog.create({
            data: {
                workSessionId: data.sessionId,
                description: data.description,
            },
        });

        if (data.photos && data.photos.length > 0) {
            for (const photo of data.photos) {
                await this.prisma.workPhoto.create({
                    data: {
                        workLogId: workLog.id,
                        filePath: photo.path.replace(/\\/g, '/'),
                        mimeType: photo.mimetype,
                        size: photo.size,
                    },
                });
            }
        }
        const logsWithPhotos = await this.prisma.workLog.findUnique({
            where: { id: workLog.id },
            include: { photos: true },
        });

        if (!logsWithPhotos) return workLog;

        return {
            ...logsWithPhotos,
            photos: logsWithPhotos.photos.map(photo => ({
                ...photo,
            })),
        };
    }

    async getWorkerLogs(workerId: string) {
        const logs = await this.prisma.workLog.findMany({
            where: {
                workSession: {
                    workerId: workerId,
                },
            },
            include: {
                workSession: {
                    include: {
                        project: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                photos: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return logs.map(log => ({
            ...log,
            photos: log.photos.map(photo => ({
                ...photo,
            })),
        }));
    }

    async getContractorLogs(
        contractorId: string,
        filters: {
            workerId?: string;
            projectId?: string;
            startDate?: string;
            endDate?: string;
            page?: number;
            limit?: number;
        },
    ) {
        const { workerId, projectId, startDate, endDate } = filters;
        const page = Math.max(1, filters.page ?? 1);
        const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
        const skip = (page - 1) * limit;

        const where: any = {
            workSession: {
                project: { contractorId },
                ...(workerId && { workerId }),
                ...(projectId && { projectId }),
                ...(startDate || endDate
                    ? {
                        date: {
                            ...(startDate && { gte: new Date(startDate) }),
                            ...(endDate && { lte: new Date(endDate) }),
                        },
                    }
                    : {}),
            },
        };

        const [total, logs] = await Promise.all([
            this.prisma.workLog.count({ where }),
            this.prisma.workLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    photos: true,
                    workSession: {
                        include: {
                            worker: { select: { id: true, name: true, email: true } },
                            project: { select: { id: true, name: true } },
                        },
                    },
                },
            }),
        ]);

        return {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            data: logs.map(log => ({
                ...log,
                photos: log.photos.map(photo => ({
                    ...photo,
                    url: photo.filePath.replace('./', '/').replace(/\\/g, '/'),
                })),
            })),
        };
    }
    async signOffLog(contractorId: string, logId: string, data: { status: WorkLogStatus; comment?: string }) {
        const log = await this.prisma.workLog.findUnique({
            where: { id: logId },
            include: {
                workSession: {
                    include: {
                        project: true,
                    },
                },
            },
        });

        if (!log) throw new NotFoundException('Work log not found');
        if (log.workSession.project.contractorId !== contractorId) {
            throw new ForbiddenException('You do not have permission to sign off this work log');
        }

        return this.prisma.workLog.update({
            where: { id: logId },
            data: {
                status: data.status,
                contractorComment: data.comment,
            },
        });
    }
}
