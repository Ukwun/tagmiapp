import { User } from "../../users/entities/user.entity";
import { Content } from "./content.entity";
export declare class Comment {
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
}
