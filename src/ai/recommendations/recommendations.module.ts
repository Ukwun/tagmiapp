import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { RecommendationsService } from "./recommendations.service"
import { RecommendationsController } from "./recommendations.controller"
import { EmbeddingsModule } from "../embeddings/embeddings.module"
import { Content } from "../../content/entities/content.entity"

@Module({
  imports: [
    TypeOrmModule.forFeature([Content]),
    EmbeddingsModule,
  ],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
