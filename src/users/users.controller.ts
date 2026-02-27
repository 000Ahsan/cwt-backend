import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get('workers')
    @Roles(Role.CONTRACTOR)
    async findAllWorkers(@Request() req) {
        return this.usersService.findWorkersByContractor(req.user.userId);
    }

    @Post('workers')
    @Roles(Role.CONTRACTOR)
    async createWorker(@Request() req, @Body() body: any) {
        const { password, ...userData } = body;
        return this.usersService.create({
            ...userData,
            passwordHash: password, // UsersService.create hashes this
            role: Role.WORKER,
            contractor: { connect: { id: req.user.userId } }
        });
    }

    @Put('workers/:id')
    @Roles(Role.CONTRACTOR)
    async updateWorker(@Param('id') id: string, @Body() body: any, @Request() req) {
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
            updateData.passwordHash = password; // UsersService.update hashes this
        }

        return this.usersService.update(id, updateData);
    }
}
