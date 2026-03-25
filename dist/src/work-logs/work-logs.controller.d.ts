import 'multer';
import { WorkLogsService } from './work-logs.service';
import { CreateWorkLogDto } from './dto/create-work-log.dto';
import { SignOffWorkLogDto } from './dto/sign-off-work-log.dto';
export declare class WorkLogsController {
    private workLogsService;
    constructor(workLogsService: WorkLogsService);
    create(req: any, body: CreateWorkLogDto, files: Express.Multer.File[]): Promise<any>;
    getWorkerLogs(req: any): Promise<{
        photos: {
            id: string;
            createdAt: Date;
            workLogId: string;
            filePath: string;
            mimeType: string;
            size: number;
        }[];
        workSession: {
            project: {
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
        };
        id: string;
        createdAt: Date;
        description: string;
        status: import("@prisma/client").$Enums.WorkLogStatus;
        workSessionId: string;
        contractorComment: string | null;
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
                workLogId: string;
                filePath: string;
                mimeType: string;
                size: number;
            }[];
            workSession: {
                project: {
                    id: string;
                    name: string;
                    address: string | null;
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
                date: Date;
                projectId: string;
                workerId: string;
                startTime: Date;
                endTime: Date | null;
                totalMinutes: number | null;
            };
            id: string;
            createdAt: Date;
            description: string;
            status: import("@prisma/client").$Enums.WorkLogStatus;
            workSessionId: string;
            contractorComment: string | null;
        }[];
    }>;
    signOff(req: any, id: string, body: SignOffWorkLogDto): Promise<{
        id: string;
        createdAt: Date;
        description: string;
        status: import("@prisma/client").$Enums.WorkLogStatus;
        workSessionId: string;
        contractorComment: string | null;
    }>;
}
