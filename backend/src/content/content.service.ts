import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject, forwardRef, Optional, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { IsNull, Not, In, LessThanOrEqual, MoreThan } from "typeorm"
import { Content } from "./entities/content.entity"
import { ContentInteraction } from "./entities/content-interaction.entity"
import { EngagementSignal } from "./entities/engagement-signal.entity"
import { Comment } from "./entities/comment.entity"
import { CommentLike } from "./entities/comment-like.entity"
import { Mention } from "./entities/mention.entity"
import { User } from "../users/entities/user.entity"
import { ContentRepository } from "./repositories/content.repository"
import { ContentInteractionRepository } from "./repositories/content-interaction.repository"
import { CommentRepository } from "./repositories/comment.repository"
import { CommentLikeRepository } from "./repositories/comment-like.repository"
import { MentionRepository } from "./repositories/mention.repository"
import { EngagementSignalRepository } from "./repositories/engagement-signal.repository"
import { UserRepository } from "../users/repositories/user.repository"
import { FollowRepository } from "../follows/repositories/follow.repository"
import { StorageService } from "../config/storage.service"
import { RedisService } from "../config/redis.service"
import { NotificationsService } from "../notifications/notifications.service"
import { ValidationPipelineService } from "../referrals/services/validation-pipeline.service"
import { MediaAnalysisService } from "../ai/media-analysis/media-analysis.service"
import { CategorizationService } from "../ai/categorization/categorization.service"
import { UserPreferenceRepository } from "./repositories/user-preference.repository"
import { UserPreferenceLearningService } from "./user-preference-learning.service"
import { PersonalizedFeedService } from "./personalized-feed.service"
import type { EngagementSignalDto } from "./dto/create-engagement-signals.dto"
import type { CreateContentDto } from "./dto/create-content.dto"
import type { CreatePostDto } from "./dto/create-post.dto"
import type { UpdateContentDto } from "./dto/update-content.dto"
import type { CreateCommentDto } from "./dto/create-comment.dto"
import type { Express } from "express"
import { v4 as uuidv4 } from "uuid"
import * as path from "path"
import * as os from "os"
import * as fs from "fs/promises"
import { createReadStream } from "fs"
import { execFile } from "child_process"
import { promisify } from "util"
import type { Response } from "express"

const execFileAsync = promisify(execFile)

@Injectable()
export class ContentService {
  constructor(
    private contentRepository: ContentRepository,
    private interactionRepository: ContentInteractionRepository,
    private commentRepository: CommentRepository,
    private commentLikeRepository: CommentLikeRepository,
    private mentionRepository: MentionRepository,
    private userRepository: UserRepository,
    private followRepository: FollowRepository,
    private engagementSignalRepository: EngagementSignalRepository,
    private storageService: StorageService,
    private redisService: RedisService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
    @Optional() @Inject(forwardRef(() => ValidationPipelineService))
    private validationPipelineService?: ValidationPipelineService,
    @Optional() private mediaAnalysisService?: MediaAnalysisService,
    @Optional() private categorizationService?: CategorizationService,
    @Optional() private userPreferenceRepository?: UserPreferenceRepository,
    @Optional() private userPreferenceLearningService?: UserPreferenceLearningService,
    @Optional() private personalizedFeedService?: PersonalizedFeedService,
  ) {}

  private readonly logger = new Logger(ContentService.name)

  private async triggerReferralValidation(userId: string): Promise<void> {
    if (!this.validationPipelineService) return
    try {
      const referral = await this.validationPipelineService.getActiveReferralForUser(userId)
      if (referral) {
        await this.validationPipelineService.runValidation(referral.id)
      }
    } catch (error) {
      this.logger.warn(`Failed to trigger referral validation for user ${userId}: ${(error as any).message}`)
    }
  }

  /**
   * Analyze all media slides in a post using Claude Vision API.
   * Sends images/video frames to Claude and gets back accurate descriptions
   * and content categories in a single API call per slide.
   *
   * Called fire-and-forget after post creation — never blocks the upload response.
   *
   * NEW: Accepts optional fileBuffers map to analyze from local files instead of
   * downloading from CDN. This fixes the issue where CDN URLs may not be accessible
   * immediately after upload or during network issues.
   */
  private async analyzePostContent(
    slides: Content[],
    fileBuffers?: Map<string, Express.Multer.File>,
  ): Promise<void> {
    if (!this.mediaAnalysisService) return

    const mediaSlides = slides.filter(s => s.contentType !== "text" && s.mediaUrl)
    if (mediaSlides.length === 0) return

    const firstSlide = slides.find(s => s.sortOrder === 0)

    for (const slide of mediaSlides) {
      let result

      // If we have the original file, analyze it directly instead of downloading from CDN
      if (fileBuffers?.has(slide.mediaUrl)) {
        const file = fileBuffers.get(slide.mediaUrl)!

        // Try to analyze from local file (either buffer in memory or path on disk)
        if (file.buffer) {
          // File is in memory - save to temp and analyze
          const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "upload-analysis-"))

          try {
            const ext = path.extname(file.originalname) || ".tmp"
            const tmpPath = path.join(tmpDir, `file${ext}`)
            await fs.writeFile(tmpPath, file.buffer)

            result = await this.mediaAnalysisService.analyzeContentFromFile(
              slide.contentType as "video" | "image" | "audio",
              tmpPath,
              slide.caption,
            )
          } catch (error) {
            this.logger.warn(`Failed to analyze from buffer for ${slide.id}: ${(error as any).message}`)
            // Fallback to CDN if buffer analysis fails
            result = await this.mediaAnalysisService.analyzeContent(
              slide.contentType as "video" | "image" | "audio",
              slide.mediaUrl,
              slide.caption,
            )
          } finally {
            await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
          }
        } else if (file.path) {
          // File is on disk - analyze directly from disk path (no need to copy)
          try {
            this.logger.log(`Analyzing from disk path for ${slide.id}: ${file.path}`)
            result = await this.mediaAnalysisService.analyzeContentFromFile(
              slide.contentType as "video" | "image" | "audio",
              file.path,
              slide.caption,
            )
          } catch (error) {
            this.logger.warn(`Failed to analyze from disk path for ${slide.id}: ${(error as any).message}`)
            // Fallback to CDN if disk analysis fails
            result = await this.mediaAnalysisService.analyzeContent(
              slide.contentType as "video" | "image" | "audio",
              slide.mediaUrl,
              slide.caption,
            )
          }
        } else {
          // Neither buffer nor path available - fall back to CDN
          this.logger.warn(`File buffer and path not available for ${slide.id}, falling back to CDN`)
          result = await this.mediaAnalysisService.analyzeContent(
            slide.contentType as "video" | "image" | "audio",
            slide.mediaUrl,
            slide.caption,
          )
        }
      } else {
        // No buffer available — fall back to downloading from CDN (backfill case)
        result = await this.mediaAnalysisService.analyzeContent(
          slide.contentType as "video" | "image" | "audio",
          slide.mediaUrl,
          slide.caption,
        )
      }

      const updates: Partial<Content> = {}
      if (result.transcription) updates.transcription = result.transcription
      if (result.aiDescription) updates.aiDescription = result.aiDescription

      // Claude returns categories directly — save them on the first slide only
      if (result.categories && slide.id === firstSlide?.id) {
        updates.categories = result.categories
      }

