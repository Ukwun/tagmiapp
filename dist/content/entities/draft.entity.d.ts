import { User } from "../../users/entities/user.entity";
export interface DraftSlide {
    type: "image" | "video" | "text";
    mediaUrl?: string;
    caption?: string;
    text?: string;
    backgroundColor?: string;
    fontStyle?: string;
    backgroundMusicUrl?: string;
    musicName?: string;
    musicTrimStart?: number;
    musicTrimEnd?: number;
    hasMediaFile?: boolean;
    hasMusicFile?: boolean;
    sortOrder: number;
}
export declare class Draft {
    id: string;
    userId: string;
    user: User;
    slides: DraftSlide[];
    hashtags: string[];
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
