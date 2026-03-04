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
                filePath: string;
                mimeType: string;
                size: number;
                workLogId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            description: string;
            workSessionId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        workerId: string;
        startTime: Date;
        endTime: Date | null;
        totalMinutes: number | null;
        date: Date;
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
        projectId: string;
        workerId: string;
        startTime: Date;
        endTime: Date | null;
        totalMinutes: number | null;
        date: Date;
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
