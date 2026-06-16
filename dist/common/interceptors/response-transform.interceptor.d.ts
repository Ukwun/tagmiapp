import { NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { ApiResponse, ApiMessageResponse } from "../interfaces/api-response.interface";
export declare class ResponseTransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T> | ApiMessageResponse> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T> | ApiMessageResponse>;
}
