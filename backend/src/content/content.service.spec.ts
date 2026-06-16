/**
 * ContentService Test Suite
 *
 * Tests core content operations: creation, publishing, interactions,
 * comments, feed retrieval, and scheduled content.
 */
import { Test, TestingModule } from "@nestjs/testing"
import { NotFoundException, ForbiddenException } from "@nestjs/common"
import { ContentService } from "./content.service"
import { ContentRepository } from "./repositories/content.repository"
import { ContentInteractionRepository } from "./repositories/content-interaction.repository"
import { CommentRepository } from "./repositories/comment.repository"
import { CommentLikeRepository } from "./repositories/comment-like.repository"
import { MentionRepository } from "./repositories/mention.repository"
import { EngagementSignalRepository } from "./repositories/engagement-signal.repository"
import { UserRepository } from "../users/repositories/user.repository"
import { FollowRepository } from "../follows/repositories/follow.repository"
import { StorageService } from "../config/storage.service"
import { RedisService } from "../config/redis.service"
import { NotificationsService } from "../notifications/notifications.service"
import { ValidationPipelineService } from "../referrals/services/validation-pipeline.service"

describe("ContentService", () => {
  let service: ContentService
  let contentRepository: any
  let interactionRepository: any
  let commentRepository: any
  let commentLikeRepository: any
  let mentionRepository: any
  let engagementSignalRepository: any
  let userRepository: any
  let followRepository: any
  let storageService: any
  let redisService: any
  let notificationsService: any
  let validationPipelineService: any

  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    username: "testuser",
    displayName: "Test User",
    role: "client",
    isActive: true,
    createdAt: new Date(),
  }

  const mockContent = {
    id: "content-123",
    userId: "user-123",
    contentType: "image",
    mediaUrl: "https://example.com/image.jpg",
    caption: "Test caption",
    hashtags: ["test"],
    likeCount: 0,
    commentCount: 0,
    viewsCount: 0,
    createdAt: new Date(),
    user: mockUser,
  }

  const mockFile = {
    fieldname: "file",
    originalname: "test.jpg",
    encoding: "7bit",
    mimetype: "image/jpeg",
    size: 1024,
    destination: "/tmp",
    filename: "test.jpg",
    path: "/tmp/test.jpg",
    buffer: Buffer.from("test"),
  } as Express.Multer.File

  beforeEach(async () => {
    const mockContentRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    }

    const mockInteractionRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      })),
    }

    const mockCommentRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      })),
    }

    const mockCommentLikeRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      })),
    }

    const mockMentionRepository = {
      save: jest.fn(),
    }

    const mockEngagementSignalRepository = {
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      })),
    }

    const mockUserRepository = {
      findByIdOptional: jest.fn(),
      findByUsername: jest.fn(),
      findByUsernames: jest.fn(),
      save: jest.fn(),
    }

    const mockFollowRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    }

    const mockStorageService = {
      uploadFile: jest.fn(),
      uploadVideo: jest.fn(),
      deleteFile: jest.fn(),
      getSignedUrl: jest.fn(),
    }

    const mockRedisService = {
      get: jest.fn(),
      set: jest.fn(),
      setex: jest.fn(),
      del: jest.fn(),
      invalidateFeedCache: jest.fn(),
      getCachedFeed: jest.fn(),
      setCachedFeed: jest.fn(),
    }

    const mockNotificationsService = {
      createNotification: jest.fn(),
      createLikeNotification: jest.fn(),
      createCommentNotification: jest.fn(),
      createReplyNotification: jest.fn(),
    }

    const mockValidationPipelineService = {
      getActiveReferralForUser: jest.fn(),
      runValidation: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentService,
        { provide: ContentRepository, useValue: mockContentRepository },
        { provide: ContentInteractionRepository, useValue: mockInteractionRepository },
        { provide: CommentRepository, useValue: mockCommentRepository },
        { provide: CommentLikeRepository, useValue: mockCommentLikeRepository },
        { provide: MentionRepository, useValue: mockMentionRepository },
        { provide: EngagementSignalRepository, useValue: mockEngagementSignalRepository },
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: FollowRepository, useValue: mockFollowRepository },
        { provide: StorageService, useValue: mockStorageService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: ValidationPipelineService, useValue: mockValidationPipelineService },
      ],
    }).compile()

    service = module.get<ContentService>(ContentService)
    contentRepository = module.get(ContentRepository)
    interactionRepository = module.get(ContentInteractionRepository)
    commentRepository = module.get(CommentRepository)
    commentLikeRepository = module.get(CommentLikeRepository)
    mentionRepository = module.get(MentionRepository)
    engagementSignalRepository = module.get(EngagementSignalRepository)
    userRepository = module.get(UserRepository)
    followRepository = module.get(FollowRepository)
    storageService = module.get(StorageService)
    redisService = module.get(RedisService)
    notificationsService = module.get(NotificationsService)
    validationPipelineService = module.get(ValidationPipelineService)

    jest.clearAllMocks()
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("create", () => {
    it("should create content with image file", async () => {
      // Arrange
      jest.spyOn(userRepository, "findByIdOptional").mockResolvedValue(mockUser)
      jest.spyOn(storageService, "uploadFile").mockResolvedValue({ secure_url: "https://cdn.example.com/image.jpg" })
      jest.spyOn(contentRepository, "create").mockReturnValue(mockContent)
      jest.spyOn(contentRepository, "save").mockResolvedValue(mockContent)
      jest.spyOn(mentionRepository, "save").mockResolvedValue([])
      jest.spyOn(userRepository, "save").mockResolvedValue(mockUser)

      // Act
      const result = await service.create("user-123", { description: "Test #hashtag @user", tags: ["test"], file: mockFile }, mockFile)

      // Assert
      expect(result).toBeDefined()
      expect(userRepository.findByIdOptional).toHaveBeenCalledWith("user-123")
      expect(storageService.uploadFile).toHaveBeenCalled()
      expect(contentRepository.save).toHaveBeenCalled()
    })

    it("should throw NotFoundException if user not found", async () => {
      // Arrange
      jest.spyOn(userRepository, "findByIdOptional").mockResolvedValue(null)

      // Act & Assert
      await expect(service.create("user-123", { description: "Test", file: mockFile }, mockFile)).rejects.toThrow(NotFoundException)
    })

    // Note: The create() method does not extract mentions from descriptions.
    // Mentions are only extracted from comments via addComment() method.

    it("should extract hashtags from description", async () => {
      // Arrange
      jest.spyOn(userRepository, "findByIdOptional").mockResolvedValue(mockUser)
      jest.spyOn(storageService, "uploadFile").mockResolvedValue({ secure_url: "https://cdn.example.com/image.jpg" })
      const mockContentWithHashtags = { ...mockContent, hashtags: ["test", "coding"] }
      jest.spyOn(contentRepository, "create").mockReturnValue(mockContentWithHashtags)
      jest.spyOn(contentRepository, "save").mockResolvedValue(mockContentWithHashtags)
      jest.spyOn(mentionRepository, "save").mockResolvedValue([])
      jest.spyOn(userRepository, "save").mockResolvedValue(mockUser)

      // Act
      const result = await service.create("user-123", { description: "#test #coding", tags: ["test", "coding"], file: mockFile }, mockFile)

      // Assert
      expect(contentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          hashtags: ["test", "coding"],
        }),
      )
    })
  })

  describe("likeContent", () => {
    it("should add like if not already liked", async () => {
      // Arrange
      jest.spyOn(contentRepository, "findOne").mockResolvedValue({ ...mockContent, user: mockUser })
      jest.spyOn(interactionRepository, "findOne").mockResolvedValue(null)
      jest.spyOn(interactionRepository, "create").mockReturnValue({ type: "like" })
      jest.spyOn(interactionRepository, "save").mockResolvedValue({ type: "like" })
      jest.spyOn(contentRepository, "save").mockResolvedValue({ ...mockContent, likeCount: 1 })

      // Act
      const result = await service.likeContent("content-123", "user-123")

      // Assert
      expect(result.liked).toBe(true)
      expect(result.likesCount).toBe(1)
      expect(interactionRepository.save).toHaveBeenCalled()
    })

    it("should remove like if already liked", async () => {
      // Arrange
      const existingLike = { id: "like-123", type: "like", userId: "user-123", contentId: "content-123" }
      jest.spyOn(contentRepository, "findOne").mockResolvedValue({ ...mockContent, likeCount: 1, user: mockUser })
      jest.spyOn(interactionRepository, "findOne").mockResolvedValue(existingLike)
      jest.spyOn(interactionRepository, "remove").mockResolvedValue(existingLike)
      jest.spyOn(contentRepository, "save").mockResolvedValue({ ...mockContent, likeCount: 0 })

      // Act
      const result = await service.likeContent("content-123", "user-123")

      // Assert
      expect(result.liked).toBe(false)
      expect(result.likesCount).toBe(0)
      expect(interactionRepository.remove).toHaveBeenCalledWith(existingLike)
    })

    it("should throw NotFoundException if content not found", async () => {
      // Arrange
      jest.spyOn(contentRepository, "findOne").mockResolvedValue(null)

      // Act & Assert
      await expect(service.likeContent("content-123", "user-123")).rejects.toThrow(NotFoundException)
    })
  })

  describe("addComment", () => {
    it("should create a comment successfully", async () => {
      // Arrange
      const mockComment = {
        id: "comment-123",
        contentId: "content-123",
        userId: "user-123",
        text: "Great post!",
        createdAt: new Date(),
        user: mockUser,
      }
      jest.spyOn(contentRepository, "findOne").mockResolvedValue({ ...mockContent, user: mockUser })
      jest.spyOn(commentRepository, "create").mockReturnValue(mockComment)
      jest.spyOn(commentRepository, "save").mockResolvedValue(mockComment)
      jest.spyOn(commentRepository, "findOne").mockResolvedValue({ ...mockComment, user: mockUser })
      jest.spyOn(contentRepository, "save").mockResolvedValue({ ...mockContent, commentCount: 1 })
      jest.spyOn(mentionRepository, "save").mockResolvedValue([])

      // Act
      const result = await service.addComment("content-123", "user-123", { text: "Great post!" })

      // Assert
      expect(result).toBeDefined()
      expect(commentRepository.save).toHaveBeenCalled()
      expect(contentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ commentCount: 1 }),
      )
    })

    it("should create a reply to existing comment", async () => {
      // Arrange
      const parentComment = {
        id: "comment-parent",
        contentId: "content-123",
        userId: "user-456",
        text: "Original comment",
        repliesCount: 0,
      }
      const replyComment = {
        id: "comment-reply",
        contentId: "content-123",
        userId: "user-123",
        parentId: "comment-parent",
        text: "Reply to comment",
        createdAt: new Date(),
        user: mockUser,
      }
      jest.spyOn(contentRepository, "findOne").mockResolvedValue({ ...mockContent, user: mockUser })
      jest.spyOn(commentRepository, "findOne")
        .mockResolvedValueOnce(parentComment)
        .mockResolvedValueOnce({ ...replyComment, user: mockUser })
      jest.spyOn(commentRepository, "create").mockReturnValue(replyComment)
      jest.spyOn(commentRepository, "save")
        .mockResolvedValueOnce(replyComment)
        .mockResolvedValueOnce({ ...parentComment, repliesCount: 1 })
      jest.spyOn(contentRepository, "save").mockResolvedValue(mockContent)
      jest.spyOn(mentionRepository, "save").mockResolvedValue([])

      // Act
      const result = await service.addComment("content-123", "user-123", {
        text: "Reply to comment",
        parentId: "comment-parent",
      })

      // Assert
      expect(result).toBeDefined()
      expect(commentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ parentId: "comment-parent" }),
      )
    })

    it("should throw NotFoundException if content not found", async () => {
      // Arrange
      jest.spyOn(contentRepository, "findOne").mockResolvedValue(null)

      // Act & Assert
      await expect(
        service.addComment("content-123", "user-123", { text: "Test" }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe("remove", () => {
    it("should delete own content successfully", async () => {
      // Arrange
      const mockSlides = [mockContent]
      jest.spyOn(contentRepository, "find").mockResolvedValue(mockSlides)
      jest.spyOn(commentRepository, "find").mockResolvedValue([]) // Mock comment lookup
      jest.spyOn(contentRepository, "remove").mockResolvedValue(mockSlides)

      // Act
      await service.remove("content-123", "user-123")

      // Assert
      expect(contentRepository.remove).toHaveBeenCalledWith(mockSlides)
    })

    it("should throw ForbiddenException if deleting another user's content", async () => {
      // Arrange
      const otherUserContent = { ...mockContent, userId: "user-456" }
      jest.spyOn(contentRepository, "find").mockResolvedValue([otherUserContent])

      // Act & Assert
      await expect(service.remove("content-123", "user-123")).rejects.toThrow(ForbiddenException)
    })

    it("should throw NotFoundException if content not found", async () => {
      // Arrange
      jest.spyOn(contentRepository, "find").mockResolvedValue([])

      // Act & Assert
      await expect(service.remove("content-123", "user-123")).rejects.toThrow(NotFoundException)
    })
  })

  describe("getComments", () => {
    it("should retrieve comments with pagination", async () => {
      // Arrange
      const mockComments = [
        {
          id: "comment-1",
          text: "First comment",
          userId: "user-123",
          user: mockUser,
          likesCount: 0,
          repliesCount: 0,
          replies: [],
          createdAt: new Date(),
        },
      ]
      jest.spyOn(commentRepository, "findAndCount").mockResolvedValue([mockComments, 1])
      jest.spyOn(commentLikeRepository, "find").mockResolvedValue([])

      // Act
      const result = await service.getComments("content-123", "user-123", 1, 10)

      // Assert
      expect(result.data).toHaveLength(1)
      expect(result.total).toBe(1)
      expect(result.page).toBe(1)
    })

    it("should mark user's liked comments", async () => {
      // Arrange
      const mockComments = [
        {
          id: "comment-1",
          text: "First comment",
          userId: "user-456",
          user: mockUser,
          likesCount: 1,
          repliesCount: 0,
          replies: [],
          createdAt: new Date(),
        },
      ]
      const userLikes = [{ commentId: "comment-1", userId: "user-123" }]
      jest.spyOn(commentRepository, "findAndCount").mockResolvedValue([mockComments, 1])
      jest.spyOn(commentLikeRepository, "find").mockResolvedValue(userLikes)

      // Act
      const result = await service.getComments("content-123", "user-123", 1, 10)

      // Assert
      expect(result.data[0].isLiked).toBe(true)
    })
  })

  describe("findAllPosts", () => {
    /**
     * Helper that creates a chainable query builder mock.
     * Every method returns the builder itself so calls like
     * .where().andWhere().orderBy().skip().take() chain correctly.
     * getManyAndCount resolves to the supplied data.
     */
    function makeQueryBuilder(posts: any[], total: number) {
      const qb: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([posts, total]),
        getRawMany: jest.fn().mockResolvedValue([]),
      }
      return qb
    }

    const mockPost = {
      id: "slide-1",
      postId: "post-1",
      userId: "user-123",
      user: mockUser,
      caption: "Test post",
      hashtags: [],
      contentType: "image",
      mediaUrl: "https://example.com/img.jpg",
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: 10,
      likeCount: 5,
      commentCount: 2,
      shareCount: 1,
      engagementScore: 8,
      viralityScore: 3,
      completionRate: 0.9,
      avgWatchTime: 15,
      avgDwellTime: 10,
    }

    beforeEach(() => {
      // Default: no cache hit, so every call goes through the query builder path
      jest.spyOn(redisService, "getCachedFeed").mockResolvedValue(null)
      jest.spyOn(redisService, "setCachedFeed").mockResolvedValue(undefined)
    })

    it("should return paginated posts for a basic ranked feed", async () => {
      // ARRANGE — two query builders: one for main feed, one for fresh candidate lookup
      const mainQb = makeQueryBuilder([mockPost], 1)
      const freshQb = makeQueryBuilder([], 0)
      jest.spyOn(contentRepository, "createQueryBuilder")
        .mockReturnValueOnce(mainQb)
        .mockReturnValueOnce(freshQb)
      jest.spyOn(contentRepository, "find").mockResolvedValue([mockPost])
      jest.spyOn(interactionRepository, "find").mockResolvedValue([])

      // ACT
      const result = await service.findAllPosts(1, 20, undefined, undefined, "user-123", false, "ranked")

      // ASSERT
      expect(result.data).toHaveLength(1)
      expect(result.data[0].postId).toBe("post-1")
      expect(mainQb.orderBy).toHaveBeenCalledWith("content.engagementScore", "DESC", "NULLS LAST")
    })

    it("should apply trendingDays filter with date cutoff and engagement threshold", async () => {
      // ARRANGE
      const qb = makeQueryBuilder([mockPost], 1)
      jest.spyOn(contentRepository, "createQueryBuilder").mockReturnValue(qb)
      jest.spyOn(contentRepository, "find").mockResolvedValue([mockPost])
      jest.spyOn(interactionRepository, "find").mockResolvedValue([])

      // ACT — pass trendingDays = 3
      const result = await service.findAllPosts(1, 30, undefined, undefined, undefined, false, "ranked", 3)

      // ASSERT — verify the two trendingDays-specific andWhere calls were made
      const andWhereCalls = qb.andWhere.mock.calls.map((c: any) => c[0])
      expect(andWhereCalls).toContain("content.createdAt >= :trendingCutoff")
      expect(andWhereCalls).toContain("content.engagementScore > 0")
    })

    it("should pass a cutoff date that is N days in the past when trendingDays is set", async () => {
      // ARRANGE
      const qb = makeQueryBuilder([mockPost], 1)
      jest.spyOn(contentRepository, "createQueryBuilder").mockReturnValue(qb)
      jest.spyOn(contentRepository, "find").mockResolvedValue([mockPost])
      jest.spyOn(interactionRepository, "find").mockResolvedValue([])

      const beforeCall = new Date()
      beforeCall.setDate(beforeCall.getDate() - 3)

      // ACT
      await service.findAllPosts(1, 30, undefined, undefined, undefined, false, "ranked", 3)

      // ASSERT — find the andWhere call with trendingCutoff and verify the date is ~3 days ago
      const cutoffCall = qb.andWhere.mock.calls.find((c: any) => c[0] === "content.createdAt >= :trendingCutoff")
      expect(cutoffCall).toBeDefined()
      const cutoffDate = cutoffCall[1].trendingCutoff as Date
      // The cutoff should be within a few seconds of 3 days ago
      expect(cutoffDate.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime() - 5000)
      expect(cutoffDate.getTime()).toBeLessThanOrEqual(Date.now())
    })

    it("should not apply trendingDays filters when trendingDays is not set", async () => {
      // ARRANGE — two query builders: main feed + fresh candidate lookup
      const mainQb = makeQueryBuilder([mockPost], 1)
      const freshQb = makeQueryBuilder([], 0)
      jest.spyOn(contentRepository, "createQueryBuilder")
        .mockReturnValueOnce(mainQb)
        .mockReturnValueOnce(freshQb)
      jest.spyOn(contentRepository, "find").mockResolvedValue([mockPost])
      jest.spyOn(interactionRepository, "find").mockResolvedValue([])

      // ACT — no trendingDays param
      await service.findAllPosts(1, 20, undefined, undefined, undefined, false, "ranked")

      // ASSERT — neither trending filter should be applied
      const andWhereCalls = mainQb.andWhere.mock.calls.map((c: any) => c[0])
      expect(andWhereCalls).not.toContain("content.createdAt >= :trendingCutoff")
      expect(andWhereCalls).not.toContain("content.engagementScore > 0")
    })

    it("should filter by userId when provided", async () => {
      // ARRANGE
      const qb = makeQueryBuilder([mockPost], 1)
      jest.spyOn(contentRepository, "createQueryBuilder").mockReturnValue(qb)
      jest.spyOn(contentRepository, "find").mockResolvedValue([mockPost])
      jest.spyOn(interactionRepository, "find").mockResolvedValue([])

      // ACT
      await service.findAllPosts(1, 20, undefined, "user-123", undefined, false, "recent")

      // ASSERT
      const andWhereCalls = qb.andWhere.mock.calls
      const userIdCall = andWhereCalls.find((c: any) => c[0] === "content.userId = :userId")
      expect(userIdCall).toBeDefined()
      expect(userIdCall[1]).toEqual({ userId: "user-123" })
    })

    it("should sort by createdAt DESC when sort is 'recent'", async () => {
      // ARRANGE
      const qb = makeQueryBuilder([mockPost], 1)
      jest.spyOn(contentRepository, "createQueryBuilder").mockReturnValue(qb)
      jest.spyOn(contentRepository, "find").mockResolvedValue([mockPost])
      jest.spyOn(interactionRepository, "find").mockResolvedValue([])

      // ACT
      await service.findAllPosts(1, 20, undefined, undefined, undefined, false, "recent")

      // ASSERT
      expect(qb.orderBy).toHaveBeenCalledWith("content.createdAt", "DESC")
    })
  })
})
