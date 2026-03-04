"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDailyReport(contractorId, date) {
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
    async getWeeklyReport(contractorId, startDate) {
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
    async getDashboardStats(contractorId) {
        const [projectsCount, workersCount, timeAggregate] = await Promise.all([
            this.prisma.project.count({ where: { contractorId } }),
            this.prisma.user.count({ where: { contractorId, role: 'WORKER' } }),
            this.prisma.workSession.aggregate({
                where: {
                    project: { contractorId },
                    endTime: { not: null },
                },
                _sum: { totalMinutes: true },
            }),
        ]);
        const totalMinutes = timeAggregate._sum.totalMinutes ?? 0;
        return {
            projectsCount,
            workersCount,
            totalHoursLogged: Math.round((totalMinutes / 60) * 100) / 100,
        };
    }
    async getProjectsChartData(contractorId, startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);
        const sessions = await this.prisma.workSession.findMany({
            where: {
                project: { contractorId },
                endTime: { not: null },
                date: { gte: start, lte: end },
            },
            select: {
                date: true,
                totalMinutes: true,
                project: { select: { id: true, name: true } },
            },
            orderBy: { date: 'asc' },
        });
        const projectMap = new Map();
        sessions.forEach(s => projectMap.set(s.project.id, s.project.name));
        const dateMap = new Map();
        sessions.forEach(s => {
            const dateKey = s.date.toISOString().slice(0, 10);
            if (!dateMap.has(dateKey))
                dateMap.set(dateKey, {});
            const entry = dateMap.get(dateKey);
            entry[s.project.id] = (entry[s.project.id] ?? 0) + (s.totalMinutes ?? 0);
        });
        return {
            projects: Array.from(projectMap.entries()).map(([id, name]) => ({ id, name })),
            series: Array.from(dateMap.entries()).map(([date, data]) => ({ date, data })),
        };
    }
    async getWorkersChartData(contractorId, startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);
        const sessions = await this.prisma.workSession.findMany({
            where: {
                project: { contractorId },
                endTime: { not: null },
                date: { gte: start, lte: end },
            },
            select: {
                date: true,
                totalMinutes: true,
                worker: { select: { id: true, name: true } },
            },
            orderBy: { date: 'asc' },
        });
        const workerMap = new Map();
        sessions.forEach(s => workerMap.set(s.worker.id, s.worker.name));
        const dateMap = new Map();
        sessions.forEach(s => {
            const dateKey = s.date.toISOString().slice(0, 10);
            if (!dateMap.has(dateKey))
                dateMap.set(dateKey, {});
            const entry = dateMap.get(dateKey);
            entry[s.worker.id] = (entry[s.worker.id] ?? 0) + (s.totalMinutes ?? 0);
        });
        return {
            workers: Array.from(workerMap.entries()).map(([id, name]) => ({ id, name })),
            series: Array.from(dateMap.entries()).map(([date, data]) => ({ date, data })),
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map