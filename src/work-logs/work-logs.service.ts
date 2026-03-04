import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { WorkLog, WorkPhoto } from '@prisma/client';
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
}
