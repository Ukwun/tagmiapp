import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { CategorizationService } from "./categorization.service"
import { CategorizationController } from "./categorization.controller"
import { EmbeddingsModule } from "../embeddings/embeddings.module"
import { Content } from "../../content/entities/content.entity"

@Module({
  imports: [EmbeddingsModule, TypeOrmModule.forFeature([Content])],
  controllers: [CategorizationController],
  providers: [CategorizationService],
  exports: [CategorizationService],
})
export class CategorizationModule {}
