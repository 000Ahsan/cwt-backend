import { UsersService } from './users.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAllWorkers(req: any): Promise<{
        name: string;
        id: string;
        role: import("@prisma/client").$Enums.Role;
        email: string;
        passwordHash: string;
        contractorId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createWorker(req: any, body: CreateWorkerDto): Promise<{
        name: string;
        id: string;
        role: import("@prisma/client").$Enums.Role;
        email: string;
        passwordHash: string;
        contractorId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateWorkerByEmail(body: UpdateWorkerDto, req: any): Promise<{
        name: string;
        id: string;
        role: import("@prisma/client").$Enums.Role;
        email: string;
        passwordHash: string;
        contractorId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateWorker(id: string, body: UpdateWorkerDto, req: any): Promise<{
        name: string;
        id: string;
        role: import("@prisma/client").$Enums.Role;
        email: string;
        passwordHash: string;
        contractorId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
