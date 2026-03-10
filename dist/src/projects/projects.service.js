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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const file_service_1 = require("../common/file/file.service");
const client_1 = require("@prisma/client");
let ProjectsService = class ProjectsService {
    prisma;
    fileService;
    constructor(prisma, fileService) {
        this.prisma = prisma;
        this.fileService = fileService;
    }
    async create(contractorId, data) {
        const { startDate, endDate, logo, ...rest } = data;
        let logoPath = logo;
        if (logo && logo.startsWith('data:image')) {
            logoPath = await this.fileService.saveBase64Image(logo);
        }
        return this.prisma.project.create({
            data: {
                ...rest,
                contractorId,
                logo: logoPath,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
            },
        });
    }
    async findAll(contractorId) {
        const projects = await this.prisma.project.findMany({
            where: { contractorId },
            include: {
                assignments: {
                    include: {
                        worker: true,
                    },
                },
                workSessions: {
                    where: {
                        endTime: { not: null },
                        workLogs: {
                            some: { status: client_1.WorkLogStatus.APPROVED },
                            none: { status: { not: client_1.WorkLogStatus.APPROVED } },
                        },
                    },
                },
            },
        });
        return projects.map(p => this._mapProjectWithWorkers(p));
    }
    async findOne(id, contractorId) {
        const project = await this.prisma.project.findFirst({
            where: { id, contractorId },
            include: {
                assignments: {
                    include: {
                        worker: true,
                    },
                },
                workSessions: {
                    where: {
                        endTime: { not: null },
                        workLogs: {
                            some: { status: client_1.WorkLogStatus.APPROVED },
                            none: { status: { not: client_1.WorkLogStatus.APPROVED } },
                        },
                    },
                },
            },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        return this._mapProjectWithWorkers(project);
    }
    _mapProjectWithWorkers(project) {
        const { assignments, workSessions, ...projectData } = project;
        const actualHours = workSessions.reduce((acc, session) => acc + ((session.totalMinutes || 0) / 60), 0);
        return {
            ...projectData,
            actualHours: Math.round(actualHours * 100) / 100,
            workers: assignments.map(a => {
                const { passwordHash, ...workerData } = a.worker;
                const workerSessions = workSessions.filter(s => s.workerId === workerData.id);
                const projectHours = workerSessions.reduce((acc, session) => acc + ((session.totalMinutes || 0) / 60), 0);
                return {
                    ...workerData,
                    projectHours: Math.round(projectHours * 100) / 100,
                };
            }),
        };
    }
    async update(id, contractorId, data) {
        const project = await this.findOne(id, contractorId);
        const { startDate, endDate, logo, ...rest } = data;
        let logoPath = logo;
        if (logo && logo.startsWith('data:image')) {
            if (project.logo) {
                await this.fileService.deleteFile(project.logo);
            }
            logoPath = await this.fileService.saveBase64Image(logo);
        }
        return this.prisma.project.update({
            where: { id },
            data: {
                ...rest,
                logo: logoPath,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
            },
        });
    }
    async remove(id, contractorId) {
        const project = await this.findOne(id, contractorId);
        if (project.logo) {
            await this.fileService.deleteFile(project.logo);
        }
        return this.prisma.project.delete({
            where: { id },
        });
    }
    async assignWorker(projectId, workerId, contractorId) {
        await this.findOne(projectId, contractorId);
        const worker = await this.prisma.user.findFirst({
            where: { id: workerId, contractorId },
        });
        if (!worker)
            throw new common_1.ForbiddenException('Worker does not belong to this contractor');
        return this.prisma.projectAssignment.create({
            data: {
                projectId,
                workerId,
            },
        });
    }
    async findAssignedProjects(workerId) {
        const assignments = await this.prisma.projectAssignment.findMany({
            where: { workerId },
            include: {
                project: {
                    include: {
                        assignments: {
                            include: {
                                worker: true,
                            },
                        },
                        workSessions: {
                            where: {
                                endTime: { not: null },
                                workLogs: {
                                    some: { status: client_1.WorkLogStatus.APPROVED },
                                    none: { status: { not: client_1.WorkLogStatus.APPROVED } },
                                },
                            },
                        },
                    },
                },
            },
        });
        const projects = assignments.map(a => {
            const mappedProject = this._mapProjectWithWorkers(a.project);
            const myStats = mappedProject.workers.find(w => w.id === workerId);
            return {
                ...mappedProject,
                myHours: myStats ? myStats.projectHours : 0,
            };
        });
        return projects;
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        file_service_1.FileService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map