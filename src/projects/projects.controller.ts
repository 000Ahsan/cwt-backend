import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AssignWorkerDto } from './dto/assign-worker.dto';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
    constructor(private projectsService: ProjectsService) { }

    @Post()
    @Roles(Role.CONTRACTOR)
    @ApiOperation({ summary: 'Create a new project' })
    async create(@Request() req, @Body() body: CreateProjectDto) {
        return this.projectsService.create(req.user.userId, body);
    }

    @Get()
    @ApiOperation({ summary: 'Get all projects (Contractors see theirs, Workers see assigned)' })
    async findAll(@Request() req) {
        if (req.user.role === Role.CONTRACTOR) {
            return this.projectsService.findAll(req.user.userId);
        }
        if (req.user.role === Role.WORKER) {
            return this.projectsService.findAssignedProjects(req.user.userId);
        }
        return [];
    }

    @Get('worker-assignments')
    @Roles(Role.WORKER)
    @ApiOperation({ summary: 'Get projects assigned to the logged-in worker' })
    async getWorkerAssignments(@Request() req) {
        return this.projectsService.findAssignedProjects(req.user.userId);
    }

    @Patch(':id')
    @Roles(Role.CONTRACTOR)
    @ApiOperation({ summary: 'Update an existing project' })
    async update(@Param('id') id: string, @Body() body: UpdateProjectDto, @Request() req) {
        return this.projectsService.update(id, req.user.userId, body);
    }

    @Delete(':id')
    @Roles(Role.CONTRACTOR)
    @ApiOperation({ summary: 'Delete a project' })
    async remove(@Param('id') id: string, @Request() req) {
        return this.projectsService.remove(id, req.user.userId);
    }

    @Post(':id/assign-worker')
    @Roles(Role.CONTRACTOR)
    @ApiOperation({ summary: 'Assign a worker to a project' })
    async assignWorker(@Param('id') projectId: string, @Body() body: AssignWorkerDto, @Request() req) {
        return this.projectsService.assignWorker(projectId, body.workerId, req.user.userId);
    }
}
