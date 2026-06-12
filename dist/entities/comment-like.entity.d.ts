import { User } from "./user.entity";
import { Comment } from "./comment.entity";
export declare class CommentLike {
    id: string;
    commentId: string;
    userId: string;
    createdAt: Date;
    comment: Comment;
    user: User;
}
