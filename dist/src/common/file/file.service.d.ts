export declare class FileService {
    private readonly uploadDir;
    constructor();
    saveBase64Image(base64: string, subDir?: string): Promise<string>;
    deleteFile(relativePath: string): Promise<void>;
}
