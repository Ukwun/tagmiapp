import { Injectable, NotFoundException } from "@nestjs/common"
import { ReportStatus } from "../../reports/entities/report.entity"
import { ReportSearchQueryDto, ResolveReportDto } from "./dto/admin-reports.dto"
import { ReportRepository } from "../../reports/repositories/report.repository"
import { UserRepository } from "../../users/repositories/user.repository"
import { ContentRepository } from "../../content/repositories/content.repository"
import { CommentRepository } from "../../content/repositories/comment.repository"

@Injectable()
export class AdminReportsService {
  constructor(
    private readonly reportRepo: ReportRepository,
    private readonly userRepo: UserRepository,
    private readonly contentRepo: ContentRepository,
    private readonly commentRepo: CommentRepository,
  ) {}

  async getReports(query: ReportSearchQueryDto) {
    const page = query.page || 1
    const limit = query.limit || 20

    const qb = this.reportRepo
      .createQueryBuilder("r")
      .leftJoinAndSelect("r.reporter", "reporter")

    if (query.status) qb.andWhere("r.status = :status", { status: query.status })
    if (query.type) qb.andWhere("r.type = :type", { type: query.type })

    // Pending first, then by date
    qb.addSelect(
      `CASE WHEN r.status = '${ReportStatus.PENDING}' THEN 0 ELSE 1 END`,
      "sort_priority",
    )
      .orderBy("sort_priority", "ASC")
      .addOrderBy("r.createdAt", "DESC")

    qb.skip((page - 1) * limit).take(limit)

    const [data, total] = await qb.getManyAndCount()

    return {
      data: data.map((r) => ({
        id: r.id,
        type: r.type,
        reason: r.reason,
        description: r.description,
        status: r.status,
        targetUserId: r.targetUserId,
        targetPostId: r.targetPostId,
        targetCommentId: r.targetCommentId,
        reporter: r.reporter
          ? { id: r.reporter.id, username: r.reporter.username, displayName: r.reporter.displayName }
          : null,
        createdAt: r.createdAt,
      })),
      total,
      page,
      limit,
    }
  }

  async getReportDetail(id: string) {
    const report = await this.reportRepo.findOne({
      where: { id },
      relations: ["reporter"],
    })
    if (!report) throw new NotFoundException("Report not found")

    let target: any = null

    if (report.targetUserId) {
      const user = await this.userRepo.findOne({ where: { id: report.targetUserId } })
      if (user) {
        const { passwordHash, ...safeUser } = user as any
        target = { type: "user", data: safeUser }
      }
    } else if (report.targetPostId) {
      const content = await this.contentRepo.findOne({
        where: { postId: report.targetPostId, sortOrder: 0 },
        relations: ["user"],
      })
      if (content) {
        target = {
          type: "post",
          data: {
            id: content.id,
            postId: content.postId,
            contentType: content.contentType,
            caption: content.caption,
            mediaUrl: content.mediaUrl,
            isActive: content.isActive,
            user: content.user
              ? { id: content.user.id, username: content.user.username }
              : null,
          },
        }
      }
    } else if (report.targetCommentId) {
      const comment = await this.commentRepo.findOne({
        where: { id: report.targetCommentId },
        relations: ["user"],
      })
      if (comment) {
        target = {
          type: "comment",
          data: {
            id: comment.id,
            text: comment.text,
            user: (comment as any).user
              ? { id: (comment as any).user.id, username: (comment as any).user.username }
              : null,
          },
        }
      }
    }

    return {
      id: report.id,
      type: report.type,
      reason: report.reason,
      description: report.description,
      status: report.status,
      reporter: report.reporter
        ? { id: report.reporter.id, username: report.reporter.username, displayName: report.reporter.displayName }
        : null,
      target,
      createdAt: report.createdAt,
    }
  }

  async resolveReport(id: string, dto: ResolveReportDto) {
    const report = await this.reportRepo.findOne({ where: { id } })
    if (!report) throw new NotFoundException("Report not found")

    report.status = dto.status
    await this.reportRepo.save(report)

    // If resolved and target is a post, deactivate the content
    if (dto.status === ReportStatus.RESOLVED && report.targetPostId) {
      await this.contentRepo.update(
        { postId: report.targetPostId },
        { isActive: false },
      )
    }

    return { id: report.id, status: report.status }
  }

  async deleteReport(id: string) {
    const report = await this.reportRepo.findOne({ where: { id } })
    if (!report) throw new NotFoundException("Report not found")

    await this.reportRepo.remove(report)
    return { id, deleted: true }
  }
}
