import { BookingsService } from "./bookings.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { UpdateBookingDto } from "./dto/update-booking.dto";
import { CreateMessageDto } from "./dto/create-message.dto";
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(req: any, createBookingDto: CreateBookingDto): Promise<import("./entities/booking.entity").Booking>;
    findAll(req: any, page?: number, limit?: number): Promise<import("../common/utils").PaginatedResponse<{
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
    getStats(req: any): Promise<{
        total: number;
        pending: number;
        active: number;
        completed: number;
    }>;
    findOne(id: string, req: any): Promise<import("./entities/booking.entity").Booking>;
    update(id: string, req: any, updateBookingDto: UpdateBookingDto): Promise<import("./entities/booking.entity").Booking>;
    remove(id: string, req: any): Promise<void>;
    getMessages(id: string, req: any, page?: number, limit?: number): Promise<import("../common/utils").PaginatedResponse<unknown>>;
    createMessage(id: string, req: any, createMessageDto: CreateMessageDto): Promise<import("./entities/booking-message.entity").BookingMessage>;
    markMessagesAsRead(id: string, req: any): Promise<void>;
}
