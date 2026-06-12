import { Controller, Get, Patch, Delete, Param, UseGuards, Request, Query } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { NotificationsService } from "./notifications.service"

@ApiTags("notifications")
@Controller("notifications")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: "Get all notifications for current user" })
  async getNotifications(@Request() req, @Query("limit") limit?: number) {
    return this.notificationsService.findAllForUser(req.user.id, limit ? +limit : 50)
  }

  @Get("unread-count")
  @ApiOperation({ summary: "Get unread notification count" })
  async getUnreadCount(@Request() req) {
    const count = await this.notificationsService.getUnreadCount(req.user.id)
    return { count }
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark notification as read" })
  async markAsRead(@Param("id") id: string, @Request() req) {
    await this.notificationsService.markAsRead(id, req.user.id)
    return { success: true }
  }

  @Patch("read-all")
  @ApiOperation({ summary: "Mark all notifications as read" })
  async markAllAsRead(@Request() req) {
    await this.notificationsService.markAllAsRead(req.user.id)
    return { success: true }
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a notification" })
  async deleteNotification(@Param("id") id: string, @Request() req) {
    await this.notificationsService.deleteNotification(id, req.user.id)
    return { success: true }
  }
}
