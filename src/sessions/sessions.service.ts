import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { WorkSession } from '@prisma/client';

@Injectable()
export class SessionsService {
    constructor(private prisma: PrismaService) { }

    async startSession(workerId: string, projectId: string): Promise<WorkSession> {
        // Check if there is already an active session
        const activeSession = await this.prisma.workSession.findFirst({
            where: { workerId, endTime: null },
        });
        if (activeSession) throw new BadRequestException('You already have an active session');

        // Verify project assignment
        const assignment = await this.prisma.projectAssignment.findUnique({
            where: { projectId_workerId: { projectId, workerId } },
        });
        if (!assignment) throw new BadRequestException('You are not assigned to this project');

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
}
