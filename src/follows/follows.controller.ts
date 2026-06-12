import { Controller, Post, Delete, Get, Param, Query, UseGuards, Req } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger"
import { FollowsService } from "./follows.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import type { Request } from "express"

@ApiTags("Follows")
@Controller("follows")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(":userId")
  @ApiOperation({ summary: "Follow a user" })
  @ApiResponse({ status: 201, description: "Successfully followed user" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 409, description: "Already following this user" })
  async followUser(@Req() req: Request, @Param("userId") userId: string) {
    return this.followsService.followUser(req.user.id, userId)
  }

  @Delete(":userId")
  @ApiOperation({ summary: "Unfollow a user" })
  @ApiResponse({ status: 200, description: "Successfully unfollowed user" })
  @ApiResponse({ status: 404, description: "Not following this user" })
  async unfollowUser(@Req() req: Request, @Param("userId") userId: string) {
    return this.followsService.unfollowUser(req.user.id, userId)
  }

  @Get("followers/:userId")
  @ApiOperation({ summary: "Get user's followers" })
  @ApiResponse({ status: 200, description: "List of followers retrieved" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getFollowers(
    @Req() req: Request,
    @Param("userId") userId: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const currentUserId = req.user?.id
    return this.followsService.getFollowers(userId, Number.parseInt(page) || 1, Number.parseInt(limit) || 20, currentUserId)
  }

  @Get("following/:userId")
  @ApiOperation({ summary: "Get users that a user is following" })
  @ApiResponse({ status: 200, description: "List of following retrieved" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getFollowing(
    @Param("userId") userId: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.followsService.getFollowing(userId, Number.parseInt(page) || 1, Number.parseInt(limit) || 20)
  }

  @Get("check/:userId")
  @ApiOperation({ summary: "Check if current user is following another user" })
  @ApiResponse({ status: 200, description: "Follow status retrieved" })
  async checkFollowing(@Req() req: Request, @Param("userId") userId: string) {
    const [isFollowing, followsYou] = await Promise.all([
      this.followsService.isFollowing(req.user.id, userId),
      this.followsService.isFollowing(userId, req.user.id),
    ])
    return { isFollowing, followsYou }
  }

  @Get("stats/:userId")
  @ApiOperation({ summary: "Get follow statistics for a user" })
  @ApiResponse({ status: 200, description: "Follow stats retrieved" })
  async getFollowStats(@Param("userId") userId: string) {
    return this.followsService.getFollowStats(userId)
  }
}