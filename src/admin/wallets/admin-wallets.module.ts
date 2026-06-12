import { Module } from "@nestjs/common"
import { WalletModule } from "../../wallet/wallet.module"
import { AdminWalletsController } from "./admin-wallets.controller"

@Module({
  imports: [WalletModule],
  controllers: [AdminWalletsController],
})
export class AdminWalletsModule {}
