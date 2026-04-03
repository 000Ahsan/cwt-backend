import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { WorkLogStatus } from '@prisma/client';

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
                workCategory: { select: { name: true } },
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
                workCategory: { select: { name: true } },
            },
            orderBy: { startTime: 'asc' },
        });
    }

    async getDashboardStats(contractorId: string) {
        const [projectsCount, workersCount, timeAggregate] = await Promise.all([
            this.prisma.project.count({ where: { contractorId } }),
            this.prisma.user.count({ where: { contractorId, role: 'WORKER' } }),
            this.prisma.workSession.aggregate({
                where: {
                    project: { contractorId },
                    endTime: { not: null },
                    workLogs: {
                        some: { status: WorkLogStatus.APPROVED },
                        none: { status: { not: WorkLogStatus.APPROVED } },
                    },
                },
                _sum: { totalMinutes: true },
            }),
        ]);

        const totalMinutes = timeAggregate?._sum?.totalMinutes ?? 0;

        return {
            projectsCount,
            workersCount,
            totalHoursLogged: Math.round((totalMinutes / 60) * 100) / 100,
        };
    }

    /**
     * Returns daily time-logged per project for line charts.
     */
    async getProjectsChartData(contractorId: string, startDate: string, endDate: string) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);

        const sessions = await this.prisma.workSession.findMany({
            where: {
                project: { contractorId },
                endTime: { not: null },
                date: { gte: start, lte: end },
                workLogs: {
                    some: { status: WorkLogStatus.APPROVED },
                    none: { status: { not: WorkLogStatus.APPROVED } },
                },
            },
            select: {
                date: true,
                totalMinutes: true,
                project: { select: { id: true, name: true } },
            },
            orderBy: { date: 'asc' },
        });

        const projectMap = new Map<string, string>();
        sessions.forEach(s => projectMap.set(s.project.id, s.project.name));

        const dateMap = new Map<string, Record<string, number>>();
        sessions.forEach(s => {
            const dateKey = s.date.toISOString().slice(0, 10);
            if (!dateMap.has(dateKey)) dateMap.set(dateKey, {});
            const entry = dateMap.get(dateKey)!;
            entry[s.project.id] = (entry[s.project.id] ?? 0) + (s.totalMinutes ?? 0);
        });

        return {
            projects: Array.from(projectMap.entries()).map(([id, name]) => ({ id, name })),
            series: Array.from(dateMap.entries()).map(([date, data]) => ({ date, data })),
        };
    }

    /**
     * Returns daily time-logged per worker for line charts.
     */
    async getWorkersChartData(contractorId: string, startDate: string, endDate: string) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);

        const sessions = await this.prisma.workSession.findMany({
            where: {
                project: { contractorId },
                endTime: { not: null },
                date: { gte: start, lte: end },
                workLogs: {
                    some: { status: WorkLogStatus.APPROVED },
                    none: { status: { not: WorkLogStatus.APPROVED } },
                },
            },
            select: {
                date: true,
                totalMinutes: true,
                worker: { select: { id: true, name: true } },
            },
            orderBy: { date: 'asc' },
        });

        const workerMap = new Map<string, string>();
        sessions.forEach(s => workerMap.set(s.worker.id, s.worker.name));

        const dateMap = new Map<string, Record<string, number>>();
        sessions.forEach(s => {
            const dateKey = s.date.toISOString().slice(0, 10);
            if (!dateMap.has(dateKey)) dateMap.set(dateKey, {});
            const entry = dateMap.get(dateKey)!;
            entry[s.worker.id] = (entry[s.worker.id] ?? 0) + (s.totalMinutes ?? 0);
        });

        return {
            workers: Array.from(workerMap.entries()).map(([id, name]) => ({ id, name })),
            series: Array.from(dateMap.entries()).map(([date, data]) => ({ date, data })),
        };
    }
}
