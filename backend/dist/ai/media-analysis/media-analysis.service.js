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
var MediaAnalysisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaAnalysisService = void 0;
const common_1 = require("@nestjs/common");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const fs = __importStar(require("fs/promises"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const categories_constant_1 = require("../../common/constants/categories.constant");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
let MediaAnalysisService = MediaAnalysisService_1 = class MediaAnalysisService {
    constructor() {
        this.logger = new common_1.Logger(MediaAnalysisService_1.name);
        this.client = null;
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (apiKey) {
            this.client = new sdk_1.default({ apiKey });
            this.logger.log(`Anthropic client initialized for media analysis (key: ${apiKey.substring(0, 20)}...)`);
        }
        else {
            this.logger.warn("ANTHROPIC_API_KEY not set — media analysis will be disabled");
        }
    }
    async analyzeContent(contentType, mediaUrl, caption) {
        if (!mediaUrl || contentType === "text") {
            return { transcription: null, aiDescription: null, categories: null };
        }
        if (!this.client) {
            this.logger.warn("Anthropic client not available — skipping analysis");
            return { transcription: null, aiDescription: null, categories: null };
        }
        try {
            switch (contentType) {
                case "video":
                    return this.analyzeVideo(mediaUrl, caption);
                case "image":
                    return this.analyzeImage(mediaUrl, caption);
                case "audio":
                    return this.analyzeAudioContent(mediaUrl, caption);
                default:
                    return { transcription: null, aiDescription: null, categories: null };
            }
        }
        catch (error) {
            this.logger.warn(`Media analysis failed for ${contentType}: ${error.message}`);
            return { transcription: null, aiDescription: null, categories: null };
        }
    }
    async analyzeContentFromFile(contentType, localFilePath, caption) {
        if (!localFilePath || contentType === "text") {
            return { transcription: null, aiDescription: null, categories: null };
        }
        if (!this.client) {
            this.logger.warn("Anthropic client not available — skipping analysis");
            return { transcription: null, aiDescription: null, categories: null };
        }
        try {
            switch (contentType) {
                case "video":
                    return this.analyzeVideoFromFile(localFilePath, caption);
                case "image":
                    return this.analyzeImageFromFile(localFilePath, caption);
                case "audio":
                    return this.analyzeAudioContent("file://" + localFilePath, caption);
                default:
                    return { transcription: null, aiDescription: null, categories: null };
            }
        }
        catch (error) {
            this.logger.warn(`Media analysis from file failed for ${contentType}: ${error.message}`);
            return { transcription: null, aiDescription: null, categories: null };
        }
    }
    async analyzeImage(mediaUrl, caption) {
        const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "media-analysis-"));
        try {
            const ext = this.getImageExtension(mediaUrl);
            const imagePath = path.join(tmpDir, `input.${ext}`);
            await this.downloadFile(mediaUrl, imagePath);
            const imageBase64 = await this.fileToBase64(imagePath);
            const mediaType = await this.detectImageType(imagePath);
            const result = await this.callClaudeVision([{ base64: imageBase64, mediaType }], caption);
            return { transcription: null, ...result };
        }
        finally {
            await this.cleanupDir(tmpDir);
        }
    }
    async analyzeImageFromFile(imagePath, caption) {
        const imageBase64 = await this.fileToBase64(imagePath);
        const mediaType = await this.detectImageType(imagePath);
        const result = await this.callClaudeVision([{ base64: imageBase64, mediaType }], caption);
        return { transcription: null, ...result };
    }
    async analyzeVideo(mediaUrl, caption) {
        const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "media-analysis-"));
        try {
            const videoPath = path.join(tmpDir, "input.mp4");
            await this.downloadFile(mediaUrl, videoPath);
            const [framePaths, transcription] = await Promise.all([
                this.extractVideoFrames(videoPath, tmpDir),
                this.extractAndTranscribeAudio(videoPath, tmpDir),
            ]);
            if (framePaths.length === 0) {
                this.logger.warn("No frames extracted from video — skipping analysis");
                return { transcription, aiDescription: null, categories: null };
            }
            const images = [];
            for (const framePath of framePaths) {
                const base64 = await this.fileToBase64(framePath);
                images.push({ base64, mediaType: "image/jpeg" });
            }
            const result = await this.callClaudeVision(images, caption, true, transcription);
            return { transcription, ...result };
        }
        finally {
            await this.cleanupDir(tmpDir);
        }
    }
    async analyzeVideoFromFile(videoPath, caption) {
        const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "media-analysis-"));
        try {
            const [framePaths, transcription] = await Promise.all([
                this.extractVideoFrames(videoPath, tmpDir),
                this.extractAndTranscribeAudio(videoPath, tmpDir),
            ]);
            if (framePaths.length === 0) {
                this.logger.warn("No frames extracted from video — skipping analysis");
                return { transcription, aiDescription: null, categories: null };
            }
            const images = [];
            for (const framePath of framePaths) {
                const base64 = await this.fileToBase64(framePath);
                images.push({ base64, mediaType: "image/jpeg" });
            }
            const result = await this.callClaudeVision(images, caption, true, transcription);
            return { transcription, ...result };
        }
        finally {
            await this.cleanupDir(tmpDir);
        }
    }
    async analyzeAudioContent(mediaUrl, caption) {
        if (!caption) {
            return { transcription: null, aiDescription: null, categories: null };
        }
        try {
            const result = await this.callClaudeText(caption);
            return { transcription: null, ...result };
        }
        catch (error) {
            this.logger.warn(`Audio categorization failed: ${error.message}`);
            return { transcription: null, aiDescription: null, categories: null };
        }
    }
    async callClaudeVision(images, caption, isVideo = false, transcription) {
        const contentBlocks = [];
        for (const img of images) {
            contentBlocks.push({
                type: "image",
                source: {
                    type: "base64",
                    media_type: img.mediaType,
                    data: img.base64,
                },
            });
        }
        const mediaWord = isVideo ? "video frames" : "image";
        const captionContext = caption ? `\nThe creator's caption is: "${caption}"` : "";
        const audioContext = transcription ? `\nAudio transcription: "${transcription}"` : "";
        contentBlocks.push({
            type: "text",
            text: `Analyze this ${mediaWord} from a social media platform for creative talent (musicians, comedians, dancers, artists, etc).${captionContext}${audioContext}

Respond with ONLY valid JSON in this exact format, no other text:
{
  "description": "A clear one-sentence description of what is shown",
  "categories": [
    {"category": "CategoryName", "confidence": 0.85},
    {"category": "CategoryName", "confidence": 0.60}
  ]
}

Rules:
- description: One natural sentence describing the content. Be specific about what you see.
- categories: Pick 1-3 most relevant from ONLY this list: ${categories_constant_1.TALENT_CATEGORIES.join(", ")}
- confidence: 0.0 to 1.0 based on how clearly the content matches that category
- If nothing matches well, return an empty categories array
- Do NOT invent categories outside the list`,
        });
        const response = await this.client.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 300,
            messages: [{ role: "user", content: contentBlocks }],
        });
        return this.parseClaudeResponse(response);
    }
    async callClaudeText(text) {
        const response = await this.client.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 300,
            messages: [
                {
                    role: "user",
                    content: `Categorize this social media post caption from a creative talent platform:

"${text}"

Respond with ONLY valid JSON in this exact format:
{
  "description": "A brief description of what this post is about",
  "categories": [
    {"category": "CategoryName", "confidence": 0.85}
  ]
}

Pick 1-3 categories from ONLY this list: ${categories_constant_1.TALENT_CATEGORIES.join(", ")}
confidence: 0.0 to 1.0. If nothing matches, return empty categories array.`,
                },
            ],
        });
        return this.parseClaudeResponse(response);
    }
    parseClaudeResponse(response) {
        try {
            const text = response.content[0]?.type === "text" ? response.content[0].text : null;
            if (!text)
                return { aiDescription: null, categories: null };
            const jsonStr = text.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
            const parsed = JSON.parse(jsonStr);
            const aiDescription = parsed.description || null;
            const categories = Array.isArray(parsed.categories)
                ? parsed.categories
                    .filter((c) => categories_constant_1.TALENT_CATEGORIES.includes(c.category) && typeof c.confidence === "number")
                    .map((c) => ({
                    category: c.category,
                    confidence: Math.min(1, Math.max(0, c.confidence)),
                }))
                : null;
            return { aiDescription, categories: categories?.length ? categories : null };
        }
        catch (error) {
            this.logger.warn(`Failed to parse Claude response: ${error.message}`);
            return { aiDescription: null, categories: null };
        }
    }
    async extractVideoFrames(videoPath, tmpDir) {
        try {
            const duration = await this.getVideoDuration(videoPath);
            if (duration <= 0)
                return [];
            const timestamps = [
                Math.max(0.5, duration * 0.25),
                duration * 0.5,
                Math.min(duration - 0.5, duration * 0.75),
            ];
            const framePaths = [];
            for (let i = 0; i < timestamps.length; i++) {
                const framePath = path.join(tmpDir, `frame_${i}.jpg`);
                try {
                    await execFileAsync("/opt/homebrew/bin/ffmpeg", [
                        "-ss", String(timestamps[i]),
                        "-i", videoPath,
                        "-vframes", "1",
                        "-vf", "scale=768:-2",
                        "-q:v", "3",
                        "-y", framePath,
                    ], { timeout: 15000 });
                    const stat = await fs.stat(framePath).catch(() => null);
                    if (stat && stat.size > 0) {
                        framePaths.push(framePath);
                    }
                }
                catch {
                }
            }
            return framePaths;
        }
        catch (error) {
            this.logger.warn(`Frame extraction failed: ${error.message}`);
            return [];
        }
    }
    async getVideoDuration(videoPath) {
        try {
            const { stdout } = await execFileAsync("/opt/homebrew/bin/ffprobe", [
                "-v", "quiet",
                "-print_format", "json",
                "-show_format",
                videoPath,
            ], { timeout: 10000 });
            const info = JSON.parse(stdout);
            return parseFloat(info.format?.duration || "0");
        }
        catch {
            return 0;
        }
    }
    async extractAndTranscribeAudio(videoPath, tmpDir) {
        try {
            const audioPath = path.join(tmpDir, "audio.wav");
            await execFileAsync("/opt/homebrew/bin/ffmpeg", [
                "-i", videoPath,
                "-vn",
                "-acodec", "pcm_s16le",
                "-ar", "16000",
                "-ac", "1",
                "-y", audioPath,
            ], { timeout: 30000 });
            const stat = await fs.stat(audioPath).catch(() => null);
            if (!stat || stat.size === 0) {
                this.logger.warn("No audio extracted from video");
                return null;
            }
            const { stdout } = await execFileAsync("/opt/homebrew/bin/whisper-cli", [
                "-m", "/Users/nwong/.whisper-models/ggml-base.bin",
                "-f", audioPath,
                "--output-txt",
                "--no-timestamps",
                "--language", "auto",
            ], { timeout: 60000 });
            const transcription = stdout.trim();
            return transcription.length > 0 ? transcription : null;
        }
        catch (error) {
            this.logger.warn(`Audio transcription failed: ${error.message}`);
            return null;
        }
    }
    async downloadFile(url, outputPath) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000);
        try {
            const response = await fetch(url, { signal: controller.signal });
            if (!response.ok) {
                throw new Error(`Failed to download ${url}: ${response.status}`);
            }
            const buffer = Buffer.from(await response.arrayBuffer());
            await fs.writeFile(outputPath, buffer);
        }
        finally {
            clearTimeout(timeout);
        }
    }
    async fileToBase64(filePath) {
        const buffer = await fs.readFile(filePath);
        return buffer.toString("base64");
    }
    getImageExtension(url) {
        if (url.includes(".png"))
            return "png";
        if (url.includes(".webp"))
            return "webp";
        if (url.includes(".gif"))
            return "gif";
        return "jpg";
    }
    getMediaType(ext) {
        const types = {
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            webp: "image/webp",
            gif: "image/gif",
        };
        return types[ext] || "image/jpeg";
    }
    async detectImageType(filePath) {
        const buffer = await fs.readFile(filePath);
        if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
            return "image/jpeg";
        }
        if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
            return "image/png";
        }
        if (buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
            return "image/webp";
        }
        if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
            return "image/gif";
        }
        const ext = path.extname(filePath).toLowerCase().slice(1);
        return this.getMediaType(ext);
    }
    async cleanupDir(dirPath) {
        try {
            const files = await fs.readdir(dirPath);
            for (const file of files) {
                await fs.unlink(path.join(dirPath, file)).catch(() => { });
            }
            await fs.rmdir(dirPath).catch(() => { });
        }
        catch {
        }
    }
};
exports.MediaAnalysisService = MediaAnalysisService;
exports.MediaAnalysisService = MediaAnalysisService = MediaAnalysisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MediaAnalysisService);
//# sourceMappingURL=media-analysis.service.js.map