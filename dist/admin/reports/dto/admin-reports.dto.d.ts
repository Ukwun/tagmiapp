import { PaginationQueryDto } from "../../dto/pagination.dto";
import { ReportStatus, ReportType } from "../../../reports/entities/report.entity";
export declare class ReportSearchQueryDto extends PaginationQueryDto {
    status?: ReportStatus;
    type?: ReportType;
}
export declare class ResolveReportDto {
    status: ReportStatus;
    adminNote?: string;
}
