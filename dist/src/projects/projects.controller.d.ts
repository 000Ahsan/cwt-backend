import { ProjectsService } from './projects.service';
export declare class ProjectsController {
    private projectsService;
    constructor(projectsService: ProjectsService);
    create(req: any, body: any): Promise<{
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
    assignWorker(projectId: string, workerId: string, req: any): Promise<{
        id: string;
        assignedAt: Date;
        workerId: string;
        projectId: string;
    }>;
}
