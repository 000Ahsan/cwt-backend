import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) {}

    @Get()
    @Roles(Role.CONTRACTOR)
    async getAttendanceLogs(
        @Request() req,
        @Query('workerId') workerId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.attendanceService.getAttendanceLogs(req.user.userId, {
            workerId,
            startDate,
            endDate,
        });
    }

    @Get('worker')
    @Roles(Role.WORKER)
    async getWorkerAttendance(
        @Request() req,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.attendanceService.getWorkerAttendance(req.user.userId, {
            startDate,
            endDate,
        });
    }
}
