import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Wallet } from "./entities/wallet.entity"
import { WalletTransaction } from "./entities/wallet-transaction.entity"
import { WithdrawalRequest } from "./entities/withdrawal-request.entity"
import { WalletService } from "./wallet.service"
import { WalletController } from "./wallet.controller"
import { WalletRepository } from "./repositories/wallet.repository"
import { WalletTransactionRepository } from "./repositories/wallet-transaction.repository"
import { WithdrawalRequestRepository } from "./repositories/withdrawal-request.repository"

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, WalletTransaction, WithdrawalRequest]),
  ],
  controllers: [WalletController],
  providers: [
    WalletService,
    WalletRepository,
    WalletTransactionRepository,
    WithdrawalRequestRepository,
  ],
  exports: [
    WalletService,
    WalletRepository,
    WalletTransactionRepository,
    WithdrawalRequestRepository,
  ],
})
export class WalletModule {}
