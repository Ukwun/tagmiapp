import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { GenerationService } from "./generation.service"
import { GenerationController } from "./generation.controller"
import { EmbeddingsModule } from "../embeddings/embeddings.module"
import { Content } from "../../content/entities/content.entity"
import { ContentEmbedding } from "../embeddings/content-embedding.entity"

@Module({
  imports: [
    TypeOrmModule.forFeature([Content, ContentEmbedding]),
    EmbeddingsModule,
  ],
  controllers: [GenerationController],
  providers: [GenerationService],
  exports: [GenerationService],
})
export class GenerationModule {}
