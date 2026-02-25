import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }

    async getDailyReport(contractorId: string, date: Date) {
        const startOfDay = new Date(date.setUTCHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setUTCHours(23, 59, 59, 999));

        return this.prisma.workSession.findMany({
            where: {
                project: { contractorId },
                startTime: { gte: startOfDay, lte: endOfDay },
            },
            include: {
                worker: { select: { name: true, email: true } },
                project: { select: { name: true } },
                workLogs: { include: { photos: true } },
            },
            orderBy: { startTime: 'asc' },
        });
    }

    async getWeeklyReport(contractorId: string, startDate: Date) {
        const endDate = new Date(startDate);
        endDate.setUTCDate(startDate.getUTCDate() + 7);

        return this.prisma.workSession.findMany({
            where: {
                project: { contractorId },
                startTime: { gte: startDate, lte: endDate },
            },
            include: {
                worker: { select: { id: true, name: true } },
                project: { select: { id: true, name: true } },
            },
            orderBy: { startTime: 'asc' },
        });
    }
}
