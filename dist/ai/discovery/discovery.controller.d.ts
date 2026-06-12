import { DiscoveryService } from "./discovery.service";
export declare class DiscoveryController {
    private readonly discoveryService;
    constructor(discoveryService: DiscoveryService);
    getSimilarCreators(req: any, limit?: number): Promise<{
        id: string;
        username: string;
        displayName: string;
        avatarUrl: string;
        bio: string;
        followersCount: number;
        isVerified: boolean;
        sharedFollowers: number;
    }[]>;
    getSimilarCreatorsForUser(userId: string, limit?: number): Promise<{
        id: string;
        username: string;
        displayName: string;
        avatarUrl: string;
        bio: string;
        followersCount: number;
        isVerified: boolean;
        sharedFollowers: number;
    }[]>;
    getForYouFeed(req: any, page?: number, limit?: number): Promise<{
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
            shareCount: number;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
}
