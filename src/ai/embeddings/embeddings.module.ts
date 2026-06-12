import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EmbeddingsService } from "./embeddings.service"
import { ContentEmbedding } from "./content-embedding.entity"
import { UserEmbedding } from "./user-embedding.entity"
import { Content } from "../../content/entities/content.entity"
import { User } from "../../users/entities/user.entity"

@Module({
  imports: [TypeOrmModule.forFeature([ContentEmbedding, UserEmbedding, Content, User])],
  providers: [EmbeddingsService],
  exports: [EmbeddingsService],
})
export class EmbeddingsModule {}
