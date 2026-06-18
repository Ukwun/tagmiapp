"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminReportsService = void 0;
const common_1 = require("@nestjs/common");
const report_entity_1 = require("../../reports/entities/report.entity");
const report_repository_1 = require("../../reports/repositories/report.repository");
const user_repository_1 = require("../../users/repositories/user.repository");
const content_repository_1 = require("../../content/repositories/content.repository");
const comment_repository_1 = require("../../content/repositories/comment.repository");
let AdminReportsService = class AdminReportsService {
    constructor(reportRepo, userRepo, contentRepo, commentRepo) {
        this.reportRepo = reportRepo;
        this.userRepo = userRepo;
        this.contentRepo = contentRepo;
        this.commentRepo = commentRepo;
    }
    async getReports(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const qb = this.reportRepo
            .createQueryBuilder("r")
            .leftJoinAndSelect("r.reporter", "reporter");
        if (query.status)
            qb.andWhere("r.status = :status", { status: query.status });
        if (query.type)
            qb.andWhere("r.type = :type", { type: query.type });
        qb.addSelect(`CASE WHEN r.status = '${report_entity_1.ReportStatus.PENDING}' THEN 0 ELSE 1 END`, "sort_priority")
            .orderBy("sort_priority", "ASC")
            .addOrderBy("r.createdAt", "DESC");
        qb.skip((page - 1) * limit).take(limit);
        const [data, total] = await qb.getManyAndCount();
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
        };
    }
    async getReportDetail(id) {
        const report = await this.reportRepo.findOne({
            where: { id },
            relations: ["reporter"],
        });
        if (!report)
            throw new common_1.NotFoundException("Report not found");
        let target = null;
        if (report.targetUserId) {
            const user = await this.userRepo.findOne({ where: { id: report.targetUserId } });
            if (user) {
                const { passwordHash, ...safeUser } = user;
                target = { type: "user", data: safeUser };
            }
        }
        else if (report.targetPostId) {
            const content = await this.contentRepo.findOne({
                where: { postId: report.targetPostId, sortOrder: 0 },
                relations: ["user"],
            });
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
                };
            }
        }
        else if (report.targetCommentId) {
            const comment = await this.commentRepo.findOne({
                where: { id: report.targetCommentId },
                relations: ["user"],
            });
            if (comment) {
                target = {
                    type: "comment",
                    data: {
                        id: comment.id,
                        text: comment.text,
                        user: comment.user
                            ? { id: comment.user.id, username: comment.user.username }
                            : null,
                    },
                };
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
        };
    }
    async resolveReport(id, dto) {
        const report = await this.reportRepo.findOne({ where: { id } });
        if (!report)
            throw new common_1.NotFoundException("Report not found");
        report.status = dto.status;
        await this.reportRepo.save(report);
        if (dto.status === report_entity_1.ReportStatus.RESOLVED && report.targetPostId) {
            await this.contentRepo.update({ postId: report.targetPostId }, { isActive: false });
        }
        return { id: report.id, status: report.status };
    }
    async deleteReport(id) {
        const report = await this.reportRepo.findOne({ where: { id } });
        if (!report)
            throw new common_1.NotFoundException("Report not found");
        await this.reportRepo.remove(report);
        return { id, deleted: true };
    }
};
exports.AdminReportsService = AdminReportsService;
exports.AdminReportsService = AdminReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [report_repository_1.ReportRepository,
        user_repository_1.UserRepository,
        content_repository_1.ContentRepository,
        comment_repository_1.CommentRepository])
], AdminReportsService);
//# sourceMappingURL=admin-reports.service.js.map