import { Module } from "@nestjs/common"
import { AdminEngagementService } from "./admin-engagement.service"
import { AdminEngagementController } from "./admin-engagement.controller"
import { ContentModule } from "../../content/content.module"
import { TrendingModule } from "../../ai/trending/trending.module"

@Module({
  imports: [ContentModule, TrendingModule],
  controllers: [AdminEngagementController],
  providers: [AdminEngagementService],
})
export class AdminEngagementModule {}
