import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AttendanceService {
    constructor(private prisma: PrismaService) {}

    async logLogin(userId: string) {
        return this.prisma.attendance.create({
            data: {
                userId,
                loginTime: new Date(),
            },
        });
    }

    async logLogout(userId: string) {
        // Find the latest attendance record without a logout time
        const latestAttendance = await this.prisma.attendance.findFirst({
            where: {
                userId,
                logoutTime: null,
            },
            orderBy: {
                loginTime: 'desc',
            },
        });

        if (latestAttendance) {
            return this.prisma.attendance.update({
                where: { id: latestAttendance.id },
                data: {
                    logoutTime: new Date(),
                },
            });
        }
    }
}
