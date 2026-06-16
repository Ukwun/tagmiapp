import { Module } from "@nestjs/common"
import { AdminContentService } from "./admin-content.service"
import { AdminContentController } from "./admin-content.controller"
import { ContentModule } from "../../content/content.module"

@Module({
  imports: [ContentModule],
  controllers: [AdminContentController],
  providers: [AdminContentService],
})
export class AdminContentModule {}
