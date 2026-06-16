import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request as Req } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger"
import { BookingsService } from "./bookings.service"
import { CreateBookingDto } from "./dto/create-booking.dto"
import { UpdateBookingDto } from "./dto/update-booking.dto"
import { CreateMessageDto } from "./dto/create-message.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@ApiTags("Bookings")
@Controller("bookings")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new booking" })
  @ApiResponse({ status: 201, description: "Booking created successfully" })
  async create(@Req() req, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(req.user.id, createBookingDto)
  }

  @Get()
  @ApiOperation({ summary: "Get user bookings" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async findAll(@Req() req, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.bookingsService.findAll(req.user.id, req.user.role, page, limit)
  }

  @Get("stats")
  @ApiOperation({ summary: "Get booking statistics" })
  async getStats(@Req() req) {
    return this.bookingsService.getBookingStats(req.user.id, req.user.role)
  }

  @Get(":id")
  @ApiOperation({ summary: "Get booking by ID" })
  @ApiResponse({ status: 200, description: "Booking retrieved successfully" })
  @ApiResponse({ status: 404, description: "Booking not found" })
  async findOne(@Param('id') id: string, @Req() req) {
    return this.bookingsService.findOne(id, req.user.id)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update booking" })
  @ApiResponse({ status: 200, description: "Booking updated successfully" })
  async update(@Param('id') id: string, @Req() req, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(id, req.user.id, updateBookingDto)
  }

  @Delete(":id")
  @ApiOperation({ summary: "Cancel booking" })
  @ApiResponse({ status: 200, description: "Booking cancelled successfully" })
  async remove(@Param('id') id: string, @Req() req) {
    return this.bookingsService.remove(id, req.user.id)
  }

  @Get(":id/messages")
  @ApiOperation({ summary: "Get booking messages" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getMessages(
    @Param('id') id: string,
    @Req() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.bookingsService.getMessages(id, req.user.id, page, limit)
  }

  @Post(":id/messages")
  @ApiOperation({ summary: "Send message in booking" })
  @ApiResponse({ status: 201, description: "Message sent successfully" })
  async createMessage(@Param('id') id: string, @Req() req, @Body() createMessageDto: CreateMessageDto) {
    return this.bookingsService.createMessage(id, req.user.id, createMessageDto)
  }

  @Patch(":id/messages/read")
  @ApiOperation({ summary: "Mark messages as read" })
  async markMessagesAsRead(@Param('id') id: string, @Req() req) {
    return this.bookingsService.markMessagesAsRead(id, req.user.id)
  }
}
