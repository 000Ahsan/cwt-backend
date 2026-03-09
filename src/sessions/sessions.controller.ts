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
    @ApiOperation({ summary: 'Start a work session for a project' })
    async start(@Request() req, @Body() body: StartSessionDto) {
        return this.sessionsService.startSession(req.user.userId, body.projectId);
    }

    @Post('end')
    @Roles(Role.WORKER)
    @ApiOperation({ summary: 'End the current work session' })
    async end(@Request() req) {
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
