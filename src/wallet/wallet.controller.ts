import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common"
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { WalletService } from "./wallet.service"
import { WithdrawDto } from "./dto/withdraw.dto"

@ApiTags("wallet")
@Controller("wallet")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getWallet(@Request() req) {
    return this.walletService.getWallet(req.user.id)
  }

  @Get("transactions")
  async getTransactions(
    @Request() req,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.walletService.getTransactionHistory(
      req.user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    )
  }

  @Post("withdraw")
  async requestWithdrawal(@Request() req, @Body() dto: WithdrawDto) {
    return this.walletService.requestWithdrawal(req.user.id, dto.amount)
  }

  @Get("withdrawals")
  async getMyWithdrawals(
    @Request() req,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.walletService.getUserWithdrawals(
      req.user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    )
  }
}
