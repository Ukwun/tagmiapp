import { Repository } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Follow } from "../../follows/entities/follow.entity";
import { Content } from "../../content/entities/content.entity";
export declare class DiscoveryService {
    private readonly userRepository;
    private readonly followRepository;
    private readonly contentRepository;
    constructor(userRepository: Repository<User>, followRepository: Repository<Follow>, contentRepository: Repository<Content>);
    getSimilarCreators(userId: string, limit?: number): Promise<{
        id: string;
        username: string;
        displayName: string;
        avatarUrl: string;
        bio: string;
        followersCount: number;
        isVerified: boolean;
        sharedFollowers: number;
    }[]>;
    getForYouFeed(userId: string, page?: number, limit?: number): Promise<{
        data: {
            postId: string;
            userId: string;
            user: User;
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
    private getUserTopHashtags;
    private getFallbackSuggestions;
}
