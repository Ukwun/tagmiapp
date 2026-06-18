import { WalletService } from "./wallet.service";
import { WithdrawDto } from "./dto/withdraw.dto";
export declare class WalletController {
    private readonly walletService;
    constructor(walletService: WalletService);
    getWallet(req: any): Promise<import("./entities/wallet.entity").Wallet>;
    getTransactions(req: any, page?: string, limit?: string): Promise<{
        data: import("./entities/wallet-transaction.entity").WalletTransaction[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    requestWithdrawal(req: any, dto: WithdrawDto): Promise<import("./entities/withdrawal-request.entity").WithdrawalRequest>;
    getMyWithdrawals(req: any, page?: string, limit?: string): Promise<{
        data: import("./entities/withdrawal-request.entity").WithdrawalRequest[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
}
