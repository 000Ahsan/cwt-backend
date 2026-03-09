import { ReportsService } from './reports.service';
export declare class ReportsController {
    private reportsService;
    constructor(reportsService: ReportsService);
    getDaily(req: any, dateStr: string): Promise<({
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
            status: import("@prisma/client").$Enums.WorkLogStatus;
            contractorComment: string | null;
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
    getWeekly(req: any, dateStr: string): Promise<({
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
    getDashboardStats(req: any): Promise<{
        projectsCount: number;
        workersCount: number;
        totalHoursLogged: number;
    }>;
    getProjectsChart(req: any, startDate: string, endDate: string): Promise<{
        projects: {
            id: string;
            name: string;
        }[];
        series: {
            date: string;
            data: Record<string, number>;
        }[];
    }>;
    getWorkersChart(req: any, startDate: string, endDate: string): Promise<{
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
