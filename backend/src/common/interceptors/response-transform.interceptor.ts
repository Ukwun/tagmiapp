/**
 * ResponseTransformInterceptor
 *
 * Wraps every successful response in a standard format: { success: true, data: ... }
 * This runs AFTER the controller returns but BEFORE the response hits the client.
 *
 * The frontend can always expect the same response shape, no matter which endpoint.
 * If a controller returns just a user object, this wraps it in { success: true, data: user }.
 * If a controller returns null, this sends { success: true, message: "Success" }.
 *
 * This does NOT handle errors — GlobalExceptionFilter does that.
 *
 * Used by: AppModule (registered globally)
 */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common"
import { Observable } from "rxjs"
import { map } from "rxjs/operators"
import { ApiResponse, ApiMessageResponse } from "../interfaces/api-response.interface"

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T> | ApiMessageResponse>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T> | ApiMessageResponse> {
    return next.handle().pipe(
      map((data) => {
        // If response already has success field, return as-is
        // This allows controllers to send custom-shaped responses when needed
        if (data && typeof data === "object" && "success" in data) {
          return data
        }

        // If data is null or undefined, return message-only response
        if (data === null || data === undefined) {
          return {
            success: true,
            message: "Success",
          }
        }

        // If data has meta field, it's a paginated response
        if (data && typeof data === "object" && "meta" in data && "data" in data) {
          return {
            success: true,
            data: data.data,
            meta: data.meta,
          }
        }

        // Standard response with data
        return {
          success: true,
          data,
        }
      }),
    )
  }
}
