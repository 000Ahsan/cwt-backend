import { Injectable, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
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
        const { startDate, endDate, logo, workCategoryIds, ...rest } = data;

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
                workCategoryLinks: workCategoryIds ? {
                    create: workCategoryIds.map(id => ({ workCategoryId: id }))
                } : undefined,
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
                        workCategory: true,
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
                workCategoryLinks: {
                    include: {
                        workCategory: true
                    }
                }
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
                        workCategory: true,
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
                workCategoryLinks: {
                    include: {
                        workCategory: true
                    }
                }
            },
        });
        if (!project) throw new NotFoundException('Project not found');
        return this._mapProjectWithWorkers(project);
    }

    private _mapProjectWithWorkers(project: any) {
        const { assignments, workSessions, workCategoryLinks, ...projectData } = project;

        // Calculate actualHours (cumulative for the project)
        const actualHours = workSessions.reduce((acc, session) => acc + ((session.totalMinutes || 0) / 60), 0);

        // Group workers by ID
        const workerMap = new Map<string, any>();

        assignments?.forEach(a => {
            if (!workerMap.has(a.workerId)) {
                const { passwordHash, ...workerData } = a.worker;

                // Calculate projectHours for this specific worker
                const workerSessions = workSessions.filter(s => s.workerId === a.workerId);
                const projectHours = workerSessions.reduce((acc, session) => acc + ((session.totalMinutes || 0) / 60), 0);

                workerMap.set(a.workerId, {
                    ...workerData,
                    projectHours: Math.round(projectHours * 100) / 100,
                    categories: [], // Assigned categories for this project
                });
            }

            const worker = workerMap.get(a.workerId);
            if (a.workCategory) {
                worker.categories.push({
                    ...a.workCategory,
                    hourlyRate: a.hourlyRate
                });
            }
        });

        return {
            ...projectData,
            actualHours: Math.round(actualHours * 100) / 100,
            categories: workCategoryLinks?.map(link => link.workCategory) || [],
            workers: Array.from(workerMap.values()),
        };
    }

    async update(id: string, contractorId: string, data: UpdateProjectDto): Promise<Project> {
        // Ensure ownership
        const project = await this.findOne(id, contractorId);

        const { startDate, endDate, logo, workCategoryIds, ...rest } = data;

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
                workCategoryLinks: workCategoryIds ? {
                    deleteMany: {},
                    create: workCategoryIds.map(catId => ({ workCategoryId: catId }))
                } : undefined,
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

    async assignWorker(projectId: string, workerId: string, workCategoryId: string, hourlyRate: number, contractorId: string) {
        // Verify project ownership
        await this.findOne(projectId, contractorId);

        // Verify worker belongs to contractor
        const worker = await this.prisma.user.findFirst({
            where: { id: workerId, contractorId },
        });
        if (!worker) throw new ForbiddenException('Worker does not belong to this contractor');

        // Verify category exists
        const category = await this.prisma.workCategory.findFirst({
            where: { id: workCategoryId, contractorId }
        });
        if (!category) throw new NotFoundException('Work category not found');

        // Check if already assigned
        const existing = await this.prisma.projectAssignment.findUnique({
            where: {
                projectId_workerId_workCategoryId: {
                    projectId,
                    workerId,
                    workCategoryId
                }
            }
        });
        if (existing) throw new ConflictException('Worker is already assigned to this project in this category');

        return this.prisma.projectAssignment.create({
            data: {
                projectId,
                workerId,
                workCategoryId,
                hourlyRate
            },
        });
    }

    async unassignWorker(projectId: string, workerId: string, workCategoryId: string, contractorId: string) {
        // Verify project ownership
        await this.findOne(projectId, contractorId);

        return this.prisma.projectAssignment.delete({
            where: {
                projectId_workerId_workCategoryId: {
                    projectId,
                    workerId,
                    workCategoryId
                }
            }
        });
    }


    async findAssignedProjects(workerId: string): Promise<any> {
        const assignments = await this.prisma.projectAssignment.findMany({
            where: { workerId },
            include: {
                workCategory: true,
                project: {
                    include: {
                        assignments: {
                            include: {
                                worker: true,
                                workCategory: true
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
                        workCategoryLinks: {
                            include: {
                                workCategory: true
                            }
                        }
                    },
                },
            },
        });

        // Group assignments by project
        const projectMap = new Map<string, any>();

        for (const a of assignments) {
            if (!projectMap.has(a.projectId)) {
                const mappedProject = this._mapProjectWithWorkers(a.project);
                // Find this specific worker's entry in the mapped workers array (optional, for backward compatibility)
                const myStats = mappedProject.workers.find(w => w.id === workerId);
                
                projectMap.set(a.projectId, {
                    ...mappedProject,
                    myHours: myStats ? myStats.projectHours : 0,
                    assignedCategories: [] // Initialize assigned categories list
                });
            }
            
            const p = projectMap.get(a.projectId);
            p.assignedCategories.push({
                ...a.workCategory,
                assignmentRate: a.hourlyRate
            });
            
            // Override the generic 'categories' with specifically assigned ones for the worker app
            p.categories = p.assignedCategories;
        }

        return Array.from(projectMap.values());
    }

}
