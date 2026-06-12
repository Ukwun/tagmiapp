import { User } from "./user.entity";
export declare class TalentProfile {
    id: string;
    userId: string;
    bio: string;
    skills: string[];
    categories: string[];
    hourlyRate: number;
    location: string;
    languages: string[];
    portfolioUrl: string;
    socialLinks: Record<string, string>;
    rating: number;
    totalBookings: number;
    responseTime: number;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
