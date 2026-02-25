import 'multer';
import { WorkLogsService } from './work-logs.service';
export declare class WorkLogsController {
    private workLogsService;
    constructor(workLogsService: WorkLogsService);
    create(req: any, body: any, files: Express.Multer.File[]): Promise<{
        id: string;
        createdAt: Date;
        description: string;
        workSessionId: string;
    }>;
}
