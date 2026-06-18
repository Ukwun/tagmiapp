import { Wallet } from "./entities/wallet.entity";
import { WalletTransaction } from "./entities/wallet-transaction.entity";
import { WithdrawalRequest } from "./entities/withdrawal-request.entity";
import { WalletRepository } from "./repositories/wallet.repository";
import { WalletTransactionRepository } from "./repositories/wallet-transaction.repository";
import { WithdrawalRequestRepository } from "./repositories/withdrawal-request.repository";
export declare class WalletService {
    private walletRepository;
    private transactionRepository;
    private withdrawalRepository;
    constructor(walletRepository: WalletRepository, transactionRepository: WalletTransactionRepository, withdrawalRepository: WithdrawalRequestRepository);
    getOrCreateWallet(userId: string): Promise<Wallet>;
    getWallet(userId: string): Promise<Wallet>;
    creditPending(userId: string, amount: number, referralId: string, ip?: string): Promise<WalletTransaction>;
    approvePending(userId: string, amount: number, referralId: string): Promise<WalletTransaction>;
    moveToWithdrawable(userId: string, amount: number): Promise<void>;
    reverseCredits(userId: string, amount: number, referralId: string, reason: string): Promise<WalletTransaction>;
    requestWithdrawal(userId: string, amount: number): Promise<WithdrawalRequest>;
    processWithdrawal(withdrawalId: string, adminId: string, approve: boolean, reason?: string): Promise<WithdrawalRequest>;
    freezeWallet(userId: string, reason: string): Promise<Wallet>;
    unfreezeWallet(userId: string): Promise<Wallet>;
    getTransactionHistory(userId: string, page?: number, limit?: number): Promise<{
        data: WalletTransaction[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    getAllWallets(page?: number, limit?: number): Promise<{
        data: Wallet[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    getPendingWithdrawals(page?: number, limit?: number): Promise<{
        data: WithdrawalRequest[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    getUserWithdrawals(userId: string, page?: number, limit?: number): Promise<{
        data: WithdrawalRequest[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    holdPayment(senderId: string, receiverId: string, amount: number): Promise<void>;
    releaseEscrow(receiverId: string, amount: number): Promise<void>;
}
