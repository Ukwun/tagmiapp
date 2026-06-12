import { WalletService } from "./wallet.service";
import { ProcessWithdrawalDto } from "./dto/process-withdrawal.dto";
export declare class AdminWalletController {
    private readonly walletService;
    constructor(walletService: WalletService);
    getAllWallets(page?: string, limit?: string): Promise<{
        data: import("./entities/wallet.entity").Wallet[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    freezeWallet(userId: string, body: {
        reason: string;
    }): Promise<import("./entities/wallet.entity").Wallet>;
    unfreezeWallet(userId: string): Promise<import("./entities/wallet.entity").Wallet>;
    getPendingWithdrawals(page?: string, limit?: string): Promise<{
        data: import("./entities/withdrawal-request.entity").WithdrawalRequest[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    processWithdrawal(id: string, req: any, dto: ProcessWithdrawalDto): Promise<import("./entities/withdrawal-request.entity").WithdrawalRequest>;
}
