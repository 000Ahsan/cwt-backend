import 'multer';
import { WorkLogsService } from './work-logs.service';
import { CreateWorkLogDto } from './dto/create-work-log.dto';
export declare class WorkLogsController {
    private workLogsService;
    constructor(workLogsService: WorkLogsService);
    create(req: any, body: CreateWorkLogDto, files: Express.Multer.File[]): Promise<any>;
    getWorkerLogs(req: any): Promise<{
        photos: {
            id: string;
            createdAt: Date;
            filePath: string;
            mimeType: string;
            size: number;
            workLogId: string;
        }[];
        workSession: {
            project: {
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
        };
        id: string;
        createdAt: Date;
        description: string;
        workSessionId: string;
    }[]>;
    getContractorLogs(req: any, workerId?: string, projectId?: string, startDate?: string, endDate?: string, page?: string, limit?: string): Promise<{
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        data: {
            photos: {
                url: string;
                id: string;
                createdAt: Date;
                filePath: string;
                mimeType: string;
                size: number;
                workLogId: string;
            }[];
            workSession: {
                project: {
                    id: string;
                    name: string;
                };
                worker: {
                    id: string;
                    name: string;
                    email: string;
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
            };
            id: string;
            createdAt: Date;
            description: string;
            workSessionId: string;
        }[];
    }>;
}
