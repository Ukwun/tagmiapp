export declare class EngagementSignalDto {
    contentId: string;
    postId: string;
    contentType: "video" | "audio" | "image" | "text";
    mediaProgress: number;
    mediaCompleted: boolean;
    dwellTimeMs: number;
    scrollDepth?: number;
    slideIndex: number;
    totalSlides: number;
}
export declare class CreateEngagementSignalsDto {
    signals: EngagementSignalDto[];
}
