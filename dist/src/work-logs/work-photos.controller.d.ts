import type { Response } from 'express';
import { PrismaService } from '../common/prisma/prisma.service';
export declare class WorkPhotosController {
    private prisma;
    constructor(prisma: PrismaService);
    getPhoto(year: string, month: string, filename: string, req: any, res: Response): Promise<void>;
}
