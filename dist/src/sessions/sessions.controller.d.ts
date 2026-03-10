import { SessionsService } from './sessions.service';
import { StartSessionDto } from './dto/start-session.dto';
export declare class SessionsController {
    private sessionsService;
    constructor(sessionsService: SessionsService);
    start(req: any, body: StartSessionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        projectId: string;
        workerId: string;
        startTime: Date;
        endTime: Date | null;
        totalMinutes: number | null;
    }>;
    end(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        projectId: string;
        workerId: string;
        startTime: Date;
        endTime: Date | null;
        totalMinutes: number | null;
    }>;
    history(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        projectId: string;
        workerId: string;
        startTime: Date;
        endTime: Date | null;
        totalMinutes: number | null;
    }[]>;
    discard(req: any): Promise<{
        message: string;
    }>;
}
