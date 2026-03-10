import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { FileService } from '../common/file/file.service';
import { Prisma, Project, WorkLogStatus } from '@prisma/client';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
    constructor(
        private prisma: PrismaService,
        private fileService: FileService
    ) { }

    async create(contractorId: string, data: CreateProjectDto): Promise<Project> {
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

    async findAll(contractorId: string): Promise<any[]> {
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
                            some: { status: WorkLogStatus.APPROVED },
                            none: { status: { not: WorkLogStatus.APPROVED } },
                        },
                    },
                },
            },
        });

        return projects.map(p => this._mapProjectWithWorkers(p));
    }

    async findOne(id: string, contractorId: string): Promise<any> {
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
                            some: { status: WorkLogStatus.APPROVED },
                            none: { status: { not: WorkLogStatus.APPROVED } },
                        },
                    },
                },
            },
        });
        if (!project) throw new NotFoundException('Project not found');
        return this._mapProjectWithWorkers(project);
    }

    private _mapProjectWithWorkers(project: any) {
        const { assignments, workSessions, ...projectData } = project;

        // Calculate actualHours (cumulative for the project)
        const actualHours = workSessions.reduce((acc, session) => acc + ((session.totalMinutes || 0) / 60), 0);

        return {
            ...projectData,
            actualHours: Math.round(actualHours * 100) / 100,
            workers: assignments.map(a => {
                const { passwordHash, ...workerData } = a.worker;

                // Calculate projectHours for this specific worker
                const workerSessions = workSessions.filter(s => s.workerId === workerData.id);
                const projectHours = workerSessions.reduce((acc, session) => acc + ((session.totalMinutes || 0) / 60), 0);

                return {
                    ...workerData,
                    projectHours: Math.round(projectHours * 100) / 100,
                };
            }),
        };
    }

    async update(id: string, contractorId: string, data: UpdateProjectDto): Promise<Project> {
        // Ensure ownership
        const project = await this.findOne(id, contractorId);

        const { startDate, endDate, logo, ...rest } = data;

        let logoPath = logo;
        if (logo && logo.startsWith('data:image')) {
            // Delete old logo if it exists
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

    async remove(id: string, contractorId: string): Promise<Project> {
        // Ensure ownership
        const project = await this.findOne(id, contractorId);

        // Cleanup logo file
        if (project.logo) {
            await this.fileService.deleteFile(project.logo);
        }

        return this.prisma.project.delete({
            where: { id },
        });
    }

    async assignWorker(projectId: string, workerId: string, contractorId: string) {
        // Verify project ownership
        await this.findOne(projectId, contractorId);

        // Verify worker belongs to contractor
        const worker = await this.prisma.user.findFirst({
            where: { id: workerId, contractorId },
        });
        if (!worker) throw new ForbiddenException('Worker does not belong to this contractor');

        return this.prisma.projectAssignment.create({
            data: {
                projectId,
                workerId,
            },
        });
    }

    async findAssignedProjects(workerId: string): Promise<any> {
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
                                    some: { status: WorkLogStatus.APPROVED },
                                    none: { status: { not: WorkLogStatus.APPROVED } },
                                },
                            },
                        },
                    },
                },
            },
        });

        const projects = assignments.map(a => {
            const mappedProject = this._mapProjectWithWorkers(a.project);
            // Find this specific worker's entry in the mapped workers array
            const myStats = mappedProject.workers.find(w => w.id === workerId);
            return {
                ...mappedProject,
                myHours: myStats ? myStats.projectHours : 0,
            };
        });

        return projects;
    }
}
