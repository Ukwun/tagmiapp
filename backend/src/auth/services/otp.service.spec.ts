/**
 * OtpService Test Suite
 */
import { Test, TestingModule } from "@nestjs/testing"
import { BadRequestException } from "@nestjs/common"
import { OtpService } from "./otp.service"
import { ERROR_MESSAGES } from "../../common/constants/error-messages.constant"
import { UserRepository } from "../../users/repositories/user.repository"
import { OtpRepository } from "../repositories/otp.repository"
import { EmailService } from "../../email/email.service"

describe("OtpService", () => {
  let service: OtpService
  let otpRepository: any
  let userRepository: any
  let emailService: any

  const mockEmailOtp = {
    id: "otp-123",
    email: "test@example.com",
    code: "123456",
    verified: false,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    createdAt: new Date(),
  }

  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    username: "testuser",
    isActive: true,
  }

  beforeEach(async () => {
    const mockOtpRepository = {
      findRecentOtp: jest.fn(),
      findValidOtp: jest.fn(),
      findVerifiedOtp: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    }

    const mockUserRepository = {
      findByEmail: jest.fn(),
    }

    const mockEmailService = {
      sendVerificationCode: jest.fn(),
      sendPasswordResetCode: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: OtpRepository, useValue: mockOtpRepository },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile()

    service = module.get<OtpService>(OtpService)
    otpRepository = module.get<OtpRepository>(OtpRepository)
    userRepository = module.get<UserRepository>(UserRepository)
    emailService = module.get<EmailService>(EmailService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("sendEmailOtp", () => {
    it("should successfully send OTP to new email", async () => {
      // Arrange
      jest.spyOn(userRepository, "findByEmail").mockResolvedValue(null)
      jest.spyOn(otpRepository, "findRecentOtp").mockResolvedValue(null)
      jest.spyOn(otpRepository, "create").mockResolvedValue(mockEmailOtp)

      // Act
      const result = await service.sendEmailOtp("newuser@example.com")

      // Assert
      expect(result).toEqual({ message: expect.stringContaining("sent") })
      expect(emailService.sendVerificationCode).toHaveBeenCalled()
    })

    it("should throw error if email is already registered", async () => {
      // Arrange
      jest.spyOn(userRepository, "findByEmail").mockResolvedValue(mockUser)

      // Act & Assert
      await expect(service.sendEmailOtp("test@example.com")).rejects.toThrow(
        ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
      )
    })

    it("should enforce rate limiting", async () => {
      // Arrange
      const recentOtp = { ...mockEmailOtp, createdAt: new Date(Date.now() - 60 * 1000) }
      jest.spyOn(userRepository, "findByEmail").mockResolvedValue(null)
      jest.spyOn(otpRepository, "findRecentOtp").mockResolvedValue(recentOtp)

      // Act & Assert
      await expect(service.sendEmailOtp("test@example.com")).rejects.toThrow(
        ERROR_MESSAGES.OTP_RATE_LIMIT,
      )
    })
  })

  describe("verifyEmailOtp", () => {
    it("should verify valid OTP", async () => {
      // Arrange
      jest.spyOn(otpRepository, "findValidOtp").mockResolvedValue(mockEmailOtp)
      jest.spyOn(otpRepository, "save").mockResolvedValue({ ...mockEmailOtp, verified: true })

      // Act
      const result = await service.verifyEmailOtp("test@example.com", "123456")

      // Assert
      expect(result).toEqual({ verified: true })
      expect(otpRepository.save).toHaveBeenCalled()
    })

    it("should throw error for invalid OTP", async () => {
      // Arrange
      jest.spyOn(otpRepository, "findValidOtp").mockResolvedValue(null)

      // Act & Assert
      await expect(service.verifyEmailOtp("test@example.com", "wrong")).rejects.toThrow(
        ERROR_MESSAGES.OTP_INVALID,
      )
    })
  })

  describe("isEmailVerified", () => {
    it("should return true for verified email", async () => {
      // Arrange
      jest.spyOn(otpRepository, "findVerifiedOtp").mockResolvedValue(mockEmailOtp)

      // Act
      const result = await service.isEmailVerified("test@example.com")

      // Assert
      expect(result).toBe(true)
    })

    it("should return false for unverified email", async () => {
      // Arrange
      jest.spyOn(otpRepository, "findVerifiedOtp").mockResolvedValue(null)

      // Act
      const result = await service.isEmailVerified("test@example.com")

      // Assert
      expect(result).toBe(false)
    })
  })

  describe("sendPasswordResetOtp", () => {
    it("should send reset code to existing user", async () => {
      // Arrange
      jest.spyOn(userRepository, "findByEmail").mockResolvedValue(mockUser)
      jest.spyOn(otpRepository, "findRecentOtp").mockResolvedValue(null)
      jest.spyOn(otpRepository, "create").mockResolvedValue(mockEmailOtp)

      // Act
      const result = await service.sendPasswordResetOtp("test@example.com")

      // Assert
      expect(result.message).toContain("reset code")
      expect(emailService.sendPasswordResetCode).toHaveBeenCalled()
    })

    it("should silently succeed for non-existent email", async () => {
      // Arrange
      jest.spyOn(userRepository, "findByEmail").mockResolvedValue(null)

      // Act
      const result = await service.sendPasswordResetOtp("nonexistent@example.com")

      // Assert
      expect(result.message).toContain("reset code")
      expect(emailService.sendPasswordResetCode).not.toHaveBeenCalled()
    })
  })
})
