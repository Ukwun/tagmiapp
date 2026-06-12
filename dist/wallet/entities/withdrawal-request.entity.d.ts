import { User } from "../../users/entities/user.entity";
export declare enum WithdrawalStatus {
    PENDING = "pending",
    APPROVED = "approved",
    PROCESSING = "processing",
    COMPLETED = "completed",
    REJECTED = "rejected",
    CANCELLED = "cancelled"
}
export declare class WithdrawalRequest {
    id: string;
    userId: string;
    amount: number;
    status: WithdrawalStatus;
    stripePayoutId: string;
    rejectionReason: string;
    adminNotes: string;
    processedBy: string;
    processedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
