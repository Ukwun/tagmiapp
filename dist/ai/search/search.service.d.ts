import { Repository } from "typeorm";
import { EmbeddingsService } from "../embeddings/embeddings.service";
import { Content } from "../../content/entities/content.entity";
import { User } from "../../users/entities/user.entity";
export declare class SearchService {
    private readonly embeddingsService;
    private readonly contentRepository;
    private readonly userRepository;
    constructor(embeddingsService: EmbeddingsService, contentRepository: Repository<Content>, userRepository: Repository<User>);
    searchContent(query: string, page?: number, limit?: number): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        modelReady: boolean;
    } | {
        data: {
            postId: string;
            userId: string;
            user: User;
            caption: string;
            hashtags: string[];
            contentType: "text" | "image" | "video" | "audio";
            mediaUrl: string;
            thumbnailUrl: string;
            similarity: number;
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
    searchTalent(query: string, page?: number, limit?: number): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        modelReady: boolean;
    } | {
        data: {
            id: string;
            username: string;
            displayName: string;
            avatarUrl: string;
            bio: string;
            followersCount: number;
            isVerified: boolean;
            similarity: number;
        }[];
        total: number;
        page: number;
        limit: number;
        modelReady?: undefined;
    }>;
}
