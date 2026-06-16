/**
 * ApiResponse Interfaces
 *
 * Defines the standard response format for all API endpoints.
 * Every response from the backend follows one of these shapes.
 *
 * This ensures the frontend always knows what to expect.
 * No endpoint should return data in a different format.
 *
 * Used by: ResponseTransformInterceptor, all controllers
 */

/**
 * Standard success response with data
 */
export interface ApiResponse<T = any> {
  success: true
  data: T
  meta?: PaginationMeta
  message?: string
}

/**
 * Success response with only a message (no data to return)
 */
export interface ApiMessageResponse {
  success: true
  message: string
}

/**
 * Error response with friendly message
 */
export interface ApiErrorResponse {
  success: false
  message: string
  code?: string
  fields?: ValidationError[]
}

/**
 * Validation error for a specific field
 */
export interface ValidationError {
  field: string
  message: string
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

/**
 * Paginated response with items and meta
 */
export interface PaginatedResponse<T> {
  success: true
  data: T[]
  meta: PaginationMeta
}
