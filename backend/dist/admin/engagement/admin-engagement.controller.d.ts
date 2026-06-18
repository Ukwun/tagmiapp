import { AdminEngagementService } from "./admin-engagement.service";
export declare class AdminEngagementController {
    private readonly engagementService;
    constructor(engagementService: AdminEngagementService);
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
    getTopContent(period?: string, limit?: string): Promise<{
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
    getTypeBreakdown(): Promise<{
        type: any;
        count: number;
        avgEngagement: number;
        avgViews: number;
        avgLikes: number;
    }[]>;
    getTrendingHashtags(limit?: string): Promise<import("../../ai/trending/hashtag-stat.entity").HashtagStat[]>;
}
