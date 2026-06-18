import { Report, ReportType, ReportReason } from "./entities/report.entity";
import { ReportRepository } from "./repositories/report.repository";
export declare class ReportsService {
    private reportRepository;
    constructor(reportRepository: ReportRepository);
    createReport(data: {
        reporterId: string;
        type: ReportType;
        reason: ReportReason;
        description?: string;
        targetUserId?: string;
        targetPostId?: string;
        targetCommentId?: string;
    }): Promise<Report>;
    getMyReports(userId: string, page?: number, limit?: number): Promise<{
        data: Report[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
}
