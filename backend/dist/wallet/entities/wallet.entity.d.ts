import { User } from "../../users/entities/user.entity";
import { WalletTransaction } from "./wallet-transaction.entity";
export declare class Wallet {
    id: string;
    userId: string;
    pendingBalance: number;
    approvedBalance: number;
    withdrawableBalance: number;
    totalEarned: number;
    totalWithdrawn: number;
    isFrozen: boolean;
    freezeReason: string;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    transactions: WalletTransaction[];
}
