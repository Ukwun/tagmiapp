import { ContentRepository } from "../../content/repositories/content.repository";
import { ContentInteractionRepository } from "../../content/repositories/content-interaction.repository";
import { EngagementSignalRepository } from "../../content/repositories/engagement-signal.repository";
import { HashtagStatRepository } from "../../ai/trending/repositories/hashtag-stat.repository";
export declare class AdminEngagementService {
    private readonly contentRepo;
    private readonly interactionRepo;
    private readonly signalRepo;
    private readonly hashtagStatRepo;
    constructor(contentRepo: ContentRepository, interactionRepo: ContentInteractionRepository, signalRepo: EngagementSignalRepository, hashtagStatRepo: HashtagStatRepository);
    getMetrics(): Promise<{
        interactions: Record<string, number>;
        totalInteractions: number;
        signals: {
            total: number;
            avgDwellTimeMs: number;
            avgMediaProgress: number;
            avgScrollDepth: number;
        };
        content: {
            avgCompletionRate: number;
            avgWatchTime: number;
            avgDwellTime: number;
            avgEngagementScore: number;
        };
    }>;
    getTopContent(period?: string, limit?: number): Promise<{
        id: string;
        postId: string;
        contentType: "text" | "image" | "video" | "audio";
        caption: string;
        user: {
            id: string;
            username: string;
            displayName: string;
            avatarUrl: string;
        };
        viewCount: number;
        likeCount: number;
        commentCount: number;
        engagementScore: number;
        completionRate: number;
        createdAt: Date;
    }[]>;
    getContentTypeBreakdown(): Promise<{
        type: any;
        count: number;
        avgEngagement: number;
        avgViews: number;
        avgLikes: number;
    }[]>;
    getTrendingHashtags(limit?: number): Promise<import("../../ai/trending/hashtag-stat.entity").HashtagStat[]>;
}
