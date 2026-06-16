import { Controller, Get, Post, Patch, Delete, Param, Query, UseGuards, Req, UseInterceptors, UploadedFile, Body, Inject, forwardRef } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger"
import { FileInterceptor } from "@nestjs/platform-express"
import { ChatService } from "./chat.service"
import { ChatGateway } from "./chat.gateway"
import { CreateRoomDto } from "./dto/create-room.dto"
import { CreateMessageDto } from "./dto/create-message.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

interface AuthenticatedRequest extends Request {
  user: {
    id: string
    role: string
  }
}

@ApiTags("Chat")
@Controller("chat")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post("rooms")
  @ApiOperation({ summary: "Create a new chat room" })
  @ApiResponse({ status: 201, description: "Room created successfully" })
  async createRoom(@Body() createRoomDto: CreateRoomDto, @Req() req: AuthenticatedRequest) {
    return this.chatService.createRoom(req.user.id, createRoomDto)
  }

  @Get("rooms")
  @ApiOperation({ summary: "Get user's chat rooms" })
  async getUserRooms(@Req() req: AuthenticatedRequest) {
    return this.chatService.getUserRooms(req.user.id)
  }

  @Get("rooms/:id/messages")
  @ApiOperation({ summary: "Get room messages" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getRoomMessages(
    @Param("id") id: string,
    @Query("page") page: number,
    @Query("limit") limit: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.chatService.getRoomMessages(id, req.user.id, page, limit)
  }

  @Post("rooms/:id/messages")
  @ApiOperation({ summary: "Send a message to a room" })
  @ApiResponse({ status: 201, description: "Message sent successfully" })
  async createMessage(@Param("id") id: string, @Body() createMessageDto: CreateMessageDto, @Req() req: AuthenticatedRequest) {
    return this.chatService.createMessage(id, req.user.id, createMessageDto)
  }

  @Post("bookings/:bookingId/room")
  @ApiOperation({ summary: "Get or create chat room for booking" })
  async getOrCreateBookingRoom(@Param("bookingId") bookingId: string, @Req() req: AuthenticatedRequest) {
    return this.chatService.getOrCreateBookingRoom(bookingId, req.user.id)
  }

  @Post("direct/:userId")
  @ApiOperation({ summary: "Get or create direct chat room with a user" })
  async getOrCreateDirectRoom(@Param("userId") userId: string, @Req() req: AuthenticatedRequest) {
    return this.chatService.getOrCreateDirectRoom(req.user.id, userId)
  }

  @Patch("rooms/:roomId/messages/:messageId")
  @ApiOperation({ summary: "Edit a message" })
  async editMessage(
    @Param("roomId") roomId: string,
    @Param("messageId") messageId: string,
    @Body("content") content: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const updated = await this.chatService.editMessage(messageId, req.user.id, content)
    // Broadcast edit via socket
    this.chatGateway.server.to(`room:${roomId}`).emit("messageEdited", {
      messageId,
      content,
      editedAt: updated.editedAt,
    })
    return { success: true, data: updated }
  }

  @Delete("rooms/:roomId/messages/:messageId")
  @ApiOperation({ summary: "Delete a message" })
  async deleteMessage(
    @Param("roomId") roomId: string,
    @Param("messageId") messageId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.chatService.deleteMessage(messageId, req.user.id)
    // Broadcast deletion via socket
    this.chatGateway.server.to(`room:${roomId}`).emit("messageDeleted", { messageId })
    return { success: true }
  }

  @Post("rooms/:id/messages/media")
  @ApiOperation({ summary: "Send a media message to a room" })
  @UseInterceptors(FileInterceptor("file"))
  async createMediaMessage(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body("content") content: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.chatService.createMediaMessage(id, req.user.id, file, content)

    // Emit via socket so the receiver gets the message in real-time
    // Also send notification to other participants
    if (result.success && result.data) {
      this.chatGateway.emitNewMessage(id, result.data)
      const mediaLabel = file.mimetype.startsWith("audio/") ? "Sent a voice message" : "Sent a file"
      this.chatGateway.notifyRoomParticipants(id, req.user.id, mediaLabel)
    }

    return result
  }
}
