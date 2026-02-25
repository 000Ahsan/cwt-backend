import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Prisma, Project } from '@prisma/client';

@Injectable()
export class ProjectsService {
    constructor(private prisma: PrismaService) { }

    async create(contractorId: string, data: Prisma.ProjectCreateWithoutContractorInput): Promise<Project> {
        return this.prisma.project.create({
            data: {
                ...data,
                contractorId,
            },
        });
    }

    async findAll(contractorId: string): Promise<Project[]> {
        return this.prisma.project.findMany({
            where: { contractorId },
        });
    }

    async findOne(id: string, contractorId: string): Promise<Project> {
        const project = await this.prisma.project.findFirst({
            where: { id, contractorId },
        });
        if (!project) throw new NotFoundException('Project not found');
        return project;
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
}
