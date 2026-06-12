/**
 * NotificationsService Test Suite
 *
 * Tests notification creation, retrieval, marking as read, and deletion.
 */
import { Test, TestingModule } from "@nestjs/testing"
import { NotificationsService } from "./notifications.service"
import { NotificationRepository } from "./repositories/notification.repository"
import { UserRepository } from "../users/repositories/user.repository"
import { NotificationType } from "./entities/notification.entity"

describe("NotificationsService", () => {
  let service: NotificationsService
  let notificationRepository: any
  let userRepository: any

  const mockNotification = {
    id: "notif-123",
    userId: "user-123",
    actorId: "user-456",
    type: NotificationType.LIKE,
    contentId: "content-789",
    read: false,
    createdAt: new Date(),
    actor: {
      id: "user-456",
      username: "actor",
      displayName: "Actor User",
    },
  }

  beforeEach(async () => {
    const mockNotificationRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }

    const mockUserRepository = {
      findByIdOptional: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: NotificationRepository, useValue: mockNotificationRepository },
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile()

    service = module.get<NotificationsService>(NotificationsService)
    notificationRepository = module.get(NotificationRepository)
    userRepository = module.get(UserRepository)

    jest.clearAllMocks()
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("create", () => {
    it("should create a notification successfully", async () => {
      // Arrange
      const data = {
        userId: "user-123",
        actorId: "user-456",
        type: NotificationType.LIKE,
        contentId: "content-789",
      }
      jest.spyOn(notificationRepository, "findOne").mockResolvedValue(null)
      jest.spyOn(notificationRepository, "create").mockReturnValue(mockNotification)
      jest.spyOn(notificationRepository, "save").mockResolvedValue(mockNotification)

      // Act
      const result = await service.create(data)

      // Assert
      expect(result).toEqual(mockNotification)
      expect(notificationRepository.create).toHaveBeenCalledWith(data)
      expect(notificationRepository.save).toHaveBeenCalledWith(mockNotification)
    })

    it("should not create notification if user is notifying themselves", async () => {
      // Arrange
      const data = {
        userId: "user-123",
        actorId: "user-123",
        type: NotificationType.LIKE,
        contentId: "content-789",
      }

      // Act
      const result = await service.create(data)

      // Assert
      expect(result).toBeNull()
      expect(notificationRepository.create).not.toHaveBeenCalled()
    })

    it("should not create duplicate notification within 5 minutes", async () => {
      // Arrange
      const data = {
        userId: "user-123",
        actorId: "user-456",
        type: NotificationType.LIKE,
        contentId: "content-789",
      }
      jest.spyOn(notificationRepository, "findOne").mockResolvedValue(mockNotification)

      // Act
      const result = await service.create(data)

      // Assert
      expect(result).toEqual(mockNotification)
      expect(notificationRepository.save).not.toHaveBeenCalled()
    })
  })

  describe("findAllForUser", () => {
    it("should retrieve notifications for user", async () => {
      // Arrange
      const notifications = [mockNotification, { ...mockNotification, id: "notif-456" }]
      jest.spyOn(notificationRepository, "find").mockResolvedValue(notifications)

      // Act
      const result = await service.findAllForUser("user-123", 50)

      // Assert
      expect(result).toEqual(notifications)
      expect(notificationRepository.find).toHaveBeenCalledWith({
        where: { userId: "user-123" },
        relations: ["actor"],
        order: { createdAt: "DESC" },
        take: 50,
      })
    })

    it("should return empty array if no notifications", async () => {
      // Arrange
      jest.spyOn(notificationRepository, "find").mockResolvedValue([])

      // Act
      const result = await service.findAllForUser("user-123")

      // Assert
      expect(result).toEqual([])
    })

    it("should respect custom limit", async () => {
      // Arrange
      jest.spyOn(notificationRepository, "find").mockResolvedValue([])

      // Act
      await service.findAllForUser("user-123", 20)

      // Assert
      expect(notificationRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ take: 20 }),
      )
    })
  })

  describe("getUnreadCount", () => {
    it("should return count of unread notifications", async () => {
      // Arrange
      jest.spyOn(notificationRepository, "count").mockResolvedValue(5)

      // Act
      const result = await service.getUnreadCount("user-123")

      // Assert
      expect(result).toBe(5)
      expect(notificationRepository.count).toHaveBeenCalledWith({
        where: { userId: "user-123", read: false },
      })
    })

    it("should return 0 if no unread notifications", async () => {
      // Arrange
      jest.spyOn(notificationRepository, "count").mockResolvedValue(0)

      // Act
      const result = await service.getUnreadCount("user-123")

      // Assert
      expect(result).toBe(0)
    })
  })

  describe("markAsRead", () => {
    it("should mark notification as read", async () => {
      // Arrange
      jest.spyOn(notificationRepository, "update").mockResolvedValue(undefined)

      // Act
      await service.markAsRead("notif-123", "user-123")

      // Assert
      expect(notificationRepository.update).toHaveBeenCalledWith(
        { id: "notif-123", userId: "user-123" },
        { read: true },
      )
    })
  })

  describe("markAllAsRead", () => {
    it("should mark all notifications as read for user", async () => {
      // Arrange
      jest.spyOn(notificationRepository, "update").mockResolvedValue(undefined)

      // Act
      await service.markAllAsRead("user-123")

      // Assert
      expect(notificationRepository.update).toHaveBeenCalledWith(
        { userId: "user-123", read: false },
        { read: true },
      )
    })
  })

  describe("deleteNotification", () => {
    it("should delete notification", async () => {
      // Arrange
      jest.spyOn(notificationRepository, "delete").mockResolvedValue(undefined)

      // Act
      await service.deleteNotification("notif-123", "user-123")

      // Assert
      expect(notificationRepository.delete).toHaveBeenCalledWith({
        id: "notif-123",
        userId: "user-123",
      })
    })
  })

  describe("createLikeNotification", () => {
    it("should create like notification", async () => {
      // Arrange
      jest.spyOn(notificationRepository, "findOne").mockResolvedValue(null)
      jest.spyOn(notificationRepository, "create").mockReturnValue(mockNotification)
      jest.spyOn(notificationRepository, "save").mockResolvedValue(mockNotification)

      // Act
      await service.createLikeNotification("content-789", "user-123", "user-456")

      // Assert
      expect(notificationRepository.create).toHaveBeenCalledWith({
        userId: "user-123",
        actorId: "user-456",
        type: NotificationType.LIKE,
        contentId: "content-789",
      })
    })
  })

  describe("createCommentNotification", () => {
    it("should create comment notification", async () => {
      // Arrange
      jest.spyOn(notificationRepository, "findOne").mockResolvedValue(null)
      jest.spyOn(notificationRepository, "create").mockReturnValue(mockNotification)
      jest.spyOn(notificationRepository, "save").mockResolvedValue(mockNotification)

      // Act
      await service.createCommentNotification(
        "content-789",
        "comment-999",
        "user-123",
        "user-456",
      )

      // Assert
      expect(notificationRepository.create).toHaveBeenCalledWith({
        userId: "user-123",
        actorId: "user-456",
        type: NotificationType.COMMENT,
        contentId: "content-789",
        commentId: "comment-999",
      })
    })
  })

  describe("createFollowNotification", () => {
    it("should create follow notification", async () => {
      // Arrange
      jest.spyOn(notificationRepository, "findOne").mockResolvedValue(null)
      jest.spyOn(notificationRepository, "create").mockReturnValue(mockNotification)
      jest.spyOn(notificationRepository, "save").mockResolvedValue(mockNotification)

      // Act
      await service.createFollowNotification("user-123", "user-456")

      // Assert
      expect(notificationRepository.create).toHaveBeenCalledWith({
        userId: "user-123",
        actorId: "user-456",
        type: NotificationType.FOLLOW,
      })
    })
  })

  describe("createMessageNotification", () => {
    it("should create message notification", async () => {
      // Arrange
      jest.spyOn(notificationRepository, "findOne").mockResolvedValue(null)
      jest.spyOn(notificationRepository, "create").mockReturnValue(mockNotification)
      jest.spyOn(notificationRepository, "save").mockResolvedValue(mockNotification)

      // Act
      await service.createMessageNotification("room-789", "user-123", "user-456")

      // Assert
      expect(notificationRepository.create).toHaveBeenCalledWith({
        userId: "user-123",
        actorId: "user-456",
        type: NotificationType.MESSAGE,
        chatRoomId: "room-789",
      })
    })
  })

  describe("createMentionNotification", () => {
    it("should create mention notification for content", async () => {
      // Arrange
      jest.spyOn(notificationRepository, "findOne").mockResolvedValue(null)
      jest.spyOn(notificationRepository, "create").mockReturnValue(mockNotification)
      jest.spyOn(notificationRepository, "save").mockResolvedValue(mockNotification)

      // Act
      await service.createMentionNotification("user-123", "user-456", "content-789")

      // Assert
      expect(notificationRepository.create).toHaveBeenCalledWith({
        userId: "user-123",
        actorId: "user-456",
        type: NotificationType.MENTION,
        contentId: "content-789",
        commentId: undefined,
      })
    })

    it("should create mention notification for comment", async () => {
      // Arrange
      jest.spyOn(notificationRepository, "findOne").mockResolvedValue(null)
      jest.spyOn(notificationRepository, "create").mockReturnValue(mockNotification)
      jest.spyOn(notificationRepository, "save").mockResolvedValue(mockNotification)

      // Act
      await service.createMentionNotification(
        "user-123",
        "user-456",
        undefined,
        "comment-999",
      )

      // Assert
      expect(notificationRepository.create).toHaveBeenCalledWith({
        userId: "user-123",
        actorId: "user-456",
        type: NotificationType.MENTION,
        contentId: undefined,
        commentId: "comment-999",
      })
    })
  })

  describe("createReplyNotification", () => {
    it("should create reply notification", async () => {
      // Arrange
      jest.spyOn(notificationRepository, "findOne").mockResolvedValue(null)
      jest.spyOn(notificationRepository, "create").mockReturnValue(mockNotification)
      jest.spyOn(notificationRepository, "save").mockResolvedValue(mockNotification)

      // Act
      await service.createReplyNotification(
        "content-789",
        "comment-999",
        "user-123",
        "user-456",
      )

      // Assert
      expect(notificationRepository.create).toHaveBeenCalledWith({
        userId: "user-123",
        actorId: "user-456",
        type: NotificationType.COMMENT_REPLY,
        contentId: "content-789",
        commentId: "comment-999",
      })
    })
  })
})
