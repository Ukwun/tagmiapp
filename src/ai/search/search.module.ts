import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { SearchService } from "./search.service"
import { SearchController } from "./search.controller"
import { EmbeddingsModule } from "../embeddings/embeddings.module"
import { Content } from "../../content/entities/content.entity"
import { User } from "../../users/entities/user.entity"

@Module({
  imports: [
    TypeOrmModule.forFeature([Content, User]),
    EmbeddingsModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
