import { Injectable, BadRequestException } from '@nestjs/common';
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

    async findOneByPhone(phone: string): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: { phone, deletedAt: null }
        });
    }

    async findOneByEmailOrPhone(identifier: string): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { phone: identifier }
                ],
                deletedAt: null
            }
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
        if (!user) throw new BadRequestException('User not found');

        const updateData: any = { ...data };

        // Email uniqueness check
        if (data.email && typeof data.email === 'string' && data.email !== user.email) {
            const existingEmail = await this.findOneByEmail(data.email);
            if (existingEmail) {
                throw new BadRequestException('Email already in use');
            }
        }

        // Phone uniqueness check
        if (data.phone && typeof data.phone === 'string' && data.phone !== user.phone) {
            const existingPhone = await this.findOneByPhone(data.phone);
            if (existingPhone) {
                throw new BadRequestException('Phone number already in use');
            }
        }

        if (data.passwordHash && typeof data.passwordHash === 'string') {
            updateData.passwordHash = await bcrypt.hash(data.passwordHash, 10);
        }

        if (data.image && typeof data.image === 'string') {
            if (data.image.startsWith('data:image')) {
                // Delete old image if it exists
                if (user.image) {
                    await this.fileService.deleteFile(user.image);
                }
                updateData.image = await this.fileService.saveBase64Image(data.image, 'users');
            } else if (data.image.startsWith('/uploads/')) {
                // Direct path from file upload
                if (user.image && user.image !== data.image) {
                    await this.fileService.deleteFile(user.image);
                }
                updateData.image = data.image;
            }
        }

        return this.prisma.user.update({
            where: { id },
            data: updateData,
        });
    }

    removePassword(user: User) {
        const { passwordHash, ...rest } = user;
        return rest;
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
