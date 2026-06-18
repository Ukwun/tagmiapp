import { AnalyticsService } from "./analytics.service";
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getBestPostingTimes(req: any): Promise<{
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
    getBestPostingTimesForUser(userId: string): Promise<{
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
    getEngagementAnalytics(req: any, days?: number): Promise<{
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
    getEngagementAnalyticsForUser(userId: string, days?: number): Promise<{
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
