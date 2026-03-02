import { Controller, Get, Param, Res, UseGuards, Request, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from '../common/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Work Photos')
@ApiBearerAuth()
@Controller('uploads/work-photos')
@UseGuards(JwtAuthGuard)
export class WorkPhotosController {
    constructor(private prisma: PrismaService) { }

    @Get(':year/:month/:filename')
    @ApiOperation({ summary: 'View/Download a work photo (authorized access only)' })
    async getPhoto(
        @Param('year') year: string,
        @Param('month') month: string,
        @Param('filename') filename: string,
        @Request() req,
        @Res() res: Response,
    ) {
        const relativePath = `./uploads/work-photos/${year}/${month}/${filename}`;

        // Auth Check: Does this photo belong to a project the user can access?
        const photo = await this.prisma.workPhoto.findFirst({
            where: { filePath: relativePath },
            include: {
                workLog: {
                    include: {
                        workSession: {
                            include: {
                                project: true,
                            },
                        },
                    },
                },
            },
        });

        if (!photo) throw new NotFoundException('Photo not found');

        const project = photo.workLog.workSession.project;
        const workerId = photo.workLog.workSession.workerId;

        if (req.user.role === Role.CONTRACTOR) {
            if (project.contractorId !== req.user.userId) throw new ForbiddenException();
        } else {
            if (workerId !== req.user.userId) throw new ForbiddenException();
        }

        const absolutePath = path.resolve(relativePath);
        if (!fs.existsSync(absolutePath)) throw new NotFoundException('File on disk not found');

        res.sendFile(absolutePath);
    }
}
