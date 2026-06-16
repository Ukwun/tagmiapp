/**
 * WalletService Test Suite
 *
 * Tests wallet operations, transactions, and withdrawal processing.
 */
import { Test, TestingModule } from "@nestjs/testing"
import { BadRequestException } from "@nestjs/common"
import { WalletService } from "./wallet.service"
import { WalletRepository } from "./repositories/wallet.repository"
import { WalletTransactionRepository } from "./repositories/wallet-transaction.repository"
import { WithdrawalRequestRepository } from "./repositories/withdrawal-request.repository"
import { TransactionType } from "./entities/wallet-transaction.entity"
import { WithdrawalStatus } from "./entities/withdrawal-request.entity"

describe("WalletService", () => {
  let service: WalletService
  let walletRepository: any
  let transactionRepository: any
  let withdrawalRepository: any

  const mockWallet = {
    id: "wallet-123",
    userId: "user-123",
    pendingBalance: 0,
    approvedBalance: 100,
    withdrawableBalance: 50,
    totalEarned: 150,
    totalWithdrawn: 0,
    isFrozen: false,
    freezeReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockTransaction = {
    id: "txn-123",
    walletId: "wallet-123",
    type: TransactionType.REFERRAL_PENDING,
    amount: 10,
    balanceAfter: 10,
    description: "Referral reward pending validation",
    createdAt: new Date(),
  }

  const mockWithdrawal = {
    id: "withdrawal-123",
    userId: "user-123",
    amount: 20,
    status: WithdrawalStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    const mockWalletRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
    }

    const mockTransactionRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
    }

    const mockWithdrawalRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: WalletRepository, useValue: mockWalletRepository },
        { provide: WalletTransactionRepository, useValue: mockTransactionRepository },
        { provide: WithdrawalRequestRepository, useValue: mockWithdrawalRepository },
      ],
    }).compile()

    service = module.get<WalletService>(WalletService)
    walletRepository = module.get(WalletRepository)
    transactionRepository = module.get(WalletTransactionRepository)
    withdrawalRepository = module.get(WithdrawalRequestRepository)

    jest.clearAllMocks()
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("getOrCreateWallet", () => {
    it("should return existing wallet if found", async () => {
      // Arrange
      jest.spyOn(walletRepository, "findOne").mockResolvedValue(mockWallet)

      // Act
      const result = await service.getOrCreateWallet("user-123")

      // Assert
      expect(result).toEqual(mockWallet)
      expect(walletRepository.findOne).toHaveBeenCalledWith({ where: { userId: "user-123" } })
      expect(walletRepository.create).not.toHaveBeenCalled()
    })

    it("should create new wallet if not found", async () => {
      // Arrange
      const newWallet = { ...mockWallet }
      jest.spyOn(walletRepository, "findOne").mockResolvedValue(null)
      jest.spyOn(walletRepository, "create").mockReturnValue(newWallet)
      jest.spyOn(walletRepository, "save").mockResolvedValue(newWallet)

      // Act
      const result = await service.getOrCreateWallet("user-123")

      // Assert
      expect(result).toEqual(newWallet)
      expect(walletRepository.create).toHaveBeenCalledWith({ userId: "user-123" })
      expect(walletRepository.save).toHaveBeenCalledWith(newWallet)
    })
  })

  describe("getWallet", () => {
    it("should return wallet for user", async () => {
      // Arrange
      jest.spyOn(walletRepository, "findOne").mockResolvedValue(mockWallet)

      // Act
      const result = await service.getWallet("user-123")

      // Assert
      expect(result).toEqual(mockWallet)
    })
  })

  describe("creditPending", () => {
    it("should credit pending balance and create transaction", async () => {
      // Arrange
      const wallet = { ...mockWallet, pendingBalance: 0, totalEarned: 0 }
      jest.spyOn(walletRepository, "findOne").mockResolvedValue(wallet)
      jest.spyOn(walletRepository, "save").mockResolvedValue({ ...wallet, pendingBalance: 10, totalEarned: 10 })
      jest.spyOn(transactionRepository, "create").mockReturnValue(mockTransaction)
      jest.spyOn(transactionRepository, "save").mockResolvedValue(mockTransaction)

      // Act
      const result = await service.creditPending("user-123", 10, "ref-123", "192.168.1.1")

      // Assert
      expect(result).toEqual(mockTransaction)
      expect(wallet.pendingBalance).toBe(10)
      expect(wallet.totalEarned).toBe(10)
      expect(walletRepository.save).toHaveBeenCalled()
      expect(transactionRepository.create).toHaveBeenCalledWith({
        walletId: "wallet-123",
        type: TransactionType.REFERRAL_PENDING,
        amount: 10,
        balanceAfter: 10,
        description: "Referral reward pending validation",
        referralId: "ref-123",
        ip: "192.168.1.1",
      })
    })

    it("should throw error if wallet is frozen", async () => {
      // Arrange
      const frozenWallet = { ...mockWallet, isFrozen: true }
      jest.spyOn(walletRepository, "findOne").mockResolvedValue(frozenWallet)

      // Act & Assert
      await expect(service.creditPending("user-123", 10, "ref-123")).rejects.toThrow(BadRequestException)
    })
  })

  describe("approvePending", () => {
    it("should move pending to approved balance", async () => {
      // Arrange
      const wallet = { ...mockWallet, pendingBalance: 20, approvedBalance: 0 }
      jest.spyOn(walletRepository, "findOne").mockResolvedValue(wallet)
      jest.spyOn(walletRepository, "save").mockResolvedValue({ ...wallet, pendingBalance: 10, approvedBalance: 10 })
      jest.spyOn(transactionRepository, "create").mockReturnValue(mockTransaction)
      jest.spyOn(transactionRepository, "save").mockResolvedValue(mockTransaction)

      // Act
      const result = await service.approvePending("user-123", 10, "ref-123")

      // Assert
      expect(result).toEqual(mockTransaction)
      expect(wallet.pendingBalance).toBe(10)
      expect(wallet.approvedBalance).toBe(10)
      expect(transactionRepository.create).toHaveBeenCalledWith({
        walletId: "wallet-123",
        type: TransactionType.REFERRAL_APPROVED,
        amount: 10,
        balanceAfter: 10,
        description: "Referral reward approved",
        referralId: "ref-123",
      })
    })
  })

  describe("moveToWithdrawable", () => {
    it("should move approved to withdrawable balance", async () => {
      // Arrange
      const wallet = { ...mockWallet, approvedBalance: 30, withdrawableBalance: 0 }
      jest.spyOn(walletRepository, "findOne").mockResolvedValue(wallet)
      jest.spyOn(walletRepository, "save").mockResolvedValue({ ...wallet, approvedBalance: 10, withdrawableBalance: 20 })

      // Act
      await service.moveToWithdrawable("user-123", 20)

      // Assert
      expect(wallet.approvedBalance).toBe(10)
      expect(wallet.withdrawableBalance).toBe(20)
      expect(walletRepository.save).toHaveBeenCalled()
    })
  })

  describe("reverseCredits", () => {
    it("should reverse pending balance and create reversal transaction", async () => {
      // Arrange
      const wallet = { ...mockWallet, pendingBalance: 20, totalEarned: 20 }
      jest.spyOn(walletRepository, "findOne").mockResolvedValue(wallet)
      jest.spyOn(walletRepository, "save").mockResolvedValue({ ...wallet, pendingBalance: 10, totalEarned: 10 })
      jest.spyOn(transactionRepository, "create").mockReturnValue(mockTransaction)
      jest.spyOn(transactionRepository, "save").mockResolvedValue(mockTransaction)

      // Act
      const result = await service.reverseCredits("user-123", 10, "ref-123", "Fraudulent activity")

      // Assert
      expect(result).toEqual(mockTransaction)
      expect(wallet.pendingBalance).toBe(10)
      expect(wallet.totalEarned).toBe(10)
      expect(transactionRepository.create).toHaveBeenCalledWith({
        walletId: "wallet-123",
        type: TransactionType.REFERRAL_REJECTED,
        amount: -10,
        balanceAfter: 10,
        description: "Fraudulent activity",
        referralId: "ref-123",
      })
    })

    it("should not allow negative balances", async () => {
      // Arrange
      const wallet = { ...mockWallet, pendingBalance: 5, totalEarned: 5 }
      jest.spyOn(walletRepository, "findOne").mockResolvedValue(wallet)
      jest.spyOn(walletRepository, "save").mockResolvedValue({ ...wallet, pendingBalance: 0, totalEarned: 0 })
      jest.spyOn(transactionRepository, "create").mockReturnValue(mockTransaction)
      jest.spyOn(transactionRepository, "save").mockResolvedValue(mockTransaction)

      // Act
      await service.reverseCredits("user-123", 10, "ref-123", "Test")

      // Assert
      expect(wallet.pendingBalance).toBe(0)
      expect(wallet.totalEarned).toBe(0)
    })
  })

  describe("requestWithdrawal", () => {
    it("should create withdrawal request successfully", async () => {
      // Arrange
      const wallet = { ...mockWallet, withdrawableBalance: 50 }
      jest.spyOn(walletRepository, "findOne").mockResolvedValue(wallet)
      jest.spyOn(walletRepository, "save").mockResolvedValue({ ...wallet, withdrawableBalance: 30 })
      jest.spyOn(transactionRepository, "create").mockReturnValue(mockTransaction)
      jest.spyOn(transactionRepository, "save").mockResolvedValue(mockTransaction)
      jest.spyOn(withdrawalRepository, "create").mockReturnValue(mockWithdrawal)
      jest.spyOn(withdrawalRepository, "save").mockResolvedValue(mockWithdrawal)

      // Act
      const result = await service.requestWithdrawal("user-123", 20)

      // Assert
      expect(result).toEqual(mockWithdrawal)
      expect(wallet.withdrawableBalance).toBe(30)
      expect(withdrawalRepository.create).toHaveBeenCalledWith({
        userId: "user-123",
        amount: 20,
        status: WithdrawalStatus.PENDING,
      })
    })

    it("should throw error if wallet is frozen", async () => {
      // Arrange
      const frozenWallet = { ...mockWallet, isFrozen: true }
      jest.spyOn(walletRepository, "findOne").mockResolvedValue(frozenWallet)

      // Act & Assert
      await expect(service.requestWithdrawal("user-123", 20)).rejects.toThrow(BadRequestException)
    })

    it("should throw error if insufficient balance", async () => {
      // Arrange
      const wallet = { ...mockWallet, withdrawableBalance: 10 }
      jest.spyOn(walletRepository, "findOne").mockResolvedValue(wallet)

      // Act & Assert
      await expect(service.requestWithdrawal("user-123", 20)).rejects.toThrow(BadRequestException)
    })
  })

  describe("processWithdrawal", () => {
    it("should approve withdrawal successfully", async () => {
      // Arrange
      const withdrawal = { ...mockWithdrawal }
      const wallet = { ...mockWallet, totalWithdrawn: 0 }
      jest.spyOn(withdrawalRepository, "findOne").mockResolvedValue(withdrawal)
      jest.spyOn(walletRepository, "findOne").mockResolvedValue(wallet)
      jest.spyOn(walletRepository, "save").mockResolvedValue({ ...wallet, totalWithdrawn: 20 })
      jest.spyOn(transactionRepository, "create").mockReturnValue(mockTransaction)
      jest.spyOn(transactionRepository, "save").mockResolvedValue(mockTransaction)
      jest.spyOn(withdrawalRepository, "save").mockResolvedValue({
        ...withdrawal,
        status: WithdrawalStatus.APPROVED,
        processedBy: "admin-123",
      })

      // Act
      const result = await service.processWithdrawal("withdrawal-123", "admin-123", true)

      // Assert
      expect(result.status).toBe(WithdrawalStatus.APPROVED)
      expect(result.processedBy).toBe("admin-123")
      expect(wallet.totalWithdrawn).toBe(20)
    })

    it("should reject withdrawal and return funds", async () => {
      // Arrange
      const withdrawal = { ...mockWithdrawal }
      const wallet = { ...mockWallet, withdrawableBalance: 50 }
      jest.spyOn(withdrawalRepository, "findOne").mockResolvedValue(withdrawal)
      jest.spyOn(walletRepository, "findOne").mockResolvedValue(wallet)
      jest.spyOn(walletRepository, "save").mockResolvedValue({ ...wallet, withdrawableBalance: 70 })
      jest.spyOn(transactionRepository, "create").mockReturnValue(mockTransaction)
      jest.spyOn(transactionRepository, "save").mockResolvedValue(mockTransaction)
      jest.spyOn(withdrawalRepository, "save").mockResolvedValue({
        ...withdrawal,
        status: WithdrawalStatus.REJECTED,
        rejectionReason: "Invalid request",
      })

      // Act
      const result = await service.processWithdrawal("withdrawal-123", "admin-123", false, "Invalid request")

      // Assert
      expect(result.status).toBe(WithdrawalStatus.REJECTED)
      expect(result.rejectionReason).toBe("Invalid request")
      expect(wallet.withdrawableBalance).toBe(70)
    })

    it("should throw error if withdrawal not found", async () => {
      // Arrange
      jest.spyOn(withdrawalRepository, "findOne").mockResolvedValue(null)

      // Act & Assert
      await expect(service.processWithdrawal("invalid-id", "admin-123", true)).rejects.toThrow(
        BadRequestException,
      )
    })

    it("should throw error if withdrawal not pending", async () => {
      // Arrange
      const completedWithdrawal = { ...mockWithdrawal, status: WithdrawalStatus.APPROVED }
      jest.spyOn(withdrawalRepository, "findOne").mockResolvedValue(completedWithdrawal)

      // Act & Assert
      await expect(service.processWithdrawal("withdrawal-123", "admin-123", true)).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe("freezeWallet", () => {
    it("should freeze wallet and create transaction", async () => {
      // Arrange
      const wallet = { ...mockWallet }
      jest.spyOn(walletRepository, "findOne").mockResolvedValue(wallet)
      jest.spyOn(walletRepository, "save").mockResolvedValue({
        ...wallet,
        isFrozen: true,
        freezeReason: "Suspicious activity",
      })
      jest.spyOn(transactionRepository, "create").mockReturnValue(mockTransaction)
      jest.spyOn(transactionRepository, "save").mockResolvedValue(mockTransaction)

      // Act
      const result = await service.freezeWallet("user-123", "Suspicious activity")

      // Assert
      expect(result.isFrozen).toBe(true)
      expect(result.freezeReason).toBe("Suspicious activity")
      expect(transactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: TransactionType.FRAUD_FREEZE,
          description: "Wallet frozen: Suspicious activity",
        }),
      )
    })
  })

  describe("unfreezeWallet", () => {
    it("should unfreeze wallet", async () => {
      // Arrange
      const frozenWallet = { ...mockWallet, isFrozen: true, freezeReason: "Suspicious activity" }
      jest.spyOn(walletRepository, "findOne").mockResolvedValue(frozenWallet)
      jest.spyOn(walletRepository, "save").mockResolvedValue({
        ...frozenWallet,
        isFrozen: false,
        freezeReason: null,
      })

      // Act
      const result = await service.unfreezeWallet("user-123")

      // Assert
      expect(result.isFrozen).toBe(false)
      expect(result.freezeReason).toBeNull()
    })
  })

  describe("getTransactionHistory", () => {
    it("should retrieve transaction history with pagination", async () => {
      // Arrange
      const wallet = { ...mockWallet }
      const transactions = [mockTransaction, { ...mockTransaction, id: "txn-456" }]
      jest.spyOn(walletRepository, "findOne").mockResolvedValue(wallet)
      jest.spyOn(transactionRepository, "findAndCount").mockResolvedValue([transactions, 2])

      // Act
      const result = await service.getTransactionHistory("user-123", 1, 20)

      // Assert
      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
      expect(transactionRepository.findAndCount).toHaveBeenCalledWith({
        where: { walletId: "wallet-123" },
        order: { createdAt: "DESC" },
        take: 20,
        skip: 0,
      })
    })
  })

  describe("getAllWallets", () => {
    it("should retrieve all wallets with pagination", async () => {
      // Arrange
      const wallets = [mockWallet, { ...mockWallet, id: "wallet-456" }]
      jest.spyOn(walletRepository, "findAndCount").mockResolvedValue([wallets, 2])

      // Act
      const result = await service.getAllWallets(1, 20)

      // Assert
      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
      expect(walletRepository.findAndCount).toHaveBeenCalledWith({
        relations: ["user"],
        order: { updatedAt: "DESC" },
        take: 20,
        skip: 0,
      })
    })
  })

  describe("getPendingWithdrawals", () => {
    it("should retrieve pending withdrawals with pagination", async () => {
      // Arrange
      const withdrawals = [mockWithdrawal, { ...mockWithdrawal, id: "withdrawal-456" }]
      jest.spyOn(withdrawalRepository, "findAndCount").mockResolvedValue([withdrawals, 2])

      // Act
      const result = await service.getPendingWithdrawals(1, 20)

      // Assert
      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(withdrawalRepository.findAndCount).toHaveBeenCalledWith({
        where: { status: WithdrawalStatus.PENDING },
        relations: ["user"],
        order: { createdAt: "ASC" },
        take: 20,
        skip: 0,
      })
    })
  })

  describe("getUserWithdrawals", () => {
    it("should retrieve user withdrawals with pagination", async () => {
      // Arrange
      const withdrawals = [mockWithdrawal, { ...mockWithdrawal, id: "withdrawal-456" }]
      jest.spyOn(withdrawalRepository, "findAndCount").mockResolvedValue([withdrawals, 2])

      // Act
      const result = await service.getUserWithdrawals("user-123", 1, 20)

      // Assert
      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(withdrawalRepository.findAndCount).toHaveBeenCalledWith({
        where: { userId: "user-123" },
        order: { createdAt: "DESC" },
        take: 20,
        skip: 0,
      })
    })
  })
})
