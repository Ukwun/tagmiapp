import { Repository } from "typeorm";
import { EmbeddingsService } from "../embeddings/embeddings.service";
import { Content } from "../../content/entities/content.entity";
export declare class RecommendationsService {
    private readonly embeddingsService;
    private readonly contentRepository;
    constructor(embeddingsService: EmbeddingsService, contentRepository: Repository<Content>);
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
    getRecommendedFeed(userId: string, page?: number, limit?: number): Promise<{
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
}
