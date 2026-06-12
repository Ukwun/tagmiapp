/**
 * AuthService Test Suite
 */
import { Test, TestingModule } from "@nestjs/testing"
import { JwtService } from "@nestjs/jwt"
import { ConfigService } from "@nestjs/config"
import { BadRequestException } from "@nestjs/common"
import * as bcrypt from "bcryptjs"
import { AuthService } from "./auth.service"
import { OtpService } from "./services/otp.service"
import { ReferralsService } from "../referrals/referrals.service"
import { ERROR_MESSAGES } from "../common/constants/error-messages.constant"
import { UserRepository } from "../users/repositories/user.repository"

jest.mock("bcryptjs")

describe("AuthService", () => {
  let service: AuthService
  let userRepository: any
  let jwtService: JwtService
  let otpService: OtpService
  let configService: ConfigService
  let referralsService: ReferralsService

  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    username: "testuser",
    displayName: "Test User",
    passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz",
    role: "client",
    isActive: true,
    isVerified: false,
    interests: ["music"],
    createdAt: new Date(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const mockUserRepository = {
      findByEmail: jest.fn(),
      findByEmailOrUsername: jest.fn(),
      findByEmailOrUsernameWithPassword: jest.fn(),
      findByUsernameOptional: jest.fn(),
      findByIdOptional: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    }

    const mockJwtService = {
      sign: jest.fn().mockReturnValue("mock-jwt-token"),
    }

    const mockOtpService = {
      sendEmailOtp: jest.fn(),
      verifyEmailOtp: jest.fn(),
      isEmailVerified: jest.fn(),
      sendPasswordResetOtp: jest.fn(),
    }

    const mockConfigService = {
      get: jest.fn(),
      getOrThrow: jest.fn(),
    }

    const mockReferralsService = {
      linkReferralToUser: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: OtpService, useValue: mockOtpService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: ReferralsService, useValue: mockReferralsService },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    userRepository = module.get<UserRepository>(UserRepository)
    jwtService = module.get<JwtService>(JwtService)
    otpService = module.get<OtpService>(OtpService)
    configService = module.get<ConfigService>(ConfigService)
    referralsService = module.get<ReferralsService>(ReferralsService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("register", () => {
    const registerDto = {
      email: "newuser@example.com",
      username: "newuser",
      password: "password123",
      displayName: "New User",
      interests: ["dance"],
      role: "client" as const,
    }

    it("should successfully register a new user", async () => {
      // Arrange: Setup mocks for successful registration
      jest.spyOn(otpService, "isEmailVerified").mockResolvedValue(true)
      jest.spyOn(userRepository, "findByEmailOrUsername").mockResolvedValue(null)
      jest.spyOn(userRepository, "create").mockReturnValue(mockUser)
      jest.spyOn(userRepository, "save").mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password" as never)

      // Act: Call register method
      const result = await service.register(registerDto)

      // Assert: Verify response structure and method calls
      expect(result).toHaveProperty("token", "mock-jwt-token")
      expect(result).toHaveProperty("user")
      expect(result.user.email).toBe(mockUser.email)
      expect(otpService.isEmailVerified).toHaveBeenCalledWith("newuser@example.com")
      expect(userRepository.create).toHaveBeenCalled()
      expect(jwtService.sign).toHaveBeenCalled()
    })

    it("should throw error if email is not verified", async () => {
      // Arrange: Email not verified
      jest.spyOn(otpService, "isEmailVerified").mockResolvedValue(false)

      // Act & Assert: Should throw BadRequestException
      await expect(service.register(registerDto)).rejects.toThrow(
        ERROR_MESSAGES.ACCOUNT_NOT_VERIFIED,
      )
      expect(otpService.isEmailVerified).toHaveBeenCalledWith("newuser@example.com")
    })

    it("should throw error if email already exists", async () => {
      // Arrange: Email already exists
      jest.spyOn(otpService, "isEmailVerified").mockResolvedValue(true)
      jest.spyOn(userRepository, "findByEmailOrUsername").mockResolvedValue({ ...mockUser, email: "newuser@example.com" })

      // Act & Assert: Should throw conflict error
      await expect(service.register(registerDto)).rejects.toThrow()
    })

    it("should throw error if username already exists", async () => {
      // Arrange: Username already exists
      jest.spyOn(otpService, "isEmailVerified").mockResolvedValue(true)
      jest.spyOn(userRepository, "findByEmailOrUsername").mockResolvedValue({ ...mockUser, username: "newuser" })

      // Act & Assert: Should throw conflict error
      await expect(service.register(registerDto)).rejects.toThrow()
    })

    it("should link referral code if provided", async () => {
      // Arrange: Registration with referral code
      const dtoWithReferral = { ...registerDto, referralCode: "REF123", fingerprint: "abc123" }
      jest.spyOn(otpService, "isEmailVerified").mockResolvedValue(true)
      jest.spyOn(userRepository, "findByEmailOrUsername").mockResolvedValue(null)
      jest.spyOn(userRepository, "create").mockReturnValue(mockUser)
      jest.spyOn(userRepository, "save").mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password" as never)
      jest.spyOn(referralsService, "linkReferralToUser").mockResolvedValue(undefined);

      // Act: Register with referral
      await service.register(dtoWithReferral)

      // Assert: Verify referral linking was attempted
      expect(referralsService.linkReferralToUser).toHaveBeenCalledWith(
        "REF123",
        mockUser.id,
        "",
        "abc123",
      )
    })

    it("should not fail registration if referral linking fails", async () => {
      // Arrange: Referral linking fails but registration succeeds
      const dtoWithReferral = { ...registerDto, referralCode: "INVALID", fingerprint: "abc123" }
      jest.spyOn(otpService, "isEmailVerified").mockResolvedValue(true)
      jest.spyOn(userRepository, "findByEmailOrUsername").mockResolvedValue(null)
      jest.spyOn(userRepository, "create").mockReturnValue(mockUser)
      jest.spyOn(userRepository, "save").mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password" as never)
      jest.spyOn(referralsService, "linkReferralToUser").mockRejectedValue(new Error("Invalid referral"))

      // Act: Register should succeed despite referral failure
      const result = await service.register(dtoWithReferral)

      // Assert: Registration successful, referral error logged but not thrown
      expect(result).toHaveProperty("token")
      expect(referralsService.linkReferralToUser).toHaveBeenCalled()
    })
  })

  describe("login", () => {
    const loginDto = {
      email: "test@example.com",
      password: "password123",
    }

    it("should successfully login with valid credentials", async () => {
      // Arrange: Valid user credentials
      jest.spyOn(userRepository, "findByEmailOrUsernameWithPassword").mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true as never)
      jest.spyOn(userRepository, "update").mockResolvedValue(undefined);
      jest.spyOn(configService, "get").mockReturnValue("")

      // Act: Login
      const result = await service.login(loginDto)

      // Assert: Returns token and user data
      expect(result).toHaveProperty("token", "mock-jwt-token")
      expect(result).toHaveProperty("user")
      expect(result.user.email).toBe(mockUser.email)
      expect(userRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        { lastLogin: expect.any(Date) },
      )
    })

    it("should throw error for non-existent user", async () => {
      // Arrange: User not found
      jest.spyOn(userRepository, "findByEmailOrUsernameWithPassword").mockResolvedValue(null)

      // Act & Assert: Should throw unauthorized error
      await expect(service.login(loginDto)).rejects.toThrow(ERROR_MESSAGES.INVALID_CREDENTIALS)
    })

    it("should throw error for inactive user", async () => {
      // Arrange: User is inactive
      const inactiveUser = { ...mockUser, isActive: false }
      jest.spyOn(userRepository, "findByEmailOrUsernameWithPassword").mockResolvedValue(inactiveUser)

      // Act & Assert: Should throw unauthorized error
      await expect(service.login(loginDto)).rejects.toThrow(ERROR_MESSAGES.INVALID_CREDENTIALS)
    })

    it("should throw error for invalid password", async () => {
      // Arrange: Wrong password
      jest.spyOn(userRepository, "findByEmailOrUsernameWithPassword").mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false as never)

      // Act & Assert: Should throw unauthorized error
      await expect(service.login(loginDto)).rejects.toThrow(ERROR_MESSAGES.INVALID_CREDENTIALS)
    })

    it("should auto-promote super admin to manager role", async () => {
      // Arrange: Super admin login with non-manager role
      const superAdminUser = { ...mockUser, email: "admin@example.com", role: "client" }
      jest.spyOn(userRepository, "findByEmailOrUsernameWithPassword").mockResolvedValue(superAdminUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true as never)
      jest.spyOn(userRepository, "update").mockResolvedValue(undefined);
      jest.spyOn(configService, "get").mockReturnValue("admin@example.com")

      // Act: Super admin login
      const result = await service.login({ email: "admin@example.com", password: "admin123" })

      // Assert: User promoted to manager
      expect(userRepository.update).toHaveBeenCalledWith(
        superAdminUser.id,
        { role: "manager" },
      )
      expect(result.user.isSuperAdmin).toBe(true)
    })

    it("should accept username instead of email for login", async () => {
      // Arrange: Login with username
      jest.spyOn(userRepository, "findByEmailOrUsernameWithPassword").mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true as never)
      jest.spyOn(userRepository, "update").mockResolvedValue(undefined);
      jest.spyOn(configService, "get").mockReturnValue("")

      // Act: Login with username
      const result = await service.login({ email: "testuser", password: "password123" })

      // Assert: Login successful
      expect(result).toHaveProperty("token")
      expect(userRepository.findByEmailOrUsernameWithPassword).toHaveBeenCalled()
    })
  })

  describe("validateUser", () => {
    it("should return user without password for valid credentials", async () => {
      // Arrange: Valid credentials
      jest.spyOn(userRepository, "findByEmailOrUsernameWithPassword").mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true as never)

      // Act: Validate user
      const result = await service.validateUser("test@example.com", "password123")

      // Assert: Returns user without passwordHash
      expect(result).toBeDefined()
      expect(result).not.toHaveProperty("passwordHash")
      expect(result.email).toBe(mockUser.email)
    })

    it("should return null for invalid credentials", async () => {
      // Arrange: Invalid password
      jest.spyOn(userRepository, "findByEmailOrUsernameWithPassword").mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false as never)

      // Act: Validate user
      const result = await service.validateUser("test@example.com", "wrongpassword")

      // Assert: Returns null
      expect(result).toBeNull()
    })

    it("should return null for non-existent user", async () => {
      // Arrange: User not found
      jest.spyOn(userRepository, "findByEmailOrUsernameWithPassword").mockResolvedValue(null)

      // Act: Validate user
      const result = await service.validateUser("notfound@example.com", "password123")

      // Assert: Returns null
      expect(result).toBeNull()
    })
  })

  describe("resetPassword", () => {
    it("should successfully reset password with valid OTP", async () => {
      // Arrange: Valid OTP and user exists
      jest.spyOn(otpService, "verifyEmailOtp").mockResolvedValue({ verified: true })
      jest.spyOn(userRepository, "findByEmail").mockResolvedValue(mockUser);
      jest.spyOn(userRepository, "update").mockResolvedValue(undefined);
      (bcrypt.hash as jest.Mock).mockResolvedValue("new-hashed-password" as never)

      // Act: Reset password
      const result = await service.resetPassword("test@example.com", "123456", "newpassword123")

      // Assert: Password updated
      expect(result).toEqual({ message: "Password reset successfully" })
      expect(otpService.verifyEmailOtp).toHaveBeenCalledWith("reset:test@example.com", "123456")
      expect(userRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        { passwordHash: "new-hashed-password" },
      )
    })

    it("should throw error if user not found", async () => {
      // Arrange: OTP valid but user not found
      jest.spyOn(otpService, "verifyEmailOtp").mockResolvedValue({ verified: true })
      jest.spyOn(userRepository, "findByEmail").mockResolvedValue(null)

      // Act & Assert: Should throw not found error
      await expect(
        service.resetPassword("notfound@example.com", "123456", "newpassword"),
      ).rejects.toThrow()
    })
  })

  describe("isUsernameAvailable", () => {
    it("should return true if username is available", async () => {
      // Arrange: Username not found
      jest.spyOn(userRepository, "findByUsernameOptional").mockResolvedValue(null)

      // Act: Check availability
      const result = await service.isUsernameAvailable("newusername")

      // Assert: Available
      expect(result).toBe(true)
    })

    it("should return false if username is taken", async () => {
      // Arrange: Username exists
      jest.spyOn(userRepository, "findByUsernameOptional").mockResolvedValue(mockUser);

      // Act: Check availability
      const result = await service.isUsernameAvailable("testuser")

      // Assert: Not available
      expect(result).toBe(false)
    })

    it("should be case-insensitive", async () => {
      // Arrange: Username exists with different case
      jest.spyOn(userRepository, "findByUsernameOptional").mockResolvedValue(mockUser);

      // Act: Check with different case
      const result = await service.isUsernameAvailable("TESTUSER")

      // Assert: Not available
      expect(result).toBe(false)
    })
  })

  describe("findById", () => {
    it("should return user by ID", async () => {
      // Arrange: User exists
      jest.spyOn(userRepository, "findByIdOptional").mockResolvedValue(mockUser);

      // Act: Find user
      const result = await service.findById("user-123")

      // Assert: Returns user
      expect(result).toEqual(mockUser)
      expect(userRepository.findByIdOptional).toHaveBeenCalledWith("user-123")
    })

    it("should return null if user not found", async () => {
      // Arrange: User not found
      jest.spyOn(userRepository, "findByIdOptional").mockResolvedValue(null)

      // Act: Find user
      const result = await service.findById("nonexistent")

      // Assert: Returns null
      expect(result).toBeNull()
    })
  })

  describe("sendEmailOtp", () => {
    it("should delegate to OtpService", async () => {
      // Arrange: OtpService ready
      jest.spyOn(otpService, "sendEmailOtp").mockResolvedValue({ message: "OTP sent" })

      // Act: Send OTP
      const result = await service.sendEmailOtp("test@example.com")

      // Assert: Delegates to OtpService
      expect(result).toEqual({ message: "OTP sent" })
      expect(otpService.sendEmailOtp).toHaveBeenCalledWith("test@example.com")
    })
  })

  describe("verifyEmailOtp", () => {
    it("should delegate to OtpService", async () => {
      // Arrange: OtpService ready
      jest.spyOn(otpService, "verifyEmailOtp").mockResolvedValue({ verified: true })

      // Act: Verify OTP
      const result = await service.verifyEmailOtp("test@example.com", "123456")

      // Assert: Delegates to OtpService
      expect(result).toEqual({ verified: true })
      expect(otpService.verifyEmailOtp).toHaveBeenCalledWith("test@example.com", "123456")
    })
  })

  describe("sendPasswordResetOtp", () => {
    it("should delegate to OtpService", async () => {
      // Arrange: OtpService ready
      jest.spyOn(otpService, "sendPasswordResetOtp").mockResolvedValue({ message: "Reset code sent" })

      // Act: Send reset OTP
      const result = await service.sendPasswordResetOtp("test@example.com")

      // Assert: Delegates to OtpService
      expect(result).toEqual({ message: "Reset code sent" })
      expect(otpService.sendPasswordResetOtp).toHaveBeenCalledWith("test@example.com")
    })
  })
})
