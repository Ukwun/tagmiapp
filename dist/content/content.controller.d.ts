import type { Response } from "express";
import { ContentService } from "./content.service";
import { CreateContentDto } from "./dto/create-content.dto";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdateContentDto } from "./dto/update-content.dto";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { CreateEngagementSignalsDto } from "./dto/create-engagement-signals.dto";
export declare class ContentController {
    private readonly contentService;
    constructor(contentService: ContentService);
    create(req: any, createContentDto: CreateContentDto, file: Express.Multer.File): Promise<import("./entities/content.entity").Content>;
    createPost(req: any, createPostDto: CreatePostDto, uploadedFiles?: {
        files?: Express.Multer.File[];
        backgroundMusic?: Express.Multer.File[];
        thumbnails?: Express.Multer.File[];
    }): Promise<{
        postId: string;
        slides: import("./entities/content.entity").Content[];
        totalSlides: number;
    }>;
    getFeed(page?: number, limit?: number, req?: any): Promise<{
        data: {
            user: {
                id: string;
                name: string;
                avatar: string;
                isVerified: boolean;
            };
            interactions: {
                likes: number;
                comments: number;
                shares: number;
                views: number;
                isLiked: boolean;
                isBookmarked: boolean;
            };
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
            parentContent: import("./entities/content.entity").Content;
            childParts: import("./entities/content.entity").Content[];
            contentComments: import("./entities/comment.entity").Comment[];
        }[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    getPostsFeed(req: any, page?: number, limit?: number, category?: string, userId?: string, followingOnly?: boolean, sort?: "recent" | "ranked", trendingDays?: number): Promise<any>;
    getNewPostsCount(since: string): Promise<{
        count: number;
    }>;
    getPostInteractors(postId: string, type: "like" | "bookmark" | "share", page?: number, limit?: number): Promise<{
        data: {
            id: string;
            username: string;
            displayName: string;
            avatarUrl: string;
            isVerified: boolean;
            interactedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    search(req: any, query: string, type?: "posts" | "users" | "hashtags" | "all", page?: number, limit?: number): Promise<{
        posts: {
            data: {
                postId: string;
                userId: string;
                user: any;
                slides: {
                    id: string;
                    contentType: "text" | "image" | "video" | "audio";
                    mediaUrl: string;
                    thumbnailUrl: string;
                    caption: string;
                    backgroundColor: string;
                    fontStyle: string;
                    duration: number;
                    sortOrder: number;
                    videoTrimStart: number;
                    videoTrimEnd: number;
                }[];
                caption: string;
                hashtags: string[];
                backgroundMusicUrl: string;
                likeCount: number;
                commentCount: number;
                shareCount: number;
                viewCount: number;
                isLiked: boolean;
                isBookmarked: boolean;
                createdAt: Date;
                updatedAt: Date;
            }[];
            total: number;
        };
        users: {
            data: {
                isFollowing: boolean;
                id: string;
                email: string;
                username: string;
                displayName: string;
                passwordHash: string;
                role: "talent" | "client" | "manager";
                lastLogin: Date;
                avatarUrl: string;
                coverImageUrl: string;
                bio: string;
                gender: string;
                dateOfBirth: Date;
                location: string;
                interests: string[];
                followersCount: number;
                followingCount: number;
                postCount: number;
                isVerified: boolean;
                isActive: boolean;
                referredBy: string;
                phoneHash: string;
                validReferralCount: number;
                referralLevel: number;
                createdAt: Date;
                updatedAt: Date;
                content: import("./entities/content.entity").Content[];
                talentProfile: import("../users/entities/talent-profile.entity").TalentProfile;
            }[];
            total: number;
        };
        hashtags: {
            data: {
                tag: string;
                postCount: number;
            }[];
            total: number;
        };
        page: number;
        limit: number;
        type: string;
        data?: undefined;
        total?: undefined;
    } | {
        data: {
            postId: string;
            userId: string;
            user: any;
            slides: {
                id: string;
                contentType: "text" | "image" | "video" | "audio";
                mediaUrl: string;
                thumbnailUrl: string;
                caption: string;
                backgroundColor: string;
                fontStyle: string;
                duration: number;
                sortOrder: number;
                videoTrimStart: number;
                videoTrimEnd: number;
            }[];
            caption: string;
            hashtags: string[];
            backgroundMusicUrl: string;
            likeCount: number;
            commentCount: number;
            shareCount: number;
            viewCount: number;
            isLiked: boolean;
            isBookmarked: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        type: string;
        posts?: undefined;
        users?: undefined;
        hashtags?: undefined;
    } | {
        data: {
            tag: string;
            postCount: number;
        }[];
        total: number;
        page: number;
        limit: number;
        type: string;
        posts?: undefined;
        users?: undefined;
        hashtags?: undefined;
    } | {
        data: {
            isFollowing: boolean;
            id: string;
            email: string;
            username: string;
            displayName: string;
            passwordHash: string;
            role: "talent" | "client" | "manager";
            lastLogin: Date;
            avatarUrl: string;
            coverImageUrl: string;
            bio: string;
            gender: string;
            dateOfBirth: Date;
            location: string;
            interests: string[];
            followersCount: number;
            followingCount: number;
            postCount: number;
            isVerified: boolean;
            isActive: boolean;
            referredBy: string;
            phoneHash: string;
            validReferralCount: number;
            referralLevel: number;
            createdAt: Date;
            updatedAt: Date;
            content: import("./entities/content.entity").Content[];
            talentProfile: import("../users/entities/talent-profile.entity").TalentProfile;
        }[];
        total: number;
        page: number;
        limit: number;
        type: string;
        posts?: undefined;
        users?: undefined;
        hashtags?: undefined;
    }>;
    getBookmarks(req: any, page?: number, limit?: number): Promise<{
        data: {
            postId: string;
            userId: string;
            user: any;
            slides: {
                id: string;
                contentType: "text" | "image" | "video" | "audio";
                mediaUrl: string;
                thumbnailUrl: string;
                caption: string;
                backgroundColor: string;
                fontStyle: string;
                duration: number;
                sortOrder: number;
                videoTrimStart: number;
                videoTrimEnd: number;
            }[];
            caption: string;
            hashtags: string[];
            backgroundMusicUrl: string;
            likeCount: number;
            commentCount: number;
            shareCount: number;
            viewCount: number;
            isLiked: boolean;
            isBookmarked: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    findAll(page?: number, limit?: number, category?: string, userId?: string): Promise<{
        data: {
            user: any;
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
            parentContent: import("./entities/content.entity").Content;
            childParts: import("./entities/content.entity").Content[];
            interactions: import("./entities/content-interaction.entity").ContentInteraction[];
            contentComments: import("./entities/comment.entity").Comment[];
        }[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    downloadSlide(slideId: string, res: Response): Promise<void>;
    findOne(id: string, req: any): Promise<any>;
    updatePost(postId: string, req: any, body: any, uploadedFiles?: {
        files?: Express.Multer.File[];
        backgroundMusic?: Express.Multer.File[];
    }): Promise<{
        postId: string;
        slides: import("./entities/content.entity").Content[];
    }>;
    update(id: string, req: any, updateContentDto: UpdateContentDto): Promise<import("./entities/content.entity").Content>;
    remove(id: string, req: any): Promise<void>;
    likeContent(id: string, req: any): Promise<{
        liked: boolean;
        likesCount: number;
    }>;
    addComment(id: string, req: any, createCommentDto: CreateCommentDto): Promise<import("./entities/comment.entity").Comment>;
    getComments(req: any, id: string, page?: number, limit?: number): Promise<{
        data: {
            user: any;
            isLiked: boolean;
            replies: {
                user: any;
                isLiked: boolean;
                id: string;
                userId: string;
                contentId: string;
                text: string;
                parentId: string;
                likes: number;
                createdAt: Date;
                updatedAt: Date;
                content: import("./entities/content.entity").Content;
                parent: import("./entities/comment.entity").Comment;
                replies: import("./entities/comment.entity").Comment[];
            }[];
            id: string;
            userId: string;
            contentId: string;
            text: string;
            parentId: string;
            likes: number;
            createdAt: Date;
            updatedAt: Date;
            content: import("./entities/content.entity").Content;
            parent: import("./entities/comment.entity").Comment;
        }[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    interactWithContent(id: string, req: any, body: {
        type: "like" | "bookmark" | "share";
    }): Promise<{
        success: boolean;
        action: string;
        type: "like" | "bookmark" | "share";
        count: number;
    }>;
    deleteComment(commentId: string, req: any): Promise<{
        success: boolean;
        deleted: boolean;
        removedCount: number;
    }>;
    likeComment(commentId: string, req: any): Promise<{
        success: boolean;
        action: string;
        likes: number;
        isLiked: boolean;
    }>;
    trackViews(req: any, body: {
        postIds: string[];
    }): Promise<{
        tracked: number;
        views: Record<string, number>;
    }>;
    trackEngagementSignals(req: any, body: CreateEngagementSignalsDto): Promise<{
        tracked: number;
        metrics: Record<string, {
            completionRate: number;
            avgWatchTime: number;
            avgDwellTime: number;
            engagementScore: number;
            viralityScore: number;
        }>;
    }>;
}
