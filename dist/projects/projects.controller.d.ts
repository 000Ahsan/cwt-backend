import { ProjectsService } from './projects.service';
export declare class ProjectsController {
    private projectsService;
    constructor(projectsService: ProjectsService);
    create(req: any, body: any): Promise<{
        name: string;
        id: string;
        contractorId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        active: boolean;
    }>;
    findAll(req: any): Promise<{
        name: string;
        id: string;
        contractorId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        active: boolean;
    }[]>;
    assignWorker(projectId: string, workerId: string, req: any): Promise<{
        id: string;
        assignedAt: Date;
        workerId: string;
        projectId: string;
    }>;
}
