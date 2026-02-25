import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CONTRACTOR)
export class ReportsController {
    constructor(private reportsService: ReportsService) { }

    @Get('daily')
    async getDaily(@Request() req, @Query('date') dateStr: string) {
        const date = dateStr ? new Date(dateStr) : new Date();
        return this.reportsService.getDailyReport(req.user.userId, date);
    }

    @Get('weekly')
    async getWeekly(@Request() req, @Query('startDate') dateStr: string) {
        const date = dateStr ? new Date(dateStr) : new Date();
        return this.reportsService.getWeeklyReport(req.user.userId, date);
    }
}
