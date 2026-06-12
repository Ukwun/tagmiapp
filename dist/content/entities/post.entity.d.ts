import { User } from "../../users/entities/user.entity";
import { Slide } from "./slide.entity";
import { Comment } from "./comment.entity";
export declare class Post {
    id: string;
    userId: string;
    caption: string;
    hashtags: string[];
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalViews: number;
    totalBookmarks: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    slides: Slide[];
    comments: Comment[];
}
