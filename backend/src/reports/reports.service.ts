import { Injectable } from "@nestjs/common"
import { Report, ReportType, ReportReason, ReportStatus } from "./entities/report.entity"
import { ReportRepository } from "./repositories/report.repository"

@Injectable()
export class ReportsService {
  constructor(
    private reportRepository: ReportRepository,
  ) {}

  async createReport(data: {
    reporterId: string
    type: ReportType
    reason: ReportReason
    description?: string
    targetUserId?: string
    targetPostId?: string
    targetCommentId?: string
  }): Promise<Report> {
    const report = this.reportRepository.create(data)
    return this.reportRepository.save(report)
  }

  async getMyReports(userId: string, page = 1, limit = 20) {
    const [reports, total] = await this.reportRepository.findAndCount({
      where: { reporterId: userId },
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    })

    return {
      data: reports,
      total,
      page,
      limit,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    }
  }
}
