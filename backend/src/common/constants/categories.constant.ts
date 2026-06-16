/**
 * TALENT_CATEGORIES
 *
 * The single source of truth for all talent/content categories across the platform.
 *
 * Used by:
 * - Media analysis AI (Claude Vision categorization)
 * - Talent profiles (skills/services offered)
 * - User preferences (personalized feed)
 * - Signup interests (onboarding)
 * - Booking types (client searching for talent)
 *
 * When adding/removing categories, update in ONE place here.
 * Frontend should fetch this list from an API endpoint, not duplicate it.
 */

/**
 * All valid talent categories in alphabetical order.
 * Each represents a type of creative talent that can be booked.
 */
export const TALENT_CATEGORIES = [
  "Acting",
  "Art",
  "Beauty",
  "Comedy",
  "Cooking",
  "Dance",
  "DJ",
  "Education",
  "Fashion",
  "Film",
  "Fitness",
  "Gaming",
  "Modeling",
  "Music",
  "Photography",
  "Singing",
  "Spoken Word",
  "Sports",
  "Technology",
  "Travel",
  "Writing",
] as const

/**
 * TypeScript type for a talent category.
 * Use this for type safety instead of plain strings.
 */
export type TalentCategory = typeof TALENT_CATEGORIES[number]

/**
 * Validate if a string is a valid talent category.
 */
export function isValidCategory(category: string): category is TalentCategory {
  return TALENT_CATEGORIES.includes(category as TalentCategory)
}

/**
 * Filter an array of strings to only include valid categories.
 * Useful when accepting user input that might contain invalid values.
 */
export function filterValidCategories(categories: string[]): TalentCategory[] {
  return categories.filter(isValidCategory)
}
