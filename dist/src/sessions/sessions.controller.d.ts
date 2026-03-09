import { SessionsService } from './sessions.service';
import { StartSessionDto } from './dto/start-session.dto';
export declare class SessionsController {
    private sessionsService;
    constructor(sessionsService: SessionsService);
    start(req: any, body: StartSessionDto): Promise<{
        id: string;
        workerId: string;
        projectId: string;
        startTime: Date;
        endTime: Date | null;
        totalMinutes: number | null;
        date: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    end(req: any): Promise<{
        id: string;
        workerId: string;
        projectId: string;
        startTime: Date;
        endTime: Date | null;
        totalMinutes: number | null;
        date: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    history(req: any): Promise<{
        id: string;
        workerId: string;
        projectId: string;
        startTime: Date;
        endTime: Date | null;
        totalMinutes: number | null;
        date: Date;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    discard(req: any): Promise<{
        message: string;
    }>;
}
