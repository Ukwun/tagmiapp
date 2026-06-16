import { ConfigService } from "@nestjs/config";
export interface UploadResult {
    secure_url: string;
    public_id: string;
    resource_type: string;
    format: string;
    bytes: number;
}
export declare class StorageService {
    private configService;
    private readonly logger;
    private s3;
    private bucket;
    private cdnBaseUrl;
    private wasabiEndpoint;
    constructor(configService: ConfigService);
    private getContentType;
    private generateKey;
    private getUrl;
    getSignedUrl(key: string, expiresIn?: number): Promise<string>;
    uploadFile(file: Express.Multer.File, folder?: string): Promise<UploadResult>;
    private processImage;
    uploadImage(file: Express.Multer.File, folder?: string): Promise<UploadResult>;
    private getVideoInfo;
    private processVideoFaststart;
    uploadVideo(file: Express.Multer.File, folder?: string): Promise<UploadResult>;
    generateVideoThumbnail(file: Express.Multer.File): Promise<string>;
    splitVideo(file: Express.Multer.File, segments: {
        start: number;
        end: number;
    }[]): Promise<Express.Multer.File[]>;
    deleteFile(publicId: string): Promise<any>;
}
