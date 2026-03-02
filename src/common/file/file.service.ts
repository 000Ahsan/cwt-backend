import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileService {
    private readonly uploadDir = path.join(process.cwd(), 'uploads');

    constructor() {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    /**
     * Saves a base64 string as a file and returns the relative path.
     * @param base64 The base64 string (can include data:image/xxx;base64, prefix)
     * @param subDir Optional subdirectory within uploads
     */
    async saveBase64Image(base64: string, subDir = 'logos'): Promise<string> {
        if (!base64 || !base64.includes('base64,')) {
            return base64; // Return as is if not a base64 string
        }

        const [meta, data] = base64.split('base64,');
        const extension = meta.match(/\/(.*?);/)?.[1] || 'png';
        const fileName = `${uuidv4()}.${extension}`;

        const targetDir = path.join(this.uploadDir, subDir);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const filePath = path.join(targetDir, fileName);
        fs.writeFileSync(filePath, data, { encoding: 'base64' });

        // Return the path that can be served by ServeStaticModule
        return `/uploads/${subDir}/${fileName}`;
    }

    /**
     * Deletes a file given its relative platform path (e.g. /uploads/logos/file.png)
     */
    async deleteFile(relativePath: string): Promise<void> {
        if (!relativePath || !relativePath.startsWith('/uploads/')) {
            return;
        }

        const absolutePath = path.join(process.cwd(), relativePath);
        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
        }
    }
}
