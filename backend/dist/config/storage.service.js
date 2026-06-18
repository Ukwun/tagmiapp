"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const crypto_1 = require("crypto");
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const fs_1 = require("fs");
const os = __importStar(require("os"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const sharp_1 = __importDefault(require("sharp"));
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
let StorageService = StorageService_1 = class StorageService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(StorageService_1.name);
        this.bucket = this.configService.get("WASABI_BUCKET") || "tagmi";
        this.cdnBaseUrl = this.configService.get("BUNNY_CDN_URL") || "";
        this.wasabiEndpoint = this.configService.get("WASABI_ENDPOINT") || "https://s3.wasabisys.com";
        this.s3 = new client_s3_1.S3Client({
            endpoint: this.wasabiEndpoint,
            region: this.configService.get("WASABI_REGION") || "us-east-1",
            credentials: {
                accessKeyId: this.configService.get("WASABI_ACCESS_KEY") || "",
                secretAccessKey: this.configService.get("WASABI_SECRET_KEY") || "",
            },
            forcePathStyle: true,
        });
    }
    getContentType(file) {
        return file.mimetype || "application/octet-stream";
    }
    generateKey(folder, file) {
        const ext = path.extname(file.originalname) || "";
        const id = (0, crypto_1.randomUUID)();
        return `${folder}/${id}${ext}`;
    }
    getUrl(key) {
        if (this.cdnBaseUrl) {
            return `${this.cdnBaseUrl.replace(/\/$/, "")}/${key}`;
        }
        return `${this.wasabiEndpoint}/${this.bucket}/${key}`;
    }
    async getSignedUrl(key, expiresIn = 3600) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        return (0, s3_request_presigner_1.getSignedUrl)(this.s3, command, { expiresIn });
    }
    async uploadFile(file, folder = "uploads") {
        const key = this.generateKey(folder, file);
        const body = file.path ? (0, fs_1.createReadStream)(file.path) : file.buffer;
        const upload = new lib_storage_1.Upload({
            client: this.s3,
            params: {
                Bucket: this.bucket,
                Key: key,
                Body: body,
                ContentType: this.getContentType(file),
                CacheControl: "public, max-age=31536000, immutable",
            },
            partSize: 10 * 1024 * 1024,
            leavePartsOnError: false,
        });
        await upload.done();
        if (file.path) {
            fs.unlink(file.path).catch(() => { });
        }
        this.logger.log(`Uploaded ${key} (${file.size} bytes)`);
        return {
            secure_url: this.getUrl(key),
            public_id: key,
            resource_type: file.mimetype?.startsWith("video") ? "video" : file.mimetype?.startsWith("audio") ? "audio" : "image",
            format: path.extname(file.originalname).replace(".", ""),
            bytes: file.size,
        };
    }
    async processImage(file) {
        try {
            const input = file.path
                ? await fs.readFile(file.path)
                : file.buffer;
            const processed = await (0, sharp_1.default)(input)
                .rotate()
                .resize(1920, 1920, {
                fit: "inside",
                withoutEnlargement: true,
            })
                .webp({ quality: 82 })
                .toBuffer();
            const reduction = Math.round((1 - processed.length / file.size) * 100);
            this.logger.log(`Image compressed: ${file.originalname} (${file.size} -> ${processed.length} bytes, -${Math.max(reduction, 0)}%)`);
            return {
                ...file,
                buffer: processed,
                size: processed.length,
                originalname: file.originalname.replace(/\.[^.]+$/, ".webp"),
                mimetype: "image/webp",
                path: undefined,
            };
        }
        catch (err) {
            this.logger.warn(`Image processing failed, uploading original: ${err.message}`);
            return file;
        }
    }
    async uploadImage(file, folder = "images") {
        const processedFile = await this.processImage(file);
        return this.uploadFile(processedFile, folder);
    }
    async getVideoInfo(inputPath) {
        try {
            const { stdout } = await execFileAsync("ffprobe", [
                "-v", "quiet",
                "-print_format", "json",
                "-show_streams",
                "-show_format",
                inputPath,
            ], { timeout: 10000 });
            const info = JSON.parse(stdout);
            const videoStream = info.streams?.find((s) => s.codec_type === "video");
            return {
                width: parseInt(videoStream?.width || "0"),
                height: parseInt(videoStream?.height || "0"),
                bitrate: parseInt(info.format?.bit_rate || "0"),
                codec: videoStream?.codec_name || "unknown",
            };
        }
        catch {
            return { width: 0, height: 0, bitrate: 0, codec: "unknown" };
        }
    }
    async processVideoFaststart(file) {
        const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "faststart-"));
        const ext = path.extname(file.originalname) || ".mp4";
        const inputPath = path.join(tmpDir, `input${ext}`);
        const outputPath = path.join(tmpDir, `output.mp4`);
        try {
            if (file.path) {
                await fs.copyFile(file.path, inputPath);
            }
            else {
                await fs.writeFile(inputPath, file.buffer);
            }
            const info = await this.getVideoInfo(inputPath);
            const maxHeight = 720;
            const maxBitrate = 2500000;
            const needsTranscode = info.height > maxHeight || info.bitrate > maxBitrate || info.codec !== "h264";
            const ffmpegArgs = ["-i", inputPath];
            if (needsTranscode) {
                const scaleFilter = info.height > maxHeight
                    ? ["-vf", `scale=-2:${maxHeight}`]
                    : [];
                ffmpegArgs.push(...scaleFilter, "-c:v", "libx264", "-preset", "fast", "-crf", "23", "-maxrate", "2500k", "-bufsize", "5000k", "-profile:v", "high", "-level", "4.0", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", "-y", outputPath);
                this.logger.log(`Transcoding ${file.originalname}: ${info.width}x${info.height} ${info.codec} ${Math.round(info.bitrate / 1000)}kbps -> 720p H.264`);
            }
            else {
                ffmpegArgs.push("-c", "copy", "-movflags", "+faststart", "-y", outputPath);
                this.logger.log(`Faststart only (already optimized): ${file.originalname}`);
            }
            const timeout = needsTranscode ? 300000 : 120000;
            await execFileAsync("ffmpeg", ffmpegArgs, { timeout });
            const buffer = await fs.readFile(outputPath);
            const processedFile = {
                ...file,
                buffer,
                size: buffer.length,
                originalname: file.originalname.replace(/\.[^.]+$/, ".mp4"),
                mimetype: "video/mp4",
                path: outputPath,
            };
            const reduction = Math.round((1 - buffer.length / file.size) * 100);
            this.logger.log(`Video processed: ${file.originalname} (${file.size} -> ${buffer.length} bytes, ${reduction > 0 ? `-${reduction}` : `+${Math.abs(reduction)}`}%)`);
            return processedFile;
        }
        catch (err) {
            this.logger.warn(`Video processing failed, uploading original: ${err.message}`);
            return file;
        }
        finally {
            try {
                await fs.unlink(inputPath);
            }
            catch { }
        }
    }
    async uploadVideo(file, folder = "videos") {
        const processedFile = await this.processVideoFaststart(file);
        const result = await this.uploadFile(processedFile, folder);
        if (processedFile !== file && processedFile.path) {
            fs.unlink(processedFile.path).catch(() => { });
        }
        return result;
    }
    async generateVideoThumbnail(file) {
        const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "thumb-"));
        const inputPath = path.join(tmpDir, `input${path.extname(file.originalname) || ".mp4"}`);
        const outputPath = path.join(tmpDir, "thumb.jpg");
        try {
            if (file.path) {
                await fs.copyFile(file.path, inputPath);
            }
            else {
                await fs.writeFile(inputPath, file.buffer);
            }
            await execFileAsync("ffmpeg", [
                "-i", inputPath,
                "-ss", "1",
                "-vframes", "1",
                "-vf", "scale=640:-2",
                "-q:v", "3",
                "-y", outputPath,
            ], { timeout: 15000 });
            const buffer = await fs.readFile(outputPath);
            const thumbFile = {
                ...file,
                buffer,
                size: buffer.length,
                originalname: "thumbnail.jpg",
                mimetype: "image/jpeg",
                path: outputPath,
            };
            const result = await this.uploadFile(thumbFile, "thumbnails");
            return result.secure_url;
        }
        catch (err) {
            this.logger.warn(`Thumbnail generation failed: ${err.message}`);
            return "";
        }
        finally {
            try {
                const files = await fs.readdir(tmpDir);
                for (const f of files)
                    await fs.unlink(path.join(tmpDir, f));
                await fs.rmdir(tmpDir);
            }
            catch { }
        }
    }
    async splitVideo(file, segments) {
        const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "split-"));
        const ext = path.extname(file.originalname) || ".mp4";
        const inputPath = path.join(tmpDir, `input${ext}`);
        const results = [];
        try {
            if (file.path) {
                await fs.copyFile(file.path, inputPath);
            }
            else {
                await fs.writeFile(inputPath, file.buffer);
            }
            for (let i = 0; i < segments.length; i++) {
                const { start, end } = segments[i];
                const outputPath = path.join(tmpDir, `segment_${i}.mp4`);
                await execFileAsync("ffmpeg", [
                    "-ss", String(start),
                    "-i", inputPath,
                    "-t", String(end - start),
                    "-c", "copy",
                    "-avoid_negative_ts", "make_zero",
                    "-y", outputPath,
                ], { timeout: 30000 });
                const buffer = await fs.readFile(outputPath);
                const baseName = file.originalname.replace(/\.[^.]+$/, "");
                results.push({
                    ...file,
                    buffer,
                    size: buffer.length,
                    originalname: `${baseName}_part${i + 1}.mp4`,
                    mimetype: "video/mp4",
                });
            }
            return results;
        }
        finally {
            try {
                const files = await fs.readdir(tmpDir);
                for (const f of files)
                    await fs.unlink(path.join(tmpDir, f));
                await fs.rmdir(tmpDir);
            }
            catch { }
        }
    }
    async deleteFile(publicId) {
        try {
            await this.s3.send(new client_s3_1.DeleteObjectCommand({
                Bucket: this.bucket,
                Key: publicId,
            }));
            this.logger.log(`Deleted ${publicId}`);
            return { result: "ok" };
        }
        catch (error) {
            this.logger.error(`Failed to delete ${publicId}:`, error);
            return { result: "error" };
        }
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map