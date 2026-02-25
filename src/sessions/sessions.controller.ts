import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionsController {
    constructor(private sessionsService: SessionsService) { }

    @Post('start')
    @Roles(Role.WORKER)
    async start(@Request() req, @Body('projectId') projectId: string) {
        return this.sessionsService.startSession(req.user.userId, projectId);
    }

    @Post('end')
    @Roles(Role.WORKER)
    async end(@Request() req) {
        return this.sessionsService.endSession(req.user.userId);
    }

    @Get('my-history')
    @Roles(Role.WORKER)
    async history(@Request() req) {
        return this.sessionsService.getWorkHistory(req.user.userId);
    }
}
