import { ReportsService } from './reports.service';
export declare class ReportsController {
    private reportsService;
    constructor(reportsService: ReportsService);
    getDaily(req: any, dateStr: string): Promise<({
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
    getWeekly(req: any, dateStr: string): Promise<({
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
