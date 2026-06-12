import { User } from "./user.entity";
export declare class Booking {
    id: string;
    clientId: string;
    talentId: string;
    title: string;
    status: "pending" | "confirmed" | "completed" | "cancelled" | "accepted" | "rejected" | "in_progress";
    description: string;
    price: number;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
    client: User;
    talent: User;
}
