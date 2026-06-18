import { AdminContentService } from "./admin-content.service";
import { ContentSearchQueryDto, BulkContentActionDto } from "./dto/admin-content.dto";
export declare class AdminContentController {
    private readonly contentService;
    constructor(contentService: AdminContentService);
    getContent(query: ContentSearchQueryDto): Promise<{
        data: {
            id: string;
            postId: string;
            userId: string;
            user: {
                id: string;
                username: string;
                displayName: string;
                avatarUrl: string;
            };
            contentType: "text" | "image" | "video" | "audio";
            caption: string;
            mediaUrl: string;
            thumbnailUrl: string;
            viewCount: number;
            likeCount: number;
            commentCount: number;
            shareCount: number;
            engagementScore: number;
            completionRate: number;
            avgWatchTime: number;
            avgDwellTime: number;
            isActive: boolean;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getContentDetail(id: string): Promise<{
        user: {
            id: string;
            username: string;
            displayName: string;
        };
        slides: {
            id: string;
            contentType: "text" | "image" | "video" | "audio";
            mediaUrl: string;
            thumbnailUrl: string;
            caption: string;
            textContent: string;
            backgroundColor: string;
            fontStyle: string;
            duration: number;
            sortOrder: number;
        }[];
        interactionBreakdown: {
            type: any;
            count: number;
        }[];
        recentComments: {
            id: string;
            text: string;
            userId: string;
            user: {
                id: any;
                username: any;
            };
            createdAt: Date;
        }[];
        id: string;
        userId: string;
        contentType: "text" | "image" | "video" | "audio";
        mediaUrl: string;
        thumbnailUrl: string;
        caption: string;
        textContent: string;
        backgroundColor: string;
        fontStyle: string;
        hashtags: string[];
        duration: number;
        backgroundMusicUrl: string;
        postId: string;
        sortOrder: number;
        isSplitVideo: boolean;
        parentContentId: string;
        sequenceNumber: number;
        totalParts: number;
        videoTrimStart: number | null;
        videoTrimEnd: number | null;
        viewCount: number;
        likeCount: number;
        commentCount: number;
        shareCount: number;
        engagementScore: number;
        completionRate: number;
        avgWatchTime: number;
        avgDwellTime: number;
        viralityScore: number;
        transcription: string | null;
        aiDescription: string | null;
        categories: {
            category: string;
            confidence: number;
        }[] | null;
        isActive: boolean;
        scheduledAt: Date | null;
        isScheduled: boolean;
        createdAt: Date;
        updatedAt: Date;
        parentContent: import("../../content/entities/content.entity").Content;
        childParts: import("../../content/entities/content.entity").Content[];
        interactions: import("../../content/entities/content-interaction.entity").ContentInteraction[];
        contentComments: import("../../content/entities/comment.entity").Comment[];
    }>;
    toggleActive(id: string, body: {
        isActive: boolean;
    }): Promise<{
        postId: string;
        isActive: boolean;
    }>;
    bulkAction(dto: BulkContentActionDto): Promise<{
        updated: number;
        action: "activate" | "deactivate";
    }>;
    updateContent(id: string, body: {
        caption?: string;
        isActive?: boolean;
    }): Promise<import("../../content/entities/content.entity").Content>;
    deleteContent(id: string): Promise<{
        postId: string;
        deleted: boolean;
    }>;
    getUserPreferences(userId: string): Promise<{
        userId: string;
        message: string;
        preferences: any[];
        totalCategories?: undefined;
        topCategories?: undefined;
    } | {
        userId: string;
        totalCategories: number;
        preferences: {
            category: string;
            affinityScore: string;
            engagementCount: number;
            lastEngagementAt: Date;
        }[];
        topCategories: string[];
        message?: undefined;
    }>;
    getUserFeedPreview(userId: string, limit?: string): Promise<{
        userId: string;
        message: string;
        preview: any[];
        totalPosts?: undefined;
    } | {
        userId: string;
        totalPosts: number;
        preview: {
            id: string;
            postId: string;
            caption: string;
            contentType: "text" | "image" | "video" | "audio";
            categories: {
                category: string;
                confidence: number;
            }[];
            viewCount: number;
            likeCount: number;
            commentCount: number;
            engagementScore: string;
            createdAt: Date;
        }[];
        message?: undefined;
    }>;
}
