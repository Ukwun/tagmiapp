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
exports.AdminContentService = void 0;
const common_1 = require("@nestjs/common");
const content_repository_1 = require("../../content/repositories/content.repository");
const content_interaction_repository_1 = require("../../content/repositories/content-interaction.repository");
const comment_repository_1 = require("../../content/repositories/comment.repository");
const content_entity_1 = require("../../content/entities/content.entity");
const user_preference_repository_1 = require("../../content/repositories/user-preference.repository");
const personalized_feed_service_1 = require("../../content/personalized-feed.service");
let AdminContentService = class AdminContentService {
    constructor(contentRepo, interactionRepo, commentRepo, userPreferenceRepo, personalizedFeedService) {
        this.contentRepo = contentRepo;
        this.interactionRepo = interactionRepo;
        this.commentRepo = commentRepo;
        this.userPreferenceRepo = userPreferenceRepo;
        this.personalizedFeedService = personalizedFeedService;
    }
    async getContent(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const qb = this.contentRepo
            .createQueryBuilder("c")
            .leftJoinAndSelect("c.user", "user")
            .where("c.sortOrder = :so", { so: 0 });
        if (query.search) {
            qb.andWhere("c.caption ILIKE :s", { s: `%${query.search}%` });
        }
        if (query.contentType) {
            qb.andWhere("c.contentType = :ct", { ct: query.contentType });
        }
        if (query.userId) {
            qb.andWhere("c.userId = :uid", { uid: query.userId });
        }
        if (query.isActive !== undefined) {
            qb.andWhere("c.isActive = :ia", { ia: query.isActive });
        }
        const sortBy = query.sortBy || "createdAt";
        const sortColumn = ["viewCount", "engagementScore"].includes(sortBy)
            ? `c.${sortBy}` : "c.createdAt";
        qb.orderBy(sortColumn, "DESC")
            .skip((page - 1) * limit)
            .take(limit);
        const [data, total] = await qb.getManyAndCount();
        return {
            data: data.map((c) => ({
                id: c.id,
                postId: c.postId,
                userId: c.userId,
                user: c.user
                    ? { id: c.user.id, username: c.user.username, displayName: c.user.displayName, avatarUrl: c.user.avatarUrl }
                    : null,
                contentType: c.contentType,
                caption: c.caption,
                mediaUrl: c.mediaUrl,
                thumbnailUrl: c.thumbnailUrl,
                viewCount: c.viewCount,
                likeCount: c.likeCount,
                commentCount: c.commentCount,
                shareCount: c.shareCount,
                engagementScore: c.engagementScore,
                completionRate: c.completionRate,
                avgWatchTime: c.avgWatchTime,
                avgDwellTime: c.avgDwellTime,
                isActive: c.isActive,
                createdAt: c.createdAt,
            })),
            total,
            page,
            limit,
        };
    }
    async getContentDetail(id) {
        const content = await this.contentRepo.findOne({
            where: { id },
            relations: ["user"],
        });
        if (!content)
            throw new common_1.NotFoundException("Content not found");
        const slides = await this.contentRepo.find({
            where: { postId: content.postId },
            order: { sortOrder: "ASC" },
        });
        const interactionBreakdown = await this.interactionRepo
            .createQueryBuilder("i")
            .select("i.type", "type")
            .addSelect("COUNT(*)", "count")
            .where("i.contentId = :cid", { cid: id })
            .groupBy("i.type")
            .getRawMany();
        const recentComments = await this.commentRepo.find({
            where: { contentId: id },
            relations: ["user"],
            order: { createdAt: "DESC" },
            take: 10,
        });
        return {
            ...content,
            user: content.user
                ? { id: content.user.id, username: content.user.username, displayName: content.user.displayName }
                : null,
            slides: slides.map((s) => ({
                id: s.id,
                contentType: s.contentType,
                mediaUrl: s.mediaUrl,
                thumbnailUrl: s.thumbnailUrl,
                caption: s.caption,
                textContent: s.textContent,
                backgroundColor: s.backgroundColor,
                fontStyle: s.fontStyle,
                duration: s.duration,
                sortOrder: s.sortOrder,
            })),
            interactionBreakdown: interactionBreakdown.map((i) => ({
                type: i.type,
                count: Number(i.count),
            })),
            recentComments: recentComments.map((c) => ({
                id: c.id,
                text: c.text,
                userId: c.userId,
                user: c.user
                    ? { id: c.user.id, username: c.user.username }
                    : null,
                createdAt: c.createdAt,
            })),
        };
    }
    async toggleContentActive(id, isActive) {
        const content = await this.contentRepo.findOne({ where: { id } });
        if (!content)
            throw new common_1.NotFoundException("Content not found");
        await this.contentRepo.update({ postId: content.postId }, { isActive });
        return { postId: content.postId, isActive };
    }
    async bulkContentAction(dto) {
        const isActive = dto.action === "activate";
        const result = await this.contentRepo
            .createQueryBuilder()
            .update(content_entity_1.Content)
            .set({ isActive })
            .where("postId IN (:...postIds)", { postIds: dto.postIds })
            .execute();
        return { updated: result.affected || 0, action: dto.action };
    }
    async updateContent(id, dto) {
        const content = await this.contentRepo.findOne({ where: { id } });
        if (!content)
            throw new common_1.NotFoundException("Content not found");
        const updates = {};
        if (dto.caption !== undefined)
            updates.caption = dto.caption;
        if (dto.isActive !== undefined)
            updates.isActive = dto.isActive;
        if (Object.keys(updates).length === 0)
            return content;
        if (dto.isActive !== undefined) {
            await this.contentRepo.update({ postId: content.postId }, { isActive: dto.isActive });
        }
        if (dto.caption !== undefined) {
            await this.contentRepo.update(id, { caption: dto.caption });
        }
        return this.contentRepo.findOne({ where: { id } });
    }
    async deleteContent(id) {
        const content = await this.contentRepo.findOne({ where: { id } });
        if (!content)
            throw new common_1.NotFoundException("Content not found");
        await this.contentRepo.update({ postId: content.postId }, { isActive: false });
        return { postId: content.postId, deleted: true };
    }
    async getUserPreferences(userId) {
        const preferences = await this.userPreferenceRepo.findByUserId(userId);
        if (preferences.length === 0) {
            return {
                userId,
                message: "User has no preferences yet. Feed will use randomized algorithm or signup interests.",
                preferences: [],
            };
        }
        return {
            userId,
            totalCategories: preferences.length,
            preferences: preferences.map((p) => ({
                category: p.category,
                affinityScore: Number(p.affinityScore).toFixed(3),
                engagementCount: p.engagementCount,
                lastEngagementAt: p.lastEngagementAt,
            })),
            topCategories: preferences
                .slice(0, 5)
                .map((p) => p.category),
        };
    }
    async getUserFeedPreview(userId, limit = 20) {
        const preferences = await this.userPreferenceRepo.findByUserId(userId);
        if (preferences.length === 0) {
            return {
                userId,
                message: "User has no preferences. Personalized feed is disabled.",
                preview: [],
            };
        }
        const feed = await this.personalizedFeedService.getPersonalizedFeed(userId, [], { page: 1, limit });
        return {
            userId,
            totalPosts: feed.length,
            preview: feed.map((post) => ({
                id: post.id,
                postId: post.postId,
                caption: post.caption?.substring(0, 100) || "(no caption)",
                contentType: post.contentType,
                categories: post.categories || [],
                viewCount: post.viewCount,
                likeCount: post.likeCount,
                commentCount: post.commentCount,
                engagementScore: Number(post.engagementScore).toFixed(2),
                createdAt: post.createdAt,
            })),
        };
    }
};
exports.AdminContentService = AdminContentService;
exports.AdminContentService = AdminContentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [content_repository_1.ContentRepository,
        content_interaction_repository_1.ContentInteractionRepository,
        comment_repository_1.CommentRepository,
        user_preference_repository_1.UserPreferenceRepository,
        personalized_feed_service_1.PersonalizedFeedService])
], AdminContentService);
//# sourceMappingURL=admin-content.service.js.map