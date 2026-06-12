/**
 * PaginationHelper Tests
 *
 * Tests all pagination utilities to ensure they normalize parameters correctly,
 * build proper responses, and handle edge cases.
 */
import { PaginationHelper } from "../utils/pagination.util"

describe("PaginationHelper", () => {
  describe("normalizeParams", () => {
    it("should return default values when no params provided", () => {
      // ARRANGE — empty params object
      const params = {}

      // ACT — normalize the params
      const result = PaginationHelper.normalizeParams(params)

      // ASSERT — should use defaults (page 1, limit 20)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
    })

    it("should convert string params to numbers", () => {
      // ARRANGE — params as strings (from query params)
      const params = { page: "3", limit: "50" }

      // ACT
      const result = PaginationHelper.normalizeParams(params)

      // ASSERT — should be numbers now
      expect(result.page).toBe(3)
      expect(result.limit).toBe(50)
    })

    it("should enforce minimum page of 1", () => {
      // ARRANGE — invalid page numbers
      const params1 = { page: 0 }
      const params2 = { page: -5 }

      // ACT
      const result1 = PaginationHelper.normalizeParams(params1)
      const result2 = PaginationHelper.normalizeParams(params2)

      // ASSERT — page should never be less than 1
      expect(result1.page).toBe(1)
      expect(result2.page).toBe(1)
    })

    it("should cap limit at 100 to prevent database overload", () => {
      // ARRANGE — someone trying to request 10,000 items
      const params = { limit: 10000 }

      // ACT
      const result = PaginationHelper.normalizeParams(params)

      // ASSERT — limit capped at 100
      expect(result.limit).toBe(100)
    })

    it("should use default when limit is 0", () => {
      // ARRANGE — invalid limit value (0 is falsy)
      const params = { limit: 0 }

      // ACT
      const result = PaginationHelper.normalizeParams(params)

      // ASSERT — 0 is falsy, so default 20 is used
      expect(result.limit).toBe(20)
    })

    it("should handle invalid string inputs gracefully", () => {
      // ARRANGE — non-numeric strings
      const params = { page: "abc", limit: "xyz" }

      // ACT
      const result = PaginationHelper.normalizeParams(params)

      // ASSERT — should fall back to defaults
      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
    })
  })

  describe("buildResponse", () => {
    it("should build response with correct pagination flags", () => {
      // ARRANGE — 50 total items, page 2, 20 per page
      const data = Array.from({ length: 20 }, (_, i) => ({ id: i }))
      const total = 50
      const page = 2
      const limit = 20

      // ACT
      const result = PaginationHelper.buildResponse(data, total, page, limit)

      // ASSERT — should indicate there's a next and previous page
      expect(result.data).toEqual(data)
      expect(result.total).toBe(50)
      expect(result.page).toBe(2)
      expect(result.limit).toBe(20)
      expect(result.hasNext).toBe(true) // 2 * 20 = 40, less than 50
      expect(result.hasPrev).toBe(true) // page > 1
    })

    it("should indicate no next page when on last page", () => {
      // ARRANGE — page 3 of 3 (41-50 of 50 total)
      const data = Array.from({ length: 10 }, (_, i) => ({ id: i }))
      const total = 50
      const page = 3
      const limit = 20

      // ACT
      const result = PaginationHelper.buildResponse(data, total, page, limit)

      // ASSERT — should indicate no next page
      expect(result.hasNext).toBe(false) // 3 * 20 = 60, >= 50
      expect(result.hasPrev).toBe(true)
    })

    it("should indicate no previous page when on first page", () => {
      // ARRANGE — page 1
      const data = Array.from({ length: 20 }, (_, i) => ({ id: i }))
      const total = 50
      const page = 1
      const limit = 20

      // ACT
      const result = PaginationHelper.buildResponse(data, total, page, limit)

      // ASSERT — should indicate no previous page
      expect(result.hasNext).toBe(true)
      expect(result.hasPrev).toBe(false) // page = 1
    })

    it("should handle single page of results", () => {
      // ARRANGE — only 15 items total, fits on one page
      const data = Array.from({ length: 15 }, (_, i) => ({ id: i }))
      const total = 15
      const page = 1
      const limit = 20

      // ACT
      const result = PaginationHelper.buildResponse(data, total, page, limit)

      // ASSERT — no next or previous pages
      expect(result.hasNext).toBe(false)
      expect(result.hasPrev).toBe(false)
    })

    it("should handle empty results", () => {
      // ARRANGE — no data found
      const data = []
      const total = 0
      const page = 1
      const limit = 20

      // ACT
      const result = PaginationHelper.buildResponse(data, total, page, limit)

      // ASSERT — empty data, no pagination
      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
      expect(result.hasNext).toBe(false)
      expect(result.hasPrev).toBe(false)
    })
  })

  describe("applyToQueryBuilder", () => {
    it("should apply skip and take to query builder", () => {
      // ARRANGE — mock query builder
      const mockQueryBuilder = {
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
      }
      const page = 3
      const limit = 20

      // ACT
      PaginationHelper.applyToQueryBuilder(mockQueryBuilder, page, limit)

      // ASSERT — should skip 40 items (first 2 pages) and take 20
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(40) // (3 - 1) * 20
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20)
    })

    it("should skip 0 items on first page", () => {
      // ARRANGE
      const mockQueryBuilder = {
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
      }
      const page = 1
      const limit = 20

      // ACT
      PaginationHelper.applyToQueryBuilder(mockQueryBuilder, page, limit)

      // ASSERT — first page skips nothing
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0) // (1 - 1) * 20
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20)
    })
  })

  describe("paginate", () => {
    it("should perform complete pagination flow", async () => {
      // ARRANGE — mock repository
      const mockData = Array.from({ length: 20 }, (_, i) => ({ id: i }))
      const mockRepository = {
        findAndCount: jest.fn().mockResolvedValue([mockData, 50]),
      }
      const findOptions = { where: { status: "active" }, order: { createdAt: "DESC" } }
      const params = { page: 2, limit: 20 }

      // ACT
      const result = await PaginationHelper.paginate(mockRepository, findOptions, params)

      // ASSERT — should return paginated response
      expect(result.data).toEqual(mockData)
      expect(result.total).toBe(50)
      expect(result.page).toBe(2)
      expect(result.limit).toBe(20)
      expect(result.hasNext).toBe(true)
      expect(result.hasPrev).toBe(true)

      // Check repository was called with correct options
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { status: "active" },
        order: { createdAt: "DESC" },
        skip: 20, // page 2
        take: 20,
      })
    })

    it("should normalize params before querying", async () => {
      // ARRANGE — string params from query string
      const mockRepository = {
        findAndCount: jest.fn().mockResolvedValue([[], 0]),
      }
      const params = { page: "5", limit: "50" }

      // ACT
      await PaginationHelper.paginate(mockRepository, {}, params)

      // ASSERT — should have normalized and used in query
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        skip: 200, // (5 - 1) * 50
        take: 50,
      })
    })
  })
})
