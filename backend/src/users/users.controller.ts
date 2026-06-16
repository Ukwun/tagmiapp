/**
 * UsersController
 *
 * HTTP endpoints for user profile management, settings, avatar uploads,
 * talent search, and account operations.
 */
import { Controller, Get, Put, Post, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, Request } from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes } from "@nestjs/swagger"
import { UsersService } from "./users.service"
import { UpdateUserDto } from "./dto/update-user.dto"
import { UpdateTalentProfileDto } from "./dto/update-talent-profile.dto"
import { UpdateSettingsDto } from "./dto/update-settings.dto"
import { UserProfileResponseDto } from "./dto/user-response.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { OptionalJwtAuthGuard } from "../auth/guards/optional-jwt-auth.guard"

@ApiTags("Users")
@Controller("users")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get("profile")
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, description: "User profile retrieved" })
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.id)
    return UserProfileResponseDto.fromSafe(user)
  }

  @Put("profile")
  @ApiOperation({ summary: "Update user profile" })
  @ApiResponse({ status: 200, description: "Profile updated successfully" })
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.updateProfile(req.user.id, updateUserDto)
    return UserProfileResponseDto.fromSafe(user)
  }

  @Post("avatar")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload user avatar" })
  @ApiResponse({ status: 200, description: "Avatar uploaded successfully" })
  async uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    return this.usersService.uploadAvatar(req.user.id, file)
  }

  @Post("cover")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload user cover photo" })
  @ApiResponse({ status: 200, description: "Cover photo uploaded successfully" })
  async uploadCover(@Request() req, @UploadedFile() file: Express.Multer.File) {
    return this.usersService.uploadCover(req.user.id, file)
  }

  @Get("talent-profile")
  @ApiOperation({ summary: "Get current user talent profile" })
  @ApiResponse({ status: 200, description: "Talent profile retrieved" })
  async getTalentProfile(@Request() req) {
    return this.usersService.getTalentProfile(req.user.id)
  }

  @Put("talent-profile")
  @ApiOperation({ summary: "Update talent profile" })
  @ApiResponse({ status: 200, description: "Talent profile updated successfully" })
  async updateTalentProfile(@Request() req, @Body() updateTalentProfileDto: UpdateTalentProfileDto) {
    return this.usersService.updateTalentProfile(req.user.id, updateTalentProfileDto)
  }

  @Get("settings")
  @ApiOperation({ summary: "Get user settings" })
  @ApiResponse({ status: 200, description: "Settings retrieved" })
  async getSettings(@Request() req) {
    return this.usersService.getOrCreateSettings(req.user.id)
  }

  @Put("settings")
  @ApiOperation({ summary: "Update user settings" })
  @ApiResponse({ status: 200, description: "Settings updated" })
  async updateSettings(@Request() req, @Body() dto: UpdateSettingsDto) {
    return this.usersService.updateSettings(req.user.id, dto)
  }

  @Delete("account")
  @ApiOperation({ summary: "Delete user account" })
  @ApiResponse({ status: 200, description: "Account deleted" })
  async deleteAccount(@Request() req) {
    await this.usersService.deleteAccount(req.user.id)
    return { message: "Account deleted successfully" }
  }

  @Get("suggested")
  @ApiOperation({ summary: "Get suggested users to follow" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({ status: 200, description: "Suggested users retrieved" })
  async getSuggestedUsers(
    @Request() req,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.getSuggestedUsers(req.user.id, limit || 5)
  }

  @Get("search")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Search users for mentions" })
  @ApiQuery({ name: "q", required: true, description: "Search query" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async searchUsers(
    @Request() req,
    @Query('q') query: string,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.searchUsers(query, limit || 10, req.user?.id)
  }

  @Get("talents/search")
  @ApiOperation({ summary: "Search talents" })
  @ApiQuery({ name: "query", required: false })
  @ApiQuery({ name: "skills", required: false, type: [String] })
  @ApiQuery({ name: "categories", required: false, type: [String] })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async searchTalents(
    @Request() req,
    @Query('query') query?: string,
    @Query('skills') skills?: string[],
    @Query('categories') categories?: string[],
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.searchTalents(
      query,
      skills,
      categories,
      page ? Number.parseInt(page) : undefined,
      limit ? Number.parseInt(limit) : undefined,
      req.user?.id,
    )
  }

  @Get('talents/:userId')
  @ApiOperation({ summary: 'Get talent profile by user ID' })
  @ApiResponse({ status: 200, description: 'Talent profile retrieved' })
  async getTalentProfileById(@Param('userId') userId: string) {
    return this.usersService.getTalentProfile(userId)
  }

  /**
   * Public profile endpoint for SEO metadata generation.
   *
   * The Next.js frontend calls this server-side (no auth token) to build
   * Open Graph tags and structured data that search engine crawlers can see.
   * Returns only public fields — no email, no privacy settings, no ownership flag.
   */
  @Get('public/:id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get public user profile for SEO (no auth required)' })
  @ApiResponse({ status: 200, description: 'Public profile retrieved' })
  async getPublicUserById(@Param('id') id: string) {
    const user = await this.usersService.findByIdOrUsername(id)
    return UserProfileResponseDto.fromSafe(user)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user profile by ID or username' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getUserById(@Param('id') id: string, @Request() req) {
    const user = await this.usersService.findByIdOrUsername(id)
    const settings = await this.usersService.getOrCreateSettings(user.id)
    const isOwnProfile = req.user?.id === user.id

    return UserProfileResponseDto.from(user, isOwnProfile, settings)
  }
}
