import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { WorkSession, WorkLogStatus, WorkSessionStatus } from '@prisma/client';

@Injectable()
export class SessionsService {
    constructor(private prisma: PrismaService) { }

    async startSession(workerId: string, projectId: string, category: string): Promise<WorkSession> {
        // Check if there is already an active or paused session
        const activeSession = await this.prisma.workSession.findFirst({
            where: {
                workerId,
                status: { in: [WorkSessionStatus.ACTIVE, WorkSessionStatus.PAUSED] },
                endTime: null
            },
        });

        // If an active session exists, hard delete it (discarding previous work)
        if (activeSession) {
            await this.prisma.workSession.delete({
                where: { id: activeSession.id },
            });
        }

        // Verify project assignment
        const assignment = await this.prisma.projectAssignment.findUnique({
            where: { projectId_workerId: { projectId, workerId } },
        });
        if (!assignment) throw new BadRequestException('You are not assigned to this project');

        // Check for unsigned-off / rejected work logs for this project in the SAME category
        const pendingLogs = await this.prisma.workLog.findFirst({
            where: {
                workSession: {
                    workerId,
                    projectId,
                    category,
                },
                status: WorkLogStatus.PENDING,
            },
        });

        if (pendingLogs) {
            throw new BadRequestException(`You have pending work logs for this project in the "${category}" category that must be signed off before starting a new session in this category.`);
        }

        return this.prisma.workSession.create({
            data: {
                workerId,
                projectId,
                category,
                status: WorkSessionStatus.ACTIVE,
                startTime: new Date(),
                date: new Date(),
            },
        });
    }

    async pauseSession(workerId: string): Promise<WorkSession> {
        const activeSession = await this.prisma.workSession.findFirst({
            where: { workerId, status: WorkSessionStatus.ACTIVE, endTime: null },
        });
        if (!activeSession) throw new NotFoundException('No active session found to pause');

        await this.prisma.workSessionPause.create({
            data: {
                workSessionId: activeSession.id,
                pauseTime: new Date(),
            },
        });

        return this.prisma.workSession.update({
            where: { id: activeSession.id },
            data: { status: WorkSessionStatus.PAUSED },
        });
    }

    async resumeSession(workerId: string): Promise<WorkSession> {
        const pausedSession = await this.prisma.workSession.findFirst({
            where: { workerId, status: WorkSessionStatus.PAUSED, endTime: null },
            include: { pauses: { where: { resumeTime: null }, orderBy: { pauseTime: 'desc' }, take: 1 } },
        });
        if (!pausedSession) throw new NotFoundException('No paused session found to resume');

        const latestPause = pausedSession.pauses[0];
        const now = new Date();
        if (latestPause) {
            const durationMs = now.getTime() - latestPause.pauseTime.getTime();
            const durationMinutes = Math.round(durationMs / 60000);

            await this.prisma.workSessionPause.update({
                where: { id: latestPause.id },
                data: {
                    resumeTime: now,
                    durationMinutes: durationMinutes,
                },
            });
        }

        return this.prisma.workSession.update({
            where: { id: pausedSession.id },
            data: { status: WorkSessionStatus.ACTIVE },
        });
    }

    async endSession(workerId: string): Promise<WorkSession> {
        const session = await this.prisma.workSession.findFirst({
            where: {
                workerId,
                status: { in: [WorkSessionStatus.ACTIVE, WorkSessionStatus.PAUSED] },
                endTime: null
            },
            include: { pauses: true },
        });
        if (!session) throw new NotFoundException('No active session found');

        const endTime = new Date();

        // If it was paused, close the last pause interval first
        if (session.status === WorkSessionStatus.PAUSED) {
            const latestPause = session.pauses.find(p => !p.resumeTime);
            if (latestPause) {
                const durationMs = endTime.getTime() - latestPause.pauseTime.getTime();
                await this.prisma.workSessionPause.update({
                    where: { id: latestPause.id },
                    data: {
                        resumeTime: endTime,
                        durationMinutes: Math.round(durationMs / 60000),
                    },
                });
            }
        }

        // Fetch all pauses to calculate total pause time
        const allPauses = await this.prisma.workSessionPause.findMany({
            where: { workSessionId: session.id },
        });

        const totalPauseMinutes = allPauses.reduce((acc, p) => acc + (p.durationMinutes || 0), 0);
        const totalElapsedMinutes = Math.round((endTime.getTime() - session.startTime.getTime()) / 60000);
        const actualWorkMinutes = Math.max(0, totalElapsedMinutes - totalPauseMinutes);

        return this.prisma.workSession.update({
            where: { id: session.id },
            data: {
                endTime,
                totalMinutes: actualWorkMinutes,
                status: WorkSessionStatus.COMPLETED,
            },
        });
    }

    async getWorkHistory(workerId: string): Promise<WorkSession[]> {
        return this.prisma.workSession.findMany({
            where: { workerId },
            include: {
                project: true,
                workLogs: {
                    include: {
                        photos: true
                    }
                }
            },
            orderBy: { startTime: 'desc' },
        });
    }

    async discardActiveSession(workerId: string): Promise<{ message: string }> {
        const activeSession = await this.prisma.workSession.findFirst({
            where: {
                workerId,
                status: { in: [WorkSessionStatus.ACTIVE, WorkSessionStatus.PAUSED] },
                endTime: null
            },
        });

        if (!activeSession) {
            throw new NotFoundException('No active session found to discard');
        }

        await this.prisma.workSession.delete({
            where: { id: activeSession.id },
        });

        return { message: 'Session discarded successfully' };
    }
}
