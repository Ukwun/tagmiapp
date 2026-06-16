import { ContentRepository } from "./repositories/content.repository";
import { UserPreferenceRepository } from "./repositories/user-preference.repository";
import { RedisService } from "../config/redis.service";
export interface EngagementSignal {
    type: "like" | "comment" | "share" | "save" | "watch" | "skip";
    metadata?: {
        watchTimePercent?: number;
    };
}
export declare class UserPreferenceLearningService {
    private readonly contentRepository;
    private readonly userPreferenceRepository;
    private readonly redisService;
    constructor(contentRepository: ContentRepository, userPreferenceRepository: UserPreferenceRepository, redisService: RedisService);
    seedPreferencesFromInterests(userId: string, interests: string[]): Promise<void>;
    updatePreferencesFromEngagement(userId: string, contentId: number | string, signal: EngagementSignal): Promise<void>;
    getTopPreferences(userId: string, limit?: number): Promise<import("./entities/user-category-preference.entity").UserCategoryPreference[]>;
    private calculateEngagementStrength;
    private invalidateFeedCache;
}
