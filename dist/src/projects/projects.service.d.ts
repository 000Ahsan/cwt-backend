import { PrismaService } from '../common/prisma/prisma.service';
import { Prisma, Project } from '@prisma/client';
export declare class ProjectsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(contractorId: string, data: Prisma.ProjectCreateWithoutContractorInput): Promise<Project>;
    findAll(contractorId: string): Promise<Project[]>;
    findOne(id: string, contractorId: string): Promise<Project>;
    assignWorker(projectId: string, workerId: string, contractorId: string): Promise<{
        id: string;
        assignedAt: Date;
        workerId: string;
        projectId: string;
    }>;
}
