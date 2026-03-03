import 'multer';
import { WorkLogsService } from './work-logs.service';
import { CreateWorkLogDto } from './dto/create-work-log.dto';
export declare class WorkLogsController {
    private workLogsService;
    constructor(workLogsService: WorkLogsService);
    create(req: any, body: CreateWorkLogDto, files: Express.Multer.File[]): Promise<{
        description: string;
        id: string;
        workSessionId: string;
        createdAt: Date;
    }>;
}
