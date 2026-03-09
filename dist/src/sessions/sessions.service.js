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
exports.SessionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let SessionsService = class SessionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async startSession(workerId, projectId) {
        const activeSession = await this.prisma.workSession.findFirst({
            where: { workerId, endTime: null },
        });
        if (activeSession) {
            await this.prisma.workSession.delete({
                where: { id: activeSession.id },
            });
        }
        const assignment = await this.prisma.projectAssignment.findUnique({
            where: { projectId_workerId: { projectId, workerId } },
        });
        if (!assignment)
            throw new common_1.BadRequestException('You are not assigned to this project');
        const pendingLogs = await this.prisma.workLog.findFirst({
            where: {
                workSession: {
                    workerId,
                    projectId,
                },
                OR: [
                    { status: client_1.WorkLogStatus.PENDING },
                ],
            },
        });
        if (pendingLogs) {
            throw new common_1.BadRequestException('You have pending work logs for this project that must be signed off by the contractor before starting a new session.');
        }
        return this.prisma.workSession.create({
            data: {
                workerId,
                projectId,
                startTime: new Date(),
                date: new Date(),
            },
        });
    }
    async endSession(workerId) {
        const activeSession = await this.prisma.workSession.findFirst({
            where: { workerId, endTime: null },
        });
        if (!activeSession)
            throw new common_1.NotFoundException('No active session found');
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
    async getWorkHistory(workerId) {
        return this.prisma.workSession.findMany({
            where: { workerId },
            include: { project: true, workLogs: true },
            orderBy: { startTime: 'desc' },
        });
    }
    async discardActiveSession(workerId) {
        const activeSession = await this.prisma.workSession.findFirst({
            where: { workerId, endTime: null },
        });
        if (!activeSession) {
            throw new common_1.NotFoundException('No active session found to discard');
        }
        await this.prisma.workSession.delete({
            where: { id: activeSession.id },
        });
        return { message: 'Session discarded successfully' };
    }
};
exports.SessionsService = SessionsService;
exports.SessionsService = SessionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SessionsService);
//# sourceMappingURL=sessions.service.js.map