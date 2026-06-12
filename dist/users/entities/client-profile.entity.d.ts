import { User } from "./user.entity";
export declare class ClientProfile {
    id: string;
    userId: string;
    companyName: string;
    industry: string;
    companySize: string;
    companyDescription: string;
    website: string;
    preferredCategories: string[];
    preferredSkills: string[];
    totalBookings: number;
    completedBookings: number;
    rating: number;
    totalSpent: number;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
