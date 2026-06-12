import { User } from "../../users/entities/user.entity";
export declare class Booking {
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
    client: User;
    talent: User;
}
