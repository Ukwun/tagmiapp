import { Wallet } from "./wallet.entity";
export declare enum TransactionType {
    REFERRAL_PENDING = "referral_pending",
    REFERRAL_APPROVED = "referral_approved",
    REFERRAL_REJECTED = "referral_rejected",
    WITHDRAWAL_REQUEST = "withdrawal_request",
    WITHDRAWAL_COMPLETED = "withdrawal_completed",
    WITHDRAWAL_CANCELLED = "withdrawal_cancelled",
    FRAUD_FREEZE = "fraud_freeze",
    FRAUD_REVERSAL = "fraud_reversal",
    ADMIN_ADJUSTMENT = "admin_adjustment"
}
export declare class WalletTransaction {
    id: string;
    walletId: string;
    type: TransactionType;
    amount: number;
    balanceAfter: number;
    description: string;
    referralId: string;
    ip: string;
    metadata: Record<string, any>;
    createdAt: Date;
    wallet: Wallet;
}
