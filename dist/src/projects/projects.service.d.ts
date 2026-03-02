import { PrismaService } from '../common/prisma/prisma.service';
import { FileService } from '../common/file/file.service';
import { Project } from '@prisma/client';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
export declare class ProjectsService {
    private prisma;
    private fileService;
    constructor(prisma: PrismaService, fileService: FileService);
    create(contractorId: string, data: CreateProjectDto): Promise<Project>;
    findAll(contractorId: string): Promise<any[]>;
    findOne(id: string, contractorId: string): Promise<any>;
    private _mapProjectWithWorkers;
    update(id: string, contractorId: string, data: UpdateProjectDto): Promise<Project>;
    remove(id: string, contractorId: string): Promise<Project>;
    assignWorker(projectId: string, workerId: string, contractorId: string): Promise<{
        id: string;
        projectId: string;
        workerId: string;
        assignedAt: Date;
    }>;
    findAssignedProjects(workerId: string): Promise<Project[]>;
}
