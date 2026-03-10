import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AssignWorkerDto } from './dto/assign-worker.dto';
export declare class ProjectsController {
    private projectsService;
    constructor(projectsService: ProjectsService);
    create(req: any, body: CreateProjectDto): Promise<{
        id: string;
        name: string;
        contractorId: string;
        description: string | null;
        logo: string | null;
        categories: string | null;
        latitude: number | null;
        longitude: number | null;
        targetHours: number | null;
        address: string | null;
        startDate: Date | null;
        endDate: Date | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(req: any): Promise<any>;
    update(id: string, body: UpdateProjectDto, req: any): Promise<{
        id: string;
        name: string;
        contractorId: string;
        description: string | null;
        logo: string | null;
        categories: string | null;
        latitude: number | null;
        longitude: number | null;
        targetHours: number | null;
        address: string | null;
        startDate: Date | null;
        endDate: Date | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        name: string;
        contractorId: string;
        description: string | null;
        logo: string | null;
        categories: string | null;
        latitude: number | null;
        longitude: number | null;
        targetHours: number | null;
        address: string | null;
        startDate: Date | null;
        endDate: Date | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    assignWorker(projectId: string, body: AssignWorkerDto, req: any): Promise<{
        id: string;
        assignedAt: Date;
        projectId: string;
        workerId: string;
    }>;
}
