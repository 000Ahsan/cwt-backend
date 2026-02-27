import { PrismaService } from '../common/prisma/prisma.service';
import { WorkLog } from '@prisma/client';
export declare class WorkLogsService {
    private prisma;
    constructor(prisma: PrismaService);
    createLog(workerId: string, data: {
        sessionId: string;
        description: string;
        photos?: any[];
    }): Promise<WorkLog>;
}
