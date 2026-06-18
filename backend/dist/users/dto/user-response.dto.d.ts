import { User } from "../entities/user.entity";
import { UserSettings } from "../entities/user-settings.entity";
export declare class UserProfileResponseDto {
    id: string;
    email?: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    coverImageUrl?: string;
    bio?: string;
    interests?: string[];
    gender?: string;
    dateOfBirth?: Date;
    location?: string;
    role: string;
    isVerified: boolean;
    isActive: boolean;
    followersCount: number;
    followingCount: number;
    postCount: number;
    createdAt: Date;
    privacy?: {
        profileVisible: boolean;
        showLocation: boolean;
        showRates: boolean;
    };
    isOwnProfile?: boolean;
    static from(user: User, isOwnProfile: boolean, settings?: UserSettings): UserProfileResponseDto;
    static fromSafe(user: User): Omit<UserProfileResponseDto, 'email'>;
}
export declare class AvatarUploadResponseDto {
    avatarUrl: string;
}
export declare class CoverUploadResponseDto {
    coverImageUrl: string;
}
export declare class MessageResponseDto {
    message: string;
}
export declare class UserSearchResponseDto {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    isVerified: boolean;
}
export declare class SuggestedUserResponseDto {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    isVerified: boolean;
    bio?: string;
    followersCount: number;
}
export declare class TalentSearchResponseDto {
    data: any[];
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
}
