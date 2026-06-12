/**
 * UsersService Test Suite
 */
import { Test, TestingModule } from "@nestjs/testing"
import { UsersService } from "./users.service"
import { StorageService } from "../config/storage.service"
import { ValidationPipelineService } from "../referrals/services/validation-pipeline.service"
import { ERROR_MESSAGES } from "../common/constants/error-messages.constant"
import { UserRepository } from "./repositories/user.repository"
import { TalentProfileRepository } from "./repositories/talent-profile.repository"
import { ClientProfileRepository } from "./repositories/client-profile.repository"
import { UserSettingsRepository } from "./repositories/user-settings.repository"
import { FollowRepository } from "../follows/repositories/follow.repository"

describe("UsersService", () => {
  let service: UsersService
  let userRepository: any
  let talentProfileRepository: any
  let clientProfileRepository: any
  let settingsRepository: any
  let followRepository: any
  let storageService: any
  let validationPipelineService: any

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

  beforeEach(async () => {
    const mockUserRepository = {
      findById: jest.fn(),
      findByUsername: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      searchUsers: jest.fn(),
      findSuggestedUsers: jest.fn(),
    }

    const mockTalentProfileRepository = {
      findByUserId: jest.fn(),
      findByUserIdOptional: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      searchTalents: jest.fn(),
    }

    const mockClientProfileRepository = {
      findByUserIdOptional: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    }

    const mockSettingsRepository = {
      findByUserIdOptional: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    }

    const mockFollowRepository = {
      createQueryBuilder: jest.fn(),
      find: jest.fn(),
    }

    const mockStorageService = {
      uploadFile: jest.fn(),
    }

    const mockValidationPipelineService = {
      getActiveReferralForUser: jest.fn(),
      runValidation: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: TalentProfileRepository, useValue: mockTalentProfileRepository },
        { provide: ClientProfileRepository, useValue: mockClientProfileRepository },
        { provide: UserSettingsRepository, useValue: mockSettingsRepository },
        { provide: FollowRepository, useValue: mockFollowRepository },
        { provide: StorageService, useValue: mockStorageService },
        { provide: ValidationPipelineService, useValue: mockValidationPipelineService },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
    userRepository = module.get<UserRepository>(UserRepository)
    talentProfileRepository = module.get<TalentProfileRepository>(TalentProfileRepository)
    clientProfileRepository = module.get<ClientProfileRepository>(ClientProfileRepository)
    settingsRepository = module.get<UserSettingsRepository>(UserSettingsRepository)
    followRepository = module.get(FollowRepository)
    storageService = module.get<StorageService>(StorageService)
    validationPipelineService = module.get<ValidationPipelineService>(ValidationPipelineService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("findById", () => {
    it("should return user by ID", async () => {
      // Arrange
      jest.spyOn(userRepository, "findById").mockResolvedValue(mockUser)

      // Act
      const result = await service.findById("user-123")

      // Assert
      expect(result).toEqual(mockUser)
      expect(userRepository.findById).toHaveBeenCalledWith("user-123")
    })

    it("should throw error if user not found", async () => {
      // Arrange
      jest.spyOn(userRepository, "findById").mockRejectedValue(new Error(ERROR_MESSAGES.USER_NOT_FOUND))

      // Act & Assert
      await expect(service.findById("nonexistent")).rejects.toThrow(ERROR_MESSAGES.USER_NOT_FOUND)
    })
  })

  describe("findByUsername", () => {
    it("should return user by username", async () => {
      // Arrange
      jest.spyOn(userRepository, "findByUsername").mockResolvedValue(mockUser)

      // Act
      const result = await service.findByUsername("testuser")

      // Assert
      expect(result).toEqual(mockUser)
      expect(userRepository.findByUsername).toHaveBeenCalledWith("testuser")
    })

    it("should throw error if user not found", async () => {
      // Arrange
      jest.spyOn(userRepository, "findByUsername").mockRejectedValue(new Error(ERROR_MESSAGES.USER_NOT_FOUND))

      // Act & Assert
      await expect(service.findByUsername("nonexistent")).rejects.toThrow(ERROR_MESSAGES.USER_NOT_FOUND)
    })
  })

  describe("findByIdOrUsername", () => {
    it("should find by ID if input is UUID", async () => {
      // Arrange
      jest.spyOn(userRepository, "findById").mockResolvedValue(mockUser)

      // Act
      const result = await service.findByIdOrUsername("550e8400-e29b-41d4-a716-446655440000")

      // Assert
      expect(result).toEqual(mockUser)
    })

    it("should find by username if input is not UUID", async () => {
      // Arrange
      jest.spyOn(userRepository, "findByUsername").mockResolvedValue(mockUser)

      // Act
      const result = await service.findByIdOrUsername("testuser")

      // Assert
      expect(result).toEqual(mockUser)
    })
  })

  describe("updateProfile", () => {
    it("should update user profile successfully", async () => {
      // Arrange
      const updateDto = { displayName: "Updated Name", bio: "Updated bio" }
      jest.spyOn(userRepository, "findById").mockResolvedValue(mockUser)
      jest.spyOn(userRepository, "save").mockResolvedValue({ ...mockUser, ...updateDto })

      // Act
      const result = await service.updateProfile("user-123", updateDto)

      // Assert
      expect(result.displayName).toBe("Updated Name")
      expect(userRepository.save).toHaveBeenCalled()
    })
  })

  describe("uploadAvatar", () => {
    const mockFile = {
      mimetype: "image/jpeg",
      buffer: Buffer.from("test"),
    } as Express.Multer.File

    it("should upload avatar successfully", async () => {
      // Arrange
      jest.spyOn(userRepository, "findById").mockResolvedValue(mockUser)
      jest.spyOn(storageService, "uploadFile").mockResolvedValue({ secure_url: "https://cdn.example.com/avatar.jpg" })
      jest.spyOn(userRepository, "save").mockResolvedValue(mockUser)

      // Act
      const result = await service.uploadAvatar("user-123", mockFile)

      // Assert
      expect(result).toEqual({ avatarUrl: "https://cdn.example.com/avatar.jpg" })
      expect(storageService.uploadFile).toHaveBeenCalledWith(mockFile)
    })

    it("should throw error if file is missing", async () => {
      // Act & Assert
      await expect(service.uploadAvatar("user-123", null as any)).rejects.toThrow(ERROR_MESSAGES.FILE_UPLOAD_FAILED)
    })

    it("should throw error if file is not an image", async () => {
      // Arrange
      const invalidFile = { ...mockFile, mimetype: "application/pdf" }

      // Act & Assert
      await expect(service.uploadAvatar("user-123", invalidFile as any)).rejects.toThrow(ERROR_MESSAGES.INVALID_FILE_TYPE)
    })
  })

  describe("uploadCover", () => {
    const mockFile = {
      mimetype: "image/jpeg",
      buffer: Buffer.from("test"),
    } as Express.Multer.File

    it("should upload cover image successfully", async () => {
      // Arrange
      jest.spyOn(userRepository, "findById").mockResolvedValue(mockUser)
      jest.spyOn(storageService, "uploadFile").mockResolvedValue({ secure_url: "https://cdn.example.com/cover.jpg" })
      jest.spyOn(userRepository, "save").mockResolvedValue(mockUser)

      // Act
      const result = await service.uploadCover("user-123", mockFile)

      // Assert
      expect(result).toEqual({ coverImageUrl: "https://cdn.example.com/cover.jpg" })
    })

    it("should throw error if file is not an image", async () => {
      // Arrange
      const invalidFile = { ...mockFile, mimetype: "text/plain" }

      // Act & Assert
      await expect(service.uploadCover("user-123", invalidFile as any)).rejects.toThrow(ERROR_MESSAGES.INVALID_FILE_TYPE)
    })
  })

  describe("updateTalentProfile", () => {
    const mockTalentProfile = {
      id: "talent-123",
      userId: "user-123",
      headline: "Test headline",
      services: [],
    }

    it("should create talent profile if it does not exist", async () => {
      // Arrange
      const updateDto = { bio: "New bio", hourlyRate: 50 }
      jest.spyOn(userRepository, "findById").mockResolvedValue(mockUser)
      jest.spyOn(talentProfileRepository, "findByUserIdOptional").mockResolvedValue(null)
      jest.spyOn(talentProfileRepository, "create").mockResolvedValue(mockTalentProfile)

      // Act
      const result = await service.updateTalentProfile("user-123", updateDto as any)

      // Assert
      expect(talentProfileRepository.create).toHaveBeenCalled()
    })

    it("should update existing talent profile", async () => {
      // Arrange
      const updateDto = { bio: "Updated bio", hourlyRate: 75 }
      jest.spyOn(userRepository, "findById").mockResolvedValue(mockUser)
      jest.spyOn(talentProfileRepository, "findByUserIdOptional").mockResolvedValue(mockTalentProfile)
      jest.spyOn(talentProfileRepository, "save").mockResolvedValue({ ...mockTalentProfile, ...updateDto })

      // Act
      const result = await service.updateTalentProfile("user-123", updateDto as any)

      // Assert
      expect(talentProfileRepository.save).toHaveBeenCalled()
    })
  })

  describe("getTalentProfile", () => {
    it("should return talent profile with user relation", async () => {
      // Arrange
      const mockTalentProfile = { id: "talent-123", userId: "user-123", user: mockUser }
      jest.spyOn(talentProfileRepository, "findByUserId").mockResolvedValue(mockTalentProfile)

      // Act
      const result = await service.getTalentProfile("user-123")

      // Assert
      expect(result).toEqual(mockTalentProfile)
      expect(talentProfileRepository.findByUserId).toHaveBeenCalledWith("user-123")
    })

    it("should throw error if talent profile not found", async () => {
      // Arrange
      jest.spyOn(talentProfileRepository, "findByUserId").mockRejectedValue(new Error(ERROR_MESSAGES.USER_NOT_FOUND))

      // Act & Assert
      await expect(service.getTalentProfile("user-123")).rejects.toThrow(ERROR_MESSAGES.USER_NOT_FOUND)
    })
  })

  describe("getOrCreateSettings", () => {
    const mockSettings = { id: "settings-123", userId: "user-123", profileVisible: true }

    it("should return existing settings", async () => {
      // Arrange
      jest.spyOn(settingsRepository, "findByUserIdOptional").mockResolvedValue(mockSettings)

      // Act
      const result = await service.getOrCreateSettings("user-123")

      // Assert
      expect(result).toEqual(mockSettings)
    })

    it("should create settings if they do not exist", async () => {
      // Arrange
      jest.spyOn(settingsRepository, "findByUserIdOptional").mockResolvedValue(null)
      jest.spyOn(settingsRepository, "create").mockResolvedValue(mockSettings)

      // Act
      const result = await service.getOrCreateSettings("user-123")

      // Assert
      expect(settingsRepository.create).toHaveBeenCalledWith("user-123")
    })
  })

  describe("updateSettings", () => {
    it("should update existing settings", async () => {
      // Arrange
      const mockSettings = { id: "settings-123", userId: "user-123", profileVisible: true }
      const updateDto = { profileVisible: false }
      jest.spyOn(settingsRepository, "findByUserIdOptional").mockResolvedValue(mockSettings)
      jest.spyOn(settingsRepository, "save").mockResolvedValue({ ...mockSettings, ...updateDto })

      // Act
      const result = await service.updateSettings("user-123", updateDto)

      // Assert
      expect(result.profileVisible).toBe(false)
    })

    it("should create settings if they do not exist", async () => {
      // Arrange
      const updateDto = { profileVisible: false }
      jest.spyOn(settingsRepository, "findByUserIdOptional").mockResolvedValue(null)
      jest.spyOn(settingsRepository, "create").mockResolvedValue({ userId: "user-123" } as any)
      jest.spyOn(settingsRepository, "save").mockResolvedValue({ userId: "user-123", ...updateDto } as any)

      // Act
      const result = await service.updateSettings("user-123", updateDto)

      // Assert
      expect(settingsRepository.create).toHaveBeenCalled()
      expect(settingsRepository.save).toHaveBeenCalled()
    })
  })

  describe("deleteAccount", () => {
    it("should soft-delete account by anonymizing data", async () => {
      // Arrange
      jest.spyOn(userRepository, "findById").mockResolvedValue(mockUser)
      const saveSpy = jest.spyOn(userRepository, "save").mockResolvedValue(mockUser)

      // Act
      await service.deleteAccount("user-123")

      // Assert
      const savedUser: any = saveSpy.mock.calls[0][0]
      expect(savedUser.isActive).toBe(false)
      expect(savedUser.displayName).toBe("Deleted User")
      expect(savedUser.avatarUrl).toBeNull()
      expect(savedUser.bio).toBeNull()
      expect(savedUser.email).toMatch(/^deleted_\d+@deleted\.tagmi$/)
      expect(savedUser.username).toMatch(/^deleted_\d+$/)
    })
  })

  describe("searchUsers", () => {
    it("should search users by username or display name", async () => {
      // Arrange
      jest.spyOn(userRepository, "searchUsers").mockResolvedValue([mockUser])

      // Act
      const result = await service.searchUsers("test", 10)

      // Assert
      expect(result).toEqual([mockUser])
      expect(userRepository.searchUsers).toHaveBeenCalledWith("test", 10)
    })
  })
})
