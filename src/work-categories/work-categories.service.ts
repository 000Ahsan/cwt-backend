import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateWorkCategoryDto } from './dto/create-work-category.dto';
import { UpdateWorkCategoryDto } from './dto/update-work-category.dto';

@Injectable()
export class WorkCategoriesService {
    constructor(private prisma: PrismaService) { }

    async create(contractorId: string, dto: CreateWorkCategoryDto) {
        const existing = await this.prisma.workCategory.findFirst({
            where: { contractorId, name: dto.name },
        });

        if (existing) {
            throw new ConflictException(`Work Category with name '${dto.name}' already exists.`);
        }

        return this.prisma.workCategory.create({
            data: {
                ...dto,
                contractorId,
            },
        });
    }

    async findAll(contractorId: string) {
        return this.prisma.workCategory.findMany({
            where: { contractorId },
            include: {
                _count: {
                    select: {
                        projectLinks: true,
                        workerLinks: true,
                    }
                }
            },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string, contractorId: string) {
        const category = await this.prisma.workCategory.findFirst({
            where: { id },
        });

        if (!category) {
            throw new NotFoundException(`Work Category with ID ${id} not found.`);
        }

        if (category.contractorId !== contractorId) {
            throw new ForbiddenException('You do not have access to this category.');
        }

        return category;
    }

    async update(id: string, contractorId: string, dto: UpdateWorkCategoryDto) {
        const category = await this.findOne(id, contractorId);

        if (!category) {
            throw new NotFoundException(`Work Category with ID ${id} not found.`);
        }

        if (dto.name) {
            const existing = await this.prisma.workCategory.findFirst({
                where: {
                    contractorId,
                    name: dto.name,
                },
            });
            if (existing && existing.id !== id) {
                throw new ConflictException(`Work Category with name '${dto.name}' already exists.`);
            }
        }

        return this.prisma.workCategory.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: string, contractorId: string) {
        await this.findOne(id, contractorId);

        // Optional: Check if used in sessions or links before deleting
        // For now, cascade or simple delete
        return this.prisma.workCategory.delete({
            where: { id },
        });
    }
}
