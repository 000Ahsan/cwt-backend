import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as fsSync from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

export interface StoredFile {
  /** Public URL path, e.g. `/uploads/users/uuid.jpg` */
  filePath: string;
  mimeType: string;
  size: number;
}

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  getUploadRoot(): string {
    return process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
  }

  /**
   * Resolve a stored public path (`/uploads/...`) or relative path to an absolute disk path.
   */
  resolveAbsolutePath(storedPath: string): string {
    if (!storedPath) {
      return storedPath;
    }

    // Absolute filesystem path already
    if (path.isAbsolute(storedPath) && !storedPath.startsWith('/uploads')) {
      return storedPath;
    }

    // Public URL path: /uploads/...
    const normalized = storedPath.replace(/\\/g, '/');
    if (normalized.startsWith('/uploads/')) {
      const relative = normalized.slice('/uploads/'.length);
      return path.join(this.getUploadRoot(), relative);
    }

    // Legacy ./uploads/... or uploads/...
    const stripped = normalized.replace(/^\.\//, '').replace(/^uploads\//, '');
    return path.join(this.getUploadRoot(), stripped);
  }

  private extensionFromMime(mimeType: string, originalName?: string): string {
    const fromName = originalName ? path.extname(originalName).toLowerCase() : '';
    if (fromName && fromName.length <= 10) {
      return fromName;
    }

    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'image/heic': '.heic',
      'image/heif': '.heif',
      'application/pdf': '.pdf',
    };
    return map[mimeType] || '.bin';
  }

  private async ensureDir(dir: string): Promise<void> {
    await fs.mkdir(dir, { recursive: true });
  }

  /**
   * Save a multer memory-storage file under uploads/{subDir}/...
   * For `work-photos`, files are placed in uploads/work-photos/YYYY/MM/.
   */
  async saveMulterFile(file: Express.Multer.File, subDir: string): Promise<StoredFile> {
    if (!file?.buffer?.length) {
      throw new Error('Empty file upload');
    }

    let relativeDir = subDir.replace(/^\/+|\/+$/g, '');
    if (relativeDir === 'work-photos') {
      const now = new Date();
      const year = String(now.getUTCFullYear());
      const month = String(now.getUTCMonth() + 1).padStart(2, '0');
      relativeDir = path.posix.join('work-photos', year, month);
    }

    const ext = this.extensionFromMime(file.mimetype, file.originalname);
    const filename = `${randomUUID()}${ext}`;
    const absoluteDir = path.join(this.getUploadRoot(), ...relativeDir.split('/'));
    await this.ensureDir(absoluteDir);

    const absolutePath = path.join(absoluteDir, filename);
    await fs.writeFile(absolutePath, file.buffer);

    const filePath = `/uploads/${relativeDir}/${filename}`.replace(/\\/g, '/');

    return {
      filePath,
      mimeType: file.mimetype || 'application/octet-stream',
      size: file.size ?? file.buffer.length,
    };
  }

  async saveMulterFiles(files: Express.Multer.File[], subDir: string): Promise<StoredFile[]> {
    if (!files?.length) {
      return [];
    }
    return Promise.all(files.map((file) => this.saveMulterFile(file, subDir)));
  }

  /**
   * Saves a base64 data-URL image and returns the public `/uploads/...` path.
   * Non-base64 strings (existing URLs/paths) are returned unchanged.
   */
  async saveBase64Image(base64: string, subDir = 'logos'): Promise<string> {
    if (!base64 || !base64.includes('base64,')) {
      return base64;
    }

    try {
      const match = /^data:([^;]+);base64,(.+)$/s.exec(base64);
      if (!match) {
        return base64;
      }

      const mimeType = match[1];
      const buffer = Buffer.from(match[2], 'base64');
      const fakeFile = {
        buffer,
        mimetype: mimeType,
        size: buffer.length,
        originalname: `upload${this.extensionFromMime(mimeType)}`,
      } as Express.Multer.File;

      const stored = await this.saveMulterFile(fakeFile, subDir);
      return stored.filePath;
    } catch (error) {
      this.logger.error('Error saving base64 image locally', error instanceof Error ? error.stack : error);
      throw error;
    }
  }

  /**
   * Delete a previously stored local file. Ignores Cloudinary / external URLs.
   */
  async deleteFile(storedPath: string): Promise<void> {
    if (!storedPath) {
      return;
    }

    // Leave remote URLs alone (legacy Cloudinary records)
    if (/^https?:\/\//i.test(storedPath)) {
      return;
    }

    try {
      const absolutePath = this.resolveAbsolutePath(storedPath);
      if (fsSync.existsSync(absolutePath)) {
        await fs.unlink(absolutePath);
      }
    } catch (error) {
      this.logger.warn(`Failed to delete file ${storedPath}: ${error}`);
    }
  }
}
