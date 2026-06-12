import { ReportsService } from "./reports.service";
import { CreateReportDto } from "./dto/create-report.dto";
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    createReport(createReportDto: CreateReportDto, req: any): Promise<{
        success: boolean;
        data: import("./entities/report.entity").Report;
    }>;
    getMyReports(req: any, page?: number, limit?: number): Promise<{
        data: import("./entities/report.entity").Report[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
}
