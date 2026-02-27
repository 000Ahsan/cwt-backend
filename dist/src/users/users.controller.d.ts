import { UsersService } from './users.service';
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
    createWorker(req: any, data: any): Promise<{
        id: string;
        role: import("@prisma/client").$Enums.Role;
        name: string;
        email: string;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
        contractorId: string | null;
    }>;
    updateWorker(id: string, data: any): Promise<{
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
