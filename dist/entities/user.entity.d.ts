import { Content } from "./content.entity";
export declare class User {
    id: string;
    email: string;
    username: string;
    displayName: string;
    passwordHash: string;
    avatarUrl: string;
    bio: string;
    interests: string[];
    followersCount: number;
    followingCount: number;
    postCount: number;
    isVerified: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    content: Content[];
}