      if (Object.keys(updates).length > 0) {
        await this.contentRepository.update(slide.id, updates)
      }
    }

    // Fallback: if first slide didn't get categories from vision (e.g. text-only),
    // use the CategorizationService with caption + hashtags
    if (firstSlide && !mediaSlides.some(s => s.id === firstSlide.id) && this.categorizationService) {
      const parts: string[] = []
      if (firstSlide.caption) parts.push(firstSlide.caption)
      if (firstSlide.hashtags?.length) parts.push(firstSlide.hashtags.join(" "))

      const text = parts.join(" ").trim()
      if (text) {
        const categories = await this.categorizationService.categorize(text, 3)
        if (categories.length > 0) {
          await this.contentRepository.update(firstSlide.id, { categories })
        }
      }
    }
  }

  /** Strip sensitive fields from user objects before returning in API responses */
  private safeUser(user: User) {
    if (!user) return user
    const { passwordHash, phoneHash, ...safe } = user as any
    return safe
  }

  private extractMentions(text: string): string[] {
    const mentionRegex = /@(\w+)/g
    const matches = text.matchAll(mentionRegex)
    return Array.from(matches, match => match[1])
  }

  private extractHashtags(text: string): string[] {
    if (!text) return []
    const matches = text.match(/#(\w+)/g)
    if (!matches) return []
    return [...new Set(matches.map(m => m.slice(1).toLowerCase()))]
  }

  private async saveMentions(
    text: string,
    mentionedByUserId: string,
    contentId?: string,
    commentId?: string,
  ): Promise<void> {
    const usernames = this.extractMentions(text)
    if (usernames.length === 0) return

    // Find users by username
    const users = await this.userRepository
      .createQueryBuilder("user")
      .where("user.username IN (:...usernames)", { usernames })
      .select(["user.id", "user.username"])
      .getMany()

    // Create mention records
    const mentions = users.map(user => ({
      mentionedUserId: user.id,
      mentionedByUserId,
      contentId,
      commentId,
    }))

    if (mentions.length > 0) {
      await this.mentionRepository.save(mentions)

      // Create notifications for each mentioned user
      for (const user of users) {
        await this.notificationsService.createMentionNotification(
          user.id,
          mentionedByUserId,
          contentId,
          commentId,
        )
      }
    }
  }

  async create(userId: string, createContentDto: CreateContentDto, file: Express.Multer.File): Promise<Content> {
    const user = await this.userRepository.findByIdOptional(userId)
    if (!user) {
      throw new NotFoundException("User not found")
    }

    // Determine content type based on file mimetype
    let type: "image" | "video" | "audio" | "text"
    if (file.mimetype.startsWith("image/")) {
      type = "image"
    } else if (file.mimetype.startsWith("video/")) {
      type = "video"
    } else if (file.mimetype.startsWith("audio/")) {
      type = "audio"
    } else {
      throw new Error("Unsupported file type")
    }

    // Upload file — images are compressed to WebP, videos are transcoded to 720p H.264
    const uploadResult = type === "video"
      ? await this.storageService.uploadVideo(file)
      : type === "image"
        ? await this.storageService.uploadImage(file)
        : await this.storageService.uploadFile(file)

    const content = this.contentRepository.create({
      userId,
      contentType: type,
      mediaUrl: uploadResult.secure_url,
      thumbnailUrl: uploadResult.secure_url,
      caption: createContentDto.description,
      hashtags: createContentDto.tags || [],
    })

    // Update user post count
    user.postCount += 1
    await this.userRepository.save(user)

    const savedContent = await this.contentRepository.save(content)
    await this.triggerReferralValidation(userId)
    return savedContent
  }

  async createPost(
    userId: string,
    createPostDto: CreatePostDto,
    files?: Express.Multer.File[],
    musicFiles?: Express.Multer.File[],
    thumbnailFiles?: Express.Multer.File[],
  ): Promise<{ postId: string; slides: Content[]; totalSlides: number }> {
    // Parse slide types from DTO (they come as objects from FormData with array notation)
    const slideTypes = typeof createPostDto.slideTypes === 'string'
      ? JSON.parse(createPostDto.slideTypes)
      : (createPostDto.slideTypes || {})
    const slideTexts = typeof createPostDto.slideTexts === 'string'
      ? JSON.parse(createPostDto.slideTexts)
      : (createPostDto.slideTexts || {})
    const slideBackgrounds = typeof createPostDto.slideBackgrounds === 'string'
      ? JSON.parse(createPostDto.slideBackgrounds)
      : (createPostDto.slideBackgrounds || {})
    const slideFontStyles = typeof createPostDto.slideFontStyles === 'string'
      ? JSON.parse(createPostDto.slideFontStyles)
      : (createPostDto.slideFontStyles || {})
    const slideCaptions = typeof createPostDto.slideCaptions === 'string'
      ? JSON.parse(createPostDto.slideCaptions)
      : (createPostDto.slideCaptions || {})
    // Per-slide music mapping: slideMusicIndex[slideIdx] -> musicFiles array index
    const slideMusicIndex = typeof createPostDto.slideMusicIndex === 'string'
      ? JSON.parse(createPostDto.slideMusicIndex)
      : (createPostDto.slideMusicIndex || {})

    // Video trim metadata (for auto-split long videos)
    const videoTrimStart = typeof createPostDto.videoTrimStart === 'string'
      ? JSON.parse(createPostDto.videoTrimStart)
      : (createPostDto.videoTrimStart || {})
    const videoTrimEnd = typeof createPostDto.videoTrimEnd === 'string'
      ? JSON.parse(createPostDto.videoTrimEnd)
      : (createPostDto.videoTrimEnd || {})

    // Per-slide custom thumbnail mapping: slideThumbnailIndex[slideIdx] -> thumbnailFiles array index
    const slideThumbnailIndex = typeof createPostDto.slideThumbnailIndex === 'string'
      ? JSON.parse(createPostDto.slideThumbnailIndex)
      : (createPostDto.slideThumbnailIndex || {})

    // Upload all music files and build a map of slideIndex -> musicUrl
    const slideMusicUrls: Record<number, string> = {}
    if (musicFiles && musicFiles.length > 0) {
      for (const [slideIdx, musicFileIdx] of Object.entries(slideMusicIndex)) {
        const idx = parseInt(musicFileIdx as string)
        if (musicFiles[idx]) {
          const musicUpload = await this.storageService.uploadFile(musicFiles[idx])
          slideMusicUrls[parseInt(slideIdx)] = musicUpload.secure_url
        }
      }
      // Backwards compat: if no slideMusicIndex mapping, put first music on first slide
      if (Object.keys(slideMusicIndex).length === 0 && musicFiles[0]) {
        const musicUpload = await this.storageService.uploadFile(musicFiles[0])
        slideMusicUrls[0] = musicUpload.secure_url
      }
    }

    // Determine total number of slides
    const totalSlides = Math.max(
      files?.length || 0,
      ...Object.keys(slideTypes).map(k => parseInt(k) + 1)
    )

    if (totalSlides === 0) {
      throw new BadRequestException("At least one slide is required")
    }

    if (totalSlides > 10) {
      throw new BadRequestException("Maximum 10 slides allowed")
    }

    const user = await this.userRepository.findByIdOptional(userId)
    if (!user) {
      throw new NotFoundException("User not found")
    }

    // Handle scheduling
    const isScheduled = !!createPostDto.scheduledAt
    const scheduledAt = isScheduled ? new Date(createPostDto.scheduledAt) : null
    if (isScheduled && scheduledAt && scheduledAt <= new Date()) {
      throw new BadRequestException("Scheduled time must be in the future")
    }

    // Generate a unique postId for all slides
    const postId = uuidv4()
    const slides: Content[] = []

    // Auto-extract hashtags from all slide captions if none provided
    let hashtags = createPostDto.hashtags || []
    if (hashtags.length === 0) {
      const allCaptions = Object.values(slideTexts).filter(Boolean).join(" ")
      hashtags = this.extractHashtags(allCaptions)
    }

    try {
      // Build slide tasks, mapping each slide to its file
      let fileIndex = 0
      const slideTasks: { index: number; slideType: string; file?: Express.Multer.File }[] = []

      for (let i = 0; i < totalSlides; i++) {
        const slideType = slideTypes[i] || "image"
        if (slideType === "text") {
          slideTasks.push({ index: i, slideType })
        } else {
          if (!files || fileIndex >= files.length) {
            throw new BadRequestException(`Missing file for slide ${i}`)
          }
          slideTasks.push({ index: i, slideType, file: files[fileIndex] })
          fileIndex++
        }
      }

      // Upload custom thumbnails and build a map of slideIndex -> thumbnailUrl
      const customThumbnailUrls: Record<number, string> = {}
      if (thumbnailFiles && thumbnailFiles.length > 0) {
        for (const [slideIdx, thumbFileIdx] of Object.entries(slideThumbnailIndex)) {
          const idx = parseInt(thumbFileIdx as string)
          if (thumbnailFiles[idx]) {
            const thumbUpload = await this.storageService.uploadFile(thumbnailFiles[idx], "thumbnails")
            customThumbnailUrls[parseInt(slideIdx)] = thumbUpload.secure_url
          }
        }
      }

      // Upload unique files first (deduplicate by name+size).
      // Auto-split videos send the same file N times — upload it only once.
      const uploadCache = new Map<string, { secure_url: string; thumbnailUrl: string; type: "image" | "video" | "audio" }>()
      // Map mediaUrl -> original file buffer for analysis (avoids CDN download)
      const fileBuffers = new Map<string, Express.Multer.File>()

      for (const task of slideTasks) {
        if (task.slideType === "text" || !task.file) continue
        const file = task.file
        const cacheKey = `${file.originalname}:${file.size}`
        if (uploadCache.has(cacheKey)) continue

        const ext = path.extname(file.originalname).toLowerCase()
        let type: "image" | "video" | "audio"
        if (file.mimetype.startsWith("image/") || [".jpg", ".jpeg", ".png", ".gif", ".webp", ".heic", ".heif"].includes(ext)) {
          type = "image"
        } else if (file.mimetype.startsWith("video/") || [".mp4", ".mov", ".m4v", ".webm", ".avi", ".mkv", ".3gp"].includes(ext)) {
          type = "video"
        } else if (file.mimetype.startsWith("audio/") || [".mp3", ".wav", ".aac", ".ogg", ".flac", ".m4a"].includes(ext)) {
          type = "audio"
        } else {
          throw new BadRequestException(`Unsupported file type: ${file.mimetype || ext}`)
        }

        const uploadResult = type === "video"
          ? await this.storageService.uploadVideo(file)
          : type === "image"
            ? await this.storageService.uploadImage(file)
            : await this.storageService.uploadFile(file)

        // Generate a real thumbnail for videos (extract frame via FFmpeg)
        let thumbnailUrl = uploadResult.secure_url
        if (type === "video") {
          const thumbUrl = await this.storageService.generateVideoThumbnail(file)
          if (thumbUrl) thumbnailUrl = thumbUrl
        }

        uploadCache.set(cacheKey, { ...uploadResult, thumbnailUrl, type })
        // Store file buffer mapped to CDN URL for later analysis
        fileBuffers.set(uploadResult.secure_url, file)
      }

      // Create all slide records (no uploads here — all files already uploaded above)
      const slideResults = await Promise.all(
        slideTasks.map(async (task) => {
          const { index: i, slideType, file } = task

          if (slideType === "text") {
            return this.contentRepository.create({
              userId,
              postId,
              sortOrder: i,
              contentType: "text",
              textContent: slideTexts[i] || "",
              caption: slideCaptions[i] || "",
              backgroundColor: slideBackgrounds[i] || "#667eea",
              fontStyle: slideFontStyles[i] || "normal",
              hashtags: i === 0 ? hashtags : [],
              backgroundMusicUrl: slideMusicUrls[i] || null,
              engagementScore: i === 0 ? 30 : 0,
              isActive: !isScheduled,
              isScheduled,
              scheduledAt,
              likeCount: 0,
              commentCount: 0,
              shareCount: 0,
              viewCount: 0,
            })
          }

          const cacheKey = `${file!.originalname}:${file!.size}`
          const cached = uploadCache.get(cacheKey)!
          const type = cached.type
          const trimStart = videoTrimStart[i] ? parseFloat(videoTrimStart[i]) : null
          const trimEnd = videoTrimEnd[i] ? parseFloat(videoTrimEnd[i]) : null

          return this.contentRepository.create({
            userId,
            postId,
            sortOrder: i,
            contentType: type,
            mediaUrl: cached.secure_url,
            thumbnailUrl: customThumbnailUrls[i] || cached.thumbnailUrl,
            caption: slideTexts[i] || null,
            hashtags: i === 0 ? hashtags : [],
            backgroundMusicUrl: slideMusicUrls[i] || null,
            videoTrimStart: trimStart,
            videoTrimEnd: trimEnd,
            engagementScore: i === 0 ? 30 : 0,
            isActive: !isScheduled,
            isScheduled,
            scheduledAt,
            likeCount: 0,
            commentCount: 0,
            shareCount: 0,
            viewCount: 0,
          })
        }),
      )

      // Save all slides to DB
      for (const content of slideResults) {
        const savedContent = await this.contentRepository.save(content)
        slides.push(savedContent)
      }

      // Update user post count (one post, multiple slides)
      user.postCount += 1
      await this.userRepository.save(user)

      await this.triggerReferralValidation(userId)

      // Invalidate feed cache so the new post shows up immediately
      await this.redisService.invalidateFeedCache()

      // Fire-and-forget: analyze media content for AI categorization.
      // This runs asynchronously — the user gets their response immediately.
      // Pass fileBuffers so analysis uses local files instead of downloading from CDN.
      this.analyzePostContent(slides, fileBuffers).catch(err => {
        this.logger.warn(`Media analysis failed for post ${postId}: ${(err as any).message}`)
      })

      return {
        postId,
        slides,
        totalSlides: slides.length,
      }
    } catch (error) {
      // Cleanup: Delete already-uploaded files and DB records
      console.error("Error creating post:", error)
      for (const slide of slides) {
        try {
          if (slide.mediaUrl) {
            // Extract storage key from URL (everything after the CDN/bucket host)
            try {
              const url = new URL(slide.mediaUrl)
              const key = url.pathname.replace(/^\//, "")
              if (key) await this.storageService.deleteFile(key)
            } catch {}
          }
          await this.contentRepository.remove(slide)
        } catch (cleanupError) {
          console.error("Cleanup error for slide:", cleanupError)
        }
      }
      throw error
    }
  }

  // Cron: publish scheduled posts every minute
  @Cron("* * * * *")
  async publishScheduledPosts() {
    const now = new Date()
    const scheduledSlides = await this.contentRepository.find({
      where: {
        isScheduled: true,
        isActive: false,
        scheduledAt: LessThanOrEqual(now),
      },
    })

    if (scheduledSlides.length === 0) return

    // Group by postId
    const postIds = [...new Set(scheduledSlides.map(s => s.postId))]

    for (const postId of postIds) {
      // Activate all slides for this post
      await this.contentRepository.update(
        { postId },
        { isActive: true, isScheduled: false },
      )

      // Send notification to the post owner
      const firstSlide = scheduledSlides.find(s => s.postId === postId)
      if (firstSlide && this.notificationsService) {
        try {
          await this.notificationsService.create({
            userId: firstSlide.userId,
            actorId: firstSlide.userId,
            type: "system" as any,
            message: "Your scheduled post is now live!",
            contentId: firstSlide.id,
          })
        } catch (e: any) {
          this.logger.warn(`Failed to send scheduled post notification: ${e.message}`)
        }
      }

      this.logger.log(`Published scheduled post ${postId}`)
    }

    // Invalidate feed cache so published posts appear immediately
    await this.redisService.invalidateFeedCache()
  }

  async findAll(page = 1, limit = 20, category?: string, userId?: string) {
    const queryBuilder = this.contentRepository
      .createQueryBuilder("content")
      .leftJoinAndSelect("content.user", "user")
      .where("content.isActive = :isActive", { isActive: true })
      .andWhere("user.isActive = :userActive", { userActive: true })

    if (category) {
      queryBuilder.andWhere("(content.hashtags LIKE :categoryFilter OR content.caption ILIKE :captionCategory)", { categoryFilter: `%${category}%`, captionCategory: `%#${category}%` })
    }

    if (userId) {
      queryBuilder.andWhere("content.userId = :userId", { userId })
    }

    const [content, total] = await queryBuilder
      .orderBy("content.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return {
      data: content.map(c => ({ ...c, user: this.safeUser(c.user) })),
      total,
      page,
      limit,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    }
  }

  private async searchPosts(query: string, currentUserId: string, pageNum: number, limitNum: number) {
    const queryBuilder = this.contentRepository
      .createQueryBuilder("content")
      .leftJoinAndSelect("content.user", "user")
      .where("content.isActive = :isActive", { isActive: true })
      .andWhere("user.isActive = :userActive", { userActive: true })
      .andWhere("content.sortOrder = :sortOrder", { sortOrder: 0 })
      .andWhere(
        "(content.caption ILIKE :query OR content.hashtags LIKE :hashtagQuery OR user.username ILIKE :query OR user.displayName ILIKE :query)",
        { query: `%${query}%`, hashtagQuery: `%${query.replace(/^#/, "")}%` }
      )
      .orderBy("content.createdAt", "DESC")
      .skip((pageNum - 1) * limitNum)
      .take(limitNum)

    const [firstSlides, total] = await queryBuilder.getManyAndCount()

    const postIds = firstSlides.map((s) => s.postId).filter(Boolean)
    const allSlides = postIds.length > 0
      ? await this.contentRepository.find({
          where: { postId: In(postIds) },
          order: { sortOrder: "ASC" },
          relations: ["user"],
        })
      : []

    const slidesByPostId = new Map<string, Content[]>()
    for (const slide of allSlides) {
      if (!slidesByPostId.has(slide.postId)) slidesByPostId.set(slide.postId, [])
      slidesByPostId.get(slide.postId)!.push(slide)
    }

    const firstSlideIds = firstSlides.map((s) => s.id)
    let likedIds = new Set<string>()
    let bookmarkedIds = new Set<string>()
    if (currentUserId && firstSlideIds.length > 0) {
      const userInteractions = await this.interactionRepository.find({
        where: { contentId: In(firstSlideIds), userId: currentUserId },
      })
      for (const interaction of userInteractions) {
        if (interaction.type === "like") likedIds.add(interaction.contentId)
        if (interaction.type === "bookmark") bookmarkedIds.add(interaction.contentId)
      }
    }

    const posts = firstSlides.map((firstSlide) => ({
      postId: firstSlide.postId,
      userId: firstSlide.userId,
      user: this.safeUser(firstSlide.user),
      slides: (slidesByPostId.get(firstSlide.postId) || [firstSlide]).map((slide) => ({
        id: slide.id,
        contentType: slide.contentType,
        mediaUrl: slide.mediaUrl,
        thumbnailUrl: slide.thumbnailUrl,
        caption: slide.caption,
        backgroundColor: slide.backgroundColor,
        fontStyle: slide.fontStyle,
        duration: slide.duration,
        sortOrder: slide.sortOrder,
        videoTrimStart: slide.videoTrimStart ?? null,
        videoTrimEnd: slide.videoTrimEnd ?? null,
      })),
      caption: firstSlide.caption,
      hashtags: firstSlide.hashtags || [],
      backgroundMusicUrl: firstSlide.backgroundMusicUrl,
      likeCount: firstSlide.likeCount,
      commentCount: firstSlide.commentCount,
      shareCount: firstSlide.shareCount,
      viewCount: firstSlide.viewCount,
      isLiked: likedIds.has(firstSlide.id),
      isBookmarked: bookmarkedIds.has(firstSlide.id),
      createdAt: firstSlide.createdAt,
      updatedAt: firstSlide.updatedAt,
    }))

    return { data: posts, total }
  }

  private async searchHashtags(query: string, limitNum: number) {
    // Search for hashtags across all posts and return unique tags with post counts
    const cleanQuery = query.replace(/^#/, "").toLowerCase()

    const results = await this.contentRepository
      .createQueryBuilder("content")
      .select("content.hashtags")
      .where("content.isActive = :isActive", { isActive: true })
      .andWhere("content.sortOrder = :sortOrder", { sortOrder: 0 })
      .andWhere("content.hashtags LIKE :query", { query: `%${cleanQuery}%` })
      .getMany()

    // Aggregate: split comma-separated hashtags, filter matching ones, count
    const tagCounts: Record<string, number> = {}
    for (const row of results) {
      const tags = Array.isArray(row.hashtags)
        ? row.hashtags
        : typeof row.hashtags === "string"
          ? (row.hashtags as string).split(",").map((t) => t.trim()).filter(Boolean)
          : []
      for (const tag of tags) {
        const lower = tag.toLowerCase()
        if (lower.includes(cleanQuery)) {
          tagCounts[lower] = (tagCounts[lower] || 0) + 1
        }
      }
    }

    // Also scan captions for hashtags matching the query
    const captionResults = await this.contentRepository
      .createQueryBuilder("content")
      .select("content.caption")
      .where("content.isActive = :isActive", { isActive: true })
      .andWhere("content.sortOrder = :sortOrder", { sortOrder: 0 })
      .andWhere("content.caption ILIKE :query", { query: `%#${cleanQuery}%` })
      .getMany()

    for (const row of captionResults) {
      const matches = (row.caption || "").match(/#(\w+)/g)
      if (matches) {
        for (const match of matches) {
          const tag = match.slice(1).toLowerCase()
          if (tag.includes(cleanQuery)) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1
          }
        }
      }
    }

    const sorted = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limitNum)
      .map(([tag, postCount]) => ({ tag: `#${tag}`, postCount }))

    return { data: sorted, total: sorted.length }
  }

  private async searchUsers(query: string, pageNum: number, limitNum: number, currentUserId?: string) {
    const [users, total] = await this.userRepository
      .createQueryBuilder("user")
      .where("user.isActive = :isActive", { isActive: true })
      .andWhere(
        "(user.username ILIKE :query OR user.displayName ILIKE :query OR user.bio ILIKE :query)",
        { query: `%${query}%` }
      )
      .orderBy("user.followersCount", "DESC")
      .addOrderBy("user.displayName", "ASC")
      .skip((pageNum - 1) * limitNum)
      .take(limitNum)
      .getManyAndCount()

    console.log(`[searchUsers] currentUserId: ${currentUserId}, users found: ${users.length}`)

    // Check follow status if user is authenticated
    if (currentUserId && users.length > 0) {
      const follows = await this.followRepository.find({
        where: { followerId: currentUserId },
        select: ["followingId"],
      })
      const followingIds = new Set(follows.map((f) => f.followingId))
      console.log(`[searchUsers] User ${currentUserId} is following: ${Array.from(followingIds).join(", ")}`)

      const usersWithFollowStatus = users.map((user) => ({
        ...user,
        isFollowing: followingIds.has(user.id),
      }))

      console.log(`[searchUsers] First user ${users[0]?.username} isFollowing:`, usersWithFollowStatus[0]?.isFollowing)
      return { data: usersWithFollowStatus, total }
    }

    console.log("[searchUsers] No currentUserId - returning all users as not following")

    // If not authenticated, return users without follow status
    const usersWithFollowStatus = users.map((user) => ({
      ...user,
      isFollowing: false,
    }))

    return { data: usersWithFollowStatus, total }
  }

  async search(query: string, currentUserId: string, type?: "posts" | "users" | "hashtags" | "all", page = 1, limit = 20) {
    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 20

    // Unified search — return posts, people, and hashtags
    if (!type || type === "all") {
      const [postsResult, usersResult, hashtagsResult] = await Promise.all([
        this.searchPosts(query, currentUserId, 1, 20),
        this.searchUsers(query, 1, 10, currentUserId),
        this.searchHashtags(query, 10),
      ])

      return {
        posts: { data: postsResult.data, total: postsResult.total },
        users: { data: usersResult.data, total: usersResult.total },
        hashtags: { data: hashtagsResult.data, total: hashtagsResult.total },
        page: pageNum,
        limit: limitNum,
        type: "all",
      }
    }

    if (type === "posts") {
      const result = await this.searchPosts(query, currentUserId, pageNum, limitNum)
      return { data: result.data, total: result.total, page: pageNum, limit: limitNum, type: "posts" }
    }

    if (type === "hashtags") {
      const result = await this.searchHashtags(query, limitNum)
      return { data: result.data, total: result.total, page: pageNum, limit: limitNum, type: "hashtags" }
    }

    // type === "users"
    const result = await this.searchUsers(query, pageNum, limitNum, currentUserId)
    return { data: result.data, total: result.total, page: pageNum, limit: limitNum, type: "users" }
  }

  async getBookmarkedPosts(userId: string, page = 1, limit = 20) {
    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 20

    // Get bookmarked content IDs
    const [bookmarks, total] = await this.interactionRepository.findAndCount({
      where: { userId, type: "bookmark" },
      order: { createdAt: "DESC" },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    })

    if (bookmarks.length === 0) {
      return { data: [], total: 0, page: pageNum, limit: limitNum }
    }

    const contentIds = bookmarks.map((b) => b.contentId)

    // Fetch first slides (the bookmarked items)
    const firstSlides = await this.contentRepository.find({
      where: { id: In(contentIds), isActive: true },
      relations: ["user"],
    })

    // Batch fetch all slides for these posts
    const postIds = firstSlides.map((s) => s.postId).filter(Boolean)
    const allSlides = postIds.length > 0
      ? await this.contentRepository.find({
          where: { postId: In(postIds) },
          order: { sortOrder: "ASC" },
          relations: ["user"],
        })
      : []

    const slidesByPostId = new Map<string, Content[]>()
    for (const slide of allSlides) {
      if (!slidesByPostId.has(slide.postId)) slidesByPostId.set(slide.postId, [])
      slidesByPostId.get(slide.postId)!.push(slide)
    }

    // All are bookmarked by definition, check likes
    let likedIds = new Set<string>()
    if (contentIds.length > 0) {
      const userLikes = await this.interactionRepository.find({
        where: { contentId: In(contentIds), userId, type: "like" },
      })
      likedIds = new Set(userLikes.map((l) => l.contentId))
    }

    const posts = firstSlides.map((firstSlide) => ({
      postId: firstSlide.postId,
      userId: firstSlide.userId,
      user: this.safeUser(firstSlide.user),
      slides: (slidesByPostId.get(firstSlide.postId) || [firstSlide]).map((slide) => ({
        id: slide.id,
        contentType: slide.contentType,
        mediaUrl: slide.mediaUrl,
        thumbnailUrl: slide.thumbnailUrl,
        caption: slide.caption,
        backgroundColor: slide.backgroundColor,
        fontStyle: slide.fontStyle,
        duration: slide.duration,
        sortOrder: slide.sortOrder,
        videoTrimStart: slide.videoTrimStart ?? null,
        videoTrimEnd: slide.videoTrimEnd ?? null,
      })),
      caption: firstSlide.caption,
      hashtags: firstSlide.hashtags || [],
      backgroundMusicUrl: firstSlide.backgroundMusicUrl,
      likeCount: firstSlide.likeCount,
      commentCount: firstSlide.commentCount,
      shareCount: firstSlide.shareCount,
      viewCount: firstSlide.viewCount,
      isLiked: likedIds.has(firstSlide.id),
      isBookmarked: true,
      createdAt: firstSlide.createdAt,
      updatedAt: firstSlide.updatedAt,
    }))

    return { data: posts, total, page: pageNum, limit: limitNum }
  }

  // Get posts with slides grouped together
  async findAllPosts(page = 1, limit = 20, category?: string, userId?: string, currentUserId?: string, followingOnly = false, sort: "recent" | "ranked" = "recent", trendingDays?: number) {
    // Convert to numbers
    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 20

    // Randomized feed config — when the global "For You" ranked feed is requested
    // (no user/category/trending filters), we pull from two random pools:
    // 70% newer posts (last 7 days) and 30% older posts, shuffled together.
    // This way every user sees a different mix on every cache cycle, instead of
    // the same deterministic engagementScore ordering for everyone.
    const NEW_CUTOFF_DAYS = 7
    const NEW_RATIO = 0.7
    const useRandomizedFeed =
      sort === "ranked" && !followingOnly && !userId && !category && !trendingDays

    // Determine if we can use personalized feed
    // Requires: personalized service available, user logged in, and preferences exist
    let usePersonalizedFeed = false
    if (useRandomizedFeed && currentUserId && this.personalizedFeedService && this.userPreferenceRepository) {
      // Validate that currentUserId is a valid UUID string
      if (currentUserId && typeof currentUserId === "string" && currentUserId.length > 0) {
        try {
          const preferences = await this.userPreferenceRepository.findByUserId(currentUserId)
          usePersonalizedFeed = preferences.length > 0
        } catch (error) {
          this.logger.warn(`Failed to check user preferences for personalized feed: ${(error as any).message}`)
        }
      } else {
        this.logger.warn(`Invalid currentUserId for personalized feed: "${currentUserId}"`)
      }
    }

    // Check Redis cache — keyed per user and feed type
    const feedType = followingOnly ? "following" : (usePersonalizedFeed ? "personalized" : sort)
    const cacheKey = `feed:${feedType}:${currentUserId || "anon"}:${pageNum}:${limitNum}:${category || ""}:${userId || ""}`
    const cached = await this.redisService.getCachedFeed(cacheKey)
    if (cached) return cached

    let firstSlides: Content[]
    let total: number

    if (usePersonalizedFeed) {
      // Personalized feed: score and rank based on user's category preferences
      // Falls back gracefully if service fails
      try {
        // Get blocked user IDs
        const blocks = await this.userRepository
          .createQueryBuilder("user")
          .leftJoin("blocks", "block", "block.blockerId = :userId OR block.blockedId = :userId", { userId: currentUserId })
          .select("CASE WHEN block.blockerId = :userId THEN block.blockedId ELSE block.blockerId END", "blockedUserId")
          .where("block.id IS NOT NULL")
          .getRawMany()

        const blockedUserIds = blocks.map(b => String(b.blockedUserId)).filter(id => id && id !== "null")

        firstSlides = await this.personalizedFeedService.getPersonalizedFeed(
          currentUserId,
          blockedUserIds,
          { page: pageNum, limit: limitNum }
        )

        // UX Enhancement: Inject user's own recent posts (last 5 min) at top, even if uncategorized
        // This ensures users see their newly uploaded content immediately
        if (currentUserId && pageNum === 1) {
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
          const recentUserPosts = await this.contentRepository.find({
            where: {
              userId: currentUserId,
              sortOrder: 0,
              isActive: true,
              createdAt: MoreThan(fiveMinutesAgo),
            },
            relations: ["user"],
            order: { createdAt: "DESC" },
            take: 3, // Max 3 recent posts at top
          })

          if (recentUserPosts.length > 0) {
            // Remove these posts from the main feed if they appear (avoid duplicates)
            const recentPostIds = new Set(recentUserPosts.map(p => p.id))
            firstSlides = firstSlides.filter(slide => !recentPostIds.has(slide.id))

            // Prepend recent posts to the top
            firstSlides = [...recentUserPosts, ...firstSlides]

            // Trim to requested limit
            firstSlides = firstSlides.slice(0, limitNum)
          }
        }

        // If personalized feed returned insufficient results, fall back to randomized
        // This happens when there aren't enough categorized posts yet
        // Works on ALL pages, not just page 1 (so pagination doesn't break)
        if (firstSlides.length < 10) {
          this.logger.log(`Personalized feed has only ${firstSlides.length} posts on page ${pageNum}, falling back to randomized`)
          const fallbackResult = await this.fetchRandomizedFeed(pageNum, limitNum, NEW_CUTOFF_DAYS, NEW_RATIO)

          // Keep user's recent posts at top if we have them (page 1 only)
          if (pageNum === 1) {
            const recentPostIds = new Set(firstSlides.map(p => p.id))
            const randomizedPosts = fallbackResult.slides.filter(slide => !recentPostIds.has(slide.id))
            firstSlides = [...firstSlides, ...randomizedPosts].slice(0, limitNum)
          } else {
            // On page 2+, just use randomized posts (no need to preserve personalized order)
            firstSlides = fallbackResult.slides
          }

          total = fallbackResult.total
        } else {
          // For total count, estimate based on last 30 days of categorized content
          // (Exact count would be expensive, estimation is fine for pagination)
          const countResult = await this.contentRepository.count({
            where: {
              isActive: true,
              categories: Not(IsNull()), // Only categorized content
              createdAt: MoreThan(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
            }
          })
          total = countResult
        }
      } catch (error) {
        this.logger.error(`Personalized feed failed, falling back to randomized: ${(error as any).message}`)
        // Fall back to randomized feed on error
        const result = await this.fetchRandomizedFeed(pageNum, limitNum, NEW_CUTOFF_DAYS, NEW_RATIO)
        firstSlides = result.slides
        total = result.total
      }
    } else if (useRandomizedFeed) {
      // Two-pool random approach: fetch 70% new + 30% old, both shuffled via RANDOM()
      const result = await this.fetchRandomizedFeed(pageNum, limitNum, NEW_CUTOFF_DAYS, NEW_RATIO)
      firstSlides = result.slides
      total = result.total

      // UX Enhancement: Inject user's own recent posts (last 5 min) at top
      if (currentUserId && pageNum === 1) {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
        const recentUserPosts = await this.contentRepository.find({
          where: {
            userId: currentUserId,
            sortOrder: 0,
            isActive: true,
            createdAt: MoreThan(fiveMinutesAgo),
          },
          relations: ["user"],
          order: { createdAt: "DESC" },
          take: 3,
        })

        if (recentUserPosts.length > 0) {
          const recentPostIds = new Set(recentUserPosts.map(p => p.id))
          firstSlides = firstSlides.filter(slide => !recentPostIds.has(slide.id))
          firstSlides = [...recentUserPosts, ...firstSlides]
          firstSlides = firstSlides.slice(0, limitNum)
        }
      }
    } else {
      // Standard path — following, recent, trending, user-specific, or category feeds
      const queryBuilder = this.contentRepository
        .createQueryBuilder("content")
        .leftJoinAndSelect("content.user", "user")
        .where("content.isActive = :isActive", { isActive: true })
        .andWhere("user.isActive = :userActive", { userActive: true })
        .andWhere("content.sortOrder = :sortOrder", { sortOrder: 0 })

      if (category) {
        queryBuilder.andWhere("(content.hashtags LIKE :categoryFilter OR content.caption ILIKE :captionCategory)", { categoryFilter: `%${category}%`, captionCategory: `%#${category}%` })
      }

      if (userId) {
        queryBuilder.andWhere("content.userId = :userId", { userId })
      }

      // Filter by following if requested
      if (followingOnly && currentUserId) {
        const follows = await this.followRepository.find({
          where: { followerId: currentUserId },
          select: ["followingId"],
        })

        const followingIds = follows.map(f => f.followingId)

        if (followingIds.length === 0) {
          return {
            data: [],
            total: 0,
            page: pageNum,
            limit: limitNum,
            hasNext: false,
            hasPrev: pageNum > 1,
          }
        }

        queryBuilder.andWhere("content.userId IN (:...followingIds)", { followingIds })
      }

      // When trendingDays is set, only show posts from the last N days that
      // have real engagement (at least 3 likes).
      if (trendingDays) {
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - trendingDays)
        queryBuilder.andWhere("content.createdAt >= :trendingCutoff", { trendingCutoff: cutoff })
        queryBuilder.andWhere("content.likeCount >= :minTrendLikes", { minTrendLikes: 3 })
      }

      if (sort === "ranked") {
        queryBuilder
          .orderBy("content.engagementScore", "DESC")
          .addOrderBy("content.createdAt", "DESC")
      } else {
        queryBuilder.orderBy("content.createdAt", "DESC")
      }

      const result = await queryBuilder
        .skip((pageNum - 1) * limitNum)
        .take(limitNum)
        .getManyAndCount()

      firstSlides = result[0]
      total = result[1]
    }

    // Batch fetch all slides for these posts in ONE query (instead of N+1)
    const postIds = firstSlides.map(s => s.postId).filter(Boolean)
    const allSlides = postIds.length > 0
      ? await this.contentRepository.find({
          where: { postId: In(postIds) },
          order: { sortOrder: "ASC" },
          relations: ["user"],
        })
      : []

    // Group slides by postId
    const slidesByPostId = new Map<string, Content[]>()
    for (const slide of allSlides) {
      if (!slidesByPostId.has(slide.postId)) {
        slidesByPostId.set(slide.postId, [])
      }
      slidesByPostId.get(slide.postId).push(slide)
    }

    // Batch fetch all interactions for current user in ONE query (instead of 2*N)
    const firstSlideIds = firstSlides.map(s => s.id)
    let likedIds = new Set<string>()
    let bookmarkedIds = new Set<string>()

    if (currentUserId && firstSlideIds.length > 0) {
      const userInteractions = await this.interactionRepository.find({
        where: { contentId: In(firstSlideIds), userId: currentUserId },
      })
      for (const interaction of userInteractions) {
        if (interaction.type === "like") likedIds.add(interaction.contentId)
        if (interaction.type === "bookmark") bookmarkedIds.add(interaction.contentId)
      }
    }

    // Map posts with pre-fetched data (no more async/await per post)
    const posts = firstSlides.map((firstSlide) => {
      const postSlides = slidesByPostId.get(firstSlide.postId) || [firstSlide]

      return {
        postId: firstSlide.postId,
        userId: firstSlide.userId,
        user: this.safeUser(firstSlide.user),
        caption: firstSlide.caption,
        hashtags: firstSlide.hashtags,
        backgroundMusicUrl: firstSlide.backgroundMusicUrl,
        createdAt: firstSlide.createdAt,
        updatedAt: firstSlide.updatedAt,
        viewCount: firstSlide.viewCount,
        likeCount: firstSlide.likeCount,
        commentCount: firstSlide.commentCount,
        shareCount: firstSlide.shareCount,
        engagementScore: firstSlide.engagementScore,
        viralityScore: firstSlide.viralityScore,
        completionRate: firstSlide.completionRate,
        avgWatchTime: firstSlide.avgWatchTime,
        avgDwellTime: firstSlide.avgDwellTime,
        isLiked: likedIds.has(firstSlide.id),
        isBookmarked: bookmarkedIds.has(firstSlide.id),
        slides: postSlides.map((slide) => ({
          id: slide.id,
          contentType: slide.contentType,
          mediaUrl: slide.mediaUrl,
          thumbnailUrl: slide.thumbnailUrl,
          caption: slide.caption || null,
          text: slide.contentType === 'text' ? (slide.textContent || slide.caption) : null,
          backgroundColor: slide.backgroundColor,
          fontStyle: slide.fontStyle,
          duration: slide.duration,
          sortOrder: slide.sortOrder,
          backgroundMusicUrl: slide.backgroundMusicUrl,
          videoTrimStart: slide.videoTrimStart ?? null,
          videoTrimEnd: slide.videoTrimEnd ?? null,
        })),
      }
    })

    const feedResult = {
      data: posts,
      total,
      page: pageNum,
      limit: limitNum,
      hasNext: pageNum * limitNum < total,
      hasPrev: pageNum > 1,
    }

    // Cache per user — each person gets their own random mix for 120s,
    // then a fresh random selection on next request after expiry.
    const ttl = sort === "ranked" ? 120 : 60
    await this.redisService.setCachedFeed(cacheKey, feedResult, ttl)

    return feedResult
  }

  /**
   * Fetch a randomized feed by pulling from two pools: "new" and "old".
   * New posts (within cutoffDays) get 70% of slots, old posts get 30%.
   * Both pools are shuffled via PostgreSQL RANDOM() so every user gets a
   * different mix on each cache cycle. If one pool is too small, the
   * other pool fills the remaining slots so the page is always full.
   *
   * Pagination works by offsetting into each pool independently — page 2
   * skips the first newCount new posts and oldCount old posts that were
   * already served on page 1.
   */
  private async fetchRandomizedFeed(
    pageNum: number,
    limitNum: number,
    cutoffDays: number,
    newRatio: number,
  ): Promise<{ slides: Content[]; total: number }> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - cutoffDays)

    // Calculate how many new vs old posts we want per page
    const newCount = Math.ceil(limitNum * newRatio)
    const oldCount = limitNum - newCount

    // Offsets for pagination — each pool paginates independently
    const newOffset = (pageNum - 1) * newCount
    const oldOffset = (pageNum - 1) * oldCount

    // Build base conditions shared by both queries
    const baseConditions = {
      isActive: true,
      userActive: true,
      sortOrder: 0,
    }

    // Fetch new posts (last N days), randomized.
    // addSelect("RANDOM()") is needed because leftJoinAndSelect causes
    // TypeORM to emit SELECT DISTINCT, and PostgreSQL requires ORDER BY
    // expressions to appear in the select list when DISTINCT is used.
    const newQuery = this.contentRepository
      .createQueryBuilder("content")
      .leftJoinAndSelect("content.user", "user")
      .addSelect("RANDOM()", "rand")
      .where("content.isActive = :isActive", baseConditions)
      .andWhere("user.isActive = :userActive", baseConditions)
      .andWhere("content.sortOrder = :sortOrder", baseConditions)
      .andWhere("content.createdAt >= :cutoff", { cutoff: cutoffDate })
      .orderBy("rand")
      .skip(newOffset)
      .take(newCount)

    // Fetch old posts (older than N days), randomized
    const oldQuery = this.contentRepository
      .createQueryBuilder("content")
      .leftJoinAndSelect("content.user", "user")
      .addSelect("RANDOM()", "rand")
      .where("content.isActive = :isActive", baseConditions)
      .andWhere("user.isActive = :userActive", baseConditions)
      .andWhere("content.sortOrder = :sortOrder", baseConditions)
      .andWhere("content.createdAt < :cutoff", { cutoff: cutoffDate })
      .orderBy("rand")
      .skip(oldOffset)
      .take(oldCount)

    // Count total active posts for pagination metadata
    const totalQuery = this.contentRepository
      .createQueryBuilder("content")
      .leftJoin("content.user", "user")
      .where("content.isActive = :isActive", baseConditions)
      .andWhere("user.isActive = :userActive", baseConditions)
      .andWhere("content.sortOrder = :sortOrder", baseConditions)

    // Run all three queries in parallel
    const [newPosts, oldPosts, total] = await Promise.all([
      newQuery.getMany(),
      oldQuery.getMany(),
      totalQuery.getCount(),
    ])

    // If one pool came up short, fill the remaining slots from the other.
    // This handles cases where there aren't enough new or old posts to
    // fill their share — the feed stays full regardless.
    let combined: Content[]

    if (newPosts.length < newCount && oldPosts.length >= oldCount) {
      // Not enough new posts — fetch extra old posts to fill the gap
      const shortfall = newCount - newPosts.length
      const extraOld = await this.contentRepository
        .createQueryBuilder("content")
        .leftJoinAndSelect("content.user", "user")
        .addSelect("RANDOM()", "rand")
        .where("content.isActive = :isActive", baseConditions)
        .andWhere("user.isActive = :userActive", baseConditions)
        .andWhere("content.sortOrder = :sortOrder", baseConditions)
        .andWhere("content.createdAt < :cutoff", { cutoff: cutoffDate })
        .orderBy("rand")
        .skip(oldOffset + oldCount)
        .take(shortfall)
        .getMany()
      combined = [...newPosts, ...oldPosts, ...extraOld]
    } else if (oldPosts.length < oldCount && newPosts.length >= newCount) {
      // Not enough old posts — fetch extra new posts to fill the gap
      const shortfall = oldCount - oldPosts.length
      const extraNew = await this.contentRepository
        .createQueryBuilder("content")
        .leftJoinAndSelect("content.user", "user")
        .addSelect("RANDOM()", "rand")
        .where("content.isActive = :isActive", baseConditions)
        .andWhere("user.isActive = :userActive", baseConditions)
        .andWhere("content.sortOrder = :sortOrder", baseConditions)
        .andWhere("content.createdAt >= :cutoff", { cutoff: cutoffDate })
        .orderBy("rand")
        .skip(newOffset + newCount)
        .take(shortfall)
        .getMany()
      combined = [...newPosts, ...oldPosts, ...extraNew]
    } else {
      combined = [...newPosts, ...oldPosts]
    }

    // Shuffle the combined list so new and old posts are interleaved
    // randomly — not new-first-then-old-last
    for (let i = combined.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[combined[i], combined[j]] = [combined[j], combined[i]]
    }

    return { slides: combined, total }
  }

  /**
   * Fisher-Yates partial shuffle: returns up to `n` unique random elements from `arr`.
   */
  private sampleArray<T>(arr: T[], n: number): T[] {
    if (arr.length <= n) return [...arr]
    const copy = [...arr]
    const result: T[] = []
    for (let i = 0; i < n && copy.length > 0; i++) {
      const j = Math.floor(Math.random() * copy.length)
      result.push(copy.splice(j, 1)[0])
    }
    return result
  }

  /**
   * Hydrate a set of postIds into the same response shape as findAllPosts.
   * Mirrors the slide/interaction batching from the main query path.
   */
  private async hydratePostsByIds(postIds: string[], currentUserId?: string): Promise<any[]> {
    if (postIds.length === 0) return []

    // Fetch all slides for these posts (ordered by sortOrder asc) in one query
    const allSlides = await this.contentRepository.find({
      where: { postId: In(postIds) },
      order: { sortOrder: "ASC" },
      relations: ["user"],
    })

    // Group slides by postId
    const slidesByPostId = new Map<string, Content[]>()
    for (const slide of allSlides) {
      if (!slidesByPostId.has(slide.postId)) {
        slidesByPostId.set(slide.postId, [])
      }
      slidesByPostId.get(slide.postId).push(slide)
    }

    // Get the first slide (sortOrder 0) per postId, preserving the requested order
    const firstSlides: Content[] = []
    for (const pid of postIds) {
      const group = slidesByPostId.get(pid)
      if (group && group.length > 0) firstSlides.push(group[0])
    }

    // Batch user interactions in one query
    const firstSlideIds = firstSlides.map(s => s.id)
    const likedIds = new Set<string>()
    const bookmarkedIds = new Set<string>()
    if (currentUserId && firstSlideIds.length > 0) {
      const userInteractions = await this.interactionRepository.find({
        where: { contentId: In(firstSlideIds), userId: currentUserId },
      })
      for (const interaction of userInteractions) {
        if (interaction.type === "like") likedIds.add(interaction.contentId)
        if (interaction.type === "bookmark") bookmarkedIds.add(interaction.contentId)
      }
    }

    // Map to the same shape as findAllPosts
    return firstSlides.map((firstSlide) => {
      const postSlides = slidesByPostId.get(firstSlide.postId) || [firstSlide]
      return {
        postId: firstSlide.postId,
        userId: firstSlide.userId,
        user: this.safeUser(firstSlide.user),
        caption: firstSlide.caption,
        hashtags: firstSlide.hashtags,
        backgroundMusicUrl: firstSlide.backgroundMusicUrl,
        createdAt: firstSlide.createdAt,
        updatedAt: firstSlide.updatedAt,
        viewCount: firstSlide.viewCount,
        likeCount: firstSlide.likeCount,
        commentCount: firstSlide.commentCount,
        shareCount: firstSlide.shareCount,
        engagementScore: firstSlide.engagementScore,
        viralityScore: firstSlide.viralityScore,
        completionRate: firstSlide.completionRate,
        avgWatchTime: firstSlide.avgWatchTime,
        avgDwellTime: firstSlide.avgDwellTime,
        isLiked: likedIds.has(firstSlide.id),
        isBookmarked: bookmarkedIds.has(firstSlide.id),
        slides: postSlides.map((slide) => ({
          id: slide.id,
          contentType: slide.contentType,
          mediaUrl: slide.mediaUrl,
          thumbnailUrl: slide.thumbnailUrl,
          caption: slide.caption || null,
          text: slide.contentType === 'text' ? (slide.textContent || slide.caption) : null,
          backgroundColor: slide.backgroundColor,
          fontStyle: slide.fontStyle,
          duration: slide.duration,
          sortOrder: slide.sortOrder,
          backgroundMusicUrl: slide.backgroundMusicUrl,
          videoTrimStart: slide.videoTrimStart ?? null,
          videoTrimEnd: slide.videoTrimEnd ?? null,
        })),
      }
    })
  }

  async findOne(id: string): Promise<any> {
    // Try by primary key first
    let content = await this.contentRepository.findOne({
      where: { id },
      relations: ["user"],
    })

    // If not found, try by postId and return grouped post format
    if (!content) {
      const slides = await this.contentRepository.find({
        where: { postId: id },
        relations: ["user"],
        order: { sortOrder: "ASC" },
      })

      if (!slides || slides.length === 0) {
        throw new NotFoundException("Content not found")
      }

      const firstSlide = slides[0]
      return {
        postId: firstSlide.postId,
        userId: firstSlide.userId,
        user: this.safeUser(firstSlide.user),
        caption: firstSlide.caption,
        hashtags: firstSlide.hashtags,
        backgroundMusicUrl: firstSlide.backgroundMusicUrl,
        createdAt: firstSlide.createdAt,
        updatedAt: firstSlide.updatedAt,
        viewCount: firstSlide.viewCount,
        likeCount: firstSlide.likeCount,
        commentCount: firstSlide.commentCount,
        shareCount: firstSlide.shareCount,
        slides: slides.map((slide) => ({
          id: slide.id,
          contentType: slide.contentType,
          mediaUrl: slide.mediaUrl,
          thumbnailUrl: slide.thumbnailUrl,
          caption: slide.caption || null,
          text: slide.contentType === "text" ? (slide.textContent || slide.caption) : null,
          backgroundColor: slide.backgroundColor,
          fontStyle: slide.fontStyle,
          duration: slide.duration,
          sortOrder: slide.sortOrder,
          backgroundMusicUrl: slide.backgroundMusicUrl,
          videoTrimStart: slide.videoTrimStart ?? null,
          videoTrimEnd: slide.videoTrimEnd ?? null,
        })),
      }
    }

    // Found by primary id — also return as grouped post format
    const allSlides = await this.contentRepository.find({
      where: { postId: content.postId },
      relations: ["user"],
      order: { sortOrder: "ASC" },
    })

    const firstSlide = allSlides[0]
    return {
      postId: firstSlide.postId,
      userId: firstSlide.userId,
      user: this.safeUser(firstSlide.user),
      caption: firstSlide.caption,
      hashtags: firstSlide.hashtags,
      backgroundMusicUrl: firstSlide.backgroundMusicUrl,
      createdAt: firstSlide.createdAt,
      updatedAt: firstSlide.updatedAt,
      viewCount: firstSlide.viewCount,
      likeCount: firstSlide.likeCount,
      commentCount: firstSlide.commentCount,
      shareCount: firstSlide.shareCount,
      slides: allSlides.map((slide) => ({
        id: slide.id,
        contentType: slide.contentType,
        mediaUrl: slide.mediaUrl,
        thumbnailUrl: slide.thumbnailUrl,
        caption: slide.caption || null,
        text: slide.contentType === "text" ? (slide.textContent || slide.caption) : null,
        backgroundColor: slide.backgroundColor,
        fontStyle: slide.fontStyle,
        duration: slide.duration,
        sortOrder: slide.sortOrder,
        backgroundMusicUrl: slide.backgroundMusicUrl,
        videoTrimStart: slide.videoTrimStart ?? null,
        videoTrimEnd: slide.videoTrimEnd ?? null,
      })),
    }
  }

  private async findContentEntity(id: string): Promise<Content> {
    const content = await this.contentRepository.findOne({
      where: { id },
      relations: ["user"],
    })
    if (!content) {
      throw new NotFoundException("Content not found")
    }
    return content
  }

  async update(id: string, userId: string, updateContentDto: UpdateContentDto): Promise<Content> {
    const content = await this.findContentEntity(id)

    if (content.userId !== userId) {
      throw new ForbiddenException("You can only update your own content")
    }

    // Only assign fields that are explicitly provided (not undefined)
    if (updateContentDto.caption !== undefined) content.caption = updateContentDto.caption
    if (updateContentDto.backgroundColor !== undefined) content.backgroundColor = updateContentDto.backgroundColor
    if (updateContentDto.fontStyle !== undefined) content.fontStyle = updateContentDto.fontStyle
    if (updateContentDto.backgroundMusicUrl !== undefined) content.backgroundMusicUrl = updateContentDto.backgroundMusicUrl
    if (updateContentDto.hashtags !== undefined) content.hashtags = updateContentDto.hashtags
    if (updateContentDto.isPublic !== undefined) content.isActive = updateContentDto.isPublic

    return this.contentRepository.save(content)
  }

  /**
   * Update a full post (all slides). Handles caption, text, backgroundColor,
   * fontStyle changes per slide, plus new music file uploads and media replacements.
   */
  async updatePost(
    postId: string,
    userId: string,
    slideUpdates: Record<string, any>,
    musicFiles?: Express.Multer.File[],
    mediaFiles?: Express.Multer.File[],
  ): Promise<{ postId: string; slides: Content[] }> {
    // Fetch all existing slides for this post
    const existingSlides = await this.contentRepository.find({
      where: { postId },
      order: { sortOrder: "ASC" },
    })

    if (existingSlides.length === 0) {
      throw new NotFoundException("Post not found")
    }

    // Verify ownership
    if (existingSlides[0].userId !== userId) {
      throw new ForbiddenException("You can only update your own content")
    }

    // Enforce 1-hour edit window
    const oneHourMs = 60 * 60 * 1000
    if (Date.now() - existingSlides[0].createdAt.getTime() > oneHourMs) {
      throw new BadRequestException("Posts can only be edited within 1 hour of creation")
    }

    // Parse slide data from the update payload
    const slideTexts = typeof slideUpdates.slideTexts === 'string'
      ? JSON.parse(slideUpdates.slideTexts)
      : (slideUpdates.slideTexts || {})
    const slideBackgrounds = typeof slideUpdates.slideBackgrounds === 'string'
      ? JSON.parse(slideUpdates.slideBackgrounds)
      : (slideUpdates.slideBackgrounds || {})
    const slideFontStyles = typeof slideUpdates.slideFontStyles === 'string'
      ? JSON.parse(slideUpdates.slideFontStyles)
      : (slideUpdates.slideFontStyles || {})
    const slideMusicIndex = typeof slideUpdates.slideMusicIndex === 'string'
      ? JSON.parse(slideUpdates.slideMusicIndex)
      : (slideUpdates.slideMusicIndex || {})
    const slideMusicRemoved = typeof slideUpdates.slideMusicRemoved === 'string'
      ? JSON.parse(slideUpdates.slideMusicRemoved)
      : (slideUpdates.slideMusicRemoved || {})
    const slideMediaIndex = typeof slideUpdates.slideMediaIndex === 'string'
      ? JSON.parse(slideUpdates.slideMediaIndex)
      : (slideUpdates.slideMediaIndex || {})
    const slideCaptions = typeof slideUpdates.slideCaptions === 'string'
      ? JSON.parse(slideUpdates.slideCaptions)
      : (slideUpdates.slideCaptions || {})

    // Upload new music files and build URL map
    const slideMusicUrls: Record<number, string> = {}
    if (musicFiles && musicFiles.length > 0) {
      for (const [slideIdx, musicFileIdx] of Object.entries(slideMusicIndex)) {
        const idx = parseInt(musicFileIdx as string)
        if (musicFiles[idx]) {
          const musicUpload = await this.storageService.uploadFile(musicFiles[idx])
          slideMusicUrls[parseInt(slideIdx)] = musicUpload.secure_url
        }
      }
    }

    // Upload new media files and build URL map
    const slideMediaUrls: Record<number, { url: string; type: string }> = {}
    if (mediaFiles && mediaFiles.length > 0) {
      for (const [slideIdx, mediaFileIdx] of Object.entries(slideMediaIndex)) {
        const idx = parseInt(mediaFileIdx as string)
        if (mediaFiles[idx]) {
          const file = mediaFiles[idx]
          const isVideo = file.mimetype.startsWith("video/")
          const isImage = file.mimetype.startsWith("image/")
          const upload = isVideo
            ? await this.storageService.uploadVideo(file)
            : isImage
              ? await this.storageService.uploadImage(file)
              : await this.storageService.uploadFile(file)
          slideMediaUrls[parseInt(slideIdx)] = {
            url: upload.secure_url,
            type: isVideo ? "video" : "image",
          }
        }
      }
    }

    // Update each existing slide
    const updatedSlides: Content[] = []
    for (let i = 0; i < existingSlides.length; i++) {
      const slide = existingSlides[i]

      // Update caption/text
      if (slide.contentType === "text") {
        if (slideTexts[i] !== undefined) {
          slide.textContent = slideTexts[i]
        }
        if (slideCaptions[i] !== undefined) {
          slide.caption = slideCaptions[i]
        }
      } else {
        if (slideTexts[i] !== undefined) {
          slide.caption = slideTexts[i]
        }
      }

      // Update background color (text slides)
      if (slideBackgrounds[i] !== undefined) {
        slide.backgroundColor = slideBackgrounds[i]
      }

      // Update font style (text slides)
      if (slideFontStyles[i] !== undefined) {
        slide.fontStyle = slideFontStyles[i]
      }

      // Handle music: new upload, removal, or keep existing
      if (slideMusicUrls[i]) {
        slide.backgroundMusicUrl = slideMusicUrls[i]
      } else if (slideMusicRemoved[i]) {
        slide.backgroundMusicUrl = null
      }

      // Handle media replacement
      if (slideMediaUrls[i]) {
        slide.mediaUrl = slideMediaUrls[i].url
        slide.thumbnailUrl = slideMediaUrls[i].url
        slide.contentType = slideMediaUrls[i].type as any
      }

      // Update hashtags on first slide
      if (i === 0 && slideUpdates.hashtags) {
        const hashtags = Array.isArray(slideUpdates.hashtags)
          ? slideUpdates.hashtags
          : typeof slideUpdates.hashtags === "string"
            ? JSON.parse(slideUpdates.hashtags)
            : []
        slide.hashtags = hashtags
      }

      const saved = await this.contentRepository.save(slide)
      updatedSlides.push(saved)
    }

    // Invalidate feed cache
    await this.redisService.invalidateFeedCache()

    return { postId, slides: updatedSlides }
  }

  async remove(id: string, userId: string): Promise<void> {
    // id can be a postId (multi-slide post) or a single content id
    let contents = await this.contentRepository.find({
      where: { postId: id },
      relations: ["user"],
    })

    // If no results by postId, try by content id
    if (contents.length === 0) {
      const single = await this.contentRepository.findOne({
        where: { id },
        relations: ["user"],
      })
      if (!single) {
        throw new NotFoundException("Content not found")
      }
      contents = [single]
    }

    if (contents[0].userId !== userId) {
      throw new ForbiddenException("You can only delete your own content")
    }

    const contentIds = contents.map(c => c.id)

    // Delete related records to avoid FK violations
    await this.engagementSignalRepository
      .createQueryBuilder()
      .delete()
      .where("contentId IN (:...ids)", { ids: contentIds })
      .execute()

    await this.interactionRepository
      .createQueryBuilder()
      .delete()
      .where("contentId IN (:...ids)", { ids: contentIds })
      .execute()

    // Delete comment likes for comments on these content items
    const comments = await this.commentRepository.find({
      where: contentIds.map(id => ({ contentId: id })),
      select: ["id"],
    })
    if (comments.length > 0) {
      const commentIds = comments.map(c => c.id)
      await this.commentLikeRepository
        .createQueryBuilder()
        .delete()
        .where("commentId IN (:...ids)", { ids: commentIds })
        .execute()
    }

    await this.commentRepository
      .createQueryBuilder()
      .delete()
      .where("contentId IN (:...ids)", { ids: contentIds })
      .execute()

    await this.contentRepository.remove(contents)

    // Invalidate feed cache so deleted post disappears immediately
    await this.redisService.invalidateFeedCache()
  }

  async likeContent(contentId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    const content = await this.findContentEntity(contentId)

    // Check if user already liked this content
    const existingLike = await this.interactionRepository.findOne({
      where: { contentId, userId, type: "like" },
    })

    if (existingLike) {
      // Unlike
      await this.interactionRepository.remove(existingLike)
      content.likeCount = Math.max(0, content.likeCount - 1)
      await this.contentRepository.save(content)
      return { liked: false, likesCount: content.likeCount }
    } else {
      // Like
      const interaction = this.interactionRepository.create({
        contentId,
        userId,
        type: "like",
      })
      await this.interactionRepository.save(interaction)
      content.likeCount += 1
      await this.contentRepository.save(content)

      // Create notification for content owner
      await this.notificationsService.createLikeNotification(contentId, content.userId, userId)

      // Update user preferences based on like (fire-and-forget)
      if (this.userPreferenceLearningService) {
        this.userPreferenceLearningService
          .updatePreferencesFromEngagement(userId, contentId, { type: "like" })
          .catch(error => this.logger.warn(`Failed to update preferences after like: ${(error as any).message}`))
      }

      return { liked: true, likesCount: content.likeCount }
    }
  }

  async viewContent(contentId: string, userId?: string): Promise<void> {
    const content = await this.findContentEntity(contentId)

    // Only count unique views per user
    if (userId) {
      const existingView = await this.interactionRepository.findOne({
        where: { contentId, userId, type: "view" },
      })

      if (!existingView) {
        const interaction = this.interactionRepository.create({
          contentId,
          userId,
          type: "view",
        })
        await this.interactionRepository.save(interaction)
        content.viewCount += 1
        await this.contentRepository.save(content)
      }
    } else {
      // Anonymous view
      content.viewCount += 1
      await this.contentRepository.save(content)
    }
  }

  /**
   * Track views for multiple posts at once (when posts scroll into viewport).
   * Counts every view with a 30-minute cooldown per user per post.
   */
  async trackBatchViews(postIds: string[], userId: string): Promise<{ tracked: number; views: Record<string, number> }> {
    let tracked = 0
    const views: Record<string, number> = {}
    const VIEW_COOLDOWN_MS = 30 * 60 * 1000 // 30 minutes

    // Get first slides for these posts (sortOrder: 0 = first slide)
    const firstSlides = await this.contentRepository.find({
      where: postIds.map(postId => ({ postId, sortOrder: 0 })),
    })

    for (const slide of firstSlides) {
      // Find most recent view by this user for this content
      const lastView = await this.interactionRepository.findOne({
        where: { contentId: slide.id, userId, type: "view" },
        order: { createdAt: "DESC" },
      })

      const now = new Date()
      const canCount = !lastView || (now.getTime() - new Date(lastView.createdAt).getTime() >= VIEW_COOLDOWN_MS)

      if (canCount) {
        const interaction = this.interactionRepository.create({
          contentId: slide.id,
          userId,
          type: "view",
        })
        await this.interactionRepository.save(interaction)
        slide.viewCount += 1
        await this.contentRepository.save(slide)
        tracked++
      }

      views[slide.postId] = slide.viewCount
    }

    // Invalidate feed cache so next fetch shows updated counts
    if (tracked > 0) {
      await this.redisService.invalidateFeedCache(userId)
    }

    return { tracked, views }
  }

  async addComment(contentId: string, userId: string, createCommentDto: CreateCommentDto): Promise<Comment> {
    const content = await this.findContentEntity(contentId)

    const comment = this.commentRepository.create({
      contentId,
      userId,
      text: createCommentDto.text,
      parentId: createCommentDto.parentId,
    })

    const savedComment = await this.commentRepository.save(comment)

    // Update comment count
    content.commentCount += 1
    await this.contentRepository.save(content)

    // Save mentions
    await this.saveMentions(createCommentDto.text, userId, contentId, savedComment.id)

    // If it's a reply, notify the parent comment owner
    if (createCommentDto.parentId) {
      const parentComment = await this.commentRepository.findOne({
        where: { id: createCommentDto.parentId },
      })
      if (parentComment) {
        await this.notificationsService.createReplyNotification(
          parentComment.userId,
          userId,
          contentId,
          savedComment.id,
        )
      }
    } else {
      // Create notification for post owner (only for top-level comments)
      await this.notificationsService.createCommentNotification(
        contentId,
        content.userId,
        userId,
        savedComment.id,
      )
    }

    // Update user preferences based on comment (fire-and-forget)
    if (this.userPreferenceLearningService) {
      this.userPreferenceLearningService
        .updatePreferencesFromEngagement(userId, contentId, { type: "comment" })
        .catch((error: any) => this.logger.warn(`Failed to update preferences after comment: ${(error as any).message}`))
    }

    const commentWithUser = await this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: ["user"],
    })
    if (commentWithUser) {
      (commentWithUser as any).user = this.safeUser(commentWithUser.user)
    }
    return commentWithUser
  }

  async getComments(contentId: string, userId?: string, page = 1, limit = 20) {
    const [comments, total] = await this.commentRepository.findAndCount({
      where: { contentId, parentId: IsNull() }, // Only top-level comments
      relations: ["user", "replies", "replies.user"],
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Batch fetch all comment like statuses in ONE query (instead of N+1)
    const allCommentIds = comments.flatMap(c => [
      c.id,
      ...(c.replies || []).map(r => r.id),
    ])

    let likedCommentIds = new Set<string>()
    if (userId && allCommentIds.length > 0) {
      const userLikes = await this.commentLikeRepository.find({
        where: { commentId: In(allCommentIds), userId },
      })
      likedCommentIds = new Set(userLikes.map(l => l.commentId))
    }

    // Enrich comments with like status (no more async per comment)
    const enrichedComments = comments.map((comment) => ({
      ...comment,
      user: this.safeUser(comment.user),
      isLiked: likedCommentIds.has(comment.id),
      replies: (comment.replies || []).map((reply) => ({
        ...reply,
        user: this.safeUser(reply.user),
        isLiked: likedCommentIds.has(reply.id),
      })),
    }))

    return {
      data: enrichedComments,
      total,
      page,
      limit,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    }
  }

  async getNewPostsCount(since: string): Promise<{ count: number }> {
    const sinceDate = new Date(since)
    if (isNaN(sinceDate.getTime())) {
      return { count: 0 }
    }

    const count = await this.contentRepository.count({
      where: {
        isActive: true,
        sortOrder: 0, // Only first slides (one per post)
        createdAt: MoreThan(sinceDate),
      },
    })

    return { count }
  }

  async getFeed(userId?: string, page = 1, limit = 20) {
    const queryBuilder = this.contentRepository
      .createQueryBuilder("content")
      .leftJoinAndSelect("content.user", "user")
      .where("content.isActive = :isActive", { isActive: true })
      .andWhere("user.isActive = :userActive", { userActive: true })

    const [contents, total] = await queryBuilder
      .orderBy("content.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    const enrichedContents = await Promise.all(
      contents.map(async (content) => {
        const interactions = await this.getContentInteractions(content.id, userId)
        return {
          ...content,
          user: {
            id: content.user.id,
            name: content.user.displayName || content.user.username,
            avatar: content.user.avatarUrl,
            isVerified: content.user.isVerified,
          },
          interactions,
        }
      }),
    )

    return {
      data: enrichedContents,
      total,
      page,
      limit,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    }
  }

  async getContentInteractions(contentId: string, userId?: string) {
    const content = await this.contentRepository.findOne({ where: { id: contentId } })

    let isLiked = false
    let isBookmarked = false

    if (userId) {
      const like = await this.interactionRepository.findOne({
        where: { contentId, userId, type: "like" },
      })
      const bookmark = await this.interactionRepository.findOne({
        where: { contentId, userId, type: "bookmark" },
      })

      isLiked = !!like
      isBookmarked = !!bookmark
    }

    return {
      likes: content.likeCount,
      comments: content.commentCount,
      shares: content.shareCount,
      views: content.viewCount,
      isLiked,
      isBookmarked,
    }
  }

  async interactWithContent(postId: string, userId: string, type: "like" | "bookmark" | "share") {
    // Get the first slide (sortOrder = 0) to represent the post
    const firstSlide = await this.contentRepository.findOne({
      where: { postId, sortOrder: 0 },
    })

    if (!firstSlide) {
      throw new NotFoundException("Post not found")
    }

    // Check if interaction already exists (using first slide's ID)
    const existingInteraction = await this.interactionRepository.findOne({
      where: { contentId: firstSlide.id, userId, type },
    })

    if (existingInteraction) {
      // Remove interaction (unlike, unbookmark)
      await this.interactionRepository.remove(existingInteraction)

      if (type === "like") {
        firstSlide.likeCount = Math.max(0, firstSlide.likeCount - 1)
      } else if (type === "share") {
        firstSlide.shareCount = Math.max(0, firstSlide.shareCount - 1)
      }

      await this.contentRepository.save(firstSlide)
      return { success: true, action: "removed", type, count: type === "like" ? firstSlide.likeCount : firstSlide.shareCount }
    } else {
      // Add interaction (store on first slide)
      const interaction = this.interactionRepository.create({
        contentId: firstSlide.id,
        userId,
        type,
      })
      await this.interactionRepository.save(interaction)

      if (type === "like") {
        firstSlide.likeCount += 1
        // Create notification for post owner
        await this.notificationsService.createLikeNotification(firstSlide.id, firstSlide.userId, userId)
      } else if (type === "share") {
        firstSlide.shareCount += 1

        // Update user preferences based on share (fire-and-forget)
        if (this.userPreferenceLearningService) {
          this.userPreferenceLearningService
            .updatePreferencesFromEngagement(userId, firstSlide.id, { type: "share" })
            .catch((error: any) => this.logger.warn(`Failed to update preferences after share: ${(error as any).message}`))
        }
      } else if (type === "bookmark") {
        // Update user preferences based on save/bookmark (fire-and-forget)
        if (this.userPreferenceLearningService) {
          this.userPreferenceLearningService
            .updatePreferencesFromEngagement(userId, firstSlide.id, { type: "save" })
            .catch((error: any) => this.logger.warn(`Failed to update preferences after save: ${(error as any).message}`))
        }
      }

      await this.contentRepository.save(firstSlide)
      return { success: true, action: "added", type, count: type === "like" ? firstSlide.likeCount : firstSlide.shareCount }
    }
  }

  // Get users who interacted with a post
  async getPostInteractors(postId: string, type: "like" | "bookmark" | "share", page = 1, limit = 50) {
    // Get the first slide (sortOrder = 0) to represent the post
    const firstSlide = await this.contentRepository.findOne({
      where: { postId, sortOrder: 0 },
    })

    if (!firstSlide) {
      throw new NotFoundException("Post not found")
    }

    // Get all interactions of this type for the first slide
    const [interactions, total] = await this.interactionRepository.findAndCount({
      where: { contentId: firstSlide.id, type },
      relations: ["user"],
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Map to user data
    const users = interactions.map((interaction) => ({
      id: interaction.user.id,
      username: interaction.user.username,
      displayName: interaction.user.displayName || interaction.user.username,
      avatarUrl: interaction.user.avatarUrl,
      isVerified: interaction.user.isVerified,
      interactedAt: interaction.createdAt,
    }))

    return {
      data: users,
      total,
      page,
      limit,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    }
  }

  /**
   * Deletes a comment if the requesting user is either the comment author
   * or the owner of the post the comment belongs to. Decrements the post's
   * comment count accordingly. Replies to the deleted comment are removed
   * as well.
   */
  async deleteComment(commentId: string, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ["replies"],
    })

    if (!comment) {
      throw new NotFoundException("Comment not found")
    }

    // Allow deletion by comment author or post owner
    const content = await this.contentRepository.findOne({ where: { id: comment.contentId } })
    if (comment.userId !== userId && content?.userId !== userId) {
      throw new ForbiddenException("You can only delete your own comments")
    }

    // Count replies so we can decrement the post's comment count accurately
    const replyCount = comment.replies?.length || 0
    const totalRemoved = 1 + replyCount

    await this.commentRepository.remove(comment)

    // Decrement comment count on the post
    if (content) {
      content.commentCount = Math.max(0, content.commentCount - totalRemoved)
      await this.contentRepository.save(content)
    }

    return { success: true, deleted: true, removedCount: totalRemoved }
  }

  async likeComment(commentId: string, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    })

    if (!comment) {
      throw new NotFoundException("Comment not found")
    }

    // Check if user already liked this comment
    const existingLike = await this.commentLikeRepository.findOne({
      where: { commentId, userId },
    })

    if (existingLike) {
      // Unlike - remove the like record
      await this.commentLikeRepository.remove(existingLike)
      comment.likes = Math.max(0, comment.likes - 1)
      await this.commentRepository.save(comment)

      return { success: true, action: "removed", likes: comment.likes, isLiked: false }
    } else {
      // Like - create a like record
      const like = this.commentLikeRepository.create({
        commentId,
        userId,
      })
      await this.commentLikeRepository.save(like)
      comment.likes += 1
      await this.commentRepository.save(comment)

      return { success: true, action: "added", likes: comment.likes, isLiked: true }
    }
  }

  async getCommentWithLikeStatus(comment: Comment, userId?: string) {
    let isLiked = false

    if (userId) {
      const like = await this.commentLikeRepository.findOne({
        where: { commentId: comment.id, userId },
      })
      isLiked = !!like
    }

    return {
      ...comment,
      isLiked,
    }
  }

  // --- Engagement Signals ---

  /**
   * Store engagement signals directly to DB and aggregate immediately.
   * Returns updated engagement metrics for the affected posts.
   */
  async trackEngagementSignals(userId: string, signals: EngagementSignalDto[]): Promise<{
    tracked: number
    metrics: Record<string, { completionRate: number; avgWatchTime: number; avgDwellTime: number; engagementScore: number; viralityScore: number }>
  }> {
    // Guard against invalid userId (undefined, null, NaN)
    if (!userId || userId === "undefined" || userId === "null") {
      this.logger.warn(`trackEngagementSignals called with invalid userId: "${userId}"`)
      return { tracked: 0, metrics: {} }
    }

    const enriched = signals.map((s) => ({ ...s, userId }))

    // Write directly to DB for immediate availability
    const entities = enriched.map((s) =>
      this.engagementSignalRepository.create({
        userId: s.userId,
        contentId: s.contentId,
        postId: s.postId,
        contentType: s.contentType,
        mediaProgress: s.mediaProgress,
        mediaCompleted: s.mediaCompleted,
        dwellTimeMs: s.dwellTimeMs,
        scrollDepth: s.scrollDepth || 0,
        slideIndex: s.slideIndex,
        totalSlides: s.totalSlides,
      }),
    )
    try {
      await this.engagementSignalRepository.save(entities)
    } catch (err: any) {
      // Ignore FK violations — content was likely deleted while user was viewing it
      if (err?.code === "23503") {
        return { tracked: 0, metrics: {} }
      }
      throw err
    }

    // Update user preferences based on watch time signals (fire-and-forget)
    if (this.userPreferenceLearningService) {
      for (const signal of enriched) {
        // Only process video/audio content with meaningful watch time
        if (
          (signal.contentType === "video" || signal.contentType === "audio") &&
          signal.mediaProgress !== undefined &&
          signal.mediaProgress !== null
        ) {
          // Validate userId and contentId are not empty
          if (!signal.userId || !signal.contentId) {
            this.logger.warn(
              `Skipping preference update - missing IDs: userId="${signal.userId}", contentId="${signal.contentId}"`
            )
            continue
          }

          // Convert mediaProgress (0.0-1.0) to percentage (0-100)
          const watchTimePercent = signal.mediaProgress * 100

          this.userPreferenceLearningService
            .updatePreferencesFromEngagement(signal.userId, signal.contentId, {
              type: "watch",
              metadata: { watchTimePercent },
            })
            .catch((error: any) => this.logger.warn(`Failed to update preferences after watch signal: ${(error as any).message}`))
        }
      }
    }

    // Aggregate immediately for the affected posts
    const postIds = [...new Set(enriched.map((s) => s.postId))]
    const metrics: Record<string, { completionRate: number; avgWatchTime: number; avgDwellTime: number; engagementScore: number; viralityScore: number }> = {}

    if (postIds.length > 0) {
      try {
        // Aggregate signals for these specific posts
        // dwellTimeMs signals are incremental (~5s each flush), so SUM per user per slide
        // then take the MAX across slides for each user's total dwell on that post
        // Aggregate signals from ALL time. Values can only go UP —
        // GREATEST prevents overwriting a higher stored value.
        const result = await this.contentRepository.query(`
          WITH slide_dwell AS (
            SELECT
              es."postId",
              es."userId",
              es."slideIndex",
              SUM(es."dwellTimeMs") as total_dwell_ms
            FROM engagement_signals es
            WHERE es."postId" = ANY($1)
            GROUP BY es."postId", es."userId", es."slideIndex"
          ),
          post_signals AS (
            SELECT
              es."postId",
              es."userId",
              COUNT(DISTINCT es."slideIndex") as slides_viewed,
              MAX(es."totalSlides") as total_slides,
              AVG(CASE WHEN es."contentType" IN ('video', 'audio') THEN es."mediaProgress" ELSE NULL END) as avg_media_progress
            FROM engagement_signals es
            WHERE es."postId" = ANY($1)
            GROUP BY es."postId", es."userId"
          ),
          user_dwell AS (
            SELECT
              sd."postId",
              sd."userId",
              SUM(sd.total_dwell_ms) / 1000.0 as total_dwell_seconds
            FROM slide_dwell sd
            GROUP BY sd."postId", sd."userId"
          ),
          post_aggregates AS (
            SELECT
              ps."postId",
              AVG(ps.slides_viewed::float / NULLIF(ps.total_slides, 0)) as completion_rate,
              AVG(ps.avg_media_progress) as avg_watch_time,
              AVG(ud.total_dwell_seconds) as avg_dwell_time
            FROM post_signals ps
            LEFT JOIN user_dwell ud ON ps."postId" = ud."postId" AND ps."userId" = ud."userId"
            GROUP BY ps."postId"
          )
          UPDATE content c
          SET
            "completionRate" = GREATEST(c."completionRate", COALESCE(pa.completion_rate, 0)),
            "avgWatchTime" = GREATEST(c."avgWatchTime", COALESCE(pa.avg_watch_time, 0)),
            "avgDwellTime" = GREATEST(c."avgDwellTime", COALESCE(pa.avg_dwell_time, 0)),
            "engagementScore" = (c."likeCount" * 3) + (c."commentCount" * 5) + (c."shareCount" * 4) + (c."viewCount" * 0.1)
              + (GREATEST(c."completionRate", COALESCE(pa.completion_rate, 0)) * 10)
              + (GREATEST(c."avgWatchTime", COALESCE(pa.avg_watch_time, 0)) * 8)
              + (GREATEST(c."avgDwellTime", COALESCE(pa.avg_dwell_time, 0)) * 6)
              - LEAST(LN(1 + EXTRACT(EPOCH FROM (NOW() - c."createdAt")) / 3600.0) * 2, 50)
          FROM post_aggregates pa
          WHERE c."postId" = pa."postId"
            AND c."sortOrder" = 0
          RETURNING c."postId", c."completionRate", c."avgWatchTime", c."avgDwellTime", c."engagementScore", c."viralityScore"
        `, [postIds])

        for (const row of result) {
          metrics[row.postId] = {
            completionRate: parseFloat(row.completionRate) || 0,
            avgWatchTime: parseFloat(row.avgWatchTime) || 0,
            avgDwellTime: parseFloat(row.avgDwellTime) || 0,
            engagementScore: parseFloat(row.engagementScore) || 0,
            viralityScore: parseFloat(row.viralityScore) || 0,
          }
        }
      } catch (err) {
        this.logger.warn(`Failed to aggregate signals for posts: ${(err as any).message}`)
      }
    }

    return { tracked: entities.length, metrics }
  }

  /**
   * Drain signals from Redis queue and bulk insert into Postgres.
   * Called by the scoring cron job.
   */
  async flushSignalsToDb(): Promise<number> {
    if (!this.redisService.isConnected) return 0

    const raw = await this.redisService.drainSignals(500)
    if (raw.length === 0) return 0

    const signals: any[] = []
    for (const item of raw) {
      try {
        signals.push(JSON.parse(item))
      } catch {
        // skip malformed entries
      }
    }

    if (signals.length === 0) return 0

    const entities = signals.map((s) =>
      this.engagementSignalRepository.create({
        userId: s.userId,
        contentId: s.contentId,
        postId: s.postId,
        contentType: s.contentType,
        mediaProgress: s.mediaProgress || 0,
        mediaCompleted: s.mediaCompleted || false,
        dwellTimeMs: s.dwellTimeMs || 0,
        scrollDepth: s.scrollDepth || 0,
        slideIndex: s.slideIndex || 0,
        totalSlides: s.totalSlides || 1,
      }),
    )

    await this.engagementSignalRepository.save(entities)
    return entities.length
  }

  /**
   * Aggregate engagement signals into Content entity columns.
   * Uses a CTE to compute per-post averages from the last 7 days of signals.
   */
  async aggregateEngagementSignals(): Promise<void> {
    await this.contentRepository.query(`
      WITH slide_dwell AS (
        SELECT
          es."postId",
          es."userId",
          es."slideIndex",
          SUM(es."dwellTimeMs") as total_dwell_ms
        FROM engagement_signals es
        WHERE es."createdAt" > NOW() - INTERVAL '7 days'
        GROUP BY es."postId", es."userId", es."slideIndex"
      ),
      post_signals AS (
        SELECT
          es."postId",
          es."userId",
          COUNT(DISTINCT es."slideIndex") as slides_viewed,
          MAX(es."totalSlides") as total_slides,
          AVG(CASE WHEN es."contentType" IN ('video', 'audio') THEN es."mediaProgress" ELSE NULL END) as avg_media_progress
        FROM engagement_signals es
        WHERE es."createdAt" > NOW() - INTERVAL '7 days'
        GROUP BY es."postId", es."userId"
      ),
      user_dwell AS (
        SELECT
          sd."postId",
          sd."userId",
          SUM(sd.total_dwell_ms) / 1000.0 as total_dwell_seconds
        FROM slide_dwell sd
        GROUP BY sd."postId", sd."userId"
      ),
      post_aggregates AS (
        SELECT
          ps."postId",
          AVG(ps.slides_viewed::float / NULLIF(ps.total_slides, 0)) as completion_rate,
          AVG(ps.avg_media_progress) as avg_watch_time,
          AVG(ud.total_dwell_seconds) as avg_dwell_time
        FROM post_signals ps
        LEFT JOIN user_dwell ud ON ps."postId" = ud."postId" AND ps."userId" = ud."userId"
        GROUP BY ps."postId"
      )
      UPDATE content c
      SET
        "completionRate" = COALESCE(pa.completion_rate, 0),
        "avgWatchTime" = COALESCE(pa.avg_watch_time, 0),
        "avgDwellTime" = COALESCE(pa.avg_dwell_time, 0)
      FROM post_aggregates pa
      WHERE c."postId" = pa."postId"
        AND c."sortOrder" = 0
    `)
  }

  /**
   * Download a video slide segment. If the slide has trim data, extract the segment
   * from the full video using FFmpeg (stream copy, no re-encoding). Otherwise, redirect
   * to the original media URL.
   */
  async downloadSlideSegment(slideId: string, res: Response): Promise<void> {
    const slide = await this.contentRepository.findOne({ where: { id: slideId } })
    if (!slide) {
      throw new NotFoundException("Slide not found")
    }

    if (!slide.mediaUrl) {
      throw new BadRequestException("Slide has no media")
    }

    // No trim data — redirect to original file
    if (slide.videoTrimStart == null || slide.videoTrimEnd == null) {
      res.redirect(slide.mediaUrl)
      return
    }

    const trimStart = slide.videoTrimStart
    const duration = slide.videoTrimEnd - slide.videoTrimStart
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "dl-segment-"))
    const outputPath = path.join(tmpDir, "segment.mp4")

    try {
      // FFmpeg stream copy — extracts the segment without re-encoding (very fast)
      await execFileAsync("ffmpeg", [
        "-ss", String(trimStart),
        "-i", slide.mediaUrl,
        "-t", String(duration),
        "-c", "copy",
        "-movflags", "+faststart",
        "-avoid_negative_ts", "make_zero",
        "-y", outputPath,
      ], { timeout: 30000 })

      const stat = await fs.stat(outputPath)
      const postId = slide.postId || slideId
      const filename = `tagmi_${postId}_slide${slide.sortOrder}.mp4`

      res.set({
        "Content-Type": "video/mp4",
        "Content-Length": stat.size,
        "Content-Disposition": `attachment; filename="${filename}"`,
      })

      const stream = createReadStream(outputPath)
      stream.pipe(res)
      stream.on("end", () => {
        fs.unlink(outputPath).catch(() => {})
        fs.rmdir(tmpDir).catch(() => {})
      })
      stream.on("error", () => {
        fs.unlink(outputPath).catch(() => {})
        fs.rmdir(tmpDir).catch(() => {})
      })
    } catch (err) {
      await fs.unlink(outputPath).catch(() => {})
      await fs.rmdir(tmpDir).catch(() => {})
      this.logger.error(`Failed to extract segment for slide ${slideId}: ${(err as any).message}`)
      // Fallback: redirect to full video
      res.redirect(slide.mediaUrl)
    }
  }
}

