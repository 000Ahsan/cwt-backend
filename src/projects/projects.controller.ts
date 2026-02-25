import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
    constructor(private projectsService: ProjectsService) { }

    @Post()
    @Roles(Role.CONTRACTOR)
    async create(@Request() req, @Body() body: any) {
        return this.projectsService.create(req.user.userId, body);
    }

    @Get()
    async findAll(@Request() req) {
        if (req.user.role === Role.CONTRACTOR) {
            return this.projectsService.findAll(req.user.userId);
        }
        // Workers see their assigned projects (to be implemented in session controller or here)
        return [];
    }

    @Post(':id/assign-worker')
    @Roles(Role.CONTRACTOR)
    async assignWorker(@Param('id') projectId: string, @Body('workerId') workerId: string, @Request() req) {
        return this.projectsService.assignWorker(projectId, workerId, req.user.userId);
    }
}
