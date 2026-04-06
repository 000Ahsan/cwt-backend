import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AttendanceService {
    constructor(private prisma: PrismaService) { }

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

    async getAttendanceLogs(
        contractorId: string,
        filters: { workerId?: string; startDate?: string; endDate?: string },
    ) {
        const { workerId, startDate, endDate } = filters;

        const endOfDay = endDate
            ? new Date(new Date(endDate).setHours(23, 59, 59, 999))
            : undefined;

        const where: any = {
            user: { contractorId },
            ...(workerId && { userId: workerId }),
            ...(startDate || endDate
                ? {
                    loginTime: {
                        ...(startDate && { gte: new Date(startDate) }),
                        ...(endOfDay && { lte: endOfDay }),
                    },
                }
                : {}),
        };

        const attendances = await this.prisma.attendance.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { loginTime: 'asc' },
        });

        // Group by user and date
        const grouped = attendances.reduce((acc, curr) => {
            const dateStr = curr.loginTime.toISOString().split('T')[0];
            const key = `${curr.userId}_${dateStr}`;

            if (!acc[key]) {
                acc[key] = {
                    date: dateStr,
                    user: curr.user,
                    firstLogin: curr.loginTime,
                    lastLogout: curr.logoutTime,
                };
            } else {
                // Update first login if earlier
                if (curr.loginTime < acc[key].firstLogin) {
                    acc[key].firstLogin = curr.loginTime;
                }
                // Update last logout
                if (curr.logoutTime) {
                    if (!acc[key].lastLogout || curr.logoutTime > acc[key].lastLogout) {
                        acc[key].lastLogout = curr.logoutTime;
                    }
                }
            }
            return acc;
        }, {} as Record<string, any>);

        return Object.values(grouped).sort((a: any, b: any) => {
            if (a.date !== b.date) return b.date.localeCompare(a.date);
            return a.user.name.localeCompare(b.user.name);
        });
    }

    async getWorkerAttendance(userId: string, filters: { startDate?: string; endDate?: string }) {
        const { startDate, endDate } = filters;

        const endOfDay = endDate
            ? new Date(new Date(endDate).setHours(23, 59, 59, 999))
            : undefined;

        const where: any = {
            userId,
            ...(startDate || endDate
                ? {
                    loginTime: {
                        ...(startDate && { gte: new Date(startDate) }),
                        ...(endOfDay && { lte: endOfDay }),
                    },
                }
                : {}),
        };

        const attendances = await this.prisma.attendance.findMany({
            where,
            orderBy: { loginTime: 'desc' },
        });

        // Group by date
        const grouped = attendances.reduce((acc, curr) => {
            const dateStr = curr.loginTime.toISOString().split('T')[0];
            const key = dateStr;

            if (!acc[key]) {
                acc[key] = {
                    date: dateStr,
                    firstLogin: curr.loginTime,
                    lastLogout: curr.logoutTime,
                    sessions: 1,
                    totalMs: curr.logoutTime ? curr.logoutTime.getTime() - curr.loginTime.getTime() : 0,
                };
            } else {
                if (curr.loginTime < acc[key].firstLogin) {
                    acc[key].firstLogin = curr.loginTime;
                }
                if (curr.logoutTime) {
                    if (!acc[key].lastLogout || curr.logoutTime > acc[key].lastLogout) {
                        acc[key].lastLogout = curr.logoutTime;
                    }
                    acc[key].totalMs += curr.logoutTime.getTime() - curr.loginTime.getTime();
                }
                acc[key].sessions += 1;
            }
            return acc;
        }, {} as Record<string, any>);

        const data = Object.values(grouped).sort((a: any, b: any) => b.date.localeCompare(a.date));

        // Calculate stats
        let totalMs = 0;
        data.forEach((day: any) => {
            totalMs += day.totalMs;
        });

        return {
            data,
            stats: {
                totalDays: data.length,
                totalHours: totalMs / 3600000,
            }
        };
    }
}
