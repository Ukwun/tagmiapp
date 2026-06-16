/**
 * ContentTransformer
 *
 * Enriches content objects with user-specific interaction data.
 * A post might have 1000 likes, but we need to tell the current user
 * whether THEY liked it. This transformer adds that context.
 *
 * This transformer does NOT fetch content from the database.
 * It enriches content that is already loaded.
 *
 * It does NOT handle like/bookmark actions — those belong in
 * InteractionsService where business rules apply.
 *
 * Used by: content, feed, search services.
 */
import { Content } from "../../content/entities/content.entity"
import { Repository } from "typeorm"

export interface EnrichedContent extends Content {
  isLiked?: boolean
  isBookmarked?: boolean
}

export class ContentTransformer {
  /**
   * Adds interaction status to a single content item.
   *
   * We check if the current user has liked or bookmarked this content.
   * If there is no logged-in user (userId is null), we skip these checks
   * and leave isLiked/isBookmarked undefined.
   *
   * The repositories are passed in because this is a static utility class.
   * Services inject their repositories and pass them here.
   *
   * @param content - The content object to enrich
   * @param userId - Current user ID (null if not logged in)
   * @param likeRepository - Repository for checking likes
   * @param bookmarkRepository - Repository for checking bookmarks
   * @returns Enriched content with interaction flags
   */
  static async enrichWithInteractions(
    content: Content,
    userId: string | null,
    likeRepository: Repository<any>,
    bookmarkRepository: Repository<any>,
  ): Promise<EnrichedContent> {
    const enriched: EnrichedContent = { ...content }

    // Only check interaction status if there is a logged-in user
    if (userId) {
      const [liked, bookmarked] = await Promise.all([
        likeRepository.count({
          where: { contentId: content.id, userId },
        }),
        bookmarkRepository.count({
          where: { contentId: content.id, userId },
        }),
      ])

      enriched.isLiked = liked > 0
      enriched.isBookmarked = bookmarked > 0
    }

    return enriched
  }

  /**
   * Enriches multiple content items efficiently.
   *
   * We process each item individually for now. In the future, this could
   * be optimized by fetching all likes/bookmarks for the user in two bulk
   * queries, then matching them to content items. For now, we keep it simple.
   *
   * @param contents - Array of content objects
   * @param userId - Current user ID (null if not logged in)
   * @param likeRepository - Repository for checking likes
   * @param bookmarkRepository - Repository for checking bookmarks
   * @returns Array of enriched content
   */
  static async enrichManyWithInteractions(
    contents: Content[],
    userId: string | null,
    likeRepository: Repository<any>,
    bookmarkRepository: Repository<any>,
  ): Promise<EnrichedContent[]> {
    return Promise.all(
      contents.map((content) =>
        this.enrichWithInteractions(content, userId, likeRepository, bookmarkRepository),
      ),
    )
  }
}
