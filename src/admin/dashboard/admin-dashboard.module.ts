import { Module } from "@nestjs/common"
import { AdminDashboardService } from "./admin-dashboard.service"
import { AdminDashboardController } from "./admin-dashboard.controller"
import { UsersModule } from "../../users/users.module"
import { ContentModule } from "../../content/content.module"
import { ReportsModule } from "../../reports/reports.module"
import { BookingsModule } from "../../bookings/bookings.module"
import { ReferralsModule } from "../../referrals/referrals.module"

@Module({
  imports: [
    UsersModule,
    ContentModule,
    ReportsModule,
    BookingsModule,
    ReferralsModule,
  ],
  controllers: [AdminDashboardController],
  providers: [AdminDashboardService],
})
export class AdminDashboardModule {}
