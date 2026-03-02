import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { AssignWorkerDto } from './dto/assign-worker.dto';
export declare class ProjectsController {
    private projectsService;
    constructor(projectsService: ProjectsService);
    create(req: any, body: CreateProjectDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        contractorId: string;
        description: string | null;
        active: boolean;
    }>;
    findAll(req: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        contractorId: string;
        description: string | null;
        active: boolean;
    }[]>;
    assignWorker(projectId: string, body: AssignWorkerDto, req: any): Promise<{
        id: string;
        assignedAt: Date;
        workerId: string;
        projectId: string;
    }>;
}
