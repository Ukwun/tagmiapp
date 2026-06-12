import { Repository } from "typeorm";
import { Content } from "../../content/entities/content.entity";
import { ContentInteraction } from "../../content/entities/content-interaction.entity";
export declare class AnalyticsService {
    private readonly contentRepository;
    private readonly interactionRepository;
    constructor(contentRepository: Repository<Content>, interactionRepository: Repository<ContentInteraction>);
    getBestPostingTimes(userId: string): Promise<{
        bestHours: {
            hour: number;
            interactions: number;
        }[];
        bestDays: {
            day: string;
            interactions: number;
        }[];
        hourlyBreakdown: {
            hour: number;
            interactions: number;
        }[];
        dailyBreakdown: {
            day: string;
            interactions: number;
        }[];
    }>;
    getEngagementAnalytics(userId: string, days?: number): Promise<{
        daily: {
            date: any;
            posts: number;
            views: number;
            likes: number;
            comments: number;
            shares: number;
            avgScore: number;
        }[];
        totals: {
            posts: number;
            views: number;
            likes: number;
            comments: number;
            shares: number;
            engagementRate: number;
        };
    }>;
}
