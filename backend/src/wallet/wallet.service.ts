import { Injectable, BadRequestException } from "@nestjs/common"
import { ERROR_MESSAGES } from "../common/constants/error-messages.constant"
import { Wallet } from "./entities/wallet.entity"
import { WalletTransaction, TransactionType } from "./entities/wallet-transaction.entity"
import { WithdrawalRequest, WithdrawalStatus } from "./entities/withdrawal-request.entity"
import { WalletRepository } from "./repositories/wallet.repository"
import { WalletTransactionRepository } from "./repositories/wallet-transaction.repository"
import { WithdrawalRequestRepository } from "./repositories/withdrawal-request.repository"

@Injectable()
export class WalletService {
  constructor(
    private walletRepository: WalletRepository,
    private transactionRepository: WalletTransactionRepository,
    private withdrawalRepository: WithdrawalRequestRepository,
  ) {}

  async getOrCreateWallet(userId: string): Promise<Wallet> {
    let wallet = await this.walletRepository.findOne({ where: { userId } })
    if (!wallet) {
      wallet = this.walletRepository.create({ userId })
      wallet = await this.walletRepository.save(wallet)
    }
    return wallet
  }

  async getWallet(userId: string): Promise<Wallet> {
    return this.getOrCreateWallet(userId)
  }

  async creditPending(userId: string, amount: number, referralId: string, ip?: string): Promise<WalletTransaction> {
    const wallet = await this.getOrCreateWallet(userId)

    if (wallet.isFrozen) {
      throw new BadRequestException("Wallet is frozen")
    }

    wallet.pendingBalance = Number(wallet.pendingBalance) + amount
    wallet.totalEarned = Number(wallet.totalEarned) + amount
    await this.walletRepository.save(wallet)

    const transaction = this.transactionRepository.create({
      walletId: wallet.id,
      type: TransactionType.REFERRAL_PENDING,
      amount,
      balanceAfter: wallet.pendingBalance,
      description: `Referral reward pending validation`,
      referralId,
      ip,
    })
    return this.transactionRepository.save(transaction)
  }

  async approvePending(userId: string, amount: number, referralId: string): Promise<WalletTransaction> {
    const wallet = await this.getOrCreateWallet(userId)

    wallet.pendingBalance = Number(wallet.pendingBalance) - amount
    wallet.approvedBalance = Number(wallet.approvedBalance) + amount
    await this.walletRepository.save(wallet)

    const transaction = this.transactionRepository.create({
      walletId: wallet.id,
      type: TransactionType.REFERRAL_APPROVED,
      amount,
      balanceAfter: wallet.approvedBalance,
      description: `Referral reward approved`,
      referralId,
    })
    return this.transactionRepository.save(transaction)
  }

  async moveToWithdrawable(userId: string, amount: number): Promise<void> {
    const wallet = await this.getOrCreateWallet(userId)

    wallet.approvedBalance = Number(wallet.approvedBalance) - amount
    wallet.withdrawableBalance = Number(wallet.withdrawableBalance) + amount
    await this.walletRepository.save(wallet)
  }

  async reverseCredits(userId: string, amount: number, referralId: string, reason: string): Promise<WalletTransaction> {
    const wallet = await this.getOrCreateWallet(userId)

    wallet.pendingBalance = Math.max(0, Number(wallet.pendingBalance) - amount)
    wallet.totalEarned = Math.max(0, Number(wallet.totalEarned) - amount)
    await this.walletRepository.save(wallet)

    const transaction = this.transactionRepository.create({
      walletId: wallet.id,
      type: TransactionType.REFERRAL_REJECTED,
      amount: -amount,
      balanceAfter: wallet.pendingBalance,
      description: reason,
      referralId,
    })
    return this.transactionRepository.save(transaction)
  }

  async requestWithdrawal(userId: string, amount: number): Promise<WithdrawalRequest> {
    const wallet = await this.getOrCreateWallet(userId)

    if (wallet.isFrozen) {
      throw new BadRequestException("Wallet is frozen")
    }

    if (Number(wallet.withdrawableBalance) < amount) {
      throw new BadRequestException("Insufficient withdrawable balance")
    }

    wallet.withdrawableBalance = Number(wallet.withdrawableBalance) - amount
    await this.walletRepository.save(wallet)

    const transaction = this.transactionRepository.create({
      walletId: wallet.id,
      type: TransactionType.WITHDRAWAL_REQUEST,
      amount: -amount,
      balanceAfter: wallet.withdrawableBalance,
      description: `Withdrawal request for ${amount} credits`,
    })
    await this.transactionRepository.save(transaction)

    const withdrawal = this.withdrawalRepository.create({
      userId,
      amount,
      status: WithdrawalStatus.PENDING,
    })
    return this.withdrawalRepository.save(withdrawal)
  }

