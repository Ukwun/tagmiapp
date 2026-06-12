/**
 * CategoriesController
 *
 * Public endpoint that returns the list of valid talent categories.
 * Frontend uses this for:
 * - Signup interest selection
 * - Talent profile category dropdowns
 * - Search filters
 * - Content categorization
 *
 * This ensures frontend and backend stay in sync — categories are
 * defined in ONE place (categories.constant.ts) and served via API.
 */
import { Controller, Get } from "@nestjs/common"
import { TALENT_CATEGORIES } from "./constants/categories.constant"

@Controller("categories")
export class CategoriesController {
  /**
   * GET /categories
   *
   * Returns the list of all valid talent categories.
   * No authentication required (public endpoint).
   */
  @Get()
  getCategories() {
    return {
      success: true,
      data: [...TALENT_CATEGORIES], // Convert readonly array to mutable for JSON
    }
  }
}
