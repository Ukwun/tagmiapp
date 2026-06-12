/**
 * AuthController Test Suite
 *
 * Tests all auth HTTP endpoints: registration, login, OTP verification,
 * password resets, username availability, and profile retrieval.
 */
import { Test, TestingModule } from "@nestjs/testing"
import { ConfigService } from "@nestjs/config"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import {
  SendOtpDto,
  VerifyOtpDto,
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  CheckUsernameDto,
} from "./dto"

describe("AuthController", () => {
  let controller: AuthController
  let authService: AuthService
  let configService: ConfigService

  const mockAuthService = {
    sendEmailOtp: jest.fn(),
    verifyEmailOtp: jest.fn(),
    register: jest.fn(),
    login: jest.fn(),
    sendPasswordResetOtp: jest.fn(),
    resetPassword: jest.fn(),
    isUsernameAvailable: jest.fn(),
  }

  const mockConfigService = {
    get: jest.fn(),
  }

  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    username: "testuser",
    displayName: "Test User",
    role: "client",
    isActive: true,
    isVerified: false,
    createdAt: new Date(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    })
      .overrideGuard(require("@nestjs/throttler").ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<AuthController>(AuthController)
    authService = module.get<AuthService>(AuthService)
    configService = module.get<ConfigService>(ConfigService)

    // Reset all mocks before each test
    jest.clearAllMocks()
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })

  describe("sendOtp", () => {
    it("should send OTP successfully", async () => {
      // Arrange: Valid email
      const dto: SendOtpDto = { email: "test@example.com" }
      const expectedResponse = { message: "Verification code sent to your email" }
      jest.spyOn(authService, "sendEmailOtp").mockResolvedValue(expectedResponse)

      // Act: Send OTP
      const result = await controller.sendOtp(dto)

      // Assert: OTP sent
      expect(result).toEqual(expectedResponse)
      expect(authService.sendEmailOtp).toHaveBeenCalledWith("test@example.com")
    })
  })

  describe("verifyOtp", () => {
    it("should verify OTP successfully", async () => {
      // Arrange: Valid email and code
      const dto: VerifyOtpDto = { email: "test@example.com", code: "123456" }
      const expectedResponse = { verified: true }
      jest.spyOn(authService, "verifyEmailOtp").mockResolvedValue(expectedResponse)

      // Act: Verify OTP
      const result = await controller.verifyOtp(dto)

      // Assert: OTP verified
      expect(result).toEqual(expectedResponse)
      expect(authService.verifyEmailOtp).toHaveBeenCalledWith("test@example.com", "123456")
    })
  })

  describe("register", () => {
    it("should register new user successfully", async () => {
      // Arrange: Valid registration data
      const dto: RegisterDto = {
        email: "newuser@example.com",
        username: "newuser",
        password: "password123",
        displayName: "New User",
        interests: ["music"],
        role: "client",
      }
      const expectedResponse = {
        token: "jwt-token",
        user: mockUser,
      }
      jest.spyOn(authService, "register").mockResolvedValue(expectedResponse as any)

      // Act: Register
      const result = await controller.register(dto)

      // Assert: User registered
      expect(result).toEqual(expectedResponse)
      expect(authService.register).toHaveBeenCalledWith(dto)
    })

    it("should handle registration with referral code", async () => {
      // Arrange: Registration with referral
      const dto: RegisterDto = {
        email: "newuser@example.com",
        username: "newuser",
        password: "password123",
        referralCode: "REF123",
        fingerprint: "abc123",
      }
      const expectedResponse = {
        token: "jwt-token",
        user: mockUser,
      }
      jest.spyOn(authService, "register").mockResolvedValue(expectedResponse as any)

      // Act: Register with referral
      const result = await controller.register(dto)

      // Assert: Registration successful
      expect(result).toEqual(expectedResponse)
      expect(authService.register).toHaveBeenCalledWith(dto)
    })
  })

  describe("login", () => {
    it("should login with valid credentials", async () => {
      // Arrange: Valid login credentials
      const dto: LoginDto = {
        email: "test@example.com",
        password: "password123",
      }
      const expectedResponse = {
        token: "jwt-token",
        user: mockUser,
      }
      jest.spyOn(authService, "login").mockResolvedValue(expectedResponse as any)

      // Act: Login
      const result = await controller.login(dto)

      // Assert: Login successful
      expect(result).toEqual(expectedResponse)
      expect(authService.login).toHaveBeenCalledWith(dto)
    })

    it("should login with username instead of email", async () => {
      // Arrange: Login with username
      const dto: LoginDto = {
        email: "testuser",
        password: "password123",
      }
      const expectedResponse = {
        token: "jwt-token",
        user: mockUser,
      }
      jest.spyOn(authService, "login").mockResolvedValue(expectedResponse as any)

      // Act: Login
      const result = await controller.login(dto)

      // Assert: Login successful
      expect(result).toEqual(expectedResponse)
      expect(authService.login).toHaveBeenCalledWith(dto)
    })
  })

  describe("forgotPassword", () => {
    it("should send password reset OTP", async () => {
      // Arrange: Valid email
      const dto: ForgotPasswordDto = { email: "test@example.com" }
      const expectedResponse = { message: "Password reset code sent to your email" }
      jest.spyOn(authService, "sendPasswordResetOtp").mockResolvedValue(expectedResponse)

      // Act: Send reset OTP
      const result = await controller.forgotPassword(dto)

      // Assert: Reset OTP sent
      expect(result).toEqual(expectedResponse)
      expect(authService.sendPasswordResetOtp).toHaveBeenCalledWith("test@example.com")
    })
  })

  describe("resetPassword", () => {
    it("should reset password with valid OTP", async () => {
      // Arrange: Valid reset request
      const dto: ResetPasswordDto = {
        email: "test@example.com",
        code: "123456",
        newPassword: "newpassword123",
      }
      const expectedResponse = { message: "Password reset successfully" }
      jest.spyOn(authService, "resetPassword").mockResolvedValue(expectedResponse)

      // Act: Reset password
      const result = await controller.resetPassword(dto)

      // Assert: Password reset
      expect(result).toEqual(expectedResponse)
      expect(authService.resetPassword).toHaveBeenCalledWith(
        "test@example.com",
        "123456",
        "newpassword123",
      )
    })
  })

  describe("checkUsername", () => {
    it("should return true if username is available", async () => {
      // Arrange: Available username
      const dto: CheckUsernameDto = { username: "newusername" }
      jest.spyOn(authService, "isUsernameAvailable").mockResolvedValue(true)

      // Act: Check username
      const result = await controller.checkUsername(dto)

      // Assert: Username available
      expect(result).toEqual({ username: "newusername", available: true })
      expect(authService.isUsernameAvailable).toHaveBeenCalledWith("newusername")
    })

    it("should return false if username is taken", async () => {
      // Arrange: Taken username
      const dto: CheckUsernameDto = { username: "testuser" }
      jest.spyOn(authService, "isUsernameAvailable").mockResolvedValue(false)

      // Act: Check username
      const result = await controller.checkUsername(dto)

      // Assert: Username not available
      expect(result).toEqual({ username: "testuser", available: false })
      expect(authService.isUsernameAvailable).toHaveBeenCalledWith("testuser")
    })
  })

  describe("getProfile", () => {
    it("should return user profile for authenticated user", async () => {
      // Arrange: Authenticated user
      const mockRequest = {
        user: mockUser,
      }
      jest.spyOn(configService, "get").mockReturnValue("")

      // Act: Get profile
      const result = await controller.getProfile(mockRequest)

      // Assert: Profile returned
      expect(result).toHaveProperty("id", mockUser.id)
      expect(result).toHaveProperty("email", mockUser.email)
      expect(result).toHaveProperty("username", mockUser.username)
      expect(result.isSuperAdmin).toBe(false)
    })

    it("should mark super admin in profile", async () => {
      // Arrange: Super admin user
      const superAdminUser = { ...mockUser, email: "admin@example.com", role: "manager" }
      const mockRequest = {
        user: superAdminUser,
      }
      jest.spyOn(configService, "get").mockReturnValue("admin@example.com")

      // Act: Get profile
      const result = await controller.getProfile(mockRequest)

      // Assert: Super admin flag set
      expect(result.isSuperAdmin).toBe(true)
      expect(result.email).toBe("admin@example.com")
    })

    it("should handle case-insensitive super admin check", async () => {
      // Arrange: Super admin with different case
      const superAdminUser = { ...mockUser, email: "ADMIN@EXAMPLE.COM", role: "manager" }
      const mockRequest = {
        user: superAdminUser,
      }
      jest.spyOn(configService, "get").mockReturnValue("admin@example.com")

      // Act: Get profile
      const result = await controller.getProfile(mockRequest)

      // Assert: Super admin flag set
      expect(result.isSuperAdmin).toBe(true)
    })

    it("should not mark regular manager as super admin", async () => {
      // Arrange: Regular manager (not super admin)
      const managerUser = { ...mockUser, role: "manager" }
      const mockRequest = {
        user: managerUser,
      }
      jest.spyOn(configService, "get").mockReturnValue("superadmin@example.com")

      // Act: Get profile
      const result = await controller.getProfile(mockRequest)

      // Assert: Not marked as super admin
      expect(result.isSuperAdmin).toBe(false)
    })
  })
})
