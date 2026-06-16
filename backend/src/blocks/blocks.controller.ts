import { Controller, Post, Delete, Get, Param, UseGuards, Request, Query } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { BlocksService } from "./blocks.service"

@ApiTags("blocks")
@Controller("blocks")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Post(":userId")
  @ApiOperation({ summary: "Block a user" })
  async blockUser(@Param("userId") userId: string, @Request() req) {
    return this.blocksService.blockUser(req.user.id, userId)
  }

  @Delete(":userId")
  @ApiOperation({ summary: "Unblock a user" })
  async unblockUser(@Param("userId") userId: string, @Request() req) {
    return this.blocksService.unblockUser(req.user.id, userId)
  }

  @Get()
  @ApiOperation({ summary: "Get blocked users" })
  async getBlockedUsers(@Request() req, @Query("page") page?: number, @Query("limit") limit?: number) {
    return this.blocksService.getBlockedUsers(req.user.id, page ? +page : 1, limit ? +limit : 20)
  }

  @Get("check/:userId")
  @ApiOperation({ summary: "Check if user is blocked" })
  async isBlocked(@Param("userId") userId: string, @Request() req) {
    const blocked = await this.blocksService.isBlocked(req.user.id, userId)
    return { blocked }
  }
}
