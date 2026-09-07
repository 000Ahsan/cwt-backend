import { Controller, Get, Post, Body, UseGuards, Request, Delete } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StartSessionDto } from './dto/start-session.dto';

@ApiTags('Sessions')
@ApiBearerAuth()
@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionsController {
    constructor(private sessionsService: SessionsService) { }

    @Post('start')
    @Roles(Role.WORKER)
    @ApiOperation({ summary: 'Start a new work session' })
    async startSession(@Request() req, @Body() startSessionDto: StartSessionDto) {
        return this.sessionsService.startSession(req.user.userId, startSessionDto.projectId, startSessionDto.workCategoryId);
    }

    @Post('restart')
    @Roles(Role.WORKER)
    @ApiOperation({ summary: 'Restart (reset) current work session' })
    async restartSession(@Request() req, @Body() startSessionDto: StartSessionDto) {
        return this.sessionsService.restartSession(req.user.userId, startSessionDto.projectId, startSessionDto.workCategoryId);
    }

    @Post('pause')
    @Roles(Role.WORKER)
    @ApiOperation({ summary: 'Pause current active session' })
    async pauseSession(@Request() req) {
        return this.sessionsService.pauseSession(req.user.userId);
    }

    @Post('resume')
    @Roles(Role.WORKER)
    @ApiOperation({ summary: 'Resume current paused session' })
    async resumeSession(@Request() req) {
        return this.sessionsService.resumeSession(req.user.userId);
    }

    @Post('end')
    @Roles(Role.WORKER)
    @ApiOperation({ summary: 'End the current active session' })
    async endSession(@Request() req) {
        return this.sessionsService.endSession(req.user.userId);
    }

    @Get('my-history')
    @Roles(Role.WORKER)
    @ApiOperation({ summary: 'Get work history for the logged-in worker' })
    async history(@Request() req) {
        return this.sessionsService.getWorkHistory(req.user.userId);
    }

    @Delete('discard')
    @Roles(Role.WORKER)
    @ApiOperation({ summary: 'Discard (permanently delete) the current active session' })
    async discard(@Request() req) {
        return this.sessionsService.discardActiveSession(req.user.userId);
    }
}
