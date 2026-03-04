import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get('workers')
    @Roles(Role.CONTRACTOR)
    @ApiOperation({ summary: 'Get all workers belonging to the contractor' })
    async findAllWorkers(@Request() req) {
        return this.usersService.findWorkersByContractor(req.user.userId);
    }

    @Post('workers')
    @Roles(Role.CONTRACTOR)
    @ApiOperation({ summary: 'Create a new worker under the contractor' })
    async createWorker(@Request() req, @Body() body: CreateWorkerDto) {
        const { password, ...userData } = body;
        return this.usersService.create({
            ...userData,
            passwordHash: password, // UsersService.create hashes this
            role: Role.WORKER,
            contractor: { connect: { id: req.user.userId } }
        } as any);
    }

    @Put('workers/:id')
    @Roles(Role.CONTRACTOR)
    @ApiOperation({ summary: 'Update a worker details by ID' })
    async updateWorker(@Param('id') id: string, @Body() body: UpdateWorkerDto, @Request() req) {
        const { password, ...userData } = body;

        const worker = await this.usersService.findOneById(id);
        if (!worker) {
            throw new NotFoundException('Worker not found');
        }
        if (worker.contractorId !== req.user.userId) {
            throw new ForbiddenException('You can only edit your own workers');
        }

        const updateData: any = { ...userData };
        if (password) {
            updateData.passwordHash = password;
        }

        return this.usersService.update(id, updateData);
    }

    @Delete('workers/:id')
    @Roles(Role.CONTRACTOR)
    @ApiOperation({ summary: 'Soft delete a worker' })
    async removeWorker(@Param('id') id: string, @Request() req) {
        const worker = await this.usersService.findOneById(id);
        if (!worker) throw new NotFoundException('Worker not found');
        if (worker.contractorId !== req.user.userId) {
            throw new ForbiddenException('You can only delete your own workers');
        }
        return this.usersService.softDelete(id);
    }
}
