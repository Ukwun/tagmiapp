import { RecommendationsService } from "./recommendations.service";
import { EmbeddingsService } from "../embeddings/embeddings.service";
export declare class RecommendationsController {
    private readonly recommendationsService;
    private readonly embeddingsService;
    constructor(recommendationsService: RecommendationsService, embeddingsService: EmbeddingsService);
    getSimilarContent(contentId: string, limit?: number): Promise<{
        data: any[];
        modelReady: boolean;
    } | {
        data: {
            postId: string;
            userId: string;
            user: import("../../users/entities/user.entity").User;
            caption: string;
            hashtags: string[];
            contentType: "text" | "image" | "video" | "audio";
            mediaUrl: string;
            thumbnailUrl: string;
            similarity: number;
            likeCount: number;
            commentCount: number;
            createdAt: Date;
        }[];
        modelReady?: undefined;
    }>;
    getRecommendedFeed(req: any, page?: number, limit?: number): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        modelReady: boolean;
    } | {
        data: {
            postId: string;
            userId: string;
            user: import("../../users/entities/user.entity").User;
            caption: string;
            hashtags: string[];
            contentType: "text" | "image" | "video" | "audio";
            mediaUrl: string;
            thumbnailUrl: string;
            engagementScore: number;
            viewCount: number;
            likeCount: number;
            commentCount: number;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        modelReady?: undefined;
    }>;
    getStatus(): Promise<{
        modelReady: boolean;
    }>;
    triggerContentBackfill(): Promise<{
        message: string;
    }>;
    triggerUserBackfill(): Promise<{
        message: string;
    }>;
}
