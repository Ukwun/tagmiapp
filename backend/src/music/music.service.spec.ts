/**
 * MusicService Test Suite
 *
 * Tests music search and trending functionality using Deezer API.
 */
import { Test, TestingModule } from "@nestjs/testing"
import { MusicService } from "./music.service"

describe("MusicService", () => {
  let service: MusicService

  const mockDeezerTrack = {
    id: 12345,
    title: "Test Song",
    title_short: "Test Song",
    artist: {
      name: "Test Artist",
    },
    album: {
      title: "Test Album",
      cover_big: "https://example.com/cover_big.jpg",
      cover_medium: "https://example.com/cover_medium.jpg",
      cover_small: "https://example.com/cover_small.jpg",
      cover: "https://example.com/cover.jpg",
    },
    duration: 180,
    preview: "https://example.com/preview.mp3",
  }

  const mockDeezerResponse = {
    data: [mockDeezerTrack],
    total: 1,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MusicService],
    }).compile()

    service = module.get<MusicService>(MusicService)

    // Clear all mocks
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("search", () => {
    it("should search for music tracks successfully", async () => {
      // Arrange
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDeezerResponse),
      })
      global.fetch = mockFetch as any

      // Act
      const result = await service.search("test query", 20)

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: "12345",
        title: "Test Song",
        artist: "Test Artist",
        album: "Test Album",
        duration: 180,
        previewUrl: "https://example.com/preview.mp3",
        coverUrl: "https://example.com/cover_big.jpg",
        coverSmall: "https://example.com/cover_small.jpg",
      })
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/search?q=test%20query&limit=20"),
        expect.any(Object),
      )
    })

    it("should filter out tracks without preview URLs", async () => {
      // Arrange
      const trackWithoutPreview = { ...mockDeezerTrack, preview: null }
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: [mockDeezerTrack, trackWithoutPreview],
        }),
      })
      global.fetch = mockFetch as any

      // Act
      const result = await service.search("test query")

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe("12345")
    })

    it("should return trending if query is empty", async () => {
      // Arrange
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDeezerResponse),
      })
      global.fetch = mockFetch as any

      // Act
      const result = await service.search("", 20)

      // Assert
      expect(result).toHaveLength(1)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/chart/0/tracks"),
        expect.any(Object),
      )
    })

    it("should return empty array on API error", async () => {
      // Arrange
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      })
      global.fetch = mockFetch as any

      // Act
      const result = await service.search("test query")

      // Assert
      expect(result).toEqual([])
    })

    it("should respect limit parameter", async () => {
      // Arrange
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDeezerResponse),
      })
      global.fetch = mockFetch as any

      // Act
      await service.search("test query", 10)

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("limit=10"),
        expect.any(Object),
      )
    })

    it("should cap limit at 50", async () => {
      // Arrange
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDeezerResponse),
      })
      global.fetch = mockFetch as any

      // Act
      await service.search("test query", 100)

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("limit=50"),
        expect.any(Object),
      )
    })

    it("should handle tracks with missing album data", async () => {
      // Arrange
      const trackWithoutAlbum = {
        ...mockDeezerTrack,
        album: null,
        artist: null,
      }
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: [trackWithoutAlbum],
        }),
      })
      global.fetch = mockFetch as any

      // Act
      const result = await service.search("test query")

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].artist).toBe("")
      expect(result[0].album).toBe("")
      expect(result[0].coverUrl).toBe("")
      expect(result[0].coverSmall).toBe("")
    })

    it("should handle network timeout and fallback to https.get", async () => {
      // Arrange
      const mockFetch = jest.fn().mockRejectedValue(new Error("Network timeout"))
      global.fetch = mockFetch as any

      // Mock the private httpsGetJson method to return success
      jest.spyOn(service as any, "httpsGetJson").mockResolvedValue(mockDeezerResponse)

      // Act
      const result = await service.search("test query")

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe("Test Song")
      expect((service as any).httpsGetJson).toHaveBeenCalled()
    })
  })

  describe("getTrending", () => {
    it("should get trending music tracks successfully", async () => {
      // Arrange
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDeezerResponse),
      })
      global.fetch = mockFetch as any

      // Act
      const result = await service.getTrending(20)

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: "12345",
        title: "Test Song",
        artist: "Test Artist",
        album: "Test Album",
        duration: 180,
        previewUrl: "https://example.com/preview.mp3",
        coverUrl: "https://example.com/cover_big.jpg",
        coverSmall: "https://example.com/cover_small.jpg",
      })
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/chart/0/tracks?limit=20"),
        expect.any(Object),
      )
    })

    it("should filter out tracks without preview URLs", async () => {
      // Arrange
      const trackWithoutPreview = { ...mockDeezerTrack, preview: "" }
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: [mockDeezerTrack, trackWithoutPreview],
        }),
      })
      global.fetch = mockFetch as any

      // Act
      const result = await service.getTrending()

      // Assert
      expect(result).toHaveLength(1)
    })

    it("should return empty array on API error", async () => {
      // Arrange
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: "Service Unavailable",
      })
      global.fetch = mockFetch as any

      // Act
      const result = await service.getTrending()

      // Assert
      expect(result).toEqual([])
    })

    it("should respect limit parameter", async () => {
      // Arrange
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDeezerResponse),
      })
      global.fetch = mockFetch as any

      // Act
      await service.getTrending(15)

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("limit=15"),
        expect.any(Object),
      )
    })

    it("should cap limit at 50", async () => {
      // Arrange
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDeezerResponse),
      })
      global.fetch = mockFetch as any

      // Act
      await service.getTrending(75)

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("limit=50"),
        expect.any(Object),
      )
    })

    it("should handle network timeout and fallback to https.get", async () => {
      // Arrange
      const mockFetch = jest.fn().mockRejectedValue(new Error("Connection refused"))
      global.fetch = mockFetch as any

      jest.spyOn(service as any, "httpsGetJson").mockResolvedValue(mockDeezerResponse)

      // Act
      const result = await service.getTrending()

      // Assert
      expect(result).toHaveLength(1)
      expect((service as any).httpsGetJson).toHaveBeenCalled()
    })

    it("should use default limit of 20 when not specified", async () => {
      // Arrange
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDeezerResponse),
      })
      global.fetch = mockFetch as any

      // Act
      await service.getTrending()

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("limit=20"),
        expect.any(Object),
      )
    })
  })

  describe("mapTrack", () => {
    it("should map track with all fields present", () => {
      // Act
      const result = (service as any).mapTrack(mockDeezerTrack)

      // Assert
      expect(result).toEqual({
        id: "12345",
        title: "Test Song",
        artist: "Test Artist",
        album: "Test Album",
        duration: 180,
        previewUrl: "https://example.com/preview.mp3",
        coverUrl: "https://example.com/cover_big.jpg",
        coverSmall: "https://example.com/cover_small.jpg",
      })
    })

    it("should use title_short if title is missing", () => {
      // Arrange
      const track = { ...mockDeezerTrack, title: null }

      // Act
      const result = (service as any).mapTrack(track)

      // Assert
      expect(result.title).toBe("Test Song")
    })

    it("should fallback to cover_medium if cover_big is missing", () => {
      // Arrange
      const track = {
        ...mockDeezerTrack,
        album: {
          ...mockDeezerTrack.album,
          cover_big: null,
        },
      }

      // Act
      const result = (service as any).mapTrack(track)

      // Assert
      expect(result.coverUrl).toBe("https://example.com/cover_medium.jpg")
    })

    it("should fallback to cover if cover_small is missing", () => {
      // Arrange
      const track = {
        ...mockDeezerTrack,
        album: {
          ...mockDeezerTrack.album,
          cover_small: null,
        },
      }

      // Act
      const result = (service as any).mapTrack(track)

      // Assert
      expect(result.coverSmall).toBe("https://example.com/cover.jpg")
    })

    it("should handle completely missing fields", () => {
      // Arrange
      const track = { id: 999 }

      // Act
      const result = (service as any).mapTrack(track)

      // Assert
      expect(result).toEqual({
        id: "999",
        title: "",
        artist: "",
        album: "",
        duration: 0,
        previewUrl: "",
        coverUrl: "",
        coverSmall: "",
      })
    })
  })
})
