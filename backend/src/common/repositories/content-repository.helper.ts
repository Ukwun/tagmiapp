/**
 * ContentRepositoryHelper
 *
 * Handles all content fetching patterns across the backend.
 * Content can be loaded with different combinations of relations
 * (author, slides, interactions, comments). Instead of every service
 * writing its own query, they call this helper with options.
 *
 * This helper does NOT handle content creation or updates.
 * Those operations belong in ContentService where validation and
 * business rules are enforced.
 *
 * It does NOT enrich content with user-specific data (isLiked, isBookmarked).
 * That is ContentTransformer's job.
 *
 * Used by: content, feed, search, notifications, admin services.
 */
import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Content } from "../../content/entities/content.entity"

export interface ContentFindOptions {
  userId?: string // Filter by author
  includeAuthor?: boolean
  includeSlides?: boolean
  includeInteractions?: boolean // likes, views, bookmarks
  includeComments?: boolean
}

@Injectable()
export class ContentRepositoryHelper {
  constructor(
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
  ) {}

  /**
   * Finds content by ID with configurable relations.
   *
   * The options parameter lets you load exactly what you need.
   * Loading only what you need keeps queries fast.
   *
   * @param id - Content ID
   * @param options - Configuration for which relations to load
   * @throws NotFoundException if content does not exist
   * @returns Content with requested relations
   */
  async findByIdOrFail(id: string, options: ContentFindOptions = {}): Promise<Content> {
    const relations = this.buildRelations(options)

    const content = await this.contentRepository.findOne({
      where: { id },
      relations,
    })

    if (!content) {
      throw new NotFoundException("Content not found")
    }

    return content
  }

  /**
   * Finds content by ID, returns null if not found.
   *
   * Use this when missing content is a valid scenario you need to handle.
   *
   * @param id - Content ID
   * @param options - Configuration for which relations to load
   * @returns Content object or null
   */
  async findById(id: string, options: ContentFindOptions = {}): Promise<Content | null> {
    const relations = this.buildRelations(options)

    return this.contentRepository.findOne({
      where: { id },
      relations,
    })
  }

  /**
   * Finds all content by a specific user.
   *
   * Used on profile pages and admin user detail views.
   * Returns newest content first.
   *
   * @param userId - The user ID who created the content
   * @param options - Configuration for relations
   * @returns Array of content items
   */
  async findByUser(userId: string, options: ContentFindOptions = {}): Promise<Content[]> {
    const relations = this.buildRelations(options)

    return this.contentRepository.find({
      where: { userId },
      relations,
      order: { createdAt: "DESC" },
    })
  }

  /**
   * Finds all content ordered by recency.
   *
   * Used in feeds and content listing endpoints.
   * Returns newest content first.
   *
   * @param options - Configuration for relations
   * @returns Array of content items
   */
  async findRecent(options: ContentFindOptions = {}): Promise<Content[]> {
    const relations = this.buildRelations(options)

    return this.contentRepository.find({
      relations,
      order: { createdAt: "DESC" },
    })
  }

  /**
   * Builds the relations array based on what the caller needs.
   *
   * This is private because callers should use the options interface
   * instead of manually building relations arrays.
   *
   * @param options - Content find options
   * @returns Array of relation strings for TypeORM
   */
  private buildRelations(options: ContentFindOptions): string[] {
    const relations: string[] = []

    if (options.includeAuthor) relations.push("user")
    if (options.includeSlides) relations.push("slides")
    if (options.includeInteractions) {
      relations.push("likes", "bookmarks", "views")
    }
    if (options.includeComments) {
      relations.push("comments", "comments.user")
    }

    return relations
  }
}
