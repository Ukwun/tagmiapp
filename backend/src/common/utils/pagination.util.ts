/**
 * PaginationHelper
 *
 * Standardizes pagination across all list endpoints.
 * Every service that returns paginated data uses this instead of
 * writing its own skip/take logic and response formatting.
 *
 * This helper does NOT fetch data from the database.
 * It only handles the math and response formatting.
 *
 * It does NOT validate query parameters — that is handled by
 * PaginationDto in the controller layer.
 *
 * Used by: bookings, wallet, chat, content, users, notifications services.
 */
export interface PaginationParams {
  page?: number | string
  limit?: number | string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

export class PaginationHelper {
  /**
   * Converts page and limit parameters to safe numbers.
   *
   * Controllers often receive these as strings from query params.
   * We normalize them here so services don't have to.
   *
   * The limit is capped at 100 to prevent anyone from requesting
   * 10,000 items at once and overloading the database.
   *
   * @param params - Pagination parameters (may be strings from query params)
   * @returns Normalized page and limit as numbers
   */
  static normalizeParams(params: PaginationParams): { page: number; limit: number } {
    const page = Math.max(Number(params.page) || 1, 1)
    const limit = Math.min(Math.max(Number(params.limit) || 20, 1), 100)
    return { page, limit }
  }

  /**
   * Builds the standard paginated response object.
   *
   * hasNext and hasPrev tell the frontend whether to show
   * next/previous buttons. Calculating this here means services
   * don't have to repeat the logic.
   *
   * @param data - The array of items for this page
   * @param total - Total count of items across all pages
   * @param page - Current page number
   * @param limit - Items per page
   * @returns Standardized pagination response
   */
  static buildResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResponse<T> {
    return {
      data,
      total,
      page,
      limit,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    }
  }

  /**
   * Applies pagination to a TypeORM query builder.
   *
   * Use this when you are building a complex query with joins and filters.
   * Just pass your query builder here before calling getManyAndCount().
   *
   * @param queryBuilder - TypeORM query builder instance
   * @param page - Page number
   * @param limit - Items per page
   * @returns The query builder with skip/take applied
   */
  static applyToQueryBuilder<T>(queryBuilder: any, page: number, limit: number) {
    return queryBuilder.skip((page - 1) * limit).take(limit)
  }

  /**
   * Complete pagination flow for simple queries.
   *
   * When you have a straightforward find operation with no custom logic,
   * this method handles everything — normalization, query, and response.
   *
   * Example:
   * return PaginationHelper.paginate(
   *   this.bookingRepository,
   *   { where: { userId }, order: { createdAt: 'DESC' } },
   *   { page: 1, limit: 20 }
   * )
   *
   * @param repository - TypeORM repository instance
   * @param findOptions - TypeORM find options (where, order, relations)
   * @param params - Pagination parameters
   * @returns Paginated response
   */
  static async paginate<T>(
    repository: any,
    findOptions: any,
    params: PaginationParams,
  ): Promise<PaginatedResponse<T>> {
    const { page, limit } = this.normalizeParams(params)

    const [data, total] = await repository.findAndCount({
      ...findOptions,
      skip: (page - 1) * limit,
      take: limit,
    })

    return this.buildResponse(data, total, page, limit)
  }
}
