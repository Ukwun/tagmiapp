"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const wallet_transaction_entity_1 = require("./entities/wallet-transaction.entity");
const withdrawal_request_entity_1 = require("./entities/withdrawal-request.entity");
const wallet_repository_1 = require("./repositories/wallet.repository");
const wallet_transaction_repository_1 = require("./repositories/wallet-transaction.repository");
const withdrawal_request_repository_1 = require("./repositories/withdrawal-request.repository");
let WalletService = class WalletService {
    constructor(walletRepository, transactionRepository, withdrawalRepository) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.withdrawalRepository = withdrawalRepository;
    }
    async getOrCreateWallet(userId) {
        let wallet = await this.walletRepository.findOne({ where: { userId } });
        if (!wallet) {
            wallet = this.walletRepository.create({ userId });
            wallet = await this.walletRepository.save(wallet);
        }
        return wallet;
    }
    async getWallet(userId) {
        return this.getOrCreateWallet(userId);
    }
    async creditPending(userId, amount, referralId, ip) {
        const wallet = await this.getOrCreateWallet(userId);
        if (wallet.isFrozen) {
            throw new common_1.BadRequestException("Wallet is frozen");
        }
        wallet.pendingBalance = Number(wallet.pendingBalance) + amount;
        wallet.totalEarned = Number(wallet.totalEarned) + amount;
        await this.walletRepository.save(wallet);
        const transaction = this.transactionRepository.create({
            walletId: wallet.id,
            type: wallet_transaction_entity_1.TransactionType.REFERRAL_PENDING,
            amount,
            balanceAfter: wallet.pendingBalance,
            description: `Referral reward pending validation`,
            referralId,
            ip,
        });
        return this.transactionRepository.save(transaction);
    }
    async approvePending(userId, amount, referralId) {
        const wallet = await this.getOrCreateWallet(userId);
        wallet.pendingBalance = Number(wallet.pendingBalance) - amount;
        wallet.approvedBalance = Number(wallet.approvedBalance) + amount;
        await this.walletRepository.save(wallet);
        const transaction = this.transactionRepository.create({
            walletId: wallet.id,
            type: wallet_transaction_entity_1.TransactionType.REFERRAL_APPROVED,
            amount,
            balanceAfter: wallet.approvedBalance,
            description: `Referral reward approved`,
            referralId,
        });
        return this.transactionRepository.save(transaction);
    }
    async moveToWithdrawable(userId, amount) {
        const wallet = await this.getOrCreateWallet(userId);
        wallet.approvedBalance = Number(wallet.approvedBalance) - amount;
        wallet.withdrawableBalance = Number(wallet.withdrawableBalance) + amount;
        await this.walletRepository.save(wallet);
    }
    async reverseCredits(userId, amount, referralId, reason) {
        const wallet = await this.getOrCreateWallet(userId);
        wallet.pendingBalance = Math.max(0, Number(wallet.pendingBalance) - amount);
        wallet.totalEarned = Math.max(0, Number(wallet.totalEarned) - amount);
        await this.walletRepository.save(wallet);
        const transaction = this.transactionRepository.create({
            walletId: wallet.id,
            type: wallet_transaction_entity_1.TransactionType.REFERRAL_REJECTED,
            amount: -amount,
            balanceAfter: wallet.pendingBalance,
            description: reason,
            referralId,
        });
        return this.transactionRepository.save(transaction);
    }
    async requestWithdrawal(userId, amount) {
        const wallet = await this.getOrCreateWallet(userId);
        if (wallet.isFrozen) {
            throw new common_1.BadRequestException("Wallet is frozen");
        }
        if (Number(wallet.withdrawableBalance) < amount) {
            throw new common_1.BadRequestException("Insufficient withdrawable balance");
        }
        wallet.withdrawableBalance = Number(wallet.withdrawableBalance) - amount;
        await this.walletRepository.save(wallet);
        const transaction = this.transactionRepository.create({
            walletId: wallet.id,
            type: wallet_transaction_entity_1.TransactionType.WITHDRAWAL_REQUEST,
            amount: -amount,
            balanceAfter: wallet.withdrawableBalance,
            description: `Withdrawal request for ${amount} credits`,
        });
        await this.transactionRepository.save(transaction);
        const withdrawal = this.withdrawalRepository.create({
            userId,
            amount,
            status: withdrawal_request_entity_1.WithdrawalStatus.PENDING,
        });
        return this.withdrawalRepository.save(withdrawal);
    }
    async processWithdrawal(withdrawalId, adminId, approve, reason) {
        const withdrawal = await this.withdrawalRepository.findOne({ where: { id: withdrawalId } });
        if (!withdrawal) {
            throw new common_1.BadRequestException("Withdrawal not found");
        }
        if (withdrawal.status !== withdrawal_request_entity_1.WithdrawalStatus.PENDING) {
            throw new common_1.BadRequestException("Withdrawal is not in pending state");
        }
        const wallet = await this.getOrCreateWallet(withdrawal.userId);
        if (approve) {
            withdrawal.status = withdrawal_request_entity_1.WithdrawalStatus.APPROVED;
            withdrawal.processedBy = adminId;
            withdrawal.processedAt = new Date();
            const transaction = this.transactionRepository.create({
                walletId: wallet.id,
                type: wallet_transaction_entity_1.TransactionType.WITHDRAWAL_COMPLETED,
                amount: -Number(withdrawal.amount),
                balanceAfter: wallet.withdrawableBalance,
                description: `Withdrawal approved`,
            });
            await this.transactionRepository.save(transaction);
            wallet.totalWithdrawn = Number(wallet.totalWithdrawn) + Number(withdrawal.amount);
            await this.walletRepository.save(wallet);
        }
        else {
            withdrawal.status = withdrawal_request_entity_1.WithdrawalStatus.REJECTED;
            withdrawal.rejectionReason = reason;
            withdrawal.processedBy = adminId;
            withdrawal.processedAt = new Date();
            wallet.withdrawableBalance = Number(wallet.withdrawableBalance) + Number(withdrawal.amount);
            await this.walletRepository.save(wallet);
            const transaction = this.transactionRepository.create({
                walletId: wallet.id,
                type: wallet_transaction_entity_1.TransactionType.WITHDRAWAL_CANCELLED,
                amount: Number(withdrawal.amount),
                balanceAfter: wallet.withdrawableBalance,
                description: `Withdrawal rejected: ${reason || "No reason provided"}`,
            });
            await this.transactionRepository.save(transaction);
        }
        return this.withdrawalRepository.save(withdrawal);
    }
    async freezeWallet(userId, reason) {
        const wallet = await this.getOrCreateWallet(userId);
        wallet.isFrozen = true;
        wallet.freezeReason = reason;
        const transaction = this.transactionRepository.create({
            walletId: wallet.id,
            type: wallet_transaction_entity_1.TransactionType.FRAUD_FREEZE,
            amount: 0,
            balanceAfter: wallet.pendingBalance,
            description: `Wallet frozen: ${reason}`,
        });
        await this.transactionRepository.save(transaction);
        return this.walletRepository.save(wallet);
    }
    async unfreezeWallet(userId) {
        const wallet = await this.getOrCreateWallet(userId);
        wallet.isFrozen = false;
        wallet.freezeReason = null;
        return this.walletRepository.save(wallet);
    }
    async getTransactionHistory(userId, page = 1, limit = 20) {
        const wallet = await this.getOrCreateWallet(userId);
        const [transactions, total] = await this.transactionRepository.findAndCount({
            where: { walletId: wallet.id },
            order: { createdAt: "DESC" },
            take: limit,
            skip: (page - 1) * limit,
        });
        return {
            data: transactions,
            total,
            page,
            limit,
            hasNext: page * limit < total,
            hasPrev: page > 1,
        };
    }
    async getAllWallets(page = 1, limit = 20) {
        const [wallets, total] = await this.walletRepository.findAndCount({
            relations: ["user"],
            order: { updatedAt: "DESC" },
            take: limit,
            skip: (page - 1) * limit,
        });
        return { data: wallets, total, page, limit, hasNext: page * limit < total, hasPrev: page > 1 };
    }
    async getPendingWithdrawals(page = 1, limit = 20) {
        const [withdrawals, total] = await this.withdrawalRepository.findAndCount({
            where: { status: withdrawal_request_entity_1.WithdrawalStatus.PENDING },
            relations: ["user"],
            order: { createdAt: "ASC" },
            take: limit,
            skip: (page - 1) * limit,
        });
        return { data: withdrawals, total, page, limit, hasNext: page * limit < total, hasPrev: page > 1 };
    }
    async getUserWithdrawals(userId, page = 1, limit = 20) {
        const [withdrawals, total] = await this.withdrawalRepository.findAndCount({
            where: { userId },
            order: { createdAt: "DESC" },
            take: limit,
            skip: (page - 1) * limit,
        });
        return { data: withdrawals, total, page, limit, hasNext: page * limit < total, hasPrev: page > 1 };
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [wallet_repository_1.WalletRepository,
        wallet_transaction_repository_1.WalletTransactionRepository,
        withdrawal_request_repository_1.WithdrawalRequestRepository])
], WalletService);
//# sourceMappingURL=wallet.service.js.map