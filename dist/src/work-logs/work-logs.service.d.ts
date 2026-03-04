import { PrismaService } from '../common/prisma/prisma.service';
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
