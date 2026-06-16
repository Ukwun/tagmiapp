import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AnalyticsService } from "./analytics.service"
import { AnalyticsController } from "./analytics.controller"
import { Content } from "../../content/entities/content.entity"
import { ContentInteraction } from "../../content/entities/content-interaction.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Content, ContentInteraction])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
