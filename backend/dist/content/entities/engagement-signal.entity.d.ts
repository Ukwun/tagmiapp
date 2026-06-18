import { User } from "../../users/entities/user.entity";
import { Content } from "./content.entity";
export declare class EngagementSignal {
    id: string;
    userId: string;
    contentId: string;
    postId: string;
    contentType: "video" | "audio" | "image" | "text";
    mediaProgress: number;
    mediaCompleted: boolean;
    dwellTimeMs: number;
    scrollDepth: number;
    slideIndex: number;
    totalSlides: number;
    createdAt: Date;
    user: User;
    content: Content;
}
