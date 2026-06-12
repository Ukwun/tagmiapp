export declare class ServiceItemDto {
    name: string;
    description: string;
    price: number;
}
export declare class UpdateTalentProfileDto {
    bio?: string;
    skills?: string[];
    categories?: string[];
    hourlyRate?: number;
    location?: string;
    languages?: string[];
    portfolioUrl?: string;
    socialLinks?: Record<string, string>;
    isAvailable?: boolean;
    isBookable?: boolean;
    services?: ServiceItemDto[];
}
