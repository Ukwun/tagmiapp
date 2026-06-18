"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPreferenceLearningService = void 0;
const common_1 = require("@nestjs/common");
const content_repository_1 = require("./repositories/content.repository");
const user_preference_repository_1 = require("./repositories/user-preference.repository");
const redis_service_1 = require("../config/redis.service");
const ALPHA = 0.15;
const MIN_CONFIDENCE = 0.6;
const ENGAGEMENT_WEIGHTS = {
    like: 0.3,
    comment: 0.5,
    share: 0.7,
    save: 0.6,
    watchHigh: 0.8,
    watchLow: -0.2,
    skip: -0.3,
};
let UserPreferenceLearningService = class UserPreferenceLearningService {
    constructor(contentRepository, userPreferenceRepository, redisService) {
        this.contentRepository = contentRepository;
        this.userPreferenceRepository = userPreferenceRepository;
        this.redisService = redisService;
    }
    async seedPreferencesFromInterests(userId, interests) {
        await this.userPreferenceRepository.seedFromInterests(userId, interests);
    }
    async updatePreferencesFromEngagement(userId, contentId, signal) {
        const content = await this.contentRepository.findOne({
            where: { id: String(contentId) },
        });
        if (!content?.categories || !Array.isArray(content.categories) || content.categories.length === 0) {
            return;
        }
        const engagementStrength = this.calculateEngagementStrength(signal);
        for (const cat of content.categories) {
            if (cat.confidence < MIN_CONFIDENCE) {
                continue;
            }
            const existingPref = await this.userPreferenceRepository.findOne(userId, cat.category);
            if (!existingPref) {
                const initialScore = 0.5 + engagementStrength * 0.2;
                const clampedScore = Math.max(0, Math.min(1, initialScore));
                await this.userPreferenceRepository.create({
                    userId,
                    category: cat.category,
                    affinityScore: clampedScore,
                    engagementCount: 1,
                    lastEngagementAt: new Date(),
                });
            }
            else {
                const oldAffinity = existingPref.affinityScore;
                const newAffinity = ALPHA * engagementStrength + (1 - ALPHA) * oldAffinity;
                const clampedScore = Math.max(0, Math.min(1, newAffinity));
                await this.userPreferenceRepository.update(existingPref.id, {
                    affinityScore: clampedScore,
                    engagementCount: existingPref.engagementCount + 1,
                    lastEngagementAt: new Date(),
                });
            }
        }
        await this.invalidateFeedCache(userId);
    }
    async getTopPreferences(userId, limit = 10) {
        return this.userPreferenceRepository.getTopPreferences(userId, limit);
    }
    calculateEngagementStrength(signal) {
        switch (signal.type) {
            case "like":
                return ENGAGEMENT_WEIGHTS.like;
            case "comment":
                return ENGAGEMENT_WEIGHTS.comment;
            case "share":
                return ENGAGEMENT_WEIGHTS.share;
            case "save":
                return ENGAGEMENT_WEIGHTS.save;
            case "watch": {
                const watchPercent = signal.metadata?.watchTimePercent ?? 0;
                if (watchPercent >= 75) {
                    return ENGAGEMENT_WEIGHTS.watchHigh;
                }
                else if (watchPercent <= 25) {
                    return ENGAGEMENT_WEIGHTS.watchLow;
                }
                else {
                    return 0.4;
                }
            }
            case "skip":
                return ENGAGEMENT_WEIGHTS.skip;
            default:
                return 0.5;
        }
    }
    async invalidateFeedCache(userId) {
        await this.redisService.invalidateFeedCache(userId);
    }
};
exports.UserPreferenceLearningService = UserPreferenceLearningService;
exports.UserPreferenceLearningService = UserPreferenceLearningService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [content_repository_1.ContentRepository,
        user_preference_repository_1.UserPreferenceRepository,
        redis_service_1.RedisService])
], UserPreferenceLearningService);
//# sourceMappingURL=user-preference-learning.service.js.map