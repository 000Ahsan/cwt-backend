import { PrismaService } from '../common/prisma/prisma.service';
import { WorkSession } from '@prisma/client';
export declare class SessionsService {
    private prisma;
    constructor(prisma: PrismaService);
    startSession(workerId: string, projectId: string): Promise<WorkSession>;
    endSession(workerId: string): Promise<WorkSession>;
    getWorkHistory(workerId: string): Promise<WorkSession[]>;
}
