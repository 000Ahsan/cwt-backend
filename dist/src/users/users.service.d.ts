import { PrismaService } from '../common/prisma/prisma.service';
import { FileService } from '../common/file/file.service';
import { Prisma, User } from '@prisma/client';
export declare class UsersService {
    private prisma;
    private fileService;
    constructor(prisma: PrismaService, fileService: FileService);
    findOneByEmail(email: string): Promise<User | null>;
    findOneById(id: string): Promise<User | null>;
    create(data: Prisma.UserCreateInput): Promise<User>;
    update(id: string, data: Prisma.UserUpdateInput): Promise<User>;
    removePassword(user: User): {
        id: string;
        role: import("@prisma/client").$Enums.Role;
        name: string;
        email: string;
        image: string | null;
        categories: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        contractorId: string | null;
    };
    softDelete(id: string): Promise<User>;
    findWorkersByContractor(contractorId: string): Promise<User[]>;
}
