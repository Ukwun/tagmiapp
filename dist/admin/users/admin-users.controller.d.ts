import { AdminUsersService } from "./admin-users.service";
import { UserSearchQueryDto, ToggleActiveDto, ToggleVerifiedDto, ChangeRoleDto, UpdateUserDto } from "./dto/admin-users.dto";
export declare class AdminUsersController {
    private readonly usersService;
    constructor(usersService: AdminUsersService);
    getUsers(query: UserSearchQueryDto): Promise<{
        data: import("../../users/entities/user.entity").User[];
        total: number;
        page: number;
        limit: number;
    }>;
    getUserDetail(id: string): Promise<any>;
    getUserContent(id: string, page?: string, limit?: string): Promise<{
        data: {
            id: string;
            postId: string;
            contentType: "text" | "image" | "video" | "audio";
            caption: string;
            thumbnailUrl: string;
            mediaUrl: string;
            viewCount: number;
            likeCount: number;
            commentCount: number;
            shareCount: number;
            engagementScore: number;
            isActive: boolean;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getUserBookings(id: string, page?: string, limit?: string): Promise<{
        data: {
            id: string;
            title: string;
            status: "pending" | "accepted" | "rejected" | "in_progress" | "completed" | "cancelled" | "paid";
            bookingType: string;
            price: number;
            finalAmount: number;
            startDate: Date;
            endDate: Date;
            createdAt: Date;
            userRole: string;
            counterparty: {
                id: string;
                username: string;
                displayName: string;
                avatarUrl: string;
            };
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getUserEngagement(id: string): Promise<{
        totals: {
            postCount: number;
            totalViews: number;
            totalLikes: number;
            totalComments: number;
            totalShares: number;
            avgEngagementScore: number;
        };
        typeBreakdown: {
            type: any;
            count: number;
        }[];
    }>;
    toggleActive(id: string, dto: ToggleActiveDto, req: any): Promise<{
        id: string;
        isActive: boolean;
    }>;
    toggleVerified(id: string, dto: ToggleVerifiedDto): Promise<{
        id: string;
        isVerified: boolean;
    }>;
    changeRole(id: string, dto: ChangeRoleDto, req: any): Promise<{
        id: string;
        role: string;
    }>;
    updateUser(id: string, dto: UpdateUserDto, req: any): Promise<any>;
    deleteUser(id: string, req: any): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
