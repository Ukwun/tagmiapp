import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { AdminGuard } from "../../auth/guards/admin.guard"
import { WalletService } from "../../wallet/wallet.service"
import { ProcessWithdrawalDto } from "../../wallet/dto/process-withdrawal.dto"

@ApiTags("Admin - Wallets")
@Controller("admin/wallets")
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminWalletsController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({ summary: "Get all wallets (paginated)" })
  async getAllWallets(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.walletService.getAllWallets(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    )
  }

  @Get("withdrawals")
  @ApiOperation({ summary: "Get pending withdrawals" })
  async getPendingWithdrawals(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.walletService.getPendingWithdrawals(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    )
  }

  @Get(":userId")
  @ApiOperation({ summary: "Get wallet detail for a specific user" })
  async getWalletDetail(@Param("userId") userId: string) {
    return this.walletService.getWallet(userId)
  }

  @Post(":userId/freeze")
  @ApiOperation({ summary: "Freeze a user wallet" })
  async freezeWallet(
    @Param("userId") userId: string,
    @Body() body: { reason: string },
  ) {
    return this.walletService.freezeWallet(userId, body.reason)
  }

  @Post(":userId/unfreeze")
  @ApiOperation({ summary: "Unfreeze a user wallet" })
  async unfreezeWallet(@Param("userId") userId: string) {
    return this.walletService.unfreezeWallet(userId)
  }

  @Post("withdrawals/:id/process")
  @ApiOperation({ summary: "Process a withdrawal (approve/reject)" })
  async processWithdrawal(
    @Param("id") id: string,
    @Request() req,
    @Body() dto: ProcessWithdrawalDto,
  ) {
    return this.walletService.processWithdrawal(id, req.user.id, dto.approve, dto.reason)
  }
}
