import { Controller, Get, Patch, Delete, Param, Body, Query, Request, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { AdminGuard } from "../../auth/guards/admin.guard"
import { AdminUsersService } from "./admin-users.service"
import {
  UserSearchQueryDto,
  ToggleActiveDto,
  ToggleVerifiedDto,
  ChangeRoleDto,
  UpdateUserDto,
} from "./dto/admin-users.dto"

@ApiTags("Admin - Users")
@Controller("admin/users")
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminUsersController {
  constructor(private readonly usersService: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: "List all users with search and filters" })
  async getUsers(@Query() query: UserSearchQueryDto) {
    return this.usersService.getUsers(query)
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user detail with related counts" })
  async getUserDetail(@Param("id") id: string) {
    return this.usersService.getUserDetail(id)
  }

  @Get(":id/content")
  @ApiOperation({ summary: "Get a user's content posts (paginated)" })
  async getUserContent(
    @Param("id") id: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.usersService.getUserContent(id, Number(page) || 1, Number(limit) || 12)
  }

  @Get(":id/bookings")
  @ApiOperation({ summary: "Get a user's bookings (as client and talent)" })
  async getUserBookings(
    @Param("id") id: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.usersService.getUserBookings(id, Number(page) || 1, Number(limit) || 12)
  }

  @Get(":id/engagement")
  @ApiOperation({ summary: "Get aggregated engagement totals for a user" })
  async getUserEngagement(@Param("id") id: string) {
    return this.usersService.getUserEngagement(id)
  }

  @Patch(":id/active")
  @ApiOperation({ summary: "Toggle user active status" })
  async toggleActive(
    @Param("id") id: string,
    @Body() dto: ToggleActiveDto,
    @Request() req,
  ) {
    return this.usersService.toggleActive(id, dto, req.user)
  }

  @Patch(":id/verified")
  @ApiOperation({ summary: "Toggle user verified status" })
  async toggleVerified(@Param("id") id: string, @Body() dto: ToggleVerifiedDto) {
    return this.usersService.toggleVerified(id, dto)
  }

  @Patch(":id/role")
  @ApiOperation({ summary: "Change user role (only super-admin can promote to manager)" })
  async changeRole(
    @Param("id") id: string,
    @Body() dto: ChangeRoleDto,
    @Request() req,
  ) {
    return this.usersService.changeRole(id, dto, req.user)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update user details (displayName, username, email, bio)" })
  async updateUser(
    @Param("id") id: string,
    @Body() dto: UpdateUserDto,
    @Request() req,
  ) {
    return this.usersService.updateUser(id, dto, req.user)
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft-delete user (anonymize and deactivate)" })
  async deleteUser(@Param("id") id: string, @Request() req) {
    return this.usersService.deleteUser(id, req.user)
  }
}
