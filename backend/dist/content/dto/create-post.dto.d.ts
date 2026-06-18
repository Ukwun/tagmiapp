export declare class CreatePostDto {
    caption?: string;
    hashtags?: string[];
    backgroundMusicUrl?: string;
    slideTypes?: Record<number, string>;
    slideTexts?: Record<number, string>;
    slideBackgrounds?: Record<number, string>;
    slideFontStyles?: Record<number, string>;
    slideCaptions?: Record<number, string>;
    slideMusicIndex?: Record<number, string>;
    slideMusicTrimStart?: Record<number, string>;
    slideMusicTrimEnd?: Record<number, string>;
    videoTrimStart?: Record<number, string>;
    videoTrimEnd?: Record<number, string>;
    slideThumbnailIndex?: Record<number, string>;
    scheduledAt?: string;
}
