import { TrendingService } from "./trending.service";
import { ScoringService } from "../scoring/scoring.service";
export declare class TrendingController {
    private readonly trendingService;
    private readonly scoringService;
    constructor(trendingService: TrendingService, scoringService: ScoringService);
    getTrendingHashtags(limit?: number): Promise<import("./hashtag-stat.entity").HashtagStat[]>;
    getHashtagStats(hashtag: string): Promise<import("./hashtag-stat.entity").HashtagStat>;
    getTrendingPosts(page?: number, limit?: number): Promise<{
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
            viralityScore: number;
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
