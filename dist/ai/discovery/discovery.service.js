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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscoveryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const follow_entity_1 = require("../../follows/entities/follow.entity");
const content_entity_1 = require("../../content/entities/content.entity");
let DiscoveryService = class DiscoveryService {
    constructor(userRepository, followRepository, contentRepository) {
        this.userRepository = userRepository;
        this.followRepository = followRepository;
        this.contentRepository = contentRepository;
    }
    async getSimilarCreators(userId, limit = 10) {
        const limitNum = Number(limit) || 10;
        const similarByFollowers = await this.followRepository
            .createQueryBuilder("f1")
            .select("f2.followingId", "candidateId")
            .addSelect("COUNT(*)", "sharedFollowers")
            .innerJoin(follow_entity_1.Follow, "f2", "f1.followerId = f2.followerId AND f2.followingId != :userId", { userId })
            .where("f1.followingId = :userId", { userId })
            .groupBy("f2.followingId")
            .orderBy("COUNT(*)", "DESC")
            .limit(limitNum * 2)
            .getRawMany();
        if (similarByFollowers.length === 0) {
            return this.getFallbackSuggestions(userId, limitNum);
        }
        const candidateIds = similarByFollowers.map((r) => r.candidateId);
        const alreadyFollowing = await this.followRepository.find({
            where: { followerId: userId },
            select: ["followingId"],
        });
        const followingSet = new Set(alreadyFollowing.map((f) => f.followingId));
        const filteredIds = candidateIds.filter((id) => !followingSet.has(id));
        if (filteredIds.length === 0) {
            return this.getFallbackSuggestions(userId, limitNum);
        }
        const users = await this.userRepository
            .createQueryBuilder("user")
            .where("user.id IN (:...ids)", { ids: filteredIds.slice(0, limitNum) })
            .andWhere("user.isActive = :isActive", { isActive: true })
            .getMany();
        const sharedMap = new Map(similarByFollowers.map((r) => [r.candidateId, Number(r.sharedFollowers)]));
        return users
            .map((user) => ({
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            bio: user.bio,
            followersCount: user.followersCount,
            isVerified: user.isVerified,
            sharedFollowers: sharedMap.get(user.id) || 0,
        }))
            .sort((a, b) => b.sharedFollowers - a.sharedFollowers);
    }
    async getForYouFeed(userId, page = 1, limit = 20) {
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 20;
        const user = await this.userRepository.findOne({ where: { id: userId } });
        const userHashtags = await this.getUserTopHashtags(userId);
        const follows = await this.followRepository.find({
            where: { followerId: userId },
            select: ["followingId"],
        });
        const followingIds = new Set(follows.map((f) => f.followingId));
        followingIds.add(userId);
        const queryBuilder = this.contentRepository
            .createQueryBuilder("content")
            .leftJoinAndSelect("content.user", "user")
            .where("content.isActive = :isActive", { isActive: true })
            .andWhere("content.sortOrder = :sortOrder", { sortOrder: 0 })
            .andWhere("user.isActive = :userActive", { userActive: true });
        if (followingIds.size > 0) {
            queryBuilder.andWhere("content.userId NOT IN (:...excludeIds)", {
                excludeIds: Array.from(followingIds),
            });
        }
        if (userHashtags.length > 0) {
            const hashtagConditions = userHashtags
                .map((_, i) => `content.hashtags ILIKE :ht${i}`)
                .join(" OR ");
            const hashtagParams = Object.fromEntries(userHashtags.map((ht, i) => [`ht${i}`, `%${ht}%`]));
            queryBuilder.orderBy(`CASE WHEN (${hashtagConditions}) THEN 1 ELSE 0 END`, "DESC");
            queryBuilder.setParameters(hashtagParams);
            queryBuilder.addOrderBy("content.viralityScore", "DESC");
            queryBuilder.addOrderBy("content.engagementScore", "DESC");
        }
        else {
            queryBuilder.orderBy("content.viralityScore", "DESC");
            queryBuilder.addOrderBy("content.engagementScore", "DESC");
        }
        queryBuilder.addOrderBy("content.createdAt", "DESC");
        const [posts, total] = await queryBuilder
            .skip((pageNum - 1) * limitNum)
            .take(limitNum)
            .getManyAndCount();
        return {
            data: posts.map((p) => ({
                postId: p.postId,
                userId: p.userId,
                user: p.user,
                caption: p.caption,
                hashtags: p.hashtags,
                contentType: p.contentType,
                mediaUrl: p.mediaUrl,
                thumbnailUrl: p.thumbnailUrl,
                engagementScore: p.engagementScore,
                viewCount: p.viewCount,
                likeCount: p.likeCount,
                commentCount: p.commentCount,
                shareCount: p.shareCount,
                createdAt: p.createdAt,
            })),
            total,
            page: pageNum,
            limit: limitNum,
        };
    }
    async getUserTopHashtags(userId, limit = 10) {
        const posts = await this.contentRepository.find({
            where: { userId, isActive: true },
            select: ["hashtags"],
            order: { createdAt: "DESC" },
            take: 50,
        });
        const counts = new Map();
        for (const post of posts) {
            if (!post.hashtags)
                continue;
            for (const tag of post.hashtags) {
                const normalized = tag.toLowerCase().replace(/^#/, "");
                if (normalized) {
                    counts.set(normalized, (counts.get(normalized) || 0) + 1);
                }
            }
        }
        return Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([tag]) => tag);
    }
    async getFallbackSuggestions(userId, limit) {
        const alreadyFollowing = await this.followRepository.find({
            where: { followerId: userId },
            select: ["followingId"],
        });
        const excludeIds = [userId, ...alreadyFollowing.map((f) => f.followingId)];
        const users = await this.userRepository
            .createQueryBuilder("user")
            .where("user.isActive = :isActive", { isActive: true })
            .andWhere("user.id NOT IN (:...excludeIds)", { excludeIds })
            .orderBy("user.followersCount", "DESC")
            .take(limit)
            .getMany();
        return users.map((user) => ({
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            bio: user.bio,
            followersCount: user.followersCount,
            isVerified: user.isVerified,
            sharedFollowers: 0,
        }));
    }
};
exports.DiscoveryService = DiscoveryService;
exports.DiscoveryService = DiscoveryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(follow_entity_1.Follow)),
    __param(2, (0, typeorm_1.InjectRepository)(content_entity_1.Content)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DiscoveryService);
//# sourceMappingURL=discovery.service.js.map