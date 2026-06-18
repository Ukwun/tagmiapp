export interface ApiResponse<T = any> {
    success: true;
    data: T;
    meta?: PaginationMeta;
    message?: string;
}
export interface ApiMessageResponse {
    success: true;
    message: string;
}
export interface ApiErrorResponse {
    success: false;
    message: string;
    code?: string;
    fields?: ValidationError[];
}
export interface ValidationError {
    field: string;
    message: string;
}
export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface PaginatedResponse<T> {
    success: true;
    data: T[];
    meta: PaginationMeta;
}
