import { Controller, Post, Body, UseGuards, Request, UseInterceptors, UploadedFiles } from '@nestjs/common';
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

@Controller('work-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkLogsController {
    constructor(private workLogsService: WorkLogsService) { }

    @Post()
    @Roles(Role.WORKER)
    @UseInterceptors(FilesInterceptor('photos', 5, {
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
    async create(@Request() req, @Body() body: any, @UploadedFiles() files: Express.Multer.File[]) {
        return this.workLogsService.createLog(req.user.userId, {
            sessionId: body.sessionId,
            description: body.description,
            photos: files,
        });
    }
}
