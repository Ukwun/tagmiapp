/**
 * ContentRepositoryHelper Tests
 *
 * Tests all content fetching patterns to ensure they load the right relations
 * and apply filters correctly.
 */
import { Test, TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { NotFoundException } from "@nestjs/common"
import { ContentRepositoryHelper } from "../repositories/content-repository.helper"
import { Content } from "../../content/entities/content.entity"

describe("ContentRepositoryHelper", () => {
  let helper: ContentRepositoryHelper
  let contentRepository: jest.Mocked<Repository<Content>>

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentRepositoryHelper,
        {
          provide: getRepositoryToken(Content),
          useValue: mockRepository,
        },
      ],
    }).compile()

    helper = module.get<ContentRepositoryHelper>(ContentRepositoryHelper)
    contentRepository = module.get(getRepositoryToken(Content))
  })

  describe("findByIdOrFail", () => {
    it("should return content when it exists", async () => {
      // ARRANGE
      const mockContent = {
        id: "content-1",
        userId: "user-1",
        caption: "Test post",
      } as Content
      contentRepository.findOne.mockResolvedValue(mockContent)

      // ACT
      const result = await helper.findByIdOrFail("content-1")

      // ASSERT
      expect(result).toEqual(mockContent)
      expect(contentRepository.findOne).toHaveBeenCalledWith({
        where: { id: "content-1" },
        relations: [],
      })
    })

    it("should throw NotFoundException when content does not exist", async () => {
      // ARRANGE
      contentRepository.findOne.mockResolvedValue(null)

      // ACT + ASSERT
      await expect(helper.findByIdOrFail("fake-id")).rejects.toThrow(NotFoundException)
      await expect(helper.findByIdOrFail("fake-id")).rejects.toThrow("Content not found")
    })

    it("should load author when includeAuthor is true", async () => {
      // ARRANGE
      const mockContent = { id: "content-1", user: { id: "user-1" } } as Content
      contentRepository.findOne.mockResolvedValue(mockContent)

      // ACT
      await helper.findByIdOrFail("content-1", { includeAuthor: true })

      // ASSERT — should include 'user' relation
      expect(contentRepository.findOne).toHaveBeenCalledWith({
        where: { id: "content-1" },
        relations: ["user"],
      })
    })

    it("should load slides when includeSlides is true", async () => {
      // ARRANGE
      const mockContent = { id: "content-1" } as Content
      contentRepository.findOne.mockResolvedValue(mockContent)

      // ACT
      await helper.findByIdOrFail("content-1", { includeSlides: true })

      // ASSERT
      expect(contentRepository.findOne).toHaveBeenCalledWith({
        where: { id: "content-1" },
        relations: ["slides"],
      })
    })

    it("should load interactions when includeInteractions is true", async () => {
      // ARRANGE
      const mockContent = { id: "content-1" } as Content
      contentRepository.findOne.mockResolvedValue(mockContent)

      // ACT
      await helper.findByIdOrFail("content-1", { includeInteractions: true })

      // ASSERT — should load likes, bookmarks, views
      expect(contentRepository.findOne).toHaveBeenCalledWith({
        where: { id: "content-1" },
        relations: ["likes", "bookmarks", "views"],
      })
    })

    it("should load comments when includeComments is true", async () => {
      // ARRANGE
      const mockContent = { id: "content-1" } as Content
      contentRepository.findOne.mockResolvedValue(mockContent)

      // ACT
      await helper.findByIdOrFail("content-1", { includeComments: true })

      // ASSERT — should load comments and comment authors
      expect(contentRepository.findOne).toHaveBeenCalledWith({
        where: { id: "content-1" },
        relations: ["comments", "comments.user"],
      })
    })

    it("should load multiple relations when specified", async () => {
      // ARRANGE
      const mockContent = { id: "content-1" } as Content
      contentRepository.findOne.mockResolvedValue(mockContent)

      // ACT
      await helper.findByIdOrFail("content-1", {
        includeAuthor: true,
        includeSlides: true,
        includeInteractions: true,
      })

      // ASSERT — should load all requested relations
      expect(contentRepository.findOne).toHaveBeenCalledWith({
        where: { id: "content-1" },
        relations: ["user", "slides", "likes", "bookmarks", "views"],
      })
    })
  })

  describe("findById", () => {
    it("should return content when it exists", async () => {
      // ARRANGE
      const mockContent = { id: "content-1" } as Content
      contentRepository.findOne.mockResolvedValue(mockContent)

      // ACT
      const result = await helper.findById("content-1")

      // ASSERT
      expect(result).toEqual(mockContent)
    })

    it("should return null when content does not exist", async () => {
      // ARRANGE
      contentRepository.findOne.mockResolvedValue(null)

      // ACT
      const result = await helper.findById("fake-id")

      // ASSERT — no error, just null
      expect(result).toBeNull()
    })
  })

  describe("findByUser", () => {
    it("should return all content by a specific user", async () => {
      // ARRANGE
      const mockContent = [
        { id: "content-1", userId: "user-1" },
        { id: "content-2", userId: "user-1" },
      ] as Content[]
      contentRepository.find.mockResolvedValue(mockContent)

      // ACT
      const result = await helper.findByUser("user-1")

      // ASSERT
      expect(result).toEqual(mockContent)
      expect(contentRepository.find).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        relations: [],
        order: { createdAt: "DESC" },
      })
    })

    it("should return content ordered by creation date", async () => {
      // ARRANGE
      const mockContent = [
        { id: "content-2", userId: "user-1", createdAt: new Date("2024-02-01") },
        { id: "content-1", userId: "user-1", createdAt: new Date("2024-01-01") },
      ] as Content[]
      contentRepository.find.mockResolvedValue(mockContent)

      // ACT
      await helper.findByUser("user-1")

      // ASSERT — should order by createdAt DESC
      expect(contentRepository.find).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        relations: [],
        order: { createdAt: "DESC" },
      })
    })

    it("should load relations when specified", async () => {
      // ARRANGE
      const mockContent = [{ id: "content-1" }] as Content[]
      contentRepository.find.mockResolvedValue(mockContent)

      // ACT
      await helper.findByUser("user-1", {
        includeAuthor: true,
        includeInteractions: true,
      })

      // ASSERT
      expect(contentRepository.find).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        relations: ["user", "likes", "bookmarks", "views"],
        order: { createdAt: "DESC" },
      })
    })

    it("should return empty array when user has no content", async () => {
      // ARRANGE
      contentRepository.find.mockResolvedValue([])

      // ACT
      const result = await helper.findByUser("user-1")

      // ASSERT
      expect(result).toEqual([])
    })
  })

  describe("findRecent", () => {
    it("should return content ordered by creation date", async () => {
      // ARRANGE
      const mockContent = [
        { id: "content-2", createdAt: new Date("2024-02-01") },
        { id: "content-1", createdAt: new Date("2024-01-01") },
      ] as Content[]
      contentRepository.find.mockResolvedValue(mockContent)

      // ACT
      const result = await helper.findRecent()

      // ASSERT
      expect(result).toEqual(mockContent)
      expect(contentRepository.find).toHaveBeenCalledWith({
        relations: [],
        order: { createdAt: "DESC" },
      })
    })

    it("should load relations when specified", async () => {
      // ARRANGE
      const mockContent = [{ id: "content-1" }] as Content[]
      contentRepository.find.mockResolvedValue(mockContent)

      // ACT
      await helper.findRecent({
        includeAuthor: true,
        includeComments: true,
      })

      // ASSERT
      expect(contentRepository.find).toHaveBeenCalledWith({
        relations: ["user", "comments", "comments.user"],
        order: { createdAt: "DESC" },
      })
    })

    it("should return all content across all users", async () => {
      // ARRANGE
      const mockContent = [
        { id: "content-1", userId: "user-1" },
        { id: "content-2", userId: "user-2" },
      ] as Content[]
      contentRepository.find.mockResolvedValue(mockContent)

      // ACT
      const result = await helper.findRecent()

      // ASSERT — no where clause, gets all content
      expect(result).toHaveLength(2)
      expect(contentRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { createdAt: "DESC" },
        }),
      )
    })
  })

  describe("buildRelations", () => {
    it("should build empty relations array when no options specified", async () => {
      // ARRANGE
      const mockContent = { id: "content-1" } as Content
      contentRepository.findOne.mockResolvedValue(mockContent)

      // ACT
      await helper.findById("content-1", {})

      // ASSERT — no relations loaded
      expect(contentRepository.findOne).toHaveBeenCalledWith({
        where: { id: "content-1" },
        relations: [],
      })
    })

    it("should combine all requested relations", async () => {
      // ARRANGE
      const mockContent = { id: "content-1" } as Content
      contentRepository.findOne.mockResolvedValue(mockContent)

      // ACT — request everything
      await helper.findById("content-1", {
        includeAuthor: true,
        includeSlides: true,
        includeInteractions: true,
        includeComments: true,
      })

      // ASSERT — should load all relations
      expect(contentRepository.findOne).toHaveBeenCalledWith({
        where: { id: "content-1" },
        relations: [
          "user",
          "slides",
          "likes",
          "bookmarks",
          "views",
          "comments",
          "comments.user",
        ],
      })
    })
  })
})
