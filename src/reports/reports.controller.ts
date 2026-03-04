import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CONTRACTOR)
export class ReportsController {
    constructor(private reportsService: ReportsService) { }

    @Get('daily')
    @ApiOperation({ summary: 'Get daily report for the contractor' })
    @ApiQuery({ name: 'date', required: false, type: String, example: '2024-03-20' })
    async getDaily(@Request() req, @Query('date') dateStr: string) {
        const date = dateStr ? new Date(dateStr) : new Date();
        return this.reportsService.getDailyReport(req.user.userId, date);
    }

    @Get('weekly')
    @ApiOperation({ summary: 'Get weekly report for the contractor' })
    @ApiQuery({ name: 'startDate', required: false, type: String, example: '2024-03-18' })
    async getWeekly(@Request() req, @Query('startDate') dateStr: string) {
        const date = dateStr ? new Date(dateStr) : new Date();
        return this.reportsService.getWeeklyReport(req.user.userId, date);
    }

    @Get('dashboard-stats')
    @ApiOperation({ summary: 'Get dashboard statistics for the contractor' })
    async getDashboardStats(@Request() req) {
        return this.reportsService.getDashboardStats(req.user.userId);
    }

    @Get('chart/projects')
    @ApiOperation({ summary: 'Daily minutes logged per project (line chart data)' })
    @ApiQuery({ name: 'startDate', required: true, type: String, example: '2026-03-01', description: 'Start of date range (YYYY-MM-DD)' })
    @ApiQuery({ name: 'endDate', required: true, type: String, example: '2026-03-31', description: 'End of date range (YYYY-MM-DD)' })
    async getProjectsChart(
        @Request() req,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        return this.reportsService.getProjectsChartData(req.user.userId, startDate, endDate);
    }

    @Get('chart/workers')
    @ApiOperation({ summary: 'Daily minutes logged per worker (line chart data)' })
    @ApiQuery({ name: 'startDate', required: true, type: String, example: '2026-03-01', description: 'Start of date range (YYYY-MM-DD)' })
    @ApiQuery({ name: 'endDate', required: true, type: String, example: '2026-03-31', description: 'End of date range (YYYY-MM-DD)' })
    async getWorkersChart(
        @Request() req,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        return this.reportsService.getWorkersChartData(req.user.userId, startDate, endDate);
    }
}
