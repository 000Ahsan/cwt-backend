import { SessionsService } from './sessions.service';
import { StartSessionDto } from './dto/start-session.dto';
export declare class SessionsController {
    private sessionsService;
    constructor(sessionsService: SessionsService);
    start(req: any, body: StartSessionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workerId: string;
        projectId: string;
        startTime: Date;
        endTime: Date | null;
        totalMinutes: number | null;
        date: Date;
    }>;
    end(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workerId: string;
        projectId: string;
        startTime: Date;
        endTime: Date | null;
        totalMinutes: number | null;
        date: Date;
    }>;
    history(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workerId: string;
        projectId: string;
        startTime: Date;
        endTime: Date | null;
        totalMinutes: number | null;
        date: Date;
    }[]>;
}
