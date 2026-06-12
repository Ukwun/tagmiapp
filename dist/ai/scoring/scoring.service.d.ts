import { Repository } from "typeorm";
import { Content } from "../../content/entities/content.entity";
import { EngagementSignal } from "../../content/entities/engagement-signal.entity";
import { RedisService } from "../../config/redis.service";
export declare class ScoringService {
    private readonly contentRepository;
    private readonly engagementSignalRepository;
    private readonly redisService;
    private readonly logger;
    constructor(contentRepository: Repository<Content>, engagementSignalRepository: Repository<EngagementSignal>, redisService: RedisService);
    flushSignalQueue(): Promise<void>;
    recalculateScores(): Promise<void>;
    private retryOnDeadlock;
    private executeScoreRecalculation;
    private calculateViralityScores;
    private aggregateEngagementSignals;
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
