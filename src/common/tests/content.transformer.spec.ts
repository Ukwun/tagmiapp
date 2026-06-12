/**
 * ContentTransformer Tests
 *
 * Tests content enrichment with user-specific interaction data
 * (isLiked, isBookmarked flags).
 */
import { ContentTransformer } from "../transformers/content.transformer"
import { Content } from "../../content/entities/content.entity"

describe("ContentTransformer", () => {
  let mockLikeRepository: any
  let mockBookmarkRepository: any

  beforeEach(() => {
    mockLikeRepository = {
      count: jest.fn(),
    }
    mockBookmarkRepository = {
      count: jest.fn(),
    }
  })

  describe("enrichWithInteractions", () => {
    it("should add isLiked true when user has liked the content", async () => {
      // ARRANGE — user has liked this content
      const content = {
        id: "content-1",
        userId: "author-1",
        caption: "Test post",
      } as Content
      const userId = "user-1"
      mockLikeRepository.count.mockResolvedValue(1) // User has liked
      mockBookmarkRepository.count.mockResolvedValue(0) // User has not bookmarked

      // ACT
      const result = await ContentTransformer.enrichWithInteractions(
        content,
        userId,
        mockLikeRepository,
        mockBookmarkRepository,
      )

      // ASSERT — isLiked should be true
      expect(result.isLiked).toBe(true)
      expect(result.isBookmarked).toBe(false)
      expect(mockLikeRepository.count).toHaveBeenCalledWith({
        where: { contentId: "content-1", userId: "user-1" },
      })
    })

    it("should add isBookmarked true when user has bookmarked the content", async () => {
      // ARRANGE — user has bookmarked this content
      const content = {
        id: "content-1",
        userId: "author-1",
        caption: "Test post",
      } as Content
      const userId = "user-1"
      mockLikeRepository.count.mockResolvedValue(0) // User has not liked
      mockBookmarkRepository.count.mockResolvedValue(1) // User has bookmarked

      // ACT
      const result = await ContentTransformer.enrichWithInteractions(
        content,
        userId,
        mockLikeRepository,
        mockBookmarkRepository,
      )

      // ASSERT — isBookmarked should be true
      expect(result.isLiked).toBe(false)
      expect(result.isBookmarked).toBe(true)
      expect(mockBookmarkRepository.count).toHaveBeenCalledWith({
        where: { contentId: "content-1", userId: "user-1" },
      })
    })

    it("should add both flags true when user has liked and bookmarked", async () => {
      // ARRANGE — user has liked AND bookmarked
      const content = { id: "content-1" } as Content
      const userId = "user-1"
      mockLikeRepository.count.mockResolvedValue(1)
      mockBookmarkRepository.count.mockResolvedValue(1)

      // ACT
      const result = await ContentTransformer.enrichWithInteractions(
        content,
        userId,
        mockLikeRepository,
        mockBookmarkRepository,
      )

      // ASSERT — both true
      expect(result.isLiked).toBe(true)
      expect(result.isBookmarked).toBe(true)
    })

    it("should not check interactions when userId is null", async () => {
      // ARRANGE — no logged-in user
      const content = { id: "content-1" } as Content
      const userId = null

      // ACT
      const result = await ContentTransformer.enrichWithInteractions(
        content,
        userId,
        mockLikeRepository,
        mockBookmarkRepository,
      )

      // ASSERT — no repository calls made, flags undefined
      expect(result.isLiked).toBeUndefined()
      expect(result.isBookmarked).toBeUndefined()
      expect(mockLikeRepository.count).not.toHaveBeenCalled()
      expect(mockBookmarkRepository.count).not.toHaveBeenCalled()
    })

    it("should preserve all content fields", async () => {
      // ARRANGE — content with multiple fields
      const content = {
        id: "content-1",
        userId: "author-1",
        caption: "Test caption",
        mediaUrl: "https://example.com/image.jpg",
        likeCount: 100,
      } as Content
      const userId = "user-1"
      mockLikeRepository.count.mockResolvedValue(1)
      mockBookmarkRepository.count.mockResolvedValue(0)

      // ACT
      const result = await ContentTransformer.enrichWithInteractions(
        content,
        userId,
        mockLikeRepository,
        mockBookmarkRepository,
      )

      // ASSERT — original fields preserved, new flags added
      expect(result.id).toBe("content-1")
      expect(result.userId).toBe("author-1")
      expect(result.caption).toBe("Test caption")
      expect(result.mediaUrl).toBe("https://example.com/image.jpg")
      expect(result.likeCount).toBe(100)
      expect(result.isLiked).toBe(true)
      expect(result.isBookmarked).toBe(false)
    })

    it("should make parallel repository calls for efficiency", async () => {
      // ARRANGE
      const content = { id: "content-1" } as Content
      const userId = "user-1"
      mockLikeRepository.count.mockResolvedValue(0)
      mockBookmarkRepository.count.mockResolvedValue(0)

      // ACT
      await ContentTransformer.enrichWithInteractions(
        content,
        userId,
        mockLikeRepository,
        mockBookmarkRepository,
      )

      // ASSERT — both repositories called (parallel execution via Promise.all)
      expect(mockLikeRepository.count).toHaveBeenCalledTimes(1)
      expect(mockBookmarkRepository.count).toHaveBeenCalledTimes(1)
    })
  })

  describe("enrichManyWithInteractions", () => {
    it("should enrich multiple content items", async () => {
      // ARRANGE — two content items
      const contents = [
        { id: "content-1", caption: "Post 1" },
        { id: "content-2", caption: "Post 2" },
      ] as Content[]
      const userId = "user-1"

      // User liked content-1, bookmarked content-2
      mockLikeRepository.count
        .mockResolvedValueOnce(1) // content-1 liked
        .mockResolvedValueOnce(0) // content-2 not liked

      mockBookmarkRepository.count
        .mockResolvedValueOnce(0) // content-1 not bookmarked
        .mockResolvedValueOnce(1) // content-2 bookmarked

      // ACT
      const result = await ContentTransformer.enrichManyWithInteractions(
        contents,
        userId,
        mockLikeRepository,
        mockBookmarkRepository,
      )

      // ASSERT — both enriched correctly
      expect(result).toHaveLength(2)
      expect(result[0].isLiked).toBe(true)
      expect(result[0].isBookmarked).toBe(false)
      expect(result[1].isLiked).toBe(false)
      expect(result[1].isBookmarked).toBe(true)
    })

    it("should handle empty content array", async () => {
      // ARRANGE — no content
      const contents: Content[] = []
      const userId = "user-1"

      // ACT
      const result = await ContentTransformer.enrichManyWithInteractions(
        contents,
        userId,
        mockLikeRepository,
        mockBookmarkRepository,
      )

      // ASSERT — empty array returned, no repository calls
      expect(result).toEqual([])
      expect(mockLikeRepository.count).not.toHaveBeenCalled()
      expect(mockBookmarkRepository.count).not.toHaveBeenCalled()
    })

    it("should not check interactions when userId is null", async () => {
      // ARRANGE — multiple content items, no user
      const contents = [{ id: "content-1" }, { id: "content-2" }] as Content[]
      const userId = null

      // ACT
      const result = await ContentTransformer.enrichManyWithInteractions(
        contents,
        userId,
        mockLikeRepository,
        mockBookmarkRepository,
      )

      // ASSERT — no interactions checked
      expect(result).toHaveLength(2)
      expect(result[0].isLiked).toBeUndefined()
      expect(result[1].isLiked).toBeUndefined()
      expect(mockLikeRepository.count).not.toHaveBeenCalled()
    })
  })
})
