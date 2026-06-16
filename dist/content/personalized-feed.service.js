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
var PersonalizedFeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalizedFeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const content_repository_1 = require("./repositories/content.repository");
const user_preference_repository_1 = require("./repositories/user-preference.repository");
const PERSONALIZED_RATIO = 0.7;
const DISCOVERY_RATIO = 0.3;
const RECENCY_BOOST_MAX = 0.1;
const FEED_LOOKBACK_DAYS = 30;
let PersonalizedFeedService = PersonalizedFeedService_1 = class PersonalizedFeedService {
    constructor(contentRepository, userPreferenceRepository) {
        this.contentRepository = contentRepository;
        this.userPreferenceRepository = userPreferenceRepository;
        this.logger = new common_1.Logger(PersonalizedFeedService_1.name);
    }
    async getPersonalizedFeed(userId, blockedUserIds, pagination) {
        const preferences = await this.userPreferenceRepository.findByUserId(userId);
        if (preferences.length === 0) {
            return [];
        }
        const affinityMap = new Map();
        for (const pref of preferences) {
            affinityMap.set(pref.category, pref.affinityScore);
        }
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - FEED_LOOKBACK_DAYS);
        const candidates = await this.contentRepository.find({
            where: {
                createdAt: (0, typeorm_1.Not)(null),
                categories: (0, typeorm_1.Not)(null),
                isActive: true,
                sortOrder: 0,
                ...(blockedUserIds.length > 0 && { userId: (0, typeorm_1.Not)((0, typeorm_1.In)(blockedUserIds.map(String))) }),
            },
            order: { createdAt: "DESC" },
            take: 1000,
        });
        const recentCandidates = candidates.filter((c) => c.createdAt >= cutoffDate);
        if (recentCandidates.length === 0) {
            return [];
        }
        const scoredPosts = recentCandidates
            .map((post) => {
            const score = this.scorePost(post, affinityMap);
            return { post, score };
        })
            .filter((item) => item.score > 0);
        scoredPosts.sort((a, b) => b.score - a.score);
        const totalNeeded = pagination.limit;
        const personalizedCount = Math.floor(totalNeeded * PERSONALIZED_RATIO);
        const discoveryCount = totalNeeded - personalizedCount;
        const personalized = scoredPosts.slice(0, personalizedCount).map((item) => item.post);
        const discoveryPool = scoredPosts.slice(Math.floor(scoredPosts.length / 2));
        const discovery = this.shuffle(discoveryPool)
            .slice(0, discoveryCount)
            .map((item) => item.post);
        const feed = this.interleave(personalized, discovery);
        const start = (pagination.page - 1) * pagination.limit;
        const end = start + pagination.limit;
        return feed.slice(start, end);
    }
    scorePost(post, affinityMap) {
        const categories = post.categories;
        if (!categories || categories.length === 0) {
            return 0;
        }
        let weightedSum = 0;
        let totalConfidence = 0;
        for (const cat of categories) {
            const affinity = affinityMap.get(cat.category) ?? 0.5;
            weightedSum += affinity * cat.confidence;
            totalConfidence += cat.confidence;
        }
        const normalizedScore = totalConfidence > 0 ? weightedSum / totalConfidence : 0.5;
        const ageInDays = (Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        const recencyBoost = Math.max(0, RECENCY_BOOST_MAX - ageInDays * 0.01);
        return normalizedScore + recencyBoost;
    }
    interleave(personalized, discovery) {
        const result = [];
        let pIndex = 0;
        let dIndex = 0;
        while (pIndex < personalized.length || dIndex < discovery.length) {
            if (pIndex < personalized.length) {
                result.push(personalized[pIndex++]);
            }
            if (pIndex < personalized.length) {
                result.push(personalized[pIndex++]);
            }
            if (dIndex < discovery.length) {
                result.push(discovery[dIndex++]);
            }
        }
        return result;
    }
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
};
exports.PersonalizedFeedService = PersonalizedFeedService;
exports.PersonalizedFeedService = PersonalizedFeedService = PersonalizedFeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [content_repository_1.ContentRepository,
        user_preference_repository_1.UserPreferenceRepository])
], PersonalizedFeedService);
//# sourceMappingURL=personalized-feed.service.js.map