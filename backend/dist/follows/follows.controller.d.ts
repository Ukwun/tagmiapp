import { FollowsService } from "./follows.service";
import type { Request } from "express";
export declare class FollowsController {
    private readonly followsService;
    constructor(followsService: FollowsService);
    followUser(req: Request, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    unfollowUser(req: Request, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getFollowers(req: Request, userId: string, page?: string, limit?: string): Promise<{
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
    getFollowing(userId: string, page?: string, limit?: string): Promise<{
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
    checkFollowing(req: Request, userId: string): Promise<{
        isFollowing: boolean;
        followsYou: boolean;
    }>;
    getFollowStats(userId: string): Promise<{
        followersCount: number;
        followingCount: number;
    }>;
}