  async processWithdrawal(
    withdrawalId: string,
    adminId: string,
    approve: boolean,
    reason?: string,
  ): Promise<WithdrawalRequest> {
    const withdrawal = await this.withdrawalRepository.findOne({ where: { id: withdrawalId } })
    if (!withdrawal) {
      throw new BadRequestException("Withdrawal not found")
    }

    if (withdrawal.status !== WithdrawalStatus.PENDING) {
      throw new BadRequestException("Withdrawal is not in pending state")
    }

    const wallet = await this.getOrCreateWallet(withdrawal.userId)

    if (approve) {
      withdrawal.status = WithdrawalStatus.APPROVED
      withdrawal.processedBy = adminId
      withdrawal.processedAt = new Date()

      const transaction = this.transactionRepository.create({
        walletId: wallet.id,
        type: TransactionType.WITHDRAWAL_COMPLETED,
        amount: -Number(withdrawal.amount),
        balanceAfter: wallet.withdrawableBalance,
        description: `Withdrawal approved`,
      })
      await this.transactionRepository.save(transaction)

      wallet.totalWithdrawn = Number(wallet.totalWithdrawn) + Number(withdrawal.amount)
      await this.walletRepository.save(wallet)
    } else {
      withdrawal.status = WithdrawalStatus.REJECTED
      withdrawal.rejectionReason = reason
      withdrawal.processedBy = adminId
      withdrawal.processedAt = new Date()

      // Return funds to withdrawable balance
      wallet.withdrawableBalance = Number(wallet.withdrawableBalance) + Number(withdrawal.amount)
      await this.walletRepository.save(wallet)

      const transaction = this.transactionRepository.create({
        walletId: wallet.id,
        type: TransactionType.WITHDRAWAL_CANCELLED,
        amount: Number(withdrawal.amount),
        balanceAfter: wallet.withdrawableBalance,
        description: `Withdrawal rejected: ${reason || "No reason provided"}`,
      })
      await this.transactionRepository.save(transaction)
    }

    return this.withdrawalRepository.save(withdrawal)
  }

  async freezeWallet(userId: string, reason: string): Promise<Wallet> {
    const wallet = await this.getOrCreateWallet(userId)
    wallet.isFrozen = true
    wallet.freezeReason = reason

    const transaction = this.transactionRepository.create({
      walletId: wallet.id,
      type: TransactionType.FRAUD_FREEZE,
      amount: 0,
      balanceAfter: wallet.pendingBalance,
      description: `Wallet frozen: ${reason}`,
    })
    await this.transactionRepository.save(transaction)

    return this.walletRepository.save(wallet)
  }

  async unfreezeWallet(userId: string): Promise<Wallet> {
    const wallet = await this.getOrCreateWallet(userId)
    wallet.isFrozen = false
    wallet.freezeReason = null
    return this.walletRepository.save(wallet)
  }

  async getTransactionHistory(userId: string, page = 1, limit = 20) {
    const wallet = await this.getOrCreateWallet(userId)

    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: { walletId: wallet.id },
      order: { createdAt: "DESC" },
      take: limit,
      skip: (page - 1) * limit,
    })

    return {
      data: transactions,
      total,
      page,
      limit,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    }
  }

  // Admin methods
  async getAllWallets(page = 1, limit = 20) {
    const [wallets, total] = await this.walletRepository.findAndCount({
      relations: ["user"],
      order: { updatedAt: "DESC" },
      take: limit,
      skip: (page - 1) * limit,
    })

    return { data: wallets, total, page, limit, hasNext: page * limit < total, hasPrev: page > 1 }
  }

  async getPendingWithdrawals(page = 1, limit = 20) {
    const [withdrawals, total] = await this.withdrawalRepository.findAndCount({
      where: { status: WithdrawalStatus.PENDING },
      relations: ["user"],
      order: { createdAt: "ASC" },
      take: limit,
      skip: (page - 1) * limit,
    })

    return { data: withdrawals, total, page, limit, hasNext: page * limit < total, hasPrev: page > 1 }
  }

  async getUserWithdrawals(userId: string, page = 1, limit = 20) {
    const [withdrawals, total] = await this.withdrawalRepository.findAndCount({
      where: { userId },
      order: { createdAt: "DESC" },
      take: limit,
      skip: (page - 1) * limit,
    })

    return { data: withdrawals, total, page, limit, hasNext: page * limit < total, hasPrev: page > 1 }
  }

  /**
   * Implements the "Pay-on-Success" Escrow logic.
   * Deducts from sender's withdrawable and holds in receiver's 'pendingBalance'.
   * This protects both the talent and the user in real-time bookings.
   */
  async holdPayment(senderId: string, receiverId: string, amount: number): Promise<void> {
    const senderWallet = await this.getOrCreateWallet(senderId);
    if (senderWallet.isFrozen) throw new BadRequestException(ERROR_MESSAGES.WALLET_FROZEN);
    
    if (Number(senderWallet.withdrawableBalance) < amount) {
      throw new BadRequestException(ERROR_MESSAGES.INSUFFICIENT_BALANCE);
    }

    const receiverWallet = await this.getOrCreateWallet(receiverId);

    senderWallet.withdrawableBalance = Number(senderWallet.withdrawableBalance) - amount;
    receiverWallet.pendingBalance = Number(receiverWallet.pendingBalance) + amount;

    await this.walletRepository.save(senderWallet);
    await this.walletRepository.save(receiverWallet);
  }

  /**
   * Finalizes the booking: moves funds from 'pending' to 'withdrawable'.
   */
  async releaseEscrow(receiverId: string, amount: number): Promise<void> {
    const wallet = await this.getOrCreateWallet(receiverId);
    
    if (Number(wallet.pendingBalance) < amount) {
      throw new BadRequestException(ERROR_MESSAGES.WITHDRAWAL_FAILED);
    }

    wallet.pendingBalance = Number(wallet.pendingBalance) - amount;
    wallet.withdrawableBalance = Number(wallet.withdrawableBalance) + amount;

    await this.walletRepository.save(wallet);
  }
}
