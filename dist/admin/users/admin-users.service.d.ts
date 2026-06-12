import { ConfigService } from "@nestjs/config";
import { User } from "../../users/entities/user.entity";
import { UserSearchQueryDto, ToggleActiveDto, ToggleVerifiedDto, ChangeRoleDto, UpdateUserDto } from "./dto/admin-users.dto";
import { UserRepository } from "../../users/repositories/user.repository";
import { ContentRepository } from "../../content/repositories/content.repository";
import { ReportRepository } from "../../reports/repositories/report.repository";
import { BookingRepository } from "../../bookings/repositories/booking.repository";
export declare class AdminUsersService {
    private readonly userRepo;
    private readonly contentRepo;
    private readonly reportRepo;
    private readonly bookingRepo;
    private readonly configService;
    private readonly superAdminEmail;
    constructor(userRepo: UserRepository, contentRepo: ContentRepository, reportRepo: ReportRepository, bookingRepo: BookingRepository, configService: ConfigService);
    isSuperAdmin(user: User): boolean;
    getUsers(query: UserSearchQueryDto): Promise<{
        data: User[];
        total: number;
        page: number;
        limit: number;
    }>;
    getUserDetail(id: string): Promise<any>;
    getUserContent(id: string, page?: number, limit?: number): Promise<{
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
    getUserBookings(id: string, page?: number, limit?: number): Promise<{
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
    toggleActive(id: string, dto: ToggleActiveDto, requestingUser: User): Promise<{
        id: string;
        isActive: boolean;
    }>;
    toggleVerified(id: string, dto: ToggleVerifiedDto): Promise<{
        id: string;
        isVerified: boolean;
    }>;
    changeRole(id: string, dto: ChangeRoleDto, requestingUser: User): Promise<{
        id: string;
        role: string;
    }>;
    updateUser(id: string, dto: UpdateUserDto, requestingUser: User): Promise<any>;
    deleteUser(id: string, requestingUser: User): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
