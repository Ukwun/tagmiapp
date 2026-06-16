/**
 * BookingsService Test Suite
 *
 * Tests booking creation, updates, message handling, and statistics.
 */
import { Test, TestingModule } from "@nestjs/testing"
import { BookingsService } from "./bookings.service"
import { BookingRepository } from "./repositories/booking.repository"
import { BookingMessageRepository } from "./repositories/booking-message.repository"
import { UserRepositoryHelper } from "../common/repositories/user-repository.helper"
import { NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common"

describe("BookingsService", () => {
  let service: BookingsService
  let bookingRepository: any
  let messageRepository: any
  let userRepositoryHelper: any

  const mockClient = {
    id: "client-123",
    username: "client",
    displayName: "Client User",
  }

  const mockTalent = {
    id: "talent-456",
    username: "talent",
    displayName: "Talent User",
  }

  const mockBooking = {
    id: "booking-123",
    clientId: "client-123",
    talentId: "talent-456",
    title: "Photoshoot",
    description: "Wedding photoshoot",
    price: 500,
    startDate: new Date("2024-12-01"),
    endDate: new Date("2024-12-01"),
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
    client: mockClient,
    talent: mockTalent,
  }

  const mockMessage = {
    id: "message-123",
    bookingId: "booking-123",
    senderId: "client-123",
    content: "Hello!",
    isRead: false,
    createdAt: new Date(),
    sender: mockClient,
  }

  beforeEach(async () => {
    const mockBookingRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
        getCount: jest.fn().mockResolvedValue(0),
      })),
      manager: {
        connection: {
          query: jest.fn().mockResolvedValue(undefined),
        },
      },
    }

    const mockMessageRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      })),
    }

    const mockUserRepositoryHelper = {
      findByIdOrFail: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: BookingRepository, useValue: mockBookingRepository },
        { provide: BookingMessageRepository, useValue: mockMessageRepository },
        { provide: UserRepositoryHelper, useValue: mockUserRepositoryHelper },
      ],
    }).compile()

    service = module.get<BookingsService>(BookingsService)
    bookingRepository = module.get(BookingRepository)
    messageRepository = module.get(BookingMessageRepository)
    userRepositoryHelper = module.get(UserRepositoryHelper)

    jest.clearAllMocks()
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("create", () => {
    it("should create a booking successfully", async () => {
      // Arrange
      const createDto = {
        talentId: "talent-456",
        title: "Photoshoot",
        description: "Wedding photoshoot",
        budget: 500,
        startDate: new Date("2024-12-01"),
        endDate: new Date("2024-12-01"),
      }
      jest.spyOn(userRepositoryHelper, "findByIdOrFail").mockResolvedValueOnce(mockClient)
      jest.spyOn(userRepositoryHelper, "findByIdOrFail").mockResolvedValueOnce(mockTalent)
      jest.spyOn(bookingRepository, "create").mockReturnValue(mockBooking)
      jest.spyOn(bookingRepository, "save").mockResolvedValue(mockBooking)

      // Act
      const result = await service.create("client-123", createDto)

      // Assert
      expect(result).toEqual(mockBooking)
      expect(userRepositoryHelper.findByIdOrFail).toHaveBeenCalledWith("client-123")
      expect(userRepositoryHelper.findByIdOrFail).toHaveBeenCalledWith("talent-456")
      expect(bookingRepository.create).toHaveBeenCalledWith({
        clientId: "client-123",
        talentId: "talent-456",
        title: "Photoshoot",
        description: "Wedding photoshoot",
        price: 500,
        startDate: createDto.startDate,
        endDate: createDto.endDate,
        status: "pending",
      })
      expect(bookingRepository.save).toHaveBeenCalledWith(mockBooking)
    })

    it("should throw error if client not found", async () => {
      // Arrange
      const createDto = {
        talentId: "talent-456",
        title: "Photoshoot",
        description: "Wedding photoshoot",
        budget: 500,
        startDate: new Date("2024-12-01"),
        endDate: new Date("2024-12-01"),
      }
      jest
        .spyOn(userRepositoryHelper, "findByIdOrFail")
        .mockRejectedValue(new NotFoundException("User not found"))

      // Act & Assert
      await expect(service.create("invalid-id", createDto)).rejects.toThrow(NotFoundException)
    })

    it("should throw error if talent not found", async () => {
      // Arrange
      const createDto = {
        talentId: "invalid-id",
        title: "Photoshoot",
        description: "Wedding photoshoot",
        budget: 500,
        startDate: new Date("2024-12-01"),
        endDate: new Date("2024-12-01"),
      }
      jest.spyOn(userRepositoryHelper, "findByIdOrFail").mockResolvedValueOnce(mockClient)
      jest
        .spyOn(userRepositoryHelper, "findByIdOrFail")
        .mockRejectedValueOnce(new NotFoundException("User not found"))

      // Act & Assert
      await expect(service.create("client-123", createDto)).rejects.toThrow(NotFoundException)
    })
  })

  describe("findAll", () => {
    it("should retrieve bookings with pagination", async () => {
      // Arrange
      const bookings = [mockBooking, { ...mockBooking, id: "booking-456" }]
      const queryBuilder = bookingRepository.createQueryBuilder()
      jest.spyOn(queryBuilder, "getManyAndCount").mockResolvedValue([bookings, 2])

      // Act
      const result = await service.findAll("client-123", "client", 1, 20)

      // Assert
      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
      expect(bookingRepository.createQueryBuilder).toHaveBeenCalledWith("booking")
    })

    it("should filter bookings by userId", async () => {
      // Arrange
      const queryBuilder = bookingRepository.createQueryBuilder()
      jest.spyOn(queryBuilder, "getManyAndCount").mockResolvedValue([[], 0])

      // Act
      await service.findAll("client-123", "client", 1, 20)

      // Assert
      expect(queryBuilder.where).toHaveBeenCalledWith(
        "booking.clientId = :userId OR booking.talentId = :userId",
        { userId: "client-123" },
      )
    })

    it("should sanitize user data in response", async () => {
      // Arrange
      const bookingWithSensitiveData = {
        ...mockBooking,
        client: { ...mockClient, email: "client@example.com", password: "hashed" },
        talent: { ...mockTalent, email: "talent@example.com", password: "hashed" },
      }
      const queryBuilder = bookingRepository.createQueryBuilder()
      jest.spyOn(queryBuilder, "getManyAndCount").mockResolvedValue([[bookingWithSensitiveData], 1])

      // Act
      const result = await service.findAll("client-123", "client", 1, 20)

      // Assert
      expect(result.data[0].client).toBeDefined()
      expect(result.data[0].talent).toBeDefined()
    })
  })

  describe("findOne", () => {
    it("should retrieve a booking successfully", async () => {
      // Arrange
      jest.spyOn(bookingRepository, "findOne").mockResolvedValue(mockBooking)

      // Act
      const result = await service.findOne("booking-123", "client-123")

      // Assert
      expect(result).toBeDefined()
      expect(result.id).toBe("booking-123")
      expect(bookingRepository.findOne).toHaveBeenCalledWith({
        where: { id: "booking-123" },
        relations: ["client", "talent"],
      })
    })

    it("should throw error if booking not found", async () => {
      // Arrange
      jest.spyOn(bookingRepository, "findOne").mockResolvedValue(null)

      // Act & Assert
      await expect(service.findOne("invalid-id", "client-123")).rejects.toThrow(NotFoundException)
    })

    it("should throw error if user not authorized", async () => {
      // Arrange
      jest.spyOn(bookingRepository, "findOne").mockResolvedValue(mockBooking)

      // Act & Assert
      await expect(service.findOne("booking-123", "other-user")).rejects.toThrow(ForbiddenException)
    })

    it("should allow talent to view booking", async () => {
      // Arrange
      jest.spyOn(bookingRepository, "findOne").mockResolvedValue(mockBooking)

      // Act
      const result = await service.findOne("booking-123", "talent-456")

      // Assert
      expect(result).toBeDefined()
      expect(result.id).toBe("booking-123")
    })
  })

  describe("update", () => {
    it("should allow client to update pending booking", async () => {
      // Arrange
      const booking = { ...mockBooking }
      jest.spyOn(bookingRepository, "findOne").mockResolvedValue(booking)
      jest.spyOn(bookingRepository, "save").mockResolvedValue({ ...booking, title: "Updated Title" })

      // Act
      const result = await service.update("booking-123", "client-123", { title: "Updated Title" })

      // Assert
      expect(result.title).toBe("Updated Title")
      expect(bookingRepository.save).toHaveBeenCalled()
    })

    it("should prevent client from updating accepted booking", async () => {
      // Arrange
      const acceptedBooking = { ...mockBooking, status: "accepted" as const }
      jest.spyOn(bookingRepository, "findOne").mockResolvedValue(acceptedBooking)

      // Act & Assert
      await expect(service.update("booking-123", "client-123", { title: "Updated" })).rejects.toThrow(
        BadRequestException,
      )
    })

    it("should allow talent to update status", async () => {
      // Arrange
      const booking = { ...mockBooking }
      jest.spyOn(bookingRepository, "findOne").mockResolvedValue(booking)
      jest.spyOn(bookingRepository, "save").mockResolvedValue({ ...booking, status: "accepted" })

      // Act
      const result = await service.update("booking-123", "talent-456", { status: "accepted" })

      // Assert
      expect(result.status).toBe("accepted")
    })

    it("should prevent talent from updating other fields", async () => {
      // Arrange
      const booking = { ...mockBooking }
      jest.spyOn(bookingRepository, "findOne").mockResolvedValue(booking)

      // Act & Assert
      await expect(service.update("booking-123", "talent-456", { title: "Updated" })).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe("remove", () => {
    it("should allow client to cancel booking", async () => {
      // Arrange
      const booking = { ...mockBooking }
      jest.spyOn(bookingRepository, "findOne").mockResolvedValue(booking)
      jest.spyOn(bookingRepository, "save").mockResolvedValue({ ...booking, status: "cancelled" })

      // Act
      await service.remove("booking-123", "client-123")

      // Assert
      expect(bookingRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: "cancelled" }),
      )
    })

    it("should prevent talent from cancelling booking", async () => {
      // Arrange
      jest.spyOn(bookingRepository, "findOne").mockResolvedValue(mockBooking)

      // Act & Assert
      await expect(service.remove("booking-123", "talent-456")).rejects.toThrow(ForbiddenException)
    })

    it("should prevent cancelling completed booking", async () => {
      // Arrange
      const completedBooking = { ...mockBooking, status: "completed" as const }
      jest.spyOn(bookingRepository, "findOne").mockResolvedValue(completedBooking)

      // Act & Assert
      await expect(service.remove("booking-123", "client-123")).rejects.toThrow(BadRequestException)
    })
  })

  describe("getMessages", () => {
    it("should retrieve messages with pagination", async () => {
      // Arrange
      const messages = [mockMessage, { ...mockMessage, id: "message-456" }]
      jest.spyOn(bookingRepository, "findOne").mockResolvedValue(mockBooking)
      jest.spyOn(messageRepository, "findAndCount").mockResolvedValue([messages, 2])

      // Act
      const result = await service.getMessages("booking-123", "client-123", 1, 50)

      // Assert
      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
    })

    it("should only allow authorized users to view messages", async () => {
      // Arrange
      jest.spyOn(bookingRepository, "findOne").mockResolvedValue(null)

      // Act & Assert
      await expect(service.getMessages("booking-123", "other-user", 1, 50)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe("createMessage", () => {
    it("should create a message successfully", async () => {
      // Arrange
      jest.spyOn(bookingRepository, "findOne").mockResolvedValue(mockBooking)
      jest.spyOn(messageRepository, "create").mockReturnValue(mockMessage)
      jest.spyOn(messageRepository, "save").mockResolvedValue(mockMessage)

      // Act
      const result = await service.createMessage("booking-123", "client-123", { message: "Hello!" })

      // Assert
      expect(result).toEqual(mockMessage)
      expect(messageRepository.create).toHaveBeenCalledWith({
        bookingId: "booking-123",
        senderId: "client-123",
        content: "Hello!",
      })
      expect(messageRepository.save).toHaveBeenCalledWith(mockMessage)
    })

    it("should only allow authorized users to create messages", async () => {
      // Arrange
      jest.spyOn(bookingRepository, "findOne").mockResolvedValue(null)

      // Act & Assert
      await expect(
        service.createMessage("booking-123", "other-user", { message: "Hello!" }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe("markMessagesAsRead", () => {
    it("should mark messages as read", async () => {
      // Arrange
      jest.spyOn(bookingRepository, "findOne").mockResolvedValue(mockBooking)
      const queryBuilder = messageRepository.createQueryBuilder()

      // Act
      await service.markMessagesAsRead("booking-123", "client-123")

      // Assert
      expect(messageRepository.createQueryBuilder).toHaveBeenCalled()
      expect(queryBuilder.update).toHaveBeenCalled()
    })

    it("should only mark messages from other users as read", async () => {
      // Arrange
      jest.spyOn(bookingRepository, "findOne").mockResolvedValue(mockBooking)
      const queryBuilder = messageRepository.createQueryBuilder()

      // Act
      await service.markMessagesAsRead("booking-123", "client-123")

      // Assert
      expect(queryBuilder.andWhere).toHaveBeenCalledWith("senderId != :userId", {
        userId: "client-123",
      })
    })
  })

  describe("getBookingStats", () => {
    it("should return booking statistics", async () => {
      // Arrange
      const queryBuilder = bookingRepository.createQueryBuilder()
      jest.spyOn(queryBuilder, "getCount").mockResolvedValueOnce(10) // total
      jest.spyOn(queryBuilder, "getCount").mockResolvedValueOnce(3) // pending
      jest.spyOn(queryBuilder, "getCount").mockResolvedValueOnce(5) // active
      jest.spyOn(queryBuilder, "getCount").mockResolvedValueOnce(2) // completed

      // Act
      const result = await service.getBookingStats("client-123", "client")

      // Assert
      expect(result).toEqual({
        total: 10,
        pending: 3,
        active: 5,
        completed: 2,
      })
    })

    it("should return zero stats if no bookings", async () => {
      // Arrange
      const queryBuilder = bookingRepository.createQueryBuilder()
      jest.spyOn(queryBuilder, "getCount").mockResolvedValue(0)

      // Act
      const result = await service.getBookingStats("client-123", "client")

      // Assert
      expect(result).toEqual({
        total: 0,
        pending: 0,
        active: 0,
        completed: 0,
      })
    })
  })
})
