import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import { ConfigService } from "@nestjs/config";
export declare class CloudinaryService {
    private configService;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File, folder?: string): Promise<UploadApiResponse | UploadApiErrorResponse>;
    deleteFile(publicId: string): Promise<any>;
    uploadVideo(file: Express.Multer.File, folder?: string): Promise<UploadApiResponse | UploadApiErrorResponse>;
}
