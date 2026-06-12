import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ScoringService } from "./scoring.service"
import { Content } from "../../content/entities/content.entity"
import { EngagementSignal } from "../../content/entities/engagement-signal.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Content, EngagementSignal])],
  providers: [ScoringService],
  exports: [ScoringService],
})
export class ScoringModule {}
