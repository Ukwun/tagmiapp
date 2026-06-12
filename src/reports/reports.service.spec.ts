/**
 * ReportsService Test Suite
 *
 * Tests report creation and retrieval operations.
 */
import { Test, TestingModule } from "@nestjs/testing"
import { ReportsService } from "./reports.service"
import { ReportRepository } from "./repositories/report.repository"
import { ReportType, ReportReason, ReportStatus } from "./entities/report.entity"

describe("ReportsService", () => {
  let service: ReportsService
  let reportRepository: any

  const mockReport = {
    id: "report-123",
    reporterId: "user-123",
    type: ReportType.USER,
    reason: ReportReason.SPAM,
    description: "This user is spamming",
    targetUserId: "user-456",
    targetPostId: null,
    targetCommentId: null,
    status: ReportStatus.PENDING,
    createdAt: new Date(),
  }

  beforeEach(async () => {
    const mockReportRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: ReportRepository, useValue: mockReportRepository },
      ],
    }).compile()

    service = module.get<ReportsService>(ReportsService)
    reportRepository = module.get(ReportRepository)

    jest.clearAllMocks()
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("createReport", () => {
    it("should create a user report successfully", async () => {
      // Arrange
      const reportData = {
        reporterId: "user-123",
        type: ReportType.USER,
        reason: ReportReason.SPAM,
        description: "This user is spamming",
        targetUserId: "user-456",
      }
      jest.spyOn(reportRepository, "create").mockReturnValue(mockReport)
      jest.spyOn(reportRepository, "save").mockResolvedValue(mockReport)

      // Act
      const result = await service.createReport(reportData)

      // Assert
      expect(result).toEqual(mockReport)
      expect(reportRepository.create).toHaveBeenCalledWith(reportData)
      expect(reportRepository.save).toHaveBeenCalledWith(mockReport)
    })

    it("should create a post report successfully", async () => {
      // Arrange
      const postReport = {
        ...mockReport,
        type: ReportType.POST,
        targetUserId: undefined,
        targetPostId: "post-789",
      }
      const reportData = {
        reporterId: "user-123",
        type: ReportType.POST,
        reason: ReportReason.HARASSMENT,
        description: "Offensive content",
        targetPostId: "post-789",
      }
      jest.spyOn(reportRepository, "create").mockReturnValue(postReport)
      jest.spyOn(reportRepository, "save").mockResolvedValue(postReport)

      // Act
      const result = await service.createReport(reportData)

      // Assert
      expect(result.type).toBe(ReportType.POST)
      expect(result.targetPostId).toBe("post-789")
      expect(reportRepository.create).toHaveBeenCalledWith(reportData)
    })

    it("should create a comment report successfully", async () => {
      // Arrange
      const commentReport = {
        ...mockReport,
        type: ReportType.COMMENT,
        targetUserId: undefined,
        targetCommentId: "comment-999",
      }
      const reportData = {
        reporterId: "user-123",
        type: ReportType.COMMENT,
        reason: ReportReason.HATE_SPEECH,
        description: "Hateful comment",
        targetCommentId: "comment-999",
      }
      jest.spyOn(reportRepository, "create").mockReturnValue(commentReport)
      jest.spyOn(reportRepository, "save").mockResolvedValue(commentReport)

      // Act
      const result = await service.createReport(reportData)

      // Assert
      expect(result.type).toBe(ReportType.COMMENT)
      expect(result.targetCommentId).toBe("comment-999")
    })

    it("should create a report without description", async () => {
      // Arrange
      const reportData = {
        reporterId: "user-123",
        type: ReportType.USER,
        reason: ReportReason.SCAM,
        targetUserId: "user-456",
      }
      const reportWithoutDesc = { ...mockReport, description: undefined }
      jest.spyOn(reportRepository, "create").mockReturnValue(reportWithoutDesc)
      jest.spyOn(reportRepository, "save").mockResolvedValue(reportWithoutDesc)

      // Act
      const result = await service.createReport(reportData)

      // Assert
      expect(result).toEqual(reportWithoutDesc)
      expect(reportRepository.create).toHaveBeenCalledWith(reportData)
    })

    it("should handle all report reasons", async () => {
      // Arrange
      const reasons = [
        ReportReason.SPAM,
        ReportReason.HARASSMENT,
        ReportReason.HATE_SPEECH,
        ReportReason.VIOLENCE,
        ReportReason.NUDITY,
        ReportReason.FALSE_INFO,
        ReportReason.SCAM,
        ReportReason.OTHER,
      ]

      for (const reason of reasons) {
        const reportData = {
          reporterId: "user-123",
          type: ReportType.USER,
          reason,
          targetUserId: "user-456",
        }
        const report = { ...mockReport, reason }
        jest.spyOn(reportRepository, "create").mockReturnValue(report)
        jest.spyOn(reportRepository, "save").mockResolvedValue(report)

        // Act
        const result = await service.createReport(reportData)

        // Assert
        expect(result.reason).toBe(reason)
      }
    })
  })

  describe("getMyReports", () => {
    it("should retrieve user reports with pagination", async () => {
      // Arrange
      const reports = [
        mockReport,
        { ...mockReport, id: "report-456" },
      ]
      jest.spyOn(reportRepository, "findAndCount").mockResolvedValue([reports, 2])

      // Act
      const result = await service.getMyReports("user-123", 1, 20)

      // Assert
      expect(result.data).toEqual(reports)
      expect(result.total).toBe(2)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
      expect(result.hasNext).toBe(false)
      expect(result.hasPrev).toBe(false)
      expect(reportRepository.findAndCount).toHaveBeenCalledWith({
        where: { reporterId: "user-123" },
        order: { createdAt: "DESC" },
        skip: 0,
        take: 20,
      })
    })

    it("should return empty array if no reports", async () => {
      // Arrange
      jest.spyOn(reportRepository, "findAndCount").mockResolvedValue([[], 0])

      // Act
      const result = await service.getMyReports("user-123", 1, 20)

      // Assert
      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
      expect(result.hasNext).toBe(false)
      expect(result.hasPrev).toBe(false)
    })

    it("should handle pagination correctly with hasNext", async () => {
      // Arrange
      const reports = Array(20).fill(mockReport)
      jest.spyOn(reportRepository, "findAndCount").mockResolvedValue([reports, 25])

      // Act
      const result = await service.getMyReports("user-123", 1, 20)

      // Assert
      expect(result.total).toBe(25)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
      expect(result.hasNext).toBe(true)
      expect(result.hasPrev).toBe(false)
    })

    it("should handle pagination correctly with hasPrev", async () => {
      // Arrange
      const reports = Array(20).fill(mockReport)
      jest.spyOn(reportRepository, "findAndCount").mockResolvedValue([reports, 50])

      // Act
      const result = await service.getMyReports("user-123", 2, 20)

      // Assert
      expect(result.page).toBe(2)
      expect(result.hasNext).toBe(true)
      expect(result.hasPrev).toBe(true)
      expect(reportRepository.findAndCount).toHaveBeenCalledWith({
        where: { reporterId: "user-123" },
        order: { createdAt: "DESC" },
        skip: 20,
        take: 20,
      })
    })

    it("should handle custom page size", async () => {
      // Arrange
      const reports = Array(10).fill(mockReport)
      jest.spyOn(reportRepository, "findAndCount").mockResolvedValue([reports, 10])

      // Act
      const result = await service.getMyReports("user-123", 1, 10)

      // Assert
      expect(result.limit).toBe(10)
      expect(result.data).toHaveLength(10)
      expect(reportRepository.findAndCount).toHaveBeenCalledWith({
        where: { reporterId: "user-123" },
        order: { createdAt: "DESC" },
        skip: 0,
        take: 10,
      })
    })

    it("should order reports by creation date descending", async () => {
      // Arrange
      const oldReport = { ...mockReport, id: "old", createdAt: new Date("2024-01-01") }
      const newReport = { ...mockReport, id: "new", createdAt: new Date("2024-12-01") }
      jest.spyOn(reportRepository, "findAndCount").mockResolvedValue([[newReport, oldReport], 2])

      // Act
      const result = await service.getMyReports("user-123", 1, 20)

      // Assert
      expect(result.data[0].id).toBe("new")
      expect(result.data[1].id).toBe("old")
      expect(reportRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { createdAt: "DESC" },
        }),
      )
    })
  })
})
