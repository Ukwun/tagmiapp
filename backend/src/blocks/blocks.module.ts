import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { BlocksService } from "./blocks.service"
import { BlocksController } from "./blocks.controller"
import { Block } from "./entities/block.entity"
import { User } from "../users/entities/user.entity"
import { BlockRepository } from "./repositories/block.repository"
import { UserRepository } from "../users/repositories/user.repository"

@Module({
  imports: [TypeOrmModule.forFeature([Block, User])],
  controllers: [BlocksController],
  providers: [BlocksService, BlockRepository, UserRepository],
  exports: [BlocksService],
})
export class BlocksModule {}
