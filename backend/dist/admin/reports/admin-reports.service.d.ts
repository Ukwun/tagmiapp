import { ReportStatus } from "../../reports/entities/report.entity";
import { ReportSearchQueryDto, ResolveReportDto } from "./dto/admin-reports.dto";
import { ReportRepository } from "../../reports/repositories/report.repository";
import { UserRepository } from "../../users/repositories/user.repository";
import { ContentRepository } from "../../content/repositories/content.repository";
import { CommentRepository } from "../../content/repositories/comment.repository";
export declare class AdminReportsService {
    private readonly reportRepo;
    private readonly userRepo;
    private readonly contentRepo;
    private readonly commentRepo;
    constructor(reportRepo: ReportRepository, userRepo: UserRepository, contentRepo: ContentRepository, commentRepo: CommentRepository);
    getReports(query: ReportSearchQueryDto): Promise<{
        data: {
            id: string;
            type: import("../../reports/entities/report.entity").ReportType;
            reason: import("../../reports/entities/report.entity").ReportReason;
            description: string;
            status: ReportStatus;
            targetUserId: string;
            targetPostId: string;
            targetCommentId: string;
            reporter: {
                id: string;
                username: string;
                displayName: string;
            };
            createdAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getReportDetail(id: string): Promise<{
        id: string;
        type: import("../../reports/entities/report.entity").ReportType;
        reason: import("../../reports/entities/report.entity").ReportReason;
        description: string;
        status: ReportStatus;
        reporter: {
            id: string;
            username: string;
            displayName: string;
        };
        target: any;
        createdAt: Date;
    }>;
    resolveReport(id: string, dto: ResolveReportDto): Promise<{
        id: string;
        status: ReportStatus;
    }>;
    deleteReport(id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
