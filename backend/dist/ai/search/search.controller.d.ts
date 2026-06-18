import { SearchService } from "./search.service";
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
    search(query: string, type?: "content" | "talent", page?: number, limit?: number): Promise<{
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
