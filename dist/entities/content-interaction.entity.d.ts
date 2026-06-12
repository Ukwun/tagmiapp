import { User } from "./user.entity";
import { Content } from "./content.entity";
export declare class ContentInteraction {
    id: string;
    userId: string;
    contentId: string;
    type: "like" | "view" | "share" | "comment" | "bookmark";
    createdAt: Date;
    user: User;
    content: Content;
}
