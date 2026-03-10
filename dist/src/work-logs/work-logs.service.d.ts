import { PrismaService } from '../common/prisma/prisma.service';
import { WorkLogStatus } from '@prisma/client';
export declare class WorkLogsService {
    private prisma;
    constructor(prisma: PrismaService);
    createLog(workerId: string, data: {
        sessionId: string;
        description: string;
        photos?: any[];
    }): Promise<any>;
    getWorkerLogs(workerId: string): Promise<{
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
            workerId: string;
            projectId: string;
            startTime: Date;
            endTime: Date | null;
            totalMinutes: number | null;
            date: Date;
            updatedAt: Date;
        };
        id: string;
        workSessionId: string;
        description: string;
        status: import("@prisma/client").$Enums.WorkLogStatus;
        contractorComment: string | null;
        createdAt: Date;
    }[]>;
    getContractorLogs(contractorId: string, filters: {
        workerId?: string;
        projectId?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    }): Promise<{
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
                worker: {
                    id: string;
                    name: string;
                    email: string;
                };
                project: {
                    id: string;
                    name: string;
                    address: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                workerId: string;
                projectId: string;
                startTime: Date;
                endTime: Date | null;
                totalMinutes: number | null;
                date: Date;
                updatedAt: Date;
            };
            id: string;
            workSessionId: string;
            description: string;
            status: import("@prisma/client").$Enums.WorkLogStatus;
            contractorComment: string | null;
            createdAt: Date;
        }[];
    }>;
    signOffLog(contractorId: string, logId: string, data: {
        status: WorkLogStatus;
        comment?: string;
    }): Promise<{
        id: string;
        workSessionId: string;
        description: string;
        status: import("@prisma/client").$Enums.WorkLogStatus;
        contractorComment: string | null;
        createdAt: Date;
    }>;
}
