import { PrismaService } from '../common/prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDailyReport(contractorId: string, date: Date): Promise<({
        worker: {
            name: string;
            email: string;
        };
        project: {
            name: string;
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
            workSessionId: string;
        })[];
    } & {
        id: string;
        workerId: string;
        projectId: string;
        startTime: Date;
        endTime: Date | null;
        totalMinutes: number | null;
        date: Date;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getWeeklyReport(contractorId: string, startDate: Date): Promise<({
        worker: {
            id: string;
            name: string;
        };
        project: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        workerId: string;
        projectId: string;
        startTime: Date;
        endTime: Date | null;
        totalMinutes: number | null;
        date: Date;
        createdAt: Date;
        updatedAt: Date;
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
