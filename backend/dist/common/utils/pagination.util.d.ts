export interface PaginationParams {
    page?: number | string;
    limit?: number | string;
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export declare class PaginationHelper {
    static normalizeParams(params: PaginationParams): {
        page: number;
        limit: number;
    };
    static buildResponse<T>(data: T[], total: number, page: number, limit: number): PaginatedResponse<T>;
    static applyToQueryBuilder<T>(queryBuilder: any, page: number, limit: number): any;
    static paginate<T>(repository: any, findOptions: any, params: PaginationParams): Promise<PaginatedResponse<T>>;
}
