import { OnModuleInit } from "@nestjs/common";
import type { CreateBookingDto } from "./dto/create-booking.dto";
import type { UpdateBookingDto } from "./dto/update-booking.dto";
import type { CreateMessageDto } from "./dto/create-message.dto";
import { UserRepositoryHelper } from "../common/repositories/user-repository.helper";
import { BookingRepository } from "./repositories/booking.repository";
import { BookingMessageRepository } from "./repositories/booking-message.repository";
import { Booking } from "./entities/booking.entity";
import { BookingMessage } from "./entities/booking-message.entity";
export declare class BookingsService implements OnModuleInit {
    private bookingRepository;
    private messageRepository;
    private userRepositoryHelper;
    private readonly logger;
    constructor(bookingRepository: BookingRepository, messageRepository: BookingMessageRepository, userRepositoryHelper: UserRepositoryHelper);
    onModuleInit(): Promise<void>;
    create(clientId: string, createBookingDto: CreateBookingDto): Promise<Booking>;
    findAll(userId: string, role: string, page?: any, limit?: any): Promise<import("../common/utils/pagination.util").PaginatedResponse<{
        client: Partial<import("../users/entities/user.entity").User>;
        talent: Partial<import("../users/entities/user.entity").User>;
        id: string;
        clientId: string;
        talentId: string;
        title: string;
        status: "pending" | "accepted" | "rejected" | "in_progress" | "completed" | "cancelled" | "paid";
        description: string;
        bookingType: string;
        location: string;
        price: number;
        finalAmount: number;
        startDate: Date;
        endDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }>>;
    findOne(id: string, userId: string): Promise<Booking>;
    update(id: string, userId: string, updateBookingDto: UpdateBookingDto): Promise<Booking>;
    remove(id: string, userId: string): Promise<void>;
    getMessages(bookingId: string, userId: string, page?: number, limit?: number): Promise<import("../common/utils/pagination.util").PaginatedResponse<unknown>>;
    createMessage(bookingId: string, senderId: string, createMessageDto: CreateMessageDto): Promise<BookingMessage>;
    markMessagesAsRead(bookingId: string, userId: string): Promise<void>;
    getBookingStats(userId: string, role: string): Promise<{
        total: number;
        pending: number;
        active: number;
        completed: number;
    }>;
}
