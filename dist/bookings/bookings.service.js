"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BookingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const user_repository_helper_1 = require("../common/repositories/user-repository.helper");
const pagination_util_1 = require("../common/utils/pagination.util");
const user_transformer_1 = require("../common/transformers/user.transformer");
const authorization_helper_1 = require("../common/guards/authorization.helper");
const error_handler_1 = require("../common/exceptions/error.handler");
const booking_repository_1 = require("./repositories/booking.repository");
const booking_message_repository_1 = require("./repositories/booking-message.repository");
const booking_message_entity_1 = require("./entities/booking-message.entity");
let BookingsService = BookingsService_1 = class BookingsService {
    constructor(bookingRepository, messageRepository, userRepositoryHelper) {
        this.bookingRepository = bookingRepository;
        this.messageRepository = messageRepository;
        this.userRepositoryHelper = userRepositoryHelper;
        this.logger = new common_1.Logger(BookingsService_1.name);
    }
    async onModuleInit() {
        try {
            const ds = this.bookingRepository.manager.connection;
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
      `);
            this.logger.log("Booking status enum verified");
        }
        catch (error) {
            this.logger.warn(`Could not update booking status enum: ${error.message}`);
        }
    }
    async create(clientId, createBookingDto) {
        const client = await this.userRepositoryHelper.findByIdOrFail(clientId);
        const talent = await this.userRepositoryHelper.findByIdOrFail(createBookingDto.talentId);
        const booking = this.bookingRepository.create({
            clientId,
            talentId: createBookingDto.talentId,
            title: createBookingDto.title,
            description: createBookingDto.description,
            price: createBookingDto.budget,
            startDate: createBookingDto.startDate,
            endDate: createBookingDto.endDate,
            status: "pending",
        });
        return this.bookingRepository.save(booking);
    }
    async findAll(userId, role, page = 1, limit = 20) {
        const { page: normalizedPage, limit: normalizedLimit } = pagination_util_1.PaginationHelper.normalizeParams({ page, limit });
        const queryBuilder = this.bookingRepository
            .createQueryBuilder("booking")
            .leftJoinAndSelect("booking.client", "client")
            .leftJoinAndSelect("booking.talent", "talent")
            .where("booking.clientId = :userId OR booking.talentId = :userId", { userId })
            .orderBy("booking.createdAt", "DESC");
        pagination_util_1.PaginationHelper.applyToQueryBuilder(queryBuilder, normalizedPage, normalizedLimit);
        const [data, total] = await queryBuilder.getManyAndCount();
        const sanitizedData = data.map((booking) => ({
            ...booking,
            client: user_transformer_1.UserTransformer.sanitize(booking.client),
            talent: user_transformer_1.UserTransformer.sanitize(booking.talent),
        }));
        return pagination_util_1.PaginationHelper.buildResponse(sanitizedData, total, normalizedPage, normalizedLimit);
    }
    async findOne(id, userId) {
        const booking = await this.bookingRepository.findOne({
            where: { id },
            relations: ["client", "talent"],
        });
        if (!booking) {
            error_handler_1.ErrorHandler.notFound("Booking", id);
        }
        authorization_helper_1.AuthorizationHelper.verifyOwnershipMultiple([booking.clientId, booking.talentId], userId, "You can only view your own bookings");
        return {
            ...booking,
            client: user_transformer_1.UserTransformer.sanitize(booking.client),
            talent: user_transformer_1.UserTransformer.sanitize(booking.talent),
        };
    }
    async update(id, userId, updateBookingDto) {
        const booking = await this.findOne(id, userId);
        if (booking.clientId === userId) {
            if (booking.status !== "pending") {
                error_handler_1.ErrorHandler.badRequest("Cannot update booking after it has been accepted/rejected");
            }
        }
        else if (booking.talentId === userId) {
            if (updateBookingDto.status &&
                ["accepted", "rejected", "in_progress", "completed"].includes(updateBookingDto.status)) {
                booking.status = updateBookingDto.status;
            }
            else {
                error_handler_1.ErrorHandler.badRequest("Talents can only update booking status");
            }
        }
        Object.assign(booking, updateBookingDto);
        return this.bookingRepository.save(booking);
    }
    async remove(id, userId) {
        const booking = await this.findOne(id, userId);
        authorization_helper_1.AuthorizationHelper.verifyOwnership(booking.clientId, userId, "Only the client can cancel a booking");
        if (["completed", "cancelled"].includes(booking.status)) {
            error_handler_1.ErrorHandler.badRequest("Cannot cancel a completed or already cancelled booking");
        }
        booking.status = "cancelled";
        await this.bookingRepository.save(booking);
    }
    async getMessages(bookingId, userId, page = 1, limit = 50) {
        const booking = await this.findOne(bookingId, userId);
        return pagination_util_1.PaginationHelper.paginate(this.messageRepository, {
            where: { bookingId },
            relations: ["sender"],
            order: { createdAt: "ASC" },
        }, { page, limit });
    }
    async createMessage(bookingId, senderId, createMessageDto) {
        const booking = await this.findOne(bookingId, senderId);
        const message = this.messageRepository.create({
            bookingId,
            senderId,
            content: createMessageDto.message,
        });
        return this.messageRepository.save(message);
    }
    async markMessagesAsRead(bookingId, userId) {
        const booking = await this.findOne(bookingId, userId);
        await this.messageRepository
            .createQueryBuilder()
            .update(booking_message_entity_1.BookingMessage)
            .set({ isRead: true })
            .where("bookingId = :bookingId", { bookingId })
            .andWhere("senderId != :userId", { userId })
            .andWhere("isRead = :isRead", { isRead: false })
            .execute();
    }
    async getBookingStats(userId, role) {
        const baseWhere = "(booking.clientId = :userId OR booking.talentId = :userId)";
        const total = await this.bookingRepository
            .createQueryBuilder("booking")
            .where(baseWhere, { userId })
            .getCount();
        const pending = await this.bookingRepository
            .createQueryBuilder("booking")
            .where(baseWhere, { userId })
            .andWhere("booking.status = :status", { status: "pending" })
            .getCount();
        const active = await this.bookingRepository
            .createQueryBuilder("booking")
            .where(baseWhere, { userId })
            .andWhere("booking.status IN (:...statuses)", { statuses: ["accepted", "in_progress"] })
            .getCount();
        const completed = await this.bookingRepository
            .createQueryBuilder("booking")
            .where(baseWhere, { userId })
            .andWhere("booking.status = :status", { status: "completed" })
            .getCount();
        return {
            total,
            pending,
            active,
            completed,
        };
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = BookingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [booking_repository_1.BookingRepository,
        booking_message_repository_1.BookingMessageRepository,
        user_repository_helper_1.UserRepositoryHelper])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map