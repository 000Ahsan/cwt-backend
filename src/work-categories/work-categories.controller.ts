import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { WorkCategoriesService } from './work-categories.service';
import { CreateWorkCategoryDto } from './dto/create-work-category.dto';
import { UpdateWorkCategoryDto } from './dto/update-work-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Work Categories')
@ApiBearerAuth()
@Controller('work-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkCategoriesController {
    constructor(private readonly workCategoriesService: WorkCategoriesService) { }

    @Post()
    @Roles(Role.CONTRACTOR)
    @ApiOperation({ summary: 'Create a new work category' })
    create(@Request() req, @Body() createWorkCategoryDto: CreateWorkCategoryDto) {
        return this.workCategoriesService.create(req.user.userId, createWorkCategoryDto);
    }

    @Get()
    @Roles(Role.CONTRACTOR, Role.WORKER)
    @ApiOperation({ summary: 'Get all work categories for the current contractor' })
    findAll(@Request() req) {
        // If worker, they might need to see categories for their contractor
        const contractorId = req.user.role === Role.CONTRACTOR ? req.user.userId : req.user.contractorId;
        return this.workCategoriesService.findAll(contractorId);
    }

    @Get(':id')
    @Roles(Role.CONTRACTOR)
    @ApiOperation({ summary: 'Get a specific work category' })
    findOne(@Param('id') id: string, @Request() req) {
        return this.workCategoriesService.findOne(id, req.user.userId);
    }

    @Patch(':id')
    @Roles(Role.CONTRACTOR)
    @ApiOperation({ summary: 'Update a work category' })
    update(@Param('id') id: string, @Request() req, @Body() updateWorkCategoryDto: UpdateWorkCategoryDto) {
        return this.workCategoriesService.update(id, req.user.userId, updateWorkCategoryDto);
    }

    @Delete(':id')
    @Roles(Role.CONTRACTOR)
    @ApiOperation({ summary: 'Delete a work category' })
    remove(@Param('id') id: string, @Request() req) {
        return this.workCategoriesService.remove(id, req.user.userId);
    }
}
