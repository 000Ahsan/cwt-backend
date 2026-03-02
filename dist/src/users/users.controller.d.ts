import { UsersService } from './users.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAllWorkers(req: any): Promise<{
        id: string;
        role: import("@prisma/client").$Enums.Role;
        name: string;
        email: string;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
        contractorId: string | null;
    }[]>;
    createWorker(req: any, body: CreateWorkerDto): Promise<{
        id: string;
        role: import("@prisma/client").$Enums.Role;
        name: string;
        email: string;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
        contractorId: string | null;
    }>;
    updateWorkerByEmail(body: UpdateWorkerDto, req: any): Promise<{
        id: string;
        role: import("@prisma/client").$Enums.Role;
        name: string;
        email: string;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
        contractorId: string | null;
    }>;
    updateWorker(id: string, body: UpdateWorkerDto, req: any): Promise<{
        id: string;
        role: import("@prisma/client").$Enums.Role;
        name: string;
        email: string;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
        contractorId: string | null;
    }>;
}
