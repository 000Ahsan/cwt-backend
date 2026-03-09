import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { WorkSession, WorkLogStatus } from '@prisma/client';

@Injectable()
export class SessionsService {
    constructor(private prisma: PrismaService) { }

    async startSession(workerId: string, projectId: string): Promise<WorkSession> {
        // Check if there is already an active session
        const activeSession = await this.prisma.workSession.findFirst({
            where: { workerId, endTime: null },
        });

        // If an active session exists, hard delete it
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

        // Check for unsigned-off / rejected work logs for this project
        // Requirement: Until one work log of a project of a worker is not signed off, he should not be able to start the session again.
        const pendingLogs = await this.prisma.workLog.findFirst({
            where: {
                workSession: {
                    workerId,
                    projectId,
                },
                OR: [
                    { status: WorkLogStatus.PENDING },
                ],
            },
        });

        if (pendingLogs) {
            throw new BadRequestException('You have pending work logs for this project that must be signed off by the contractor before starting a new session.');
        }

        return this.prisma.workSession.create({
            data: {
                workerId,
                projectId,
                startTime: new Date(),
                date: new Date(), // Stored as DATE in DB (UTC day)
            },
        });
    }

    async endSession(workerId: string): Promise<WorkSession> {
        const activeSession = await this.prisma.workSession.findFirst({
            where: { workerId, endTime: null },
        });
        if (!activeSession) throw new NotFoundException('No active session found');

        const endTime = new Date();
        const totalMinutes = Math.round((endTime.getTime() - activeSession.startTime.getTime()) / 60000);

        return this.prisma.workSession.update({
            where: { id: activeSession.id },
            data: {
                endTime,
                totalMinutes,
            },
        });
    }

    async getWorkHistory(workerId: string): Promise<WorkSession[]> {
        return this.prisma.workSession.findMany({
            where: { workerId },
            include: { project: true, workLogs: true },
            orderBy: { startTime: 'desc' },
        });
    }

    async discardActiveSession(workerId: string): Promise<{ message: string }> {
        const activeSession = await this.prisma.workSession.findFirst({
            where: { workerId, endTime: null },
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
