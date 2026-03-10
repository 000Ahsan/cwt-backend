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
exports.WorkLogsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let WorkLogsService = class WorkLogsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createLog(workerId, data) {
        const session = await this.prisma.workSession.findUnique({
            where: { id: data.sessionId },
        });
        if (!session || session.workerId !== workerId)
            throw new common_1.BadRequestException('Invalid session');
        if (session.endTime)
            throw new common_1.BadRequestException('Cannot add logs to a closed session');
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
        if (!logsWithPhotos)
            return workLog;
        return {
            ...logsWithPhotos,
            photos: logsWithPhotos.photos.map(photo => ({
                ...photo,
            })),
        };
    }
    async getWorkerLogs(workerId) {
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
    async getContractorLogs(contractorId, filters) {
        const { workerId, projectId, startDate, endDate } = filters;
        const page = Math.max(1, filters.page ?? 1);
        const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
        const skip = (page - 1) * limit;
        const where = {
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
                            project: { select: { id: true, name: true, address: true } },
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
    async signOffLog(contractorId, logId, data) {
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
        if (!log)
            throw new common_1.NotFoundException('Work log not found');
        if (log.workSession.project.contractorId !== contractorId) {
            throw new common_1.ForbiddenException('You do not have permission to sign off this work log');
        }
        return this.prisma.workLog.update({
            where: { id: logId },
            data: {
                status: data.status,
                contractorComment: data.comment,
            },
        });
    }
};
exports.WorkLogsService = WorkLogsService;
exports.WorkLogsService = WorkLogsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkLogsService);
//# sourceMappingURL=work-logs.service.js.map