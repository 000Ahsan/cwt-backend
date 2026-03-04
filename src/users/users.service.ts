import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { FileService } from '../common/file/file.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private fileService: FileService
    ) { }

    async findOneByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: { email, deletedAt: null }
        });
    }

    async findOneById(id: string): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: { id, deletedAt: null }
        });
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        const passwordHash = await bcrypt.hash(data.passwordHash, 10);

        let imagePath = data.image;
        if (data.image && data.image.startsWith('data:image')) {
            imagePath = await this.fileService.saveBase64Image(data.image, 'users');
        }

        return this.prisma.user.create({
            data: {
                ...data,
                passwordHash,
                image: imagePath,
            },
        });
    }

    async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        const user = await this.findOneById(id);

        const updateData: any = { ...data };

        if (data.passwordHash && typeof data.passwordHash === 'string') {
            updateData.passwordHash = await bcrypt.hash(data.passwordHash, 10);
        }

        if (data.image && typeof data.image === 'string' && data.image.startsWith('data:image')) {
            // Delete old image if it exists
            if (user?.image) {
                await this.fileService.deleteFile(user.image);
            }
            updateData.image = await this.fileService.saveBase64Image(data.image, 'users');
        }

        return this.prisma.user.update({
            where: { id },
            data: updateData,
        });
    }

    async softDelete(id: string): Promise<User> {
        const user = await this.findOneById(id);
        if (user?.image) {
            await this.fileService.deleteFile(user.image);
        }
        return this.prisma.user.update({
            where: { id },
            data: { deletedAt: new Date(), image: null }, // Optional: nullify image on delete
        });
    }

    async findWorkersByContractor(contractorId: string): Promise<User[]> {
        return this.prisma.user.findMany({
            where: {
                contractorId,
                role: 'WORKER',
                deletedAt: null
            },
            include: {
                assignments: {
                    include: {
                        project: true
                    }
                }
            }
        });
    }
}
