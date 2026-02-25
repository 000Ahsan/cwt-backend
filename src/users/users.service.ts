import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findOneByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async findOneById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { id } });
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        const hashedPassword = await bcrypt.hash(data.passwordHash, 10);
        return this.prisma.user.create({
            data: {
                ...data,
                passwordHash: hashedPassword,
            },
        });
    }

    async findWorkersByContractor(contractorId: string): Promise<User[]> {
        return this.prisma.user.findMany({
            where: { contractorId },
        });
    }
}
