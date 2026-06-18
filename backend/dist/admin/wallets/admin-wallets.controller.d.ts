import { WalletService } from "../../wallet/wallet.service";
import { ProcessWithdrawalDto } from "../../wallet/dto/process-withdrawal.dto";
export declare class AdminWalletsController {
    private readonly walletService;
    constructor(walletService: WalletService);
    getAllWallets(page?: string, limit?: string): Promise<{
        data: import("../../wallet/entities/wallet.entity").Wallet[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    getPendingWithdrawals(page?: string, limit?: string): Promise<{
        data: import("../../wallet/entities/withdrawal-request.entity").WithdrawalRequest[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    getWalletDetail(userId: string): Promise<import("../../wallet/entities/wallet.entity").Wallet>;
    freezeWallet(userId: string, body: {
        reason: string;
    }): Promise<import("../../wallet/entities/wallet.entity").Wallet>;
    unfreezeWallet(userId: string): Promise<import("../../wallet/entities/wallet.entity").Wallet>;
    processWithdrawal(id: string, req: any, dto: ProcessWithdrawalDto): Promise<import("../../wallet/entities/withdrawal-request.entity").WithdrawalRequest>;
}
