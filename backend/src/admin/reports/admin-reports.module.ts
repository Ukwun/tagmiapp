import { Module } from "@nestjs/common"
import { AdminReportsService } from "./admin-reports.service"
import { AdminReportsController } from "./admin-reports.controller"
import { ReportsModule } from "../../reports/reports.module"
import { UsersModule } from "../../users/users.module"
import { ContentModule } from "../../content/content.module"

@Module({
  imports: [ReportsModule, UsersModule, ContentModule],
  controllers: [AdminReportsController],
  providers: [AdminReportsService],
})
export class AdminReportsModule {}
