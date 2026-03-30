import { Controller, Post, Body, UseGuards, Request, UseInterceptors, UploadedFiles, Get, Query, Patch, Param } from '@nestjs/common';
import 'multer';
import { WorkLogsService } from './work-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { CreateWorkLogDto } from './dto/create-work-log.dto';
import { SignOffWorkLogDto } from './dto/sign-off-work-log.dto';

@ApiTags('Work Logs')
@ApiBearerAuth()
@Controller('work-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkLogsController {
    constructor(private workLogsService: WorkLogsService) { }

    @Post()
    @Roles(Role.WORKER)
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Submit a work log with photos' })
    @UseInterceptors(FilesInterceptor('photos', 10, {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const date = new Date();
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const uploadDir = `./uploads/work-photos/${year}/${month}`;

                if (!require('fs').existsSync(uploadDir)) {
                    require('fs').mkdirSync(uploadDir, { recursive: true });
                }
                cb(null, uploadDir);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = uuidv4();
                cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
                return cb(new Error('Only image files (jpg/png) are allowed!'), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }))
    async create(@Request() req, @Body() body: CreateWorkLogDto, @UploadedFiles() files: Express.Multer.File[]) {
        return this.workLogsService.createLog(req.user.userId, {
            sessionId: body.sessionId,
            description: body.description,
            photos: files,
        });
    }

    @Get('worker')
    @Roles(Role.WORKER)
    @ApiOperation({ summary: 'Get work logs for the current worker with filters' })
    @ApiQuery({ name: 'projectId', required: false, type: String })
    @ApiQuery({ name: 'category', required: false, type: String })
    @ApiQuery({ name: 'startDate', required: false, type: String })
    @ApiQuery({ name: 'endDate', required: false, type: String })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getWorkerLogs(
        @Request() req,
        @Query('projectId') projectId?: string,
        @Query('category') category?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.workLogsService.getWorkerLogs(req.user.userId, {
            projectId,
            category,
            startDate,
            endDate,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }

    @Get('contractor')
    @Roles(Role.CONTRACTOR)
    @ApiOperation({ summary: 'Get all work logs for the contractor with filters and pagination' })
    @ApiQuery({ name: 'workerId', required: false, type: String, description: 'Filter by worker ID' })
    @ApiQuery({ name: 'projectId', required: false, type: String, description: 'Filter by project ID' })
    @ApiQuery({ name: 'startDate', required: false, type: String, example: '2026-03-01', description: 'Start of date range (inclusive)' })
    @ApiQuery({ name: 'endDate', required: false, type: String, example: '2026-03-31', description: 'End of date range (inclusive)' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 20, description: 'Items per page (default: 20, max: 100)' })
    async getContractorLogs(
        @Request() req,
        @Query('workerId') workerId?: string,
        @Query('projectId') projectId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.workLogsService.getContractorLogs(req.user.userId, {
            workerId,
            projectId,
            startDate,
            endDate,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }

    @Patch(':id/sign-off')
    @Roles(Role.CONTRACTOR)
    @ApiOperation({ summary: 'Sign off (approve/reject) a work log' })
    async signOff(
        @Request() req,
        @Param('id') id: string,
        @Body() body: SignOffWorkLogDto,
    ) {
        return this.workLogsService.signOffLog(req.user.userId, id, body);
    }
}
