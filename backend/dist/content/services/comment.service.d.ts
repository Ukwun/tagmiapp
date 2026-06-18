import type { Repository } from "typeorm";
import { Comment } from "../entities/comment.entity";
import { CommentLike } from "../entities/comment-like.entity";
import { Content } from "../entities/content.entity";
import { Mention } from "../entities/mention.entity";
import { User } from "../../users/entities/user.entity";
import { NotificationsService } from "../../notifications/notifications.service";
import type { CreateCommentDto } from "../dto/create-comment.dto";
export declare class CommentService {
    private commentRepository;
    private commentLikeRepository;
    private contentRepository;
    private mentionRepository;
    private userRepository;
    private notificationsService;
    constructor(commentRepository: Repository<Comment>, commentLikeRepository: Repository<CommentLike>, contentRepository: Repository<Content>, mentionRepository: Repository<Mention>, userRepository: Repository<User>, notificationsService: NotificationsService);
    private safeUser;
    private extractMentions;
    private saveMentions;
    addComment(contentId: string, userId: string, createCommentDto: CreateCommentDto): Promise<Comment>;
    getComments(contentId: string, userId?: string, page?: number, limit?: number): Promise<{
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
                content: Content;
                parent: Comment;
                replies: Comment[];
            }[];
            id: string;
            userId: string;
            contentId: string;
            text: string;
            parentId: string;
            likes: number;
            createdAt: Date;
            updatedAt: Date;
            content: Content;
            parent: Comment;
        }[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    likeComment(commentId: string, userId: string): Promise<{
        success: boolean;
        action: string;
        likes: number;
        isLiked: boolean;
    }>;
    getCommentWithLikeStatus(comment: Comment, userId?: string): Promise<{
        isLiked: boolean;
        id: string;
        userId: string;
        contentId: string;
        text: string;
        parentId: string;
        likes: number;
        createdAt: Date;
        updatedAt: Date;
        user: User;
        content: Content;
        parent: Comment;
        replies: Comment[];
    }>;
}
