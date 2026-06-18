import { Injectable, NotFoundException, ForbiddenException, BadRequestException, OnModuleInit, Logger } from "@nestjs/common"
import type { CreateBookingDto } from "./dto/create-booking.dto"
import type { UpdateBookingDto } from "./dto/update-booking.dto"
import type { CreateMessageDto } from "./dto/create-message.dto"
import { UserRepositoryHelper } from "../common/repositories/user-repository.helper"
import { PaginationHelper } from "../common/utils/pagination.util"
import { UserTransformer } from "../common/transformers/user.transformer"
import { AuthorizationHelper } from "../common/guards/authorization.helper"
import { ErrorHandler } from "../common/exceptions/error.handler"
import { BookingRepository } from "./repositories/booking.repository"
import { BookingMessageRepository } from "./repositories/booking-message.repository"
import { Booking } from "./entities/booking.entity"
import { BookingMessage } from "./entities/booking-message.entity"

@Injectable()
export class BookingsService implements OnModuleInit {
  private readonly logger = new Logger(BookingsService.name)

  constructor(
    private bookingRepository: BookingRepository,
    private messageRepository: BookingMessageRepository,
    private userRepositoryHelper: UserRepositoryHelper,
  ) {}

  async onModuleInit() {
    // Add 'in_progress' to booking status enum if missing (Postgres doesn't auto-migrate enums)
    try {
      const ds = this.bookingRepository.manager.connection
      await ds.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_enum
            WHERE enumlabel = 'in_progress'
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'bookings_status_enum')
          ) THEN
            ALTER TYPE bookings_status_enum ADD VALUE 'in_progress' AFTER 'rejected';
          END IF;
        END
        $$;
      `)
      this.logger.log("Booking status enum verified")
    } catch (error) {
      this.logger.warn(`Could not update booking status enum: ${(error as any).message}`)
    }
  }

  async create(clientId: string, createBookingDto: CreateBookingDto): Promise<Booking> {
    // Using UserRepositoryHelper eliminates duplicate user fetching logic
    const client = await this.userRepositoryHelper.findByIdOrFail(clientId)
    const talent = await this.userRepositoryHelper.findByIdOrFail(createBookingDto.talentId)

    const booking = this.bookingRepository.create({
      clientId,
      talentId: createBookingDto.talentId,
      title: createBookingDto.title,
      description: createBookingDto.description,
      price: createBookingDto.budget,
      startDate: createBookingDto.startDate,
      endDate: createBookingDto.endDate,
      status: "pending",
    })

    return this.bookingRepository.save(booking)
  }

  async findAll(userId: string, role: string, page: any = 1, limit: any = 20) {
    // Using PaginationHelper eliminates duplicate pagination logic
    const { page: normalizedPage, limit: normalizedLimit } = PaginationHelper.normalizeParams({ page, limit })

    const queryBuilder = this.bookingRepository
      .createQueryBuilder("booking")
      .leftJoinAndSelect("booking.client", "client")
      .leftJoinAndSelect("booking.talent", "talent")
      .where("booking.clientId = :userId OR booking.talentId = :userId", { userId })
      .orderBy("booking.createdAt", "DESC")

    PaginationHelper.applyToQueryBuilder(queryBuilder, normalizedPage, normalizedLimit)

    const [data, total] = await queryBuilder.getManyAndCount()

    // Using UserTransformer to remove sensitive fields from client and talent
    const sanitizedData = data.map((booking) => ({
      ...booking,
      client: UserTransformer.sanitize(booking.client),
      talent: UserTransformer.sanitize(booking.talent),
    }))

    return PaginationHelper.buildResponse(sanitizedData, total, normalizedPage, normalizedLimit)
  }

  async findOne(id: string, userId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ["client", "talent"],
    })

    if (!booking) {
      ErrorHandler.notFound("Booking", id)
    }

    // Using AuthorizationHelper for ownership check
    AuthorizationHelper.verifyOwnershipMultiple(
      [booking.clientId, booking.talentId],
      userId,
      "You can only view your own bookings",
    )

    // Using UserTransformer to sanitize user data before returning
    return {
      ...booking,
      client: UserTransformer.sanitize(booking.client) as any,
      talent: UserTransformer.sanitize(booking.talent) as any,
    }
  }

  async update(id: string, userId: string, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.findOne(id, userId)

    // Only allow certain updates based on role and status
    if (booking.clientId === userId) {
      // Clients can update details if booking is pending
      if (booking.status !== "pending") {
        ErrorHandler.badRequest("Cannot update booking after it has been accepted/rejected")
      }
    } else if (booking.talentId === userId) {
      // Talents can only update status
      if (
        updateBookingDto.status &&
        ["accepted", "rejected", "in_progress", "completed"].includes(updateBookingDto.status)
      ) {
        booking.status = updateBookingDto.status
      } else {
        ErrorHandler.badRequest("Talents can only update booking status")
      }
    }

    Object.assign(booking, updateBookingDto)
    return this.bookingRepository.save(booking)
  }

  async remove(id: string, userId: string): Promise<void> {
    const booking = await this.findOne(id, userId)

    // Using AuthorizationHelper for ownership check
    AuthorizationHelper.verifyOwnership(booking.clientId, userId, "Only the client can cancel a booking")

    if (["completed", "cancelled"].includes(booking.status)) {
      ErrorHandler.badRequest("Cannot cancel a completed or already cancelled booking")
    }

    booking.status = "cancelled"
    await this.bookingRepository.save(booking)
  }

  async getMessages(bookingId: string, userId: string, page = 1, limit = 50) {
    const booking = await this.findOne(bookingId, userId)

    // Using PaginationHelper for consistent message pagination
    return PaginationHelper.paginate(
      this.messageRepository,
      {
        where: { bookingId },
        relations: ["sender"],
        order: { createdAt: "ASC" },
      },
      { page, limit },
    )
  }

  async createMessage(
    bookingId: string,
    senderId: string,
    createMessageDto: CreateMessageDto,
  ): Promise<BookingMessage> {
    const booking = await this.findOne(bookingId, senderId)

    const message = this.messageRepository.create({
      bookingId,
      senderId,
      content: createMessageDto.message,
    })

    return this.messageRepository.save(message)
  }

  async markMessagesAsRead(bookingId: string, userId: string): Promise<void> {
    const booking = await this.findOne(bookingId, userId)

    await this.messageRepository
      .createQueryBuilder()
      .update(BookingMessage)
      .set({ isRead: true })
      .where("bookingId = :bookingId", { bookingId })
      .andWhere("senderId != :userId", { userId })
      .andWhere("isRead = :isRead", { isRead: false })
      .execute()
  }

  async getBookingStats(userId: string, role: string) {
    const baseWhere = "(booking.clientId = :userId OR booking.talentId = :userId)"

    const total = await this.bookingRepository
      .createQueryBuilder("booking")
      .where(baseWhere, { userId })
      .getCount()

    const pending = await this.bookingRepository
      .createQueryBuilder("booking")
      .where(baseWhere, { userId })
      .andWhere("booking.status = :status", { status: "pending" })
      .getCount()

    const active = await this.bookingRepository
      .createQueryBuilder("booking")
      .where(baseWhere, { userId })
      .andWhere("booking.status IN (:...statuses)", { statuses: ["accepted", "in_progress"] })
      .getCount()

    const completed = await this.bookingRepository
      .createQueryBuilder("booking")
      .where(baseWhere, { userId })
      .andWhere("booking.status = :status", { status: "completed" })
      .getCount()

    return {
      total,
      pending,
      active,
      completed,
    }
  }
}

