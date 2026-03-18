import { PrismaService } from '../common/prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDailyReport(contractorId: string, date: Date): Promise<({
        project: {
            name: string;
        };
        worker: {
            name: string;
            email: string;
        };
        workLogs: ({
            photos: {
                id: string;
                createdAt: Date;
                workLogId: string;
                filePath: string;
                mimeType: string;
                size: number;
            }[];
        } & {
            id: string;
            createdAt: Date;
            description: string;
            status: import("@prisma/client").$Enums.WorkLogStatus;
            workSessionId: string;
            contractorComment: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        projectId: string;
        workerId: string;
        startTime: Date;
        endTime: Date | null;
        totalMinutes: number | null;
    })[]>;
    getWeeklyReport(contractorId: string, startDate: Date): Promise<({
        project: {
            id: string;
            name: string;
        };
        worker: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        projectId: string;
        workerId: string;
        startTime: Date;
        endTime: Date | null;
        totalMinutes: number | null;
    })[]>;
    getDashboardStats(contractorId: string): Promise<{
        projectsCount: number;
        workersCount: number;
        totalHoursLogged: number;
    }>;
    getProjectsChartData(contractorId: string, startDate: string, endDate: string): Promise<{
        projects: {
            id: string;
            name: string;
        }[];
        series: {
            date: string;
            data: Record<string, number>;
        }[];
    }>;
    getWorkersChartData(contractorId: string, startDate: string, endDate: string): Promise<{
        workers: {
            id: string;
            name: string;
        }[];
        series: {
            date: string;
            data: Record<string, number>;
        }[];
    }>;
}
