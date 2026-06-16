import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { TrendingService } from "./trending.service"
import { TrendingController } from "./trending.controller"
import { HashtagStat } from "./hashtag-stat.entity"
import { Content } from "../../content/entities/content.entity"
import { ScoringModule } from "../scoring/scoring.module"
import { HashtagStatRepository } from "./repositories/hashtag-stat.repository"

@Module({
  imports: [
    TypeOrmModule.forFeature([HashtagStat, Content]),
    ScoringModule,
  ],
  controllers: [TrendingController],
  providers: [TrendingService, HashtagStatRepository],
  exports: [TrendingService, HashtagStatRepository],
})
export class TrendingModule {}
