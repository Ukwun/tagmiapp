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
var FollowsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowsService = void 0;
const common_1 = require("@nestjs/common");
const follow_repository_1 = require("./repositories/follow.repository");
const user_repository_1 = require("../users/repositories/user.repository");
const notifications_service_1 = require("../notifications/notifications.service");
const validation_pipeline_service_1 = require("../referrals/services/validation-pipeline.service");
let FollowsService = FollowsService_1 = class FollowsService {
    constructor(followRepository, userRepository, notificationsService, validationPipelineService) {
        this.followRepository = followRepository;
        this.userRepository = userRepository;
        this.notificationsService = notificationsService;
        this.validationPipelineService = validationPipelineService;
        this.logger = new common_1.Logger(FollowsService_1.name);
    }
    async followUser(followerId, followingId) {
        if (followerId === followingId) {
            throw new common_1.ConflictException("You cannot follow yourself");
        }
        const [follower, following] = await Promise.all([
            this.userRepository.findByIdOptional(followerId),
            this.userRepository.findByIdOptional(followingId),
        ]);
        if (!follower || !following) {
            throw new common_1.NotFoundException("User not found");
        }
        const existingFollow = await this.followRepository.findOne({
            where: { followerId, followingId },
        });
        if (existingFollow) {
            throw new common_1.ConflictException("You are already following this user");
        }
        const follow = this.followRepository.create({ followerId, followingId });
        await this.followRepository.save(follow);
        follower.followingCount += 1;
        following.followersCount += 1;
        await Promise.all([this.userRepository.save(follower), this.userRepository.save(following)]);
        await this.notificationsService.createFollowNotification(followingId, followerId);
        if (this.validationPipelineService) {
            try {
                const referral = await this.validationPipelineService.getActiveReferralForUser(followerId);
                if (referral) {
                    await this.validationPipelineService.runValidation(referral.id);
                }
            }
            catch (error) {
                this.logger.warn(`Failed to trigger referral validation for user ${followerId}: ${error.message}`);
            }
        }
        return { success: true, message: "Successfully followed user" };
    }
    async unfollowUser(followerId, followingId) {
        const follow = await this.followRepository.findOne({
            where: { followerId, followingId },
        });
        if (!follow) {
            throw new common_1.NotFoundException("You are not following this user");
        }
        await this.followRepository.remove(follow);
        const [follower, following] = await Promise.all([
            this.userRepository.findByIdOptional(followerId),
            this.userRepository.findByIdOptional(followingId),
        ]);
        if (follower && following) {
            follower.followingCount = Math.max(0, follower.followingCount - 1);
            following.followersCount = Math.max(0, following.followersCount - 1);
            await Promise.all([this.userRepository.save(follower), this.userRepository.save(following)]);
        }
        return { success: true, message: "Successfully unfollowed user" };
    }
    async getFollowers(userId, page = 1, limit = 20, currentUserId) {
        const [follows, total] = await this.followRepository.findAndCount({
            where: { followingId: userId },
            relations: ["follower"],
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: "DESC" },
        });
        const followerIds = follows.map((f) => f.follower.id);
        let followingMap = new Map();
        if (currentUserId && followerIds.length > 0) {
            const currentUserFollowing = await this.followRepository.find({
                where: {
                    followerId: currentUserId,
                },
            });
            currentUserFollowing.forEach((f) => followingMap.set(f.followingId, true));
        }
        const followers = follows.map((follow) => ({
            id: follow.follower.id,
            username: follow.follower.username,
            displayName: follow.follower.displayName,
            avatarUrl: follow.follower.avatarUrl,
            isVerified: follow.follower.isVerified,
            isFollowing: followingMap.get(follow.follower.id) || false,
            followedAt: follow.createdAt,
        }));
        return {
            data: followers,
            total,
            page,
            limit,
            hasNext: page * limit < total,
            hasPrev: page > 1,
        };
    }
    async getFollowing(userId, page = 1, limit = 20) {
        const [follows, total] = await this.followRepository.findAndCount({
            where: { followerId: userId },
            relations: ["following"],
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: "DESC" },
        });
        const following = follows.map((follow) => ({
            id: follow.following.id,
            username: follow.following.username,
            displayName: follow.following.displayName,
            avatarUrl: follow.following.avatarUrl,
            isVerified: follow.following.isVerified,
            isFollowing: true,
            followedAt: follow.createdAt,
        }));
        return {
            data: following,
            total,
            page,
            limit,
            hasNext: page * limit < total,
            hasPrev: page > 1,
        };
    }
    async isFollowing(followerId, followingId) {
        const follow = await this.followRepository.findOne({
            where: { followerId, followingId },
        });
        return !!follow;
    }
    async getFollowStats(userId) {
        const user = await this.userRepository.findByIdOptional(userId);
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        return {
            followersCount: user.followersCount,
            followingCount: user.followingCount,
        };
    }
};
exports.FollowsService = FollowsService;
exports.FollowsService = FollowsService = FollowsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => notifications_service_1.NotificationsService))),
    __param(3, (0, common_1.Optional)()),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => validation_pipeline_service_1.ValidationPipelineService))),
    __metadata("design:paramtypes", [follow_repository_1.FollowRepository,
        user_repository_1.UserRepository,
        notifications_service_1.NotificationsService,
        validation_pipeline_service_1.ValidationPipelineService])
], FollowsService);
//# sourceMappingURL=follows.service.js.map