import { FollowRepository } from "./repositories/follow.repository";
import { UserRepository } from "../users/repositories/user.repository";
import { NotificationsService } from "../notifications/notifications.service";
import { ValidationPipelineService } from "../referrals/services/validation-pipeline.service";
export declare class FollowsService {
    private followRepository;
    private userRepository;
    private notificationsService;
    private validationPipelineService?;
    private readonly logger;
    constructor(followRepository: FollowRepository, userRepository: UserRepository, notificationsService: NotificationsService, validationPipelineService?: ValidationPipelineService);
    followUser(followerId: string, followingId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    unfollowUser(followerId: string, followingId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getFollowers(userId: string, page?: number, limit?: number, currentUserId?: string): Promise<{
        data: {
            id: string;
            username: string;
            displayName: string;
            avatarUrl: string;
            isVerified: boolean;
            isFollowing: boolean;
            followedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    getFollowing(userId: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            username: string;
            displayName: string;
            avatarUrl: string;
            isVerified: boolean;
            isFollowing: boolean;
            followedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    isFollowing(followerId: string, followingId: string): Promise<boolean>;
    getFollowStats(userId: string): Promise<{
        followersCount: number;
        followingCount: number;
    }>;
}
