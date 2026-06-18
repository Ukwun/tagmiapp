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
exports.CommentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const comment_entity_1 = require("../entities/comment.entity");
const comment_like_entity_1 = require("../entities/comment-like.entity");
const content_entity_1 = require("../entities/content.entity");
const mention_entity_1 = require("../entities/mention.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const notifications_service_1 = require("../../notifications/notifications.service");
const error_handler_1 = require("../../common/exceptions/error.handler");
let CommentService = class CommentService {
    constructor(commentRepository, commentLikeRepository, contentRepository, mentionRepository, userRepository, notificationsService) {
        this.commentRepository = commentRepository;
        this.commentLikeRepository = commentLikeRepository;
        this.contentRepository = contentRepository;
        this.mentionRepository = mentionRepository;
        this.userRepository = userRepository;
        this.notificationsService = notificationsService;
    }
    safeUser(user) {
        if (!user)
            return user;
        const { passwordHash, phoneHash, ...safe } = user;
        return safe;
    }
    extractMentions(text) {
        const mentionRegex = /@(\w+)/g;
        const matches = text.matchAll(mentionRegex);
        return Array.from(matches, match => match[1]);
    }
    async saveMentions(text, mentionedByUserId, contentId, commentId) {
        const usernames = this.extractMentions(text);
        if (usernames.length === 0)
            return;
        const users = await this.userRepository.find({
            where: usernames.map(username => ({ username })),
        });
        const mentions = users.map(user => this.mentionRepository.create({
            mentionedUserId: user.id,
            mentionedByUserId,
            contentId,
            commentId,
        }));
        if (mentions.length > 0) {
            await this.mentionRepository.save(mentions);
            for (const user of users) {
                await this.notificationsService.createMentionNotification(user.id, mentionedByUserId, contentId, commentId);
            }
        }
    }
    async addComment(contentId, userId, createCommentDto) {
        const content = await this.contentRepository.findOne({ where: { id: contentId } });
        if (!content) {
            error_handler_1.ErrorHandler.notFound("Content");
        }
        const comment = this.commentRepository.create({
            contentId,
            userId,
            text: createCommentDto.text,
            parentId: createCommentDto.parentId,
        });
        const savedComment = await this.commentRepository.save(comment);
        content.commentCount += 1;
        await this.contentRepository.save(content);
        await this.saveMentions(createCommentDto.text, userId, contentId, savedComment.id);
        if (createCommentDto.parentId) {
            const parentComment = await this.commentRepository.findOne({
                where: { id: createCommentDto.parentId },
            });
            if (parentComment) {
                await this.notificationsService.createReplyNotification(parentComment.userId, userId, contentId, savedComment.id);
            }
        }
        else {
            await this.notificationsService.createCommentNotification(contentId, content.userId, userId, savedComment.id);
        }
        const commentWithUser = await this.commentRepository.findOne({
            where: { id: savedComment.id },
            relations: ["user"],
        });
        if (commentWithUser) {
            commentWithUser.user = this.safeUser(commentWithUser.user);
        }
        return commentWithUser;
    }
    async getComments(contentId, userId, page = 1, limit = 20) {
        const [comments, total] = await this.commentRepository.findAndCount({
            where: { contentId, parentId: (0, typeorm_2.IsNull)() },
            relations: ["user", "replies", "replies.user"],
            order: { createdAt: "DESC" },
            skip: (page - 1) * limit,
            take: limit,
        });
        const allCommentIds = comments.flatMap(c => [
            c.id,
            ...(c.replies || []).map(r => r.id),
        ]);
        let likedCommentIds = new Set();
        if (userId && allCommentIds.length > 0) {
            const userLikes = await this.commentLikeRepository.find({
                where: { commentId: (0, typeorm_2.In)(allCommentIds), userId },
            });
            likedCommentIds = new Set(userLikes.map(l => l.commentId));
        }
        const enrichedComments = comments.map((comment) => ({
            ...comment,
            user: this.safeUser(comment.user),
            isLiked: likedCommentIds.has(comment.id),
            replies: (comment.replies || []).map((reply) => ({
                ...reply,
                user: this.safeUser(reply.user),
                isLiked: likedCommentIds.has(reply.id),
            })),
        }));
        return {
            data: enrichedComments,
            total,
            page,
            limit,
            hasNext: page * limit < total,
            hasPrev: page > 1,
        };
    }
    async likeComment(commentId, userId) {
        const comment = await this.commentRepository.findOne({
            where: { id: commentId },
        });
        if (!comment) {
            error_handler_1.ErrorHandler.notFound("Comment");
        }
        const existingLike = await this.commentLikeRepository.findOne({
            where: { commentId, userId },
        });
        if (existingLike) {
            await this.commentLikeRepository.remove(existingLike);
            comment.likes = Math.max(0, comment.likes - 1);
            await this.commentRepository.save(comment);
            return { success: true, action: "removed", likes: comment.likes, isLiked: false };
        }
        else {
            const like = this.commentLikeRepository.create({
                commentId,
                userId,
            });
            await this.commentLikeRepository.save(like);
            comment.likes += 1;
            await this.commentRepository.save(comment);
            return { success: true, action: "added", likes: comment.likes, isLiked: true };
        }
    }
    async getCommentWithLikeStatus(comment, userId) {
        let isLiked = false;
        if (userId) {
            const like = await this.commentLikeRepository.findOne({
                where: { commentId: comment.id, userId },
            });
            isLiked = !!like;
        }
        return {
            ...comment,
            isLiked,
        };
    }
};
exports.CommentService = CommentService;
exports.CommentService = CommentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(comment_entity_1.Comment)),
    __param(1, (0, typeorm_1.InjectRepository)(comment_like_entity_1.CommentLike)),
    __param(2, (0, typeorm_1.InjectRepository)(content_entity_1.Content)),
    __param(3, (0, typeorm_1.InjectRepository)(mention_entity_1.Mention)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(5, (0, common_1.Inject)((0, common_1.forwardRef)(() => notifications_service_1.NotificationsService))),
    __metadata("design:paramtypes", [Function, Function, Function, Function, Function, notifications_service_1.NotificationsService])
], CommentService);
//# sourceMappingURL=comment.service.js.map