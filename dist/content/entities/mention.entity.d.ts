import { User } from "../../users/entities/user.entity";
import { Content } from "./content.entity";
import { Comment } from "./comment.entity";
export declare class Mention {
    id: string;
    mentionedUserId: string;
    mentionedByUserId: string;
    contentId: string;
    commentId: string;
    mentionedUser: User;
    mentionedByUser: User;
    content: Content;
    comment: Comment;
    createdAt: Date;
}
