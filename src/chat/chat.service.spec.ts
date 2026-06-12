/**
 * ChatService Test Suite
 *
 * Tests chat room creation, messaging, and media handling.
 */
import { Test, TestingModule } from "@nestjs/testing"
import { NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common"
import { ChatService } from "./chat.service"
import { ChatRoomRepository } from "./repositories/chat-room.repository"
import { ChatMessageRepository } from "./repositories/chat-message.repository"
import { UserRepository } from "../users/repositories/user.repository"
import { BookingRepository } from "../bookings/repositories/booking.repository"
import { StorageService } from "../config/storage.service"

describe("ChatService", () => {
  let service: ChatService
  let roomRepository: any
  let messageRepository: any
  let userRepository: any
  let bookingRepository: any
  let storageService: any

  const mockUser = {
    id: "user-123",
    username: "user1",
    displayName: "User One",
  }

  const mockOtherUser = {
    id: "user-456",
    username: "user2",
    displayName: "User Two",
  }

  const mockRoom = {
    id: "room-123",
    name: "Test Room",
    type: "direct",
    participants: [mockUser, mockOtherUser],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockMessage = {
    id: "msg-123",
    roomId: "room-123",
    senderId: "user-123",
    content: "Hello!",
    isRead: false,
    isDeleted: false,
    isEdited: false,
    createdAt: new Date(),
    sender: mockUser,
  }

  const mockBooking = {
    id: "booking-123",
    clientId: "user-123",
    talentId: "user-456",
    title: "Test Booking",
    client: mockUser,
    talent: mockOtherUser,
  }

  beforeEach(async () => {
    const mockRoomRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        innerJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getOne: jest.fn().mockResolvedValue(null),
        limit: jest.fn().mockReturnThis(),
      })),
    }

    const mockMessageRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      })),
    }

    const mockUserRepository = {
      findOne: jest.fn(),
      findByIds: jest.fn(),
    }

    const mockBookingRepository = {
      findOne: jest.fn(),
    }

    const mockStorageService = {
      uploadFile: jest.fn(),
      uploadVideo: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: ChatRoomRepository, useValue: mockRoomRepository },
        { provide: ChatMessageRepository, useValue: mockMessageRepository },
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: BookingRepository, useValue: mockBookingRepository },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile()

    service = module.get<ChatService>(ChatService)
    roomRepository = module.get(ChatRoomRepository)
    messageRepository = module.get(ChatMessageRepository)
    userRepository = module.get(UserRepository)
    bookingRepository = module.get(BookingRepository)
    storageService = module.get(StorageService)

    jest.clearAllMocks()
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("createRoom", () => {
    it("should create a direct room successfully", async () => {
      // Arrange
      const createRoomDto = {
        name: "Test Room",
        type: "direct" as const,
        participants: ["user-123", "user-456"],
      }
      jest.spyOn(userRepository, "findOne").mockResolvedValue(mockUser)
      jest.spyOn(userRepository, "findByIds").mockResolvedValue([mockUser, mockOtherUser])
      jest.spyOn(roomRepository, "create").mockReturnValue(mockRoom)
      jest.spyOn(roomRepository, "save").mockResolvedValue(mockRoom)

      // Act
      const result = await service.createRoom("user-123", createRoomDto)

      // Assert
      expect(result).toEqual(mockRoom)
      expect(roomRepository.create).toHaveBeenCalledWith({
        name: "Test Room",
        type: "direct",
        bookingId: undefined,
        participants: [mockUser, mockOtherUser],
      })
    })

    it("should create a booking room successfully", async () => {
      // Arrange
      const createRoomDto = {
        name: "Booking Room",
        type: "booking" as const,
        bookingId: "booking-123",
        participants: ["user-123", "user-456"],
      }
      jest.spyOn(userRepository, "findOne").mockResolvedValue(mockUser)
      jest.spyOn(bookingRepository, "findOne").mockResolvedValue(mockBooking)
      jest.spyOn(userRepository, "findByIds").mockResolvedValue([mockUser, mockOtherUser])
      jest.spyOn(roomRepository, "create").mockReturnValue(mockRoom)
      jest.spyOn(roomRepository, "save").mockResolvedValue(mockRoom)

      // Act
      const result = await service.createRoom("user-123", createRoomDto)

      // Assert
      expect(result).toEqual(mockRoom)
      expect(bookingRepository.findOne).toHaveBeenCalledWith({ where: { id: "booking-123" } })
    })

    it("should throw error if user not found", async () => {
      // Arrange
      const createRoomDto = {
        name: "Test Room",
        participants: ["user-123"],
      }
      jest.spyOn(userRepository, "findOne").mockResolvedValue(null)

      // Act & Assert
      await expect(service.createRoom("user-123", createRoomDto)).rejects.toThrow(NotFoundException)
    })

    it("should throw error if booking not found", async () => {
      // Arrange
      const createRoomDto = {
        name: "Booking Room",
        bookingId: "invalid-id",
        participants: ["user-123"],
      }
      jest.spyOn(userRepository, "findOne").mockResolvedValue(mockUser)
      jest.spyOn(bookingRepository, "findOne").mockResolvedValue(null)

      // Act & Assert
      await expect(service.createRoom("user-123", createRoomDto)).rejects.toThrow(NotFoundException)
    })

    it("should throw error if user not involved in booking", async () => {
      // Arrange
      const createRoomDto = {
        name: "Booking Room",
        bookingId: "booking-123",
        participants: ["other-user"],
      }
      const booking = { ...mockBooking, clientId: "other1", talentId: "other2" }
      jest.spyOn(userRepository, "findOne").mockResolvedValue({ id: "other-user" })
      jest.spyOn(bookingRepository, "findOne").mockResolvedValue(booking)

      // Act & Assert
      await expect(service.createRoom("other-user", createRoomDto)).rejects.toThrow(ForbiddenException)
    })
  })

  describe("getUserRooms", () => {
    it("should retrieve user rooms successfully", async () => {
      // Arrange
      const rooms = [mockRoom]
      const queryBuilder = roomRepository.createQueryBuilder()
      jest.spyOn(queryBuilder, "getMany").mockResolvedValue(rooms)
      const msgQueryBuilder = messageRepository.createQueryBuilder()
      jest.spyOn(msgQueryBuilder, "getOne").mockResolvedValue(mockMessage)
      jest.spyOn(messageRepository, "count").mockResolvedValue(2)

      // Act
      const result = await service.getUserRooms("user-123")

      // Assert
      expect(result).toHaveLength(1)
      expect((result[0] as any).lastMessage).toEqual(mockMessage)
      expect((result[0] as any).unreadCount).toBe(2)
    })

    it("should filter out invalid direct rooms", async () => {
      // Arrange
      const invalidRoom = { ...mockRoom, type: "direct", participants: [mockUser] }
      const queryBuilder = roomRepository.createQueryBuilder()
      jest.spyOn(queryBuilder, "getMany").mockResolvedValue([invalidRoom])

      // Act
      const result = await service.getUserRooms("user-123")

      // Assert
      expect(result).toHaveLength(0)
    })
  })

  describe("joinRoom", () => {
    it("should allow user to join room", async () => {
      // Arrange
      const room = { ...mockRoom, participants: [mockOtherUser] }
      jest.spyOn(roomRepository, "findOne").mockResolvedValue(room)
      jest.spyOn(userRepository, "findOne").mockResolvedValue(mockUser)
      jest.spyOn(roomRepository, "save").mockResolvedValue({ ...room, participants: [mockOtherUser, mockUser] })

      // Act
      const result = await service.joinRoom("room-123", "user-123")

      // Assert
      expect(result.participants).toContainEqual(mockUser)
      expect(roomRepository.save).toHaveBeenCalled()
    })

    it("should not add user if already participant", async () => {
      // Arrange
      jest.spyOn(roomRepository, "findOne").mockResolvedValue(mockRoom)

      // Act
      const result = await service.joinRoom("room-123", "user-123")

      // Assert
      expect(roomRepository.save).not.toHaveBeenCalled()
      expect(result).toEqual(mockRoom)
    })

    it("should throw error if room not found", async () => {
      // Arrange
      jest.spyOn(roomRepository, "findOne").mockResolvedValue(null)

      // Act & Assert
      await expect(service.joinRoom("invalid-id", "user-123")).rejects.toThrow(NotFoundException)
    })
  })

  describe("getRoomMessages", () => {
    it("should retrieve messages successfully", async () => {
      // Arrange
      const messages = [mockMessage, { ...mockMessage, id: "msg-456" }]
      jest.spyOn(roomRepository, "findOne").mockResolvedValueOnce(mockRoom).mockResolvedValueOnce(mockRoom)
      jest.spyOn(messageRepository, "findAndCount").mockResolvedValue([messages, 2])

      // Act
      const result = await service.getRoomMessages("room-123", "user-123", 1, 50)

      // Assert
      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(50)
    })

    it("should throw error if user has no access", async () => {
      // Arrange
      const roomWithoutUser = { ...mockRoom, participants: [mockOtherUser] }
      jest.spyOn(roomRepository, "findOne").mockResolvedValueOnce(mockRoom).mockResolvedValueOnce(roomWithoutUser)

      // Act & Assert
      await expect(service.getRoomMessages("room-123", "user-123", 1, 50)).rejects.toThrow(ForbiddenException)
    })

    it("should throw error if room not found", async () => {
      // Arrange
      jest.spyOn(roomRepository, "findOne").mockResolvedValue(null)

      // Act & Assert
      await expect(service.getRoomMessages("invalid-id", "user-123")).rejects.toThrow(NotFoundException)
    })
  })

  describe("createMessage", () => {
    it("should create message successfully", async () => {
      // Arrange
      const createMessageDto = { content: "Hello!" }
      jest.spyOn(roomRepository, "findOne").mockResolvedValue(mockRoom)
      jest.spyOn(messageRepository, "create").mockReturnValue(mockMessage)
      jest.spyOn(messageRepository, "save").mockResolvedValueOnce(mockMessage).mockResolvedValueOnce(mockRoom as any)
      jest.spyOn(roomRepository, "save").mockResolvedValue(mockRoom)
      jest.spyOn(messageRepository, "findOne").mockResolvedValue(mockMessage)

      // Act
      const result = await service.createMessage("room-123", "user-123", createMessageDto)

      // Assert
      expect(result).toEqual(mockMessage)
      expect(messageRepository.create).toHaveBeenCalledWith({
        roomId: "room-123",
        senderId: "user-123",
        content: "Hello!",
        replyToId: null,
      })
    })

    it("should throw error if user has no access", async () => {
      // Arrange
      const roomWithoutUser = { ...mockRoom, participants: [mockOtherUser] }
      jest.spyOn(roomRepository, "findOne").mockResolvedValue(roomWithoutUser)

      // Act & Assert
      await expect(service.createMessage("room-123", "user-123", { content: "Hello!" })).rejects.toThrow(ForbiddenException)
    })

    it("should throw error if room not found", async () => {
      // Arrange
      jest.spyOn(roomRepository, "findOne").mockResolvedValue(null)

      // Act & Assert
      await expect(service.createMessage("invalid-id", "user-123", { content: "Hello!" })).rejects.toThrow(NotFoundException)
    })
  })

  describe("markMessageAsRead", () => {
    it("should mark message as read successfully", async () => {
      // Arrange
      const unreadMessage = { ...mockMessage, isRead: false }
      jest.spyOn(messageRepository, "findOne").mockResolvedValue(unreadMessage)
      jest.spyOn(roomRepository, "findOne").mockResolvedValue(mockRoom)
      jest.spyOn(messageRepository, "save").mockResolvedValue({ ...unreadMessage, isRead: true })

      // Act
      await service.markMessageAsRead("msg-123", "user-456")

      // Assert
      expect(unreadMessage.isRead).toBe(true)
      expect(messageRepository.save).toHaveBeenCalled()
    })

    it("should not update if already read", async () => {
      // Arrange
      const readMessage = { ...mockMessage, isRead: true }
      jest.spyOn(messageRepository, "findOne").mockResolvedValue(readMessage)
      jest.spyOn(roomRepository, "findOne").mockResolvedValue(mockRoom)

      // Act
      await service.markMessageAsRead("msg-123", "user-456")

      // Assert
      expect(messageRepository.save).not.toHaveBeenCalled()
    })

    it("should throw error if message not found", async () => {
      // Arrange
      jest.spyOn(messageRepository, "findOne").mockResolvedValue(null)

      // Act & Assert
      await expect(service.markMessageAsRead("invalid-id", "user-123")).rejects.toThrow(NotFoundException)
    })
  })

  describe("getRoomUsers", () => {
    it("should return participant IDs", async () => {
      // Arrange
      jest.spyOn(roomRepository, "findOne").mockResolvedValue(mockRoom)

      // Act
      const result = await service.getRoomUsers("room-123")

      // Assert
      expect(result).toEqual(["user-123", "user-456"])
    })

    it("should return empty array if room not found", async () => {
      // Arrange
      jest.spyOn(roomRepository, "findOne").mockResolvedValue(null)

      // Act
      const result = await service.getRoomUsers("invalid-id")

      // Assert
      expect(result).toEqual([])
    })
  })

  describe("getOrCreateBookingRoom", () => {
    it("should return existing booking room", async () => {
      // Arrange
      jest.spyOn(roomRepository, "findOne").mockResolvedValue(mockRoom)

      // Act
      const result = await service.getOrCreateBookingRoom("booking-123", "user-123")

      // Assert
      expect(result).toEqual(mockRoom)
      expect(roomRepository.create).not.toHaveBeenCalled()
    })

    it("should create new booking room if not exists", async () => {
      // Arrange
      jest.spyOn(roomRepository, "findOne").mockResolvedValueOnce(null)
      jest.spyOn(bookingRepository, "findOne").mockResolvedValue(mockBooking)
      jest.spyOn(roomRepository, "create").mockReturnValue(mockRoom)
      jest.spyOn(roomRepository, "save").mockResolvedValue(mockRoom)

      // Act
      const result = await service.getOrCreateBookingRoom("booking-123", "user-123")

      // Assert
      expect(result).toEqual(mockRoom)
      expect(roomRepository.create).toHaveBeenCalled()
    })

    it("should throw error if booking not found", async () => {
      // Arrange
      jest.spyOn(roomRepository, "findOne").mockResolvedValue(null)
      jest.spyOn(bookingRepository, "findOne").mockResolvedValue(null)

      // Act & Assert
      await expect(service.getOrCreateBookingRoom("invalid-id", "user-123")).rejects.toThrow(NotFoundException)
    })

    it("should throw error if user not involved in booking", async () => {
      // Arrange
      const booking = { ...mockBooking, clientId: "other1", talentId: "other2" }
      jest.spyOn(roomRepository, "findOne").mockResolvedValue(null)
      jest.spyOn(bookingRepository, "findOne").mockResolvedValue(booking)

      // Act & Assert
      await expect(service.getOrCreateBookingRoom("booking-123", "user-123")).rejects.toThrow(ForbiddenException)
    })
  })

  describe("getOrCreateDirectRoom", () => {
    it("should return existing direct room", async () => {
      // Arrange
      const queryBuilder = roomRepository.createQueryBuilder()
      jest.spyOn(queryBuilder, "getMany").mockResolvedValue([mockRoom])

      // Act
      const result = await service.getOrCreateDirectRoom("user-123", "user-456")

      // Assert
      expect(result).toEqual(mockRoom)
      expect(roomRepository.create).not.toHaveBeenCalled()
    })

    it("should create new direct room if not exists", async () => {
      // Arrange
      const queryBuilder = roomRepository.createQueryBuilder()
      jest.spyOn(queryBuilder, "getMany").mockResolvedValue([])
      jest.spyOn(userRepository, "findOne").mockResolvedValueOnce(mockUser).mockResolvedValueOnce(mockOtherUser)
      jest.spyOn(roomRepository, "create").mockReturnValue(mockRoom)
      jest.spyOn(roomRepository, "save").mockResolvedValue(mockRoom)

      // Act
      const result = await service.getOrCreateDirectRoom("user-123", "user-456")

      // Assert
      expect(result).toEqual(mockRoom)
      expect(roomRepository.create).toHaveBeenCalled()
    })

    it("should throw error if trying to chat with self", async () => {
      // Act & Assert
      await expect(service.getOrCreateDirectRoom("user-123", "user-123")).rejects.toThrow(BadRequestException)
    })

    it("should throw error if user not found", async () => {
      // Arrange
      const queryBuilder = roomRepository.createQueryBuilder()
      jest.spyOn(queryBuilder, "getMany").mockResolvedValue([])
      jest.spyOn(userRepository, "findOne").mockResolvedValue(null)

      // Act & Assert
      await expect(service.getOrCreateDirectRoom("user-123", "user-456")).rejects.toThrow(NotFoundException)
    })
  })

  describe("editMessage", () => {
    it("should edit message successfully", async () => {
      // Arrange
      const message = { ...mockMessage }
      jest.spyOn(messageRepository, "findOne").mockResolvedValue(message)
      jest.spyOn(messageRepository, "save").mockResolvedValue({ ...message, content: "Edited", isEdited: true })

      // Act
      const result = await service.editMessage("msg-123", "user-123", "Edited")

      // Assert
      expect(result.content).toBe("Edited")
      expect(result.isEdited).toBe(true)
      expect(messageRepository.save).toHaveBeenCalled()
    })

    it("should throw error if not message owner", async () => {
      // Arrange
      jest.spyOn(messageRepository, "findOne").mockResolvedValue(mockMessage)

      // Act & Assert
      await expect(service.editMessage("msg-123", "other-user", "Edited")).rejects.toThrow(ForbiddenException)
    })

    it("should throw error if message deleted", async () => {
      // Arrange
      const deletedMessage = { ...mockMessage, isDeleted: true }
      jest.spyOn(messageRepository, "findOne").mockResolvedValue(deletedMessage)

      // Act & Assert
      await expect(service.editMessage("msg-123", "user-123", "Edited")).rejects.toThrow(BadRequestException)
    })

    it("should throw error if message not found", async () => {
      // Arrange
      jest.spyOn(messageRepository, "findOne").mockResolvedValue(null)

      // Act & Assert
      await expect(service.editMessage("invalid-id", "user-123", "Edited")).rejects.toThrow(NotFoundException)
    })
  })

  describe("deleteMessage", () => {
    it("should delete message successfully", async () => {
      // Arrange
      const message = { ...mockMessage }
      jest.spyOn(messageRepository, "findOne").mockResolvedValue(message)
      jest.spyOn(messageRepository, "save").mockResolvedValue({ ...message, isDeleted: true, content: "" })

      // Act
      const result = await service.deleteMessage("msg-123", "user-123")

      // Assert
      expect(result.isDeleted).toBe(true)
      expect(result.content).toBe("")
      expect(messageRepository.save).toHaveBeenCalled()
    })

    it("should throw error if not message owner", async () => {
      // Arrange
      jest.spyOn(messageRepository, "findOne").mockResolvedValue(mockMessage)

      // Act & Assert
      await expect(service.deleteMessage("msg-123", "other-user")).rejects.toThrow(ForbiddenException)
    })

    it("should throw error if message not found", async () => {
      // Arrange
      jest.spyOn(messageRepository, "findOne").mockResolvedValue(null)

      // Act & Assert
      await expect(service.deleteMessage("invalid-id", "user-123")).rejects.toThrow(NotFoundException)
    })
  })

  describe("createMediaMessage", () => {
    it("should create image message successfully", async () => {
      // Arrange
      const file = {
        originalname: "test.jpg",
        mimetype: "image/jpeg",
        buffer: Buffer.from("test"),
      } as Express.Multer.File
      jest.spyOn(roomRepository, "findOne").mockResolvedValue(mockRoom)
      jest.spyOn(storageService, "uploadFile").mockResolvedValue({ secure_url: "https://example.com/test.jpg" })
      jest.spyOn(messageRepository, "create").mockReturnValue(mockMessage)
      jest.spyOn(messageRepository, "save").mockResolvedValue(mockMessage)
      jest.spyOn(messageRepository, "findOne").mockResolvedValue(mockMessage)

      // Act
      const result = await service.createMediaMessage("room-123", "user-123", file, "Check this out")

      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockMessage)
      expect(storageService.uploadFile).toHaveBeenCalledWith(file)
    })

    it("should create video message successfully", async () => {
      // Arrange
      const file = {
        originalname: "test.mp4",
        mimetype: "video/mp4",
        buffer: Buffer.from("test"),
      } as Express.Multer.File
      jest.spyOn(roomRepository, "findOne").mockResolvedValue(mockRoom)
      jest.spyOn(storageService, "uploadVideo").mockResolvedValue({ secure_url: "https://example.com/test.mp4" })
      jest.spyOn(messageRepository, "create").mockReturnValue(mockMessage)
      jest.spyOn(messageRepository, "save").mockResolvedValue(mockMessage)
      jest.spyOn(messageRepository, "findOne").mockResolvedValue(mockMessage)

      // Act
      const result = await service.createMediaMessage("room-123", "user-123", file)

      // Assert
      expect(result.success).toBe(true)
      expect(storageService.uploadVideo).toHaveBeenCalledWith(file)
    })

    it("should throw error if unsupported file type", async () => {
      // Arrange
      const file = {
        originalname: "test.exe",
        mimetype: "application/x-msdownload",
        buffer: Buffer.from("test"),
      } as Express.Multer.File
      jest.spyOn(roomRepository, "findOne").mockResolvedValue(mockRoom)

      // Act & Assert
      await expect(service.createMediaMessage("room-123", "user-123", file)).rejects.toThrow(ForbiddenException)
    })

    it("should throw error if user not participant", async () => {
      // Arrange
      const file = {
        originalname: "test.jpg",
        mimetype: "image/jpeg",
        buffer: Buffer.from("test"),
      } as Express.Multer.File
      const roomWithoutUser = { ...mockRoom, participants: [mockOtherUser] }
      jest.spyOn(roomRepository, "findOne").mockResolvedValue(roomWithoutUser)

      // Act & Assert
      await expect(service.createMediaMessage("room-123", "user-123", file)).rejects.toThrow(ForbiddenException)
    })

    it("should throw error if room not found", async () => {
      // Arrange
      const file = {
        originalname: "test.jpg",
        mimetype: "image/jpeg",
        buffer: Buffer.from("test"),
      } as Express.Multer.File
      jest.spyOn(roomRepository, "findOne").mockResolvedValue(null)

      // Act & Assert
      await expect(service.createMediaMessage("invalid-id", "user-123", file)).rejects.toThrow(NotFoundException)
    })
  })
})
