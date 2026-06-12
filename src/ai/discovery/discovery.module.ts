import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { DiscoveryService } from "./discovery.service"
import { DiscoveryController } from "./discovery.controller"
import { User } from "../../users/entities/user.entity"
import { Follow } from "../../follows/entities/follow.entity"
import { Content } from "../../content/entities/content.entity"

@Module({
  imports: [TypeOrmModule.forFeature([User, Follow, Content])],
  controllers: [DiscoveryController],
  providers: [DiscoveryService],
  exports: [DiscoveryService],
})
export class DiscoveryModule {}
