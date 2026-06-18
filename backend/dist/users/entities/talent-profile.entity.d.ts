import { User } from "./user.entity";
export declare class TalentProfile {
    id: string;
    userId: string;
    displayName: string;
    profileImageUrl: string;
    coverImageUrl: string;
    bio: string;
    skills: string[];
    categories: string[];
    hourlyRate: number;
    location: string;
    languages: string[];
    portfolioUrl: string;
    socialLinks: Record<string, string>;
    services: {
        name: string;
        description: string;
        price: number;
    }[];
    rating: number;
    totalBookings: number;
    responseTime: number;
    availabilityStatus: "available" | "busy" | "unavailable";
    isAvailable: boolean;
    isBookable: boolean;
    followerCount: number;
    followingCount: number;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
