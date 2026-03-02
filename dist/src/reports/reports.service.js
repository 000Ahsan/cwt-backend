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
        const [projectsCount, workersCount] = await Promise.all([
            this.prisma.project.count({ where: { contractorId } }),
            this.prisma.user.count({ where: { contractorId, role: 'WORKER' } }),
        ]);
        return {
            projectsCount,
            workersCount,
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map