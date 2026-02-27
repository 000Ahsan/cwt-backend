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
        createdAt: Date;
        updatedAt: Date;
        workerId: string;
        projectId: string;
        startTime: Date;
        endTime: Date | null;
        totalMinutes: number | null;
        date: Date;
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
        workerId: string;
        projectId: string;
        startTime: Date;
        endTime: Date | null;
        totalMinutes: number | null;
        date: Date;
    })[]>;
}
