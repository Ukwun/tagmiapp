/**
 * BlocksService Test Suite
 *
 * Tests blocking/unblocking operations, retrieving blocked users,
 * and checking block status.
 */
import { Test, TestingModule } from "@nestjs/testing"
import { NotFoundException, ConflictException } from "@nestjs/common"
import { BlocksService } from "./blocks.service"
import { BlockRepository } from "./repositories/block.repository"
import { UserRepository } from "../users/repositories/user.repository"

describe("BlocksService", () => {
  let service: BlocksService
  let blockRepository: any
  let userRepository: any

  const mockUser1 = {
    id: "user-123",
    email: "user1@example.com",
    username: "user1",
    displayName: "User One",
    avatarUrl: "https://example.com/avatar1.jpg",
  }

  const mockUser2 = {
    id: "user-456",
    email: "user2@example.com",
    username: "user2",
    displayName: "User Two",
    avatarUrl: "https://example.com/avatar2.jpg",
  }

  const mockBlock = {
    id: "block-789",
    blockerId: "user-123",
    blockedId: "user-456",
    createdAt: new Date(),
    blocker: mockUser1,
    blocked: mockUser2,
  }

  beforeEach(async () => {
    const mockBlockRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      findAndCount: jest.fn(),
      find: jest.fn(),
    }

    const mockUserRepository = {
      findByIdOptional: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlocksService,
        { provide: BlockRepository, useValue: mockBlockRepository },
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile()

    service = module.get<BlocksService>(BlocksService)
    blockRepository = module.get(BlockRepository)
    userRepository = module.get(UserRepository)

    jest.clearAllMocks()
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("blockUser", () => {
    it("should block a user successfully", async () => {
      // Arrange
      jest.spyOn(userRepository, "findByIdOptional")
        .mockResolvedValueOnce(mockUser1)
        .mockResolvedValueOnce(mockUser2)
      jest.spyOn(blockRepository, "findOne").mockResolvedValue(null)
      jest.spyOn(blockRepository, "create").mockReturnValue(mockBlock)
      jest.spyOn(blockRepository, "save").mockResolvedValue(mockBlock)

      // Act
      const result = await service.blockUser("user-123", "user-456")

      // Assert
      expect(result).toEqual({ success: true, message: "User blocked successfully" })
      expect(userRepository.findByIdOptional).toHaveBeenCalledTimes(2)
      expect(blockRepository.create).toHaveBeenCalledWith({
        blockerId: "user-123",
        blockedId: "user-456",
      })
      expect(blockRepository.save).toHaveBeenCalled()
    })

    it("should throw ConflictException when trying to block yourself", async () => {
      // Act & Assert
      await expect(service.blockUser("user-123", "user-123")).rejects.toThrow(
        ConflictException,
      )
      await expect(service.blockUser("user-123", "user-123")).rejects.toThrow(
        "You cannot block yourself",
      )
    })

    it("should throw NotFoundException if blocker not found", async () => {
      // Arrange
      jest.spyOn(userRepository, "findByIdOptional")
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockUser2)

      // Act & Assert
      await expect(service.blockUser("user-123", "user-456")).rejects.toThrow(
        NotFoundException,
      )
    })

    it("should throw NotFoundException if blocked user not found", async () => {
      // Arrange
      jest.spyOn(userRepository, "findByIdOptional")
        .mockResolvedValueOnce(mockUser1)
        .mockResolvedValueOnce(null)

      // Act & Assert
      await expect(service.blockUser("user-123", "user-456")).rejects.toThrow(
        NotFoundException,
      )
    })

    it("should throw ConflictException if user is already blocked", async () => {
      // Arrange
      jest.spyOn(userRepository, "findByIdOptional")
        .mockResolvedValue(mockUser1)
        .mockResolvedValue(mockUser2)
      jest.spyOn(blockRepository, "findOne").mockResolvedValue(mockBlock)

      // Act & Assert
      await expect(service.blockUser("user-123", "user-456")).rejects.toThrow(
        new ConflictException("You have already blocked this user"),
      )
    })
  })

  describe("unblockUser", () => {
    it("should unblock a user successfully", async () => {
      // Arrange
      jest.spyOn(blockRepository, "findOne").mockResolvedValue(mockBlock)
      jest.spyOn(blockRepository, "remove").mockResolvedValue(mockBlock)

      // Act
      const result = await service.unblockUser("user-123", "user-456")

      // Assert
      expect(result).toEqual({ success: true, message: "User unblocked successfully" })
      expect(blockRepository.findOne).toHaveBeenCalledWith({
        where: { blockerId: "user-123", blockedId: "user-456" },
      })
      expect(blockRepository.remove).toHaveBeenCalledWith(mockBlock)
    })

    it("should throw NotFoundException if block not found", async () => {
      // Arrange
      jest.spyOn(blockRepository, "findOne").mockResolvedValue(null)

      // Act & Assert
      await expect(service.unblockUser("user-123", "user-456")).rejects.toThrow(
        NotFoundException,
      )
      await expect(service.unblockUser("user-123", "user-456")).rejects.toThrow(
        "Block not found",
      )
    })
  })

  describe("getBlockedUsers", () => {
    it("should retrieve blocked users with pagination", async () => {
      // Arrange
      const blocks = [
        { ...mockBlock, id: "block-1" },
        { ...mockBlock, id: "block-2" },
      ]
      jest.spyOn(blockRepository, "findAndCount").mockResolvedValue([blocks, 2])

      // Act
      const result = await service.getBlockedUsers("user-123", 1, 20)

      // Assert
      expect(result.total).toBe(2)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
      expect(result.hasNext).toBe(false)
      expect(result.data).toHaveLength(2)
      expect(result.data[0]).toEqual({
        id: mockUser2.id,
        username: mockUser2.username,
        displayName: mockUser2.displayName,
        avatarUrl: mockUser2.avatarUrl,
        blockedAt: mockBlock.createdAt,
      })
    })

    it("should return empty array if no blocked users", async () => {
      // Arrange
      jest.spyOn(blockRepository, "findAndCount").mockResolvedValue([[], 0])

      // Act
      const result = await service.getBlockedUsers("user-123", 1, 20)

      // Assert
      expect(result.total).toBe(0)
      expect(result.data).toHaveLength(0)
    })

    it("should handle pagination correctly", async () => {
      // Arrange
      const blocks = Array(25).fill(mockBlock)
      jest.spyOn(blockRepository, "findAndCount").mockResolvedValue([blocks.slice(0, 20), 25])

      // Act
      const result = await service.getBlockedUsers("user-123", 1, 20)

      // Assert
      expect(result.total).toBe(25)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
      expect(result.hasNext).toBe(true)
      expect(blockRepository.findAndCount).toHaveBeenCalledWith({
        where: { blockerId: "user-123" },
        relations: ["blocked"],
        skip: 0,
        take: 20,
        order: { createdAt: "DESC" },
      })
    })
  })

  describe("isBlocked", () => {
    it("should return true if user is blocked", async () => {
      // Arrange
      jest.spyOn(blockRepository, "findOne").mockResolvedValue(mockBlock)

      // Act
      const result = await service.isBlocked("user-123", "user-456")

      // Assert
      expect(result).toBe(true)
      expect(blockRepository.findOne).toHaveBeenCalledWith({
        where: { blockerId: "user-123", blockedId: "user-456" },
      })
    })

    it("should return false if user is not blocked", async () => {
      // Arrange
      jest.spyOn(blockRepository, "findOne").mockResolvedValue(null)

      // Act
      const result = await service.isBlocked("user-123", "user-456")

      // Assert
      expect(result).toBe(false)
    })
  })

  describe("getBlockedUserIds", () => {
    it("should return array of blocked user IDs", async () => {
      // Arrange
      const blocks = [
        { ...mockBlock, blockedId: "user-1" },
        { ...mockBlock, blockedId: "user-2" },
        { ...mockBlock, blockedId: "user-3" },
      ]
      jest.spyOn(blockRepository, "find").mockResolvedValue(blocks)

      // Act
      const result = await service.getBlockedUserIds("user-123")

      // Assert
      expect(result).toEqual(["user-1", "user-2", "user-3"])
      expect(blockRepository.find).toHaveBeenCalledWith({
        where: { blockerId: "user-123" },
        select: ["blockedId"],
      })
    })

    it("should return empty array if no blocks", async () => {
      // Arrange
      jest.spyOn(blockRepository, "find").mockResolvedValue([])

      // Act
      const result = await service.getBlockedUserIds("user-123")

      // Assert
      expect(result).toEqual([])
    })
  })

  describe("getUsersWhoBlockedMe", () => {
    it("should return array of user IDs who blocked the current user", async () => {
      // Arrange
      const blocks = [
        { ...mockBlock, blockerId: "user-1" },
        { ...mockBlock, blockerId: "user-2" },
        { ...mockBlock, blockerId: "user-3" },
      ]
      jest.spyOn(blockRepository, "find").mockResolvedValue(blocks)

      // Act
      const result = await service.getUsersWhoBlockedMe("user-456")

      // Assert
      expect(result).toEqual(["user-1", "user-2", "user-3"])
      expect(blockRepository.find).toHaveBeenCalledWith({
        where: { blockedId: "user-456" },
        select: ["blockerId"],
      })
    })

    it("should return empty array if not blocked by anyone", async () => {
      // Arrange
      jest.spyOn(blockRepository, "find").mockResolvedValue([])

      // Act
      const result = await service.getUsersWhoBlockedMe("user-456")

      // Assert
      expect(result).toEqual([])
    })
  })
})
