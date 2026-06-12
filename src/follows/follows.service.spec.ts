/**
 * FollowsService Test Suite
 *
 * Tests following/unfollowing operations, retrieving followers/following,
 * checking follow status, and follow statistics.
 */
import { Test, TestingModule } from "@nestjs/testing"
import { NotFoundException, ConflictException } from "@nestjs/common"
import { FollowsService } from "./follows.service"
import { FollowRepository } from "./repositories/follow.repository"
import { UserRepository } from "../users/repositories/user.repository"
import { NotificationsService } from "../notifications/notifications.service"
import { ValidationPipelineService } from "../referrals/services/validation-pipeline.service"

describe("FollowsService", () => {
  let service: FollowsService
  let followRepository: any
  let userRepository: any
  let notificationsService: any
  let validationPipelineService: any

  const mockUser1 = {
    id: "user-123",
    email: "user1@example.com",
    username: "user1",
    displayName: "User One",
    followersCount: 10,
    followingCount: 5,
    save: jest.fn(),
  }

  const mockUser2 = {
    id: "user-456",
    email: "user2@example.com",
    username: "user2",
    displayName: "User Two",
    followersCount: 20,
    followingCount: 15,
    save: jest.fn(),
  }

  const mockFollow = {
    id: "follow-789",
    followerId: "user-123",
    followingId: "user-456",
    createdAt: new Date(),
    follower: mockUser1,
    following: mockUser2,
  }

  beforeEach(async () => {
    const mockFollowRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      findAndCount: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
    }

    const mockUserRepository = {
      findByIdOptional: jest.fn(),
      save: jest.fn(),
    }

    const mockNotificationsService = {
      createFollowNotification: jest.fn(),
    }

    const mockValidationPipelineService = {
      getActiveReferralForUser: jest.fn(),
      runValidation: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowsService,
        { provide: FollowRepository, useValue: mockFollowRepository },
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: ValidationPipelineService, useValue: mockValidationPipelineService },
      ],
    }).compile()

    service = module.get<FollowsService>(FollowsService)
    followRepository = module.get(FollowRepository)
    userRepository = module.get(UserRepository)
    notificationsService = module.get(NotificationsService)
    validationPipelineService = module.get(ValidationPipelineService)

    jest.clearAllMocks()
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("followUser", () => {
    it("should follow a user successfully", async () => {
      // Arrange
      jest.spyOn(userRepository, "findByIdOptional")
        .mockResolvedValueOnce(mockUser1)
        .mockResolvedValueOnce(mockUser2)
      jest.spyOn(followRepository, "findOne").mockResolvedValue(null)
      jest.spyOn(followRepository, "create").mockReturnValue(mockFollow)
      jest.spyOn(followRepository, "save").mockResolvedValue(mockFollow)
      jest.spyOn(userRepository, "save").mockResolvedValue(mockUser1)
      jest.spyOn(notificationsService, "createFollowNotification").mockResolvedValue(undefined)

      // Act
      const result = await service.followUser("user-123", "user-456")

      // Assert
      expect(result).toEqual({ success: true, message: "Successfully followed user" })
      expect(followRepository.create).toHaveBeenCalledWith({
        followerId: "user-123",
        followingId: "user-456",
      })
      expect(mockUser1.followingCount).toBe(6)
      expect(mockUser2.followersCount).toBe(21)
      expect(userRepository.save).toHaveBeenCalledTimes(2)
      expect(notificationsService.createFollowNotification).toHaveBeenCalledWith("user-456", "user-123")
    })

    it("should throw ConflictException when trying to follow yourself", async () => {
      // Act & Assert
      await expect(service.followUser("user-123", "user-123")).rejects.toThrow(
        new ConflictException("You cannot follow yourself"),
      )
    })

    it("should throw NotFoundException if follower not found", async () => {
      // Arrange
      jest.spyOn(userRepository, "findByIdOptional")
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockUser2)

      // Act & Assert
      await expect(service.followUser("user-123", "user-456")).rejects.toThrow(
        NotFoundException,
      )
    })

    it("should throw NotFoundException if user to follow not found", async () => {
      // Arrange
      jest.spyOn(userRepository, "findByIdOptional")
        .mockResolvedValueOnce(mockUser1)
        .mockResolvedValueOnce(null)

      // Act & Assert
      await expect(service.followUser("user-123", "user-456")).rejects.toThrow(
        NotFoundException,
      )
    })

    it("should throw ConflictException if already following", async () => {
      // Arrange
      jest.spyOn(userRepository, "findByIdOptional")
        .mockResolvedValueOnce(mockUser1)
        .mockResolvedValueOnce(mockUser2)
      jest.spyOn(followRepository, "findOne").mockResolvedValue(mockFollow)

      // Act & Assert
      await expect(service.followUser("user-123", "user-456")).rejects.toThrow(
        new ConflictException("You are already following this user"),
      )
    })

    it("should trigger referral validation if pipeline service exists", async () => {
      // Arrange
      const mockReferral = { id: "referral-123" }
      jest.spyOn(userRepository, "findByIdOptional")
        .mockResolvedValueOnce(mockUser1)
        .mockResolvedValueOnce(mockUser2)
      jest.spyOn(followRepository, "findOne").mockResolvedValue(null)
      jest.spyOn(followRepository, "create").mockReturnValue(mockFollow)
      jest.spyOn(followRepository, "save").mockResolvedValue(mockFollow)
      jest.spyOn(userRepository, "save").mockResolvedValue(mockUser1)
      jest.spyOn(notificationsService, "createFollowNotification").mockResolvedValue(undefined)
      jest.spyOn(validationPipelineService, "getActiveReferralForUser").mockResolvedValue(mockReferral)
      jest.spyOn(validationPipelineService, "runValidation").mockResolvedValue(undefined)

      // Act
      await service.followUser("user-123", "user-456")

      // Assert
      expect(validationPipelineService.getActiveReferralForUser).toHaveBeenCalledWith("user-123")
      expect(validationPipelineService.runValidation).toHaveBeenCalledWith("referral-123")
    })
  })

  describe("unfollowUser", () => {
    it("should unfollow a user successfully", async () => {
      // Arrange
      const user1 = { ...mockUser1, followingCount: 5 }
      const user2 = { ...mockUser2, followersCount: 20 }
      jest.spyOn(followRepository, "findOne").mockResolvedValue(mockFollow)
      jest.spyOn(followRepository, "remove").mockResolvedValue(mockFollow)
      jest.spyOn(userRepository, "findByIdOptional")
        .mockResolvedValueOnce(user1)
        .mockResolvedValueOnce(user2)
      jest.spyOn(userRepository, "save").mockResolvedValue(user1)

      // Act
      const result = await service.unfollowUser("user-123", "user-456")

      // Assert
      expect(result).toEqual({ success: true, message: "Successfully unfollowed user" })
      expect(followRepository.remove).toHaveBeenCalledWith(mockFollow)
      expect(user1.followingCount).toBe(4)
      expect(user2.followersCount).toBe(19)
    })

    it("should throw NotFoundException if not following", async () => {
      // Arrange
      jest.spyOn(followRepository, "findOne").mockResolvedValue(null)

      // Act & Assert
      await expect(service.unfollowUser("user-123", "user-456")).rejects.toThrow(
        new NotFoundException("You are not following this user"),
      )
    })

    it("should prevent negative follower counts", async () => {
      // Arrange
      const userWithZeroFollowers = { ...mockUser1, followingCount: 0 }
      const userWithZeroFollowing = { ...mockUser2, followersCount: 0 }
      jest.spyOn(followRepository, "findOne").mockResolvedValue(mockFollow)
      jest.spyOn(followRepository, "remove").mockResolvedValue(mockFollow)
      jest.spyOn(userRepository, "findByIdOptional")
        .mockResolvedValueOnce(userWithZeroFollowers)
        .mockResolvedValueOnce(userWithZeroFollowing)
      jest.spyOn(userRepository, "save").mockResolvedValue(userWithZeroFollowers)

      // Act
      await service.unfollowUser("user-123", "user-456")

      // Assert
      expect(userWithZeroFollowers.followingCount).toBe(0)
      expect(userWithZeroFollowing.followersCount).toBe(0)
    })
  })

  describe("getFollowers", () => {
    it("should retrieve followers with pagination", async () => {
      // Arrange
      const followers = [
        { ...mockFollow, follower: mockUser1 },
        { ...mockFollow, follower: { ...mockUser1, id: "user-789" } },
      ]
      jest.spyOn(followRepository, "findAndCount").mockResolvedValue([followers, 2])

      // Act
      const result = await service.getFollowers("user-456", 1, 20)

      // Assert
      expect(result.total).toBe(2)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
      expect(result.hasNext).toBe(false)
      expect(result.data).toHaveLength(2)
    })

    it("should mark followers that current user follows", async () => {
      // Arrange
      const followers = [{ ...mockFollow, follower: mockUser1 }]
      const currentUserFollowing = [{ followingId: mockUser1.id }]
      jest.spyOn(followRepository, "findAndCount").mockResolvedValue([followers, 1])
      jest.spyOn(followRepository, "find").mockResolvedValue(currentUserFollowing)

      // Act
      const result = await service.getFollowers("user-456", 1, 20, "current-user-123")

      // Assert
      expect(result.data[0].isFollowing).toBe(true)
    })

    it("should return empty array if no followers", async () => {
      // Arrange
      jest.spyOn(followRepository, "findAndCount").mockResolvedValue([[], 0])

      // Act
      const result = await service.getFollowers("user-456", 1, 20)

      // Assert
      expect(result.total).toBe(0)
      expect(result.data).toHaveLength(0)
    })
  })

  describe("getFollowing", () => {
    it("should retrieve following users with pagination", async () => {
      // Arrange
      const following = [
        { ...mockFollow, following: mockUser2 },
        { ...mockFollow, following: { ...mockUser2, id: "user-789" } },
      ]
      jest.spyOn(followRepository, "findAndCount").mockResolvedValue([following, 2])

      // Act
      const result = await service.getFollowing("user-123", 1, 20)

      // Assert
      expect(result.total).toBe(2)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
      expect(result.hasNext).toBe(false)
      expect(result.data).toHaveLength(2)
    })

    it("should handle pagination correctly", async () => {
      // Arrange
      const following = Array(25).fill(mockFollow)
      jest.spyOn(followRepository, "findAndCount").mockResolvedValue([following.slice(0, 20), 25])

      // Act
      const result = await service.getFollowing("user-123", 1, 20)

      // Assert
      expect(result.hasNext).toBe(true)
      expect(followRepository.findAndCount).toHaveBeenCalledWith({
        where: { followerId: "user-123" },
        relations: ["following"],
        skip: 0,
        take: 20,
        order: { createdAt: "DESC" },
      })
    })
  })

  describe("isFollowing", () => {
    it("should return true if following", async () => {
      // Arrange
      jest.spyOn(followRepository, "findOne").mockResolvedValue(mockFollow)

      // Act
      const result = await service.isFollowing("user-123", "user-456")

      // Assert
      expect(result).toBe(true)
    })

    it("should return false if not following", async () => {
      // Arrange
      jest.spyOn(followRepository, "findOne").mockResolvedValue(null)

      // Act
      const result = await service.isFollowing("user-123", "user-456")

      // Assert
      expect(result).toBe(false)
    })
  })

  describe("getFollowStats", () => {
    it("should return follow statistics", async () => {
      // Arrange
      jest.spyOn(userRepository, "findByIdOptional").mockResolvedValue(mockUser1)

      // Act
      const result = await service.getFollowStats("user-123")

      // Assert
      expect(result).toEqual({
        followersCount: mockUser1.followersCount,
        followingCount: mockUser1.followingCount,
      })
    })

    it("should throw NotFoundException if user not found", async () => {
      // Arrange
      jest.spyOn(userRepository, "findByIdOptional").mockResolvedValue(null)

      // Act & Assert
      await expect(service.getFollowStats("user-123")).rejects.toThrow(
        NotFoundException,
      )
    })
  })
})
