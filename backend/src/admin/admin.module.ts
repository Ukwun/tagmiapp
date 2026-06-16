import { Module } from "@nestjs/common"
import { AdminDashboardModule } from "./dashboard/admin-dashboard.module"
import { AdminUsersModule } from "./users/admin-users.module"
import { AdminContentModule } from "./content/admin-content.module"
import { AdminEngagementModule } from "./engagement/admin-engagement.module"
import { AdminReportsModule } from "./reports/admin-reports.module"
import { AdminWalletsModule } from "./wallets/admin-wallets.module"
import { AdminReferralsModule } from "./referrals/admin-referrals.module"

@Module({
  imports: [
    AdminDashboardModule,
    AdminUsersModule,
    AdminContentModule,
    AdminEngagementModule,
    AdminReportsModule,
    AdminWalletsModule,
    AdminReferralsModule,
  ],
})
export class AdminModule {}
