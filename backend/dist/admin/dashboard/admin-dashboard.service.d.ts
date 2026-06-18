import { RedisService } from "../../config/redis.service";
import { UserRepository } from "../../users/repositories/user.repository";
import { ContentRepository } from "../../content/repositories/content.repository";
import { ContentInteractionRepository } from "../../content/repositories/content-interaction.repository";
import { EngagementSignalRepository } from "../../content/repositories/engagement-signal.repository";
import { ReportRepository } from "../../reports/repositories/report.repository";
import { BookingRepository } from "../../bookings/repositories/booking.repository";
import { ReferralRepository } from "../../referrals/repositories/referral.repository";
import { UserPreferenceRepository } from "../../content/repositories/user-preference.repository";
export declare class AdminDashboardService {
    private readonly userRepo;
    private readonly contentRepo;
    private readonly interactionRepo;
    private readonly signalRepo;
    private readonly reportRepo;
    private readonly bookingRepo;
    private readonly referralRepo;
    private readonly redisService;
    private readonly userPreferenceRepo;
    constructor(userRepo: UserRepository, contentRepo: ContentRepository, interactionRepo: ContentInteractionRepository, signalRepo: EngagementSignalRepository, reportRepo: ReportRepository, bookingRepo: BookingRepository, referralRepo: ReferralRepository, redisService: RedisService, userPreferenceRepo: UserPreferenceRepository);
    getDashboardOverview(): Promise<any>;
    getFeedPerformanceMetrics(): Promise<any>;
    private generateRecommendations;
}
