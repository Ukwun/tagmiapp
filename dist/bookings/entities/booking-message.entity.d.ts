import { User } from "../../users/entities/user.entity";
import { Booking } from "./booking.entity";
export declare class BookingMessage {
    id: string;
    bookingId: string;
    senderId: string;
    content: string;
    isRead: boolean;
    createdAt: Date;
    booking: Booking;
    sender: User;
}
