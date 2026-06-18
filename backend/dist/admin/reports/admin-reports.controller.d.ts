import { AdminReportsService } from "./admin-reports.service";
import { ReportSearchQueryDto, ResolveReportDto } from "./dto/admin-reports.dto";
export declare class AdminReportsController {
    private readonly reportsService;
    constructor(reportsService: AdminReportsService);
    getReports(query: ReportSearchQueryDto): Promise<{
        data: {
            id: string;
            type: import("../../reports/entities/report.entity").ReportType;
            reason: import("../../reports/entities/report.entity").ReportReason;
            description: string;
            status: import("../../reports/entities/report.entity").ReportStatus;
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
        status: import("../../reports/entities/report.entity").ReportStatus;
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
        status: import("../../reports/entities/report.entity").ReportStatus;
    }>;
    deleteReport(id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
