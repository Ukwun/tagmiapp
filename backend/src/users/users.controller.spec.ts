/**
 * UsersController Test Suite
 */
import { Test, TestingModule } from "@nestjs/testing"
import { UsersController } from "./users.controller"
import { UsersService } from "./users.service"

describe("UsersController", () => {
  let controller: UsersController
  let usersService: UsersService

  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    username: "testuser",
    displayName: "Test User",
    avatarUrl: null,
    coverImageUrl: null,
    bio: "Test bio",
    interests: ["music"],
    role: "client",
    isVerified: false,
    isActive: true,
    followersCount: 10,
    followingCount: 5,
    postCount: 3,
    createdAt: new Date(),
  }

  const mockSettings = {
    id: "settings-123",
    userId: "user-123",
    profileVisible: true,
    showLocation: true,
    showRates: true,
  }

  const mockUsersService = {
    findById: jest.fn(),
    findByUsername: jest.fn(),
    findByIdOrUsername: jest.fn(),
    updateProfile: jest.fn(),
    uploadAvatar: jest.fn(),
    uploadCover: jest.fn(),
    getTalentProfile: jest.fn(),
    updateTalentProfile: jest.fn(),
    getOrCreateSettings: jest.fn(),
    updateSettings: jest.fn(),
    deleteAccount: jest.fn(),
    getSuggestedUsers: jest.fn(),
    searchUsers: jest.fn(),
    searchTalents: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile()

    controller = module.get<UsersController>(UsersController)
    usersService = module.get<UsersService>(UsersService)

    jest.clearAllMocks()
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })

  describe("getProfile", () => {
    it("should return current user profile without email", async () => {
      // Arrange
      const mockRequest = { user: { id: "user-123" } }
      jest.spyOn(usersService, "findById").mockResolvedValue(mockUser as any)

      // Act
      const result = await controller.getProfile(mockRequest)

      // Assert
      expect(result).not.toHaveProperty("email")
      expect(result.username).toBe("testuser")
      expect(usersService.findById).toHaveBeenCalledWith("user-123")
    })
  })

  describe("updateProfile", () => {
    it("should update user profile", async () => {
      // Arrange
      const mockRequest = { user: { id: "user-123" } }
      const updateDto = { displayName: "Updated Name" }
      jest.spyOn(usersService, "updateProfile").mockResolvedValue({ ...mockUser, ...updateDto } as any)

      // Act
      const result = await controller.updateProfile(mockRequest, updateDto)

      // Assert
      expect(result.displayName).toBe("Updated Name")
      expect(usersService.updateProfile).toHaveBeenCalledWith("user-123", updateDto)
    })
  })

  describe("uploadAvatar", () => {
    it("should upload avatar", async () => {
      // Arrange
      const mockRequest = { user: { id: "user-123" } }
      const mockFile = { mimetype: "image/jpeg" } as Express.Multer.File
      const uploadResult = { avatarUrl: "https://cdn.example.com/avatar.jpg" }
      jest.spyOn(usersService, "uploadAvatar").mockResolvedValue(uploadResult)

      // Act
      const result = await controller.uploadAvatar(mockRequest, mockFile)

      // Assert
      expect(result).toEqual(uploadResult)
      expect(usersService.uploadAvatar).toHaveBeenCalledWith("user-123", mockFile)
    })
  })

  describe("uploadCover", () => {
    it("should upload cover image", async () => {
      // Arrange
      const mockRequest = { user: { id: "user-123" } }
      const mockFile = { mimetype: "image/jpeg" } as Express.Multer.File
      const uploadResult = { coverImageUrl: "https://cdn.example.com/cover.jpg" }
      jest.spyOn(usersService, "uploadCover").mockResolvedValue(uploadResult)

      // Act
      const result = await controller.uploadCover(mockRequest, mockFile)

      // Assert
      expect(result).toEqual(uploadResult)
      expect(usersService.uploadCover).toHaveBeenCalledWith("user-123", mockFile)
    })
  })

  describe("getTalentProfile", () => {
    it("should get current user talent profile", async () => {
      // Arrange
      const mockRequest = { user: { id: "user-123" } }
      const mockTalentProfile = { id: "talent-123", userId: "user-123" }
      jest.spyOn(usersService, "getTalentProfile").mockResolvedValue(mockTalentProfile as any)

      // Act
      const result = await controller.getTalentProfile(mockRequest)

      // Assert
      expect(result).toEqual(mockTalentProfile)
      expect(usersService.getTalentProfile).toHaveBeenCalledWith("user-123")
    })
  })

  describe("updateTalentProfile", () => {
    it("should update talent profile", async () => {
      // Arrange
      const mockRequest = { user: { id: "user-123" } }
      const updateDto = { headline: "New headline" }
      const mockTalentProfile = { id: "talent-123", ...updateDto }
      jest.spyOn(usersService, "updateTalentProfile").mockResolvedValue(mockTalentProfile as any)

      // Act
      const result = await controller.updateTalentProfile(mockRequest, updateDto as any)

      // Assert
      expect(result).toEqual(mockTalentProfile)
      expect(usersService.updateTalentProfile).toHaveBeenCalledWith("user-123", updateDto)
    })
  })

  describe("getSettings", () => {
    it("should get or create user settings", async () => {
      // Arrange
      const mockRequest = { user: { id: "user-123" } }
      jest.spyOn(usersService, "getOrCreateSettings").mockResolvedValue(mockSettings as any)

      // Act
      const result = await controller.getSettings(mockRequest)

      // Assert
      expect(result).toEqual(mockSettings)
      expect(usersService.getOrCreateSettings).toHaveBeenCalledWith("user-123")
    })
  })

  describe("updateSettings", () => {
    it("should update user settings", async () => {
      // Arrange
      const mockRequest = { user: { id: "user-123" } }
      const updateDto = { profileVisible: false }
      jest.spyOn(usersService, "updateSettings").mockResolvedValue({ ...mockSettings, ...updateDto } as any)

      // Act
      const result = await controller.updateSettings(mockRequest, updateDto)

      // Assert
      expect(result.profileVisible).toBe(false)
      expect(usersService.updateSettings).toHaveBeenCalledWith("user-123", updateDto)
    })
  })

  describe("deleteAccount", () => {
    it("should delete account", async () => {
      // Arrange
      const mockRequest = { user: { id: "user-123" } }
      jest.spyOn(usersService, "deleteAccount").mockResolvedValue(undefined)

      // Act
      const result = await controller.deleteAccount(mockRequest)

      // Assert
      expect(result).toEqual({ message: "Account deleted successfully" })
      expect(usersService.deleteAccount).toHaveBeenCalledWith("user-123")
    })
  })

  describe("getSuggestedUsers", () => {
    it("should get suggested users with default limit", async () => {
      // Arrange
      const mockRequest = { user: { id: "user-123" } }
      const mockSuggested = [mockUser]
      jest.spyOn(usersService, "getSuggestedUsers").mockResolvedValue(mockSuggested as any)

      // Act
      const result = await controller.getSuggestedUsers(mockRequest)

      // Assert
      expect(result).toEqual(mockSuggested)
      expect(usersService.getSuggestedUsers).toHaveBeenCalledWith("user-123", 5)
    })

    it("should get suggested users with custom limit", async () => {
      // Arrange
      const mockRequest = { user: { id: "user-123" } }
      const mockSuggested = [mockUser]
      jest.spyOn(usersService, "getSuggestedUsers").mockResolvedValue(mockSuggested as any)

      // Act
      const result = await controller.getSuggestedUsers(mockRequest, 10)

      // Assert
      expect(result).toEqual(mockSuggested)
      expect(usersService.getSuggestedUsers).toHaveBeenCalledWith("user-123", 10)
    })
  })

  describe("searchUsers", () => {
    it("should search users", async () => {
      // Arrange
      const mockResults = [mockUser]
      jest.spyOn(usersService, "searchUsers").mockResolvedValue(mockResults as any)

      // Act
      const result = await controller.searchUsers({ user: { id: "user-1" } } as any, "test")

      // Assert
      expect(result).toEqual(mockResults)
      expect(usersService.searchUsers).toHaveBeenCalledWith("test", 10, "user-1")
    })

    it("should search users with custom limit", async () => {
      // Arrange
      const mockResults = [mockUser]
      jest.spyOn(usersService, "searchUsers").mockResolvedValue(mockResults as any)

      // Act
      const result = await controller.searchUsers({ user: { id: "user-1" } } as any, "test", 20)

      // Assert
      expect(usersService.searchUsers).toHaveBeenCalledWith("test", 20, "user-1")
    })
  })

  describe("searchTalents", () => {
    it("should search talents with all filters", async () => {
      // Arrange
      const mockRequest = { user: { id: "user-123" } }
      const mockResults = { data: [], total: 0, page: 1, limit: 20, hasNext: false, hasPrev: false }
      jest.spyOn(usersService, "searchTalents").mockResolvedValue(mockResults)

      // Act
      const result = await controller.searchTalents(
        mockRequest,
        "designer",
        ["photoshop"],
        ["design"],
        "2",
        "10"
      )

      // Assert
      expect(result).toEqual(mockResults)
      expect(usersService.searchTalents).toHaveBeenCalledWith(
        "designer",
        ["photoshop"],
        ["design"],
        2,
        10,
        "user-123"
      )
    })

    it("should search talents with default pagination", async () => {
      // Arrange
      const mockRequest = { user: { id: "user-123" } }
      const mockResults = { data: [], total: 0, page: 1, limit: 20, hasNext: false, hasPrev: false }
      jest.spyOn(usersService, "searchTalents").mockResolvedValue(mockResults)

      // Act
      const result = await controller.searchTalents(mockRequest)

      // Assert
      expect(usersService.searchTalents).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "user-123"
      )
    })
  })

  describe("getTalentProfileById", () => {
    it("should get talent profile by user ID", async () => {
      // Arrange
      const mockTalentProfile = { id: "talent-123", userId: "user-456" }
      jest.spyOn(usersService, "getTalentProfile").mockResolvedValue(mockTalentProfile as any)

      // Act
      const result = await controller.getTalentProfileById("user-456")

      // Assert
      expect(result).toEqual(mockTalentProfile)
      expect(usersService.getTalentProfile).toHaveBeenCalledWith("user-456")
    })
  })

  describe("getUserById", () => {
    it("should get user by ID with privacy settings for own profile", async () => {
      // Arrange
      const mockRequest = { user: { id: "user-123" } }
      jest.spyOn(usersService, "findByIdOrUsername").mockResolvedValue(mockUser as any)
      jest.spyOn(usersService, "getOrCreateSettings").mockResolvedValue(mockSettings as any)

      // Act
      const result = await controller.getUserById("user-123", mockRequest)

      // Assert
      expect(result.isOwnProfile).toBe(true)
      expect(result.email).toBe("test@example.com")
      expect(result.privacy).toBeDefined()
      expect(usersService.findByIdOrUsername).toHaveBeenCalledWith("user-123")
    })

    it("should get user by username without email for other users", async () => {
      // Arrange
      const mockRequest = { user: { id: "user-999" } }
      jest.spyOn(usersService, "findByIdOrUsername").mockResolvedValue(mockUser as any)
      jest.spyOn(usersService, "getOrCreateSettings").mockResolvedValue(mockSettings as any)

      // Act
      const result = await controller.getUserById("testuser", mockRequest)

      // Assert
      expect(result.isOwnProfile).toBe(false)
      expect(result.email).toBeUndefined()
      expect(usersService.findByIdOrUsername).toHaveBeenCalledWith("testuser")
    })
  })
})
