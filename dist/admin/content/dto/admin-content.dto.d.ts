import { PaginationQueryDto } from "../../dto/pagination.dto";
export declare class ContentSearchQueryDto extends PaginationQueryDto {
    search?: string;
    contentType?: string;
    userId?: string;
    isActive?: boolean;
    sortBy?: string;
}
export declare class BulkContentActionDto {
    postIds: string[];
    action: "activate" | "deactivate";
}
