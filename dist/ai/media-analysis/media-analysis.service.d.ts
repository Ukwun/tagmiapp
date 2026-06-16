export interface MediaAnalysisResult {
    transcription: string | null;
    aiDescription: string | null;
    categories: {
        category: string;
        confidence: number;
    }[] | null;
}
export declare class MediaAnalysisService {
    private readonly logger;
    private client;
    constructor();
    analyzeContent(contentType: "video" | "image" | "audio" | "text", mediaUrl: string | null, caption?: string | null): Promise<MediaAnalysisResult>;
    analyzeContentFromFile(contentType: "video" | "image" | "audio" | "text", localFilePath: string, caption?: string | null): Promise<MediaAnalysisResult>;
    private analyzeImage;
    private analyzeImageFromFile;
    private analyzeVideo;
    private analyzeVideoFromFile;
    private analyzeAudioContent;
    private callClaudeVision;
    private callClaudeText;
    private parseClaudeResponse;
    private extractVideoFrames;
    private getVideoDuration;
    private extractAndTranscribeAudio;
    private downloadFile;
    private fileToBase64;
    private getImageExtension;
    private getMediaType;
    private detectImageType;
    private cleanupDir;
}
