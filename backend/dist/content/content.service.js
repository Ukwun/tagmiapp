"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ContentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("typeorm");
const content_repository_1 = require("./repositories/content.repository");
const content_interaction_repository_1 = require("./repositories/content-interaction.repository");
const comment_repository_1 = require("./repositories/comment.repository");
const comment_like_repository_1 = require("./repositories/comment-like.repository");
const mention_repository_1 = require("./repositories/mention.repository");
const engagement_signal_repository_1 = require("./repositories/engagement-signal.repository");
const user_repository_1 = require("../users/repositories/user.repository");
const follow_repository_1 = require("../follows/repositories/follow.repository");
const storage_service_1 = require("../config/storage.service");
const redis_service_1 = require("../config/redis.service");
const notifications_service_1 = require("../notifications/notifications.service");
const validation_pipeline_service_1 = require("../referrals/services/validation-pipeline.service");
const media_analysis_service_1 = require("../ai/media-analysis/media-analysis.service");
const categorization_service_1 = require("../ai/categorization/categorization.service");
const user_preference_repository_1 = require("./repositories/user-preference.repository");
const user_preference_learning_service_1 = require("./user-preference-learning.service");
const personalized_feed_service_1 = require("./personalized-feed.service");
const uuid_1 = require("uuid");
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const fs = __importStar(require("fs/promises"));
const fs_1 = require("fs");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
let ContentService = ContentService_1 = class ContentService {
    constructor(contentRepository, interactionRepository, commentRepository, commentLikeRepository, mentionRepository, userRepository, followRepository, engagementSignalRepository, storageService, redisService, notificationsService, validationPipelineService, mediaAnalysisService, categorizationService, userPreferenceRepository, userPreferenceLearningService, personalizedFeedService) {
        this.contentRepository = contentRepository;
        this.interactionRepository = interactionRepository;
        this.commentRepository = commentRepository;
        this.commentLikeRepository = commentLikeRepository;
        this.mentionRepository = mentionRepository;
        this.userRepository = userRepository;
        this.followRepository = followRepository;
        this.engagementSignalRepository = engagementSignalRepository;
        this.storageService = storageService;
        this.redisService = redisService;
        this.notificationsService = notificationsService;
        this.validationPipelineService = validationPipelineService;
        this.mediaAnalysisService = mediaAnalysisService;
        this.categorizationService = categorizationService;
        this.userPreferenceRepository = userPreferenceRepository;
        this.userPreferenceLearningService = userPreferenceLearningService;
        this.personalizedFeedService = personalizedFeedService;
        this.logger = new common_1.Logger(ContentService_1.name);
    }
    async triggerReferralValidation(userId) {
        if (!this.validationPipelineService)
            return;
        try {
            const referral = await this.validationPipelineService.getActiveReferralForUser(userId);
            if (referral) {
                await this.validationPipelineService.runValidation(referral.id);
            }
        }
        catch (error) {
            this.logger.warn(`Failed to trigger referral validation for user ${userId}: ${error.message}`);
        }
    }
    async analyzePostContent(slides, fileBuffers) {
        if (!this.mediaAnalysisService)
            return;
        const mediaSlides = slides.filter(s => s.contentType !== "text" && s.mediaUrl);
        if (mediaSlides.length === 0)
            return;
        const firstSlide = slides.find(s => s.sortOrder === 0);
        for (const slide of mediaSlides) {
            let result;
            if (fileBuffers?.has(slide.mediaUrl)) {
                const file = fileBuffers.get(slide.mediaUrl);
                if (file.buffer) {
                    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "upload-analysis-"));
                    try {
                        const ext = path.extname(file.originalname) || ".tmp";
                        const tmpPath = path.join(tmpDir, `file${ext}`);
                        await fs.writeFile(tmpPath, file.buffer);
                        result = await this.mediaAnalysisService.analyzeContentFromFile(slide.contentType, tmpPath, slide.caption);
                    }
                    catch (error) {
                        this.logger.warn(`Failed to analyze from buffer for ${slide.id}: ${error.message}`);
                        result = await this.mediaAnalysisService.analyzeContent(slide.contentType, slide.mediaUrl, slide.caption);
                    }
                    finally {
                        await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => { });
                    }
                }
                else if (file.path) {
                    try {
                        this.logger.log(`Analyzing from disk path for ${slide.id}: ${file.path}`);
                        result = await this.mediaAnalysisService.analyzeContentFromFile(slide.contentType, file.path, slide.caption);
                    }
                    catch (error) {
                        this.logger.warn(`Failed to analyze from disk path for ${slide.id}: ${error.message}`);
                        result = await this.mediaAnalysisService.analyzeContent(slide.contentType, slide.mediaUrl, slide.caption);
                    }
                }
                else {
                    this.logger.warn(`File buffer and path not available for ${slide.id}, falling back to CDN`);
                    result = await this.mediaAnalysisService.analyzeContent(slide.contentType, slide.mediaUrl, slide.caption);
                }
            }
            else {
                result = await this.mediaAnalysisService.analyzeContent(slide.contentType, slide.mediaUrl, slide.caption);
            }
            const updates = {};
            if (result.transcription)
                updates.transcription = result.transcription;
            if (result.aiDescription)
                updates.aiDescription = result.aiDescription;
            if (result.categories && slide.id === firstSlide?.id) {
                updates.categories = result.categories;
            }
            if (Object.keys(updates).length > 0) {
                await this.contentRepository.update(slide.id, updates);
            }
        }
        if (firstSlide && !mediaSlides.some(s => s.id === firstSlide.id) && this.categorizationService) {
            const parts = [];
            if (firstSlide.caption)
                parts.push(firstSlide.caption);
            if (firstSlide.hashtags?.length)
                parts.push(firstSlide.hashtags.join(" "));
            const text = parts.join(" ").trim();
            if (text) {
                const categories = await this.categorizationService.categorize(text, 3);
                if (categories.length > 0) {
                    await this.contentRepository.update(firstSlide.id, { categories });
                }
            }
        }
    }
    safeUser(user) {
        if (!user)
            return user;
        const { passwordHash, phoneHash, ...safe } = user;
        return safe;
    }
    extractMentions(text) {
        const mentionRegex = /@(\w+)/g;
        const matches = text.matchAll(mentionRegex);
        return Array.from(matches, match => match[1]);
    }
    extractHashtags(text) {
        if (!text)
            return [];
        const matches = text.match(/#(\w+)/g);
        if (!matches)
            return [];
        return [...new Set(matches.map(m => m.slice(1).toLowerCase()))];
    }
    async saveMentions(text, mentionedByUserId, contentId, commentId) {
        const usernames = this.extractMentions(text);
        if (usernames.length === 0)
            return;
        const users = await this.userRepository
            .createQueryBuilder("user")
            .where("user.username IN (:...usernames)", { usernames })
            .select(["user.id", "user.username"])
            .getMany();
        const mentions = users.map(user => ({
            mentionedUserId: user.id,
            mentionedByUserId,
            contentId,
            commentId,
        }));
        if (mentions.length > 0) {
            await this.mentionRepository.save(mentions);
            for (const user of users) {
                await this.notificationsService.createMentionNotification(user.id, mentionedByUserId, contentId, commentId);
            }
        }
    }
    async create(userId, createContentDto, file) {
        const user = await this.userRepository.findByIdOptional(userId);
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        let type;
        if (file.mimetype.startsWith("image/")) {
            type = "image";
        }
        else if (file.mimetype.startsWith("video/")) {
            type = "video";
        }
        else if (file.mimetype.startsWith("audio/")) {
            type = "audio";
        }
        else {
            throw new Error("Unsupported file type");
        }
        const uploadResult = type === "video"
            ? await this.storageService.uploadVideo(file)
            : type === "image"
                ? await this.storageService.uploadImage(file)
                : await this.storageService.uploadFile(file);
        const content = this.contentRepository.create({
            userId,
            contentType: type,
            mediaUrl: uploadResult.secure_url,
            thumbnailUrl: uploadResult.secure_url,
            caption: createContentDto.description,
            hashtags: createContentDto.tags || [],
        });
        user.postCount += 1;
        await this.userRepository.save(user);
        const savedContent = await this.contentRepository.save(content);
        await this.triggerReferralValidation(userId);
        return savedContent;
    }
    async createPost(userId, createPostDto, files, musicFiles, thumbnailFiles) {
        const slideTypes = typeof createPostDto.slideTypes === 'string'
            ? JSON.parse(createPostDto.slideTypes)
            : (createPostDto.slideTypes || {});
        const slideTexts = typeof createPostDto.slideTexts === 'string'
            ? JSON.parse(createPostDto.slideTexts)
            : (createPostDto.slideTexts || {});
        const slideBackgrounds = typeof createPostDto.slideBackgrounds === 'string'
            ? JSON.parse(createPostDto.slideBackgrounds)
            : (createPostDto.slideBackgrounds || {});
        const slideFontStyles = typeof createPostDto.slideFontStyles === 'string'
            ? JSON.parse(createPostDto.slideFontStyles)
            : (createPostDto.slideFontStyles || {});
        const slideCaptions = typeof createPostDto.slideCaptions === 'string'
            ? JSON.parse(createPostDto.slideCaptions)
            : (createPostDto.slideCaptions || {});
        const slideMusicIndex = typeof createPostDto.slideMusicIndex === 'string'
            ? JSON.parse(createPostDto.slideMusicIndex)
            : (createPostDto.slideMusicIndex || {});
        const videoTrimStart = typeof createPostDto.videoTrimStart === 'string'
            ? JSON.parse(createPostDto.videoTrimStart)
            : (createPostDto.videoTrimStart || {});
        const videoTrimEnd = typeof createPostDto.videoTrimEnd === 'string'
            ? JSON.parse(createPostDto.videoTrimEnd)
            : (createPostDto.videoTrimEnd || {});
        const slideThumbnailIndex = typeof createPostDto.slideThumbnailIndex === 'string'
            ? JSON.parse(createPostDto.slideThumbnailIndex)
            : (createPostDto.slideThumbnailIndex || {});
        const slideMusicUrls = {};
        if (musicFiles && musicFiles.length > 0) {
            for (const [slideIdx, musicFileIdx] of Object.entries(slideMusicIndex)) {
                const idx = parseInt(musicFileIdx);
                if (musicFiles[idx]) {
                    const musicUpload = await this.storageService.uploadFile(musicFiles[idx]);
                    slideMusicUrls[parseInt(slideIdx)] = musicUpload.secure_url;
                }
            }
            if (Object.keys(slideMusicIndex).length === 0 && musicFiles[0]) {
                const musicUpload = await this.storageService.uploadFile(musicFiles[0]);
                slideMusicUrls[0] = musicUpload.secure_url;
            }
        }
        const totalSlides = Math.max(files?.length || 0, ...Object.keys(slideTypes).map(k => parseInt(k) + 1));
        if (totalSlides === 0) {
            throw new common_1.BadRequestException("At least one slide is required");
        }
        if (totalSlides > 10) {
            throw new common_1.BadRequestException("Maximum 10 slides allowed");
        }
        const user = await this.userRepository.findByIdOptional(userId);
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        const isScheduled = !!createPostDto.scheduledAt;
        const scheduledAt = isScheduled ? new Date(createPostDto.scheduledAt) : null;
        if (isScheduled && scheduledAt && scheduledAt <= new Date()) {
            throw new common_1.BadRequestException("Scheduled time must be in the future");
        }
        const postId = (0, uuid_1.v4)();
        const slides = [];
        let hashtags = createPostDto.hashtags || [];
        if (hashtags.length === 0) {
            const allCaptions = Object.values(slideTexts).filter(Boolean).join(" ");
            hashtags = this.extractHashtags(allCaptions);
        }
        try {
            let fileIndex = 0;
            const slideTasks = [];
            for (let i = 0; i < totalSlides; i++) {
                const slideType = slideTypes[i] || "image";
                if (slideType === "text") {
                    slideTasks.push({ index: i, slideType });
                }
                else {
                    if (!files || fileIndex >= files.length) {
                        throw new common_1.BadRequestException(`Missing file for slide ${i}`);
                    }
                    slideTasks.push({ index: i, slideType, file: files[fileIndex] });
                    fileIndex++;
                }
            }
            const customThumbnailUrls = {};
            if (thumbnailFiles && thumbnailFiles.length > 0) {
                for (const [slideIdx, thumbFileIdx] of Object.entries(slideThumbnailIndex)) {
                    const idx = parseInt(thumbFileIdx);
                    if (thumbnailFiles[idx]) {
                        const thumbUpload = await this.storageService.uploadFile(thumbnailFiles[idx], "thumbnails");
                        customThumbnailUrls[parseInt(slideIdx)] = thumbUpload.secure_url;
                    }
                }
            }
            const uploadCache = new Map();
            const fileBuffers = new Map();
            for (const task of slideTasks) {
                if (task.slideType === "text" || !task.file)
                    continue;
                const file = task.file;
                const cacheKey = `${file.originalname}:${file.size}`;
                if (uploadCache.has(cacheKey))
                    continue;
                const ext = path.extname(file.originalname).toLowerCase();
                let type;
                if (file.mimetype.startsWith("image/") || [".jpg", ".jpeg", ".png", ".gif", ".webp", ".heic", ".heif"].includes(ext)) {
                    type = "image";
                }
                else if (file.mimetype.startsWith("video/") || [".mp4", ".mov", ".m4v", ".webm", ".avi", ".mkv", ".3gp"].includes(ext)) {
                    type = "video";
                }
                else if (file.mimetype.startsWith("audio/") || [".mp3", ".wav", ".aac", ".ogg", ".flac", ".m4a"].includes(ext)) {
                    type = "audio";
                }
                else {
                    throw new common_1.BadRequestException(`Unsupported file type: ${file.mimetype || ext}`);
                }
                const uploadResult = type === "video"
                    ? await this.storageService.uploadVideo(file)
                    : type === "image"
                        ? await this.storageService.uploadImage(file)
                        : await this.storageService.uploadFile(file);
                let thumbnailUrl = uploadResult.secure_url;
                if (type === "video") {
                    const thumbUrl = await this.storageService.generateVideoThumbnail(file);
                    if (thumbUrl)
                        thumbnailUrl = thumbUrl;
                }
                uploadCache.set(cacheKey, { ...uploadResult, thumbnailUrl, type });
                fileBuffers.set(uploadResult.secure_url, file);
            }
            const slideResults = await Promise.all(slideTasks.map(async (task) => {
                const { index: i, slideType, file } = task;
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
                    });
                }
                const cacheKey = `${file.originalname}:${file.size}`;
                const cached = uploadCache.get(cacheKey);
                const type = cached.type;
                const trimStart = videoTrimStart[i] ? parseFloat(videoTrimStart[i]) : null;
                const trimEnd = videoTrimEnd[i] ? parseFloat(videoTrimEnd[i]) : null;
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
                });
            }));
            for (const content of slideResults) {
                const savedContent = await this.contentRepository.save(content);
                slides.push(savedContent);
            }
            user.postCount += 1;
            await this.userRepository.save(user);
            await this.triggerReferralValidation(userId);
            await this.redisService.invalidateFeedCache();
            this.analyzePostContent(slides, fileBuffers).catch(err => {
                this.logger.warn(`Media analysis failed for post ${postId}: ${err.message}`);
            });
            return {
                postId,
                slides,
                totalSlides: slides.length,
            };
        }
        catch (error) {
            console.error("Error creating post:", error);
            for (const slide of slides) {
                try {
                    if (slide.mediaUrl) {
                        try {
                            const url = new URL(slide.mediaUrl);
                            const key = url.pathname.replace(/^\//, "");
                            if (key)
                                await this.storageService.deleteFile(key);
                        }
                        catch { }
                    }
                    await this.contentRepository.remove(slide);
                }
                catch (cleanupError) {
                    console.error("Cleanup error for slide:", cleanupError);
                }
            }
            throw error;
        }
    }
    async publishScheduledPosts() {
        const now = new Date();
        const scheduledSlides = await this.contentRepository.find({
            where: {
                isScheduled: true,
                isActive: false,
                scheduledAt: (0, typeorm_1.LessThanOrEqual)(now),
            },
        });
        if (scheduledSlides.length === 0)
            return;
        const postIds = [...new Set(scheduledSlides.map(s => s.postId))];
        for (const postId of postIds) {
            await this.contentRepository.update({ postId }, { isActive: true, isScheduled: false });
            const firstSlide = scheduledSlides.find(s => s.postId === postId);
            if (firstSlide && this.notificationsService) {
                try {
                    await this.notificationsService.create({
                        userId: firstSlide.userId,
                        actorId: firstSlide.userId,
                        type: "system",
                        message: "Your scheduled post is now live!",
                        contentId: firstSlide.id,
                    });
                }
                catch (e) {
                    this.logger.warn(`Failed to send scheduled post notification: ${e.message}`);
                }
            }
            this.logger.log(`Published scheduled post ${postId}`);
        }
        await this.redisService.invalidateFeedCache();
    }
    async findAll(page = 1, limit = 20, category, userId) {
        const queryBuilder = this.contentRepository
            .createQueryBuilder("content")
            .leftJoinAndSelect("content.user", "user")
            .where("content.isActive = :isActive", { isActive: true })
            .andWhere("user.isActive = :userActive", { userActive: true });
        if (category) {
            queryBuilder.andWhere("(content.hashtags LIKE :categoryFilter OR content.caption ILIKE :captionCategory)", { categoryFilter: `%${category}%`, captionCategory: `%#${category}%` });
        }
        if (userId) {
            queryBuilder.andWhere("content.userId = :userId", { userId });
        }
        const [content, total] = await queryBuilder
            .orderBy("content.createdAt", "DESC")
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return {
            data: content.map(c => ({ ...c, user: this.safeUser(c.user) })),
            total,
            page,
            limit,
            hasNext: page * limit < total,
            hasPrev: page > 1,
        };
    }
    async searchPosts(query, currentUserId, pageNum, limitNum) {
        const queryBuilder = this.contentRepository
            .createQueryBuilder("content")
            .leftJoinAndSelect("content.user", "user")
            .where("content.isActive = :isActive", { isActive: true })
            .andWhere("user.isActive = :userActive", { userActive: true })
            .andWhere("content.sortOrder = :sortOrder", { sortOrder: 0 })
            .andWhere("(content.caption ILIKE :query OR content.hashtags LIKE :hashtagQuery OR user.username ILIKE :query OR user.displayName ILIKE :query)", { query: `%${query}%`, hashtagQuery: `%${query.replace(/^#/, "")}%` })
            .orderBy("content.createdAt", "DESC")
            .skip((pageNum - 1) * limitNum)
            .take(limitNum);
        const [firstSlides, total] = await queryBuilder.getManyAndCount();
        const postIds = firstSlides.map((s) => s.postId).filter(Boolean);
        const allSlides = postIds.length > 0
            ? await this.contentRepository.find({
                where: { postId: (0, typeorm_1.In)(postIds) },
                order: { sortOrder: "ASC" },
                relations: ["user"],
            })
            : [];
        const slidesByPostId = new Map();
        for (const slide of allSlides) {
            if (!slidesByPostId.has(slide.postId))
                slidesByPostId.set(slide.postId, []);
            slidesByPostId.get(slide.postId).push(slide);
        }
        const firstSlideIds = firstSlides.map((s) => s.id);
        let likedIds = new Set();
        let bookmarkedIds = new Set();
        if (currentUserId && firstSlideIds.length > 0) {
            const userInteractions = await this.interactionRepository.find({
                where: { contentId: (0, typeorm_1.In)(firstSlideIds), userId: currentUserId },
            });
            for (const interaction of userInteractions) {
                if (interaction.type === "like")
                    likedIds.add(interaction.contentId);
                if (interaction.type === "bookmark")
                    bookmarkedIds.add(interaction.contentId);
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
        }));
        return { data: posts, total };
    }
    async searchHashtags(query, limitNum) {
        const cleanQuery = query.replace(/^#/, "").toLowerCase();
        const results = await this.contentRepository
            .createQueryBuilder("content")
            .select("content.hashtags")
            .where("content.isActive = :isActive", { isActive: true })
            .andWhere("content.sortOrder = :sortOrder", { sortOrder: 0 })
            .andWhere("content.hashtags LIKE :query", { query: `%${cleanQuery}%` })
            .getMany();
        const tagCounts = {};
        for (const row of results) {
            const tags = Array.isArray(row.hashtags)
                ? row.hashtags
                : typeof row.hashtags === "string"
                    ? row.hashtags.split(",").map((t) => t.trim()).filter(Boolean)
                    : [];
            for (const tag of tags) {
                const lower = tag.toLowerCase();
                if (lower.includes(cleanQuery)) {
                    tagCounts[lower] = (tagCounts[lower] || 0) + 1;
                }
            }
        }
        const captionResults = await this.contentRepository
            .createQueryBuilder("content")
            .select("content.caption")
            .where("content.isActive = :isActive", { isActive: true })
            .andWhere("content.sortOrder = :sortOrder", { sortOrder: 0 })
            .andWhere("content.caption ILIKE :query", { query: `%#${cleanQuery}%` })
            .getMany();
        for (const row of captionResults) {
            const matches = (row.caption || "").match(/#(\w+)/g);
            if (matches) {
                for (const match of matches) {
                    const tag = match.slice(1).toLowerCase();
                    if (tag.includes(cleanQuery)) {
                        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                    }
                }
            }
        }
        const sorted = Object.entries(tagCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limitNum)
            .map(([tag, postCount]) => ({ tag: `#${tag}`, postCount }));
        return { data: sorted, total: sorted.length };
    }
    async searchUsers(query, pageNum, limitNum, currentUserId) {
        const [users, total] = await this.userRepository
            .createQueryBuilder("user")
            .where("user.isActive = :isActive", { isActive: true })
            .andWhere("(user.username ILIKE :query OR user.displayName ILIKE :query OR user.bio ILIKE :query)", { query: `%${query}%` })
            .orderBy("user.followersCount", "DESC")
            .addOrderBy("user.displayName", "ASC")
            .skip((pageNum - 1) * limitNum)
            .take(limitNum)
            .getManyAndCount();
        console.log(`[searchUsers] currentUserId: ${currentUserId}, users found: ${users.length}`);
        if (currentUserId && users.length > 0) {
            const follows = await this.followRepository.find({
                where: { followerId: currentUserId },
                select: ["followingId"],
            });
            const followingIds = new Set(follows.map((f) => f.followingId));
            console.log(`[searchUsers] User ${currentUserId} is following: ${Array.from(followingIds).join(", ")}`);
            const usersWithFollowStatus = users.map((user) => ({
                ...user,
                isFollowing: followingIds.has(user.id),
            }));
            console.log(`[searchUsers] First user ${users[0]?.username} isFollowing:`, usersWithFollowStatus[0]?.isFollowing);
            return { data: usersWithFollowStatus, total };
        }
        console.log("[searchUsers] No currentUserId - returning all users as not following");
        const usersWithFollowStatus = users.map((user) => ({
            ...user,
            isFollowing: false,
        }));
        return { data: usersWithFollowStatus, total };
    }
    async search(query, currentUserId, type, page = 1, limit = 20) {
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 20;
        if (!type || type === "all") {
            const [postsResult, usersResult, hashtagsResult] = await Promise.all([
                this.searchPosts(query, currentUserId, 1, 20),
                this.searchUsers(query, 1, 10, currentUserId),
                this.searchHashtags(query, 10),
            ]);
            return {
                posts: { data: postsResult.data, total: postsResult.total },
                users: { data: usersResult.data, total: usersResult.total },
                hashtags: { data: hashtagsResult.data, total: hashtagsResult.total },
                page: pageNum,
                limit: limitNum,
                type: "all",
            };
        }
        if (type === "posts") {
            const result = await this.searchPosts(query, currentUserId, pageNum, limitNum);
            return { data: result.data, total: result.total, page: pageNum, limit: limitNum, type: "posts" };
        }
        if (type === "hashtags") {
            const result = await this.searchHashtags(query, limitNum);
            return { data: result.data, total: result.total, page: pageNum, limit: limitNum, type: "hashtags" };
        }
        const result = await this.searchUsers(query, pageNum, limitNum, currentUserId);
        return { data: result.data, total: result.total, page: pageNum, limit: limitNum, type: "users" };
    }
    async getBookmarkedPosts(userId, page = 1, limit = 20) {
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 20;
        const [bookmarks, total] = await this.interactionRepository.findAndCount({
            where: { userId, type: "bookmark" },
            order: { createdAt: "DESC" },
            skip: (pageNum - 1) * limitNum,
            take: limitNum,
        });
        if (bookmarks.length === 0) {
            return { data: [], total: 0, page: pageNum, limit: limitNum };
        }
        const contentIds = bookmarks.map((b) => b.contentId);
        const firstSlides = await this.contentRepository.find({
            where: { id: (0, typeorm_1.In)(contentIds), isActive: true },
            relations: ["user"],
        });
        const postIds = firstSlides.map((s) => s.postId).filter(Boolean);
        const allSlides = postIds.length > 0
            ? await this.contentRepository.find({
                where: { postId: (0, typeorm_1.In)(postIds) },
                order: { sortOrder: "ASC" },
                relations: ["user"],
            })
            : [];
        const slidesByPostId = new Map();
        for (const slide of allSlides) {
            if (!slidesByPostId.has(slide.postId))
                slidesByPostId.set(slide.postId, []);
            slidesByPostId.get(slide.postId).push(slide);
        }
        let likedIds = new Set();
        if (contentIds.length > 0) {
            const userLikes = await this.interactionRepository.find({
                where: { contentId: (0, typeorm_1.In)(contentIds), userId, type: "like" },
            });
            likedIds = new Set(userLikes.map((l) => l.contentId));
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
        }));
        return { data: posts, total, page: pageNum, limit: limitNum };
    }
    async findAllPosts(page = 1, limit = 20, category, userId, currentUserId, followingOnly = false, sort = "recent", trendingDays) {
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 20;
        const NEW_CUTOFF_DAYS = 7;
        const NEW_RATIO = 0.7;
        const useRandomizedFeed = sort === "ranked" && !followingOnly && !userId && !category && !trendingDays;
        let usePersonalizedFeed = false;
        if (useRandomizedFeed && currentUserId && this.personalizedFeedService && this.userPreferenceRepository) {
            if (currentUserId && typeof currentUserId === "string" && currentUserId.length > 0) {
                try {
                    const preferences = await this.userPreferenceRepository.findByUserId(currentUserId);
                    usePersonalizedFeed = preferences.length > 0;
                }
                catch (error) {
                    this.logger.warn(`Failed to check user preferences for personalized feed: ${error.message}`);
                }
            }
            else {
                this.logger.warn(`Invalid currentUserId for personalized feed: "${currentUserId}"`);
            }
        }
        const feedType = followingOnly ? "following" : (usePersonalizedFeed ? "personalized" : sort);
        const cacheKey = `feed:${feedType}:${currentUserId || "anon"}:${pageNum}:${limitNum}:${category || ""}:${userId || ""}`;
        const cached = await this.redisService.getCachedFeed(cacheKey);
        if (cached)
            return cached;
        let firstSlides;
        let total;
        if (usePersonalizedFeed) {
            try {
                const blocks = await this.userRepository
                    .createQueryBuilder("user")
                    .leftJoin("blocks", "block", "block.blockerId = :userId OR block.blockedId = :userId", { userId: currentUserId })
                    .select("CASE WHEN block.blockerId = :userId THEN block.blockedId ELSE block.blockerId END", "blockedUserId")
                    .where("block.id IS NOT NULL")
                    .getRawMany();
                const blockedUserIds = blocks.map(b => String(b.blockedUserId)).filter(id => id && id !== "null");
                firstSlides = await this.personalizedFeedService.getPersonalizedFeed(currentUserId, blockedUserIds, { page: pageNum, limit: limitNum });
                if (currentUserId && pageNum === 1) {
                    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
                    const recentUserPosts = await this.contentRepository.find({
                        where: {
                            userId: currentUserId,
                            sortOrder: 0,
                            isActive: true,
                            createdAt: (0, typeorm_1.MoreThan)(fiveMinutesAgo),
                        },
                        relations: ["user"],
                        order: { createdAt: "DESC" },
                        take: 3,
                    });
                    if (recentUserPosts.length > 0) {
                        const recentPostIds = new Set(recentUserPosts.map(p => p.id));
                        firstSlides = firstSlides.filter(slide => !recentPostIds.has(slide.id));
                        firstSlides = [...recentUserPosts, ...firstSlides];
                        firstSlides = firstSlides.slice(0, limitNum);
                    }
                }
                if (firstSlides.length < 10) {
                    this.logger.log(`Personalized feed has only ${firstSlides.length} posts on page ${pageNum}, falling back to randomized`);
                    const fallbackResult = await this.fetchRandomizedFeed(pageNum, limitNum, NEW_CUTOFF_DAYS, NEW_RATIO);
                    if (pageNum === 1) {
                        const recentPostIds = new Set(firstSlides.map(p => p.id));
                        const randomizedPosts = fallbackResult.slides.filter(slide => !recentPostIds.has(slide.id));
                        firstSlides = [...firstSlides, ...randomizedPosts].slice(0, limitNum);
                    }
                    else {
                        firstSlides = fallbackResult.slides;
                    }
                    total = fallbackResult.total;
                }
                else {
                    const countResult = await this.contentRepository.count({
                        where: {
                            isActive: true,
                            categories: (0, typeorm_1.Not)((0, typeorm_1.IsNull)()),
                            createdAt: (0, typeorm_1.MoreThan)(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
                        }
                    });
                    total = countResult;
                }
            }
            catch (error) {
                this.logger.error(`Personalized feed failed, falling back to randomized: ${error.message}`);
                const result = await this.fetchRandomizedFeed(pageNum, limitNum, NEW_CUTOFF_DAYS, NEW_RATIO);
                firstSlides = result.slides;
                total = result.total;
            }
        }
        else if (useRandomizedFeed) {
            const result = await this.fetchRandomizedFeed(pageNum, limitNum, NEW_CUTOFF_DAYS, NEW_RATIO);
            firstSlides = result.slides;
            total = result.total;
            if (currentUserId && pageNum === 1) {
                const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
                const recentUserPosts = await this.contentRepository.find({
                    where: {
                        userId: currentUserId,
                        sortOrder: 0,
                        isActive: true,
                        createdAt: (0, typeorm_1.MoreThan)(fiveMinutesAgo),
                    },
                    relations: ["user"],
                    order: { createdAt: "DESC" },
                    take: 3,
                });
                if (recentUserPosts.length > 0) {
                    const recentPostIds = new Set(recentUserPosts.map(p => p.id));
                    firstSlides = firstSlides.filter(slide => !recentPostIds.has(slide.id));
                    firstSlides = [...recentUserPosts, ...firstSlides];
                    firstSlides = firstSlides.slice(0, limitNum);
                }
            }
        }
        else {
            const queryBuilder = this.contentRepository
                .createQueryBuilder("content")
                .leftJoinAndSelect("content.user", "user")
                .where("content.isActive = :isActive", { isActive: true })
                .andWhere("user.isActive = :userActive", { userActive: true })
                .andWhere("content.sortOrder = :sortOrder", { sortOrder: 0 });
            if (category) {
                queryBuilder.andWhere("(content.hashtags LIKE :categoryFilter OR content.caption ILIKE :captionCategory)", { categoryFilter: `%${category}%`, captionCategory: `%#${category}%` });
            }
            if (userId) {
                queryBuilder.andWhere("content.userId = :userId", { userId });
            }
            if (followingOnly && currentUserId) {
                const follows = await this.followRepository.find({
                    where: { followerId: currentUserId },
                    select: ["followingId"],
                });
                const followingIds = follows.map(f => f.followingId);
                if (followingIds.length === 0) {
                    return {
                        data: [],
                        total: 0,
                        page: pageNum,
                        limit: limitNum,
                        hasNext: false,
                        hasPrev: pageNum > 1,
                    };
                }
                queryBuilder.andWhere("content.userId IN (:...followingIds)", { followingIds });
            }
            if (trendingDays) {
                const cutoff = new Date();
                cutoff.setDate(cutoff.getDate() - trendingDays);
                queryBuilder.andWhere("content.createdAt >= :trendingCutoff", { trendingCutoff: cutoff });
                queryBuilder.andWhere("content.likeCount >= :minTrendLikes", { minTrendLikes: 3 });
            }
            if (sort === "ranked") {
                queryBuilder
                    .orderBy("content.engagementScore", "DESC")
                    .addOrderBy("content.createdAt", "DESC");
            }
            else {
                queryBuilder.orderBy("content.createdAt", "DESC");
            }
            const result = await queryBuilder
                .skip((pageNum - 1) * limitNum)
                .take(limitNum)
                .getManyAndCount();
            firstSlides = result[0];
            total = result[1];
        }
        const postIds = firstSlides.map(s => s.postId).filter(Boolean);
        const allSlides = postIds.length > 0
            ? await this.contentRepository.find({
                where: { postId: (0, typeorm_1.In)(postIds) },
                order: { sortOrder: "ASC" },
                relations: ["user"],
            })
            : [];
        const slidesByPostId = new Map();
        for (const slide of allSlides) {
            if (!slidesByPostId.has(slide.postId)) {
                slidesByPostId.set(slide.postId, []);
            }
            slidesByPostId.get(slide.postId).push(slide);
        }
        const firstSlideIds = firstSlides.map(s => s.id);
        let likedIds = new Set();
        let bookmarkedIds = new Set();
        if (currentUserId && firstSlideIds.length > 0) {
            const userInteractions = await this.interactionRepository.find({
                where: { contentId: (0, typeorm_1.In)(firstSlideIds), userId: currentUserId },
            });
            for (const interaction of userInteractions) {
                if (interaction.type === "like")
                    likedIds.add(interaction.contentId);
                if (interaction.type === "bookmark")
                    bookmarkedIds.add(interaction.contentId);
            }
        }
        const posts = firstSlides.map((firstSlide) => {
            const postSlides = slidesByPostId.get(firstSlide.postId) || [firstSlide];
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
            };
        });
        const feedResult = {
            data: posts,
            total,
            page: pageNum,
            limit: limitNum,
            hasNext: pageNum * limitNum < total,
            hasPrev: pageNum > 1,
        };
        const ttl = sort === "ranked" ? 120 : 60;
        await this.redisService.setCachedFeed(cacheKey, feedResult, ttl);
        return feedResult;
    }
    async fetchRandomizedFeed(pageNum, limitNum, cutoffDays, newRatio) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - cutoffDays);
        const newCount = Math.ceil(limitNum * newRatio);
        const oldCount = limitNum - newCount;
        const newOffset = (pageNum - 1) * newCount;
        const oldOffset = (pageNum - 1) * oldCount;
        const baseConditions = {
            isActive: true,
            userActive: true,
            sortOrder: 0,
        };
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
            .take(newCount);
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
            .take(oldCount);
        const totalQuery = this.contentRepository
            .createQueryBuilder("content")
            .leftJoin("content.user", "user")
            .where("content.isActive = :isActive", baseConditions)
            .andWhere("user.isActive = :userActive", baseConditions)
            .andWhere("content.sortOrder = :sortOrder", baseConditions);
        const [newPosts, oldPosts, total] = await Promise.all([
            newQuery.getMany(),
            oldQuery.getMany(),
            totalQuery.getCount(),
        ]);
        let combined;
        if (newPosts.length < newCount && oldPosts.length >= oldCount) {
            const shortfall = newCount - newPosts.length;
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
                .getMany();
            combined = [...newPosts, ...oldPosts, ...extraOld];
        }
        else if (oldPosts.length < oldCount && newPosts.length >= newCount) {
            const shortfall = oldCount - oldPosts.length;
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
                .getMany();
            combined = [...newPosts, ...oldPosts, ...extraNew];
        }
        else {
            combined = [...newPosts, ...oldPosts];
        }
        for (let i = combined.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [combined[i], combined[j]] = [combined[j], combined[i]];
        }
        return { slides: combined, total };
    }
    sampleArray(arr, n) {
        if (arr.length <= n)
            return [...arr];
        const copy = [...arr];
        const result = [];
        for (let i = 0; i < n && copy.length > 0; i++) {
            const j = Math.floor(Math.random() * copy.length);
            result.push(copy.splice(j, 1)[0]);
        }
        return result;
    }
    async hydratePostsByIds(postIds, currentUserId) {
        if (postIds.length === 0)
            return [];
        const allSlides = await this.contentRepository.find({
            where: { postId: (0, typeorm_1.In)(postIds) },
            order: { sortOrder: "ASC" },
            relations: ["user"],
        });
        const slidesByPostId = new Map();
        for (const slide of allSlides) {
            if (!slidesByPostId.has(slide.postId)) {
                slidesByPostId.set(slide.postId, []);
            }
            slidesByPostId.get(slide.postId).push(slide);
        }
        const firstSlides = [];
        for (const pid of postIds) {
            const group = slidesByPostId.get(pid);
            if (group && group.length > 0)
                firstSlides.push(group[0]);
        }
        const firstSlideIds = firstSlides.map(s => s.id);
        const likedIds = new Set();
        const bookmarkedIds = new Set();
        if (currentUserId && firstSlideIds.length > 0) {
            const userInteractions = await this.interactionRepository.find({
                where: { contentId: (0, typeorm_1.In)(firstSlideIds), userId: currentUserId },
            });
            for (const interaction of userInteractions) {
                if (interaction.type === "like")
                    likedIds.add(interaction.contentId);
                if (interaction.type === "bookmark")
                    bookmarkedIds.add(interaction.contentId);
            }
        }
        return firstSlides.map((firstSlide) => {
            const postSlides = slidesByPostId.get(firstSlide.postId) || [firstSlide];
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
            };
        });
    }
    async findOne(id) {
        let content = await this.contentRepository.findOne({
            where: { id },
            relations: ["user"],
        });
        if (!content) {
            const slides = await this.contentRepository.find({
                where: { postId: id },
                relations: ["user"],
                order: { sortOrder: "ASC" },
            });
            if (!slides || slides.length === 0) {
                throw new common_1.NotFoundException("Content not found");
            }
            const firstSlide = slides[0];
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
            };
        }
        const allSlides = await this.contentRepository.find({
            where: { postId: content.postId },
            relations: ["user"],
            order: { sortOrder: "ASC" },
        });
        const firstSlide = allSlides[0];
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
        };
    }
    async findContentEntity(id) {
        const content = await this.contentRepository.findOne({
            where: { id },
            relations: ["user"],
        });
        if (!content) {
            throw new common_1.NotFoundException("Content not found");
        }
        return content;
    }
    async update(id, userId, updateContentDto) {
        const content = await this.findContentEntity(id);
        if (content.userId !== userId) {
            throw new common_1.ForbiddenException("You can only update your own content");
        }
        if (updateContentDto.caption !== undefined)
            content.caption = updateContentDto.caption;
        if (updateContentDto.backgroundColor !== undefined)
            content.backgroundColor = updateContentDto.backgroundColor;
        if (updateContentDto.fontStyle !== undefined)
            content.fontStyle = updateContentDto.fontStyle;
        if (updateContentDto.backgroundMusicUrl !== undefined)
            content.backgroundMusicUrl = updateContentDto.backgroundMusicUrl;
        if (updateContentDto.hashtags !== undefined)
            content.hashtags = updateContentDto.hashtags;
        if (updateContentDto.isPublic !== undefined)
            content.isActive = updateContentDto.isPublic;
        return this.contentRepository.save(content);
    }
    async updatePost(postId, userId, slideUpdates, musicFiles, mediaFiles) {
        const existingSlides = await this.contentRepository.find({
            where: { postId },
            order: { sortOrder: "ASC" },
        });
        if (existingSlides.length === 0) {
            throw new common_1.NotFoundException("Post not found");
        }
        if (existingSlides[0].userId !== userId) {
            throw new common_1.ForbiddenException("You can only update your own content");
        }
        const oneHourMs = 60 * 60 * 1000;
        if (Date.now() - existingSlides[0].createdAt.getTime() > oneHourMs) {
            throw new common_1.BadRequestException("Posts can only be edited within 1 hour of creation");
        }
        const slideTexts = typeof slideUpdates.slideTexts === 'string'
            ? JSON.parse(slideUpdates.slideTexts)
            : (slideUpdates.slideTexts || {});
        const slideBackgrounds = typeof slideUpdates.slideBackgrounds === 'string'
            ? JSON.parse(slideUpdates.slideBackgrounds)
            : (slideUpdates.slideBackgrounds || {});
        const slideFontStyles = typeof slideUpdates.slideFontStyles === 'string'
            ? JSON.parse(slideUpdates.slideFontStyles)
            : (slideUpdates.slideFontStyles || {});
        const slideMusicIndex = typeof slideUpdates.slideMusicIndex === 'string'
            ? JSON.parse(slideUpdates.slideMusicIndex)
            : (slideUpdates.slideMusicIndex || {});
        const slideMusicRemoved = typeof slideUpdates.slideMusicRemoved === 'string'
            ? JSON.parse(slideUpdates.slideMusicRemoved)
            : (slideUpdates.slideMusicRemoved || {});
        const slideMediaIndex = typeof slideUpdates.slideMediaIndex === 'string'
            ? JSON.parse(slideUpdates.slideMediaIndex)
            : (slideUpdates.slideMediaIndex || {});
        const slideCaptions = typeof slideUpdates.slideCaptions === 'string'
            ? JSON.parse(slideUpdates.slideCaptions)
            : (slideUpdates.slideCaptions || {});
        const slideMusicUrls = {};
        if (musicFiles && musicFiles.length > 0) {
            for (const [slideIdx, musicFileIdx] of Object.entries(slideMusicIndex)) {
                const idx = parseInt(musicFileIdx);
                if (musicFiles[idx]) {
                    const musicUpload = await this.storageService.uploadFile(musicFiles[idx]);
                    slideMusicUrls[parseInt(slideIdx)] = musicUpload.secure_url;
                }
            }
        }
        const slideMediaUrls = {};
        if (mediaFiles && mediaFiles.length > 0) {
            for (const [slideIdx, mediaFileIdx] of Object.entries(slideMediaIndex)) {
                const idx = parseInt(mediaFileIdx);
                if (mediaFiles[idx]) {
                    const file = mediaFiles[idx];
                    const isVideo = file.mimetype.startsWith("video/");
                    const isImage = file.mimetype.startsWith("image/");
                    const upload = isVideo
                        ? await this.storageService.uploadVideo(file)
                        : isImage
                            ? await this.storageService.uploadImage(file)
                            : await this.storageService.uploadFile(file);
                    slideMediaUrls[parseInt(slideIdx)] = {
                        url: upload.secure_url,
                        type: isVideo ? "video" : "image",
                    };
                }
            }
        }
        const updatedSlides = [];
        for (let i = 0; i < existingSlides.length; i++) {
            const slide = existingSlides[i];
            if (slide.contentType === "text") {
                if (slideTexts[i] !== undefined) {
                    slide.textContent = slideTexts[i];
                }
                if (slideCaptions[i] !== undefined) {
                    slide.caption = slideCaptions[i];
                }
            }
            else {
                if (slideTexts[i] !== undefined) {
                    slide.caption = slideTexts[i];
                }
            }
            if (slideBackgrounds[i] !== undefined) {
                slide.backgroundColor = slideBackgrounds[i];
            }
            if (slideFontStyles[i] !== undefined) {
                slide.fontStyle = slideFontStyles[i];
            }
            if (slideMusicUrls[i]) {
                slide.backgroundMusicUrl = slideMusicUrls[i];
            }
            else if (slideMusicRemoved[i]) {
                slide.backgroundMusicUrl = null;
            }
            if (slideMediaUrls[i]) {
                slide.mediaUrl = slideMediaUrls[i].url;
                slide.thumbnailUrl = slideMediaUrls[i].url;
                slide.contentType = slideMediaUrls[i].type;
            }
            if (i === 0 && slideUpdates.hashtags) {
                const hashtags = Array.isArray(slideUpdates.hashtags)
                    ? slideUpdates.hashtags
                    : typeof slideUpdates.hashtags === "string"
                        ? JSON.parse(slideUpdates.hashtags)
                        : [];
                slide.hashtags = hashtags;
            }
            const saved = await this.contentRepository.save(slide);
            updatedSlides.push(saved);
        }
        await this.redisService.invalidateFeedCache();
        return { postId, slides: updatedSlides };
    }
    async remove(id, userId) {
        let contents = await this.contentRepository.find({
            where: { postId: id },
            relations: ["user"],
        });
        if (contents.length === 0) {
            const single = await this.contentRepository.findOne({
                where: { id },
                relations: ["user"],
            });
            if (!single) {
                throw new common_1.NotFoundException("Content not found");
            }
            contents = [single];
        }
        if (contents[0].userId !== userId) {
            throw new common_1.ForbiddenException("You can only delete your own content");
        }
        const contentIds = contents.map(c => c.id);
        await this.engagementSignalRepository
            .createQueryBuilder()
            .delete()
            .where("contentId IN (:...ids)", { ids: contentIds })
            .execute();
        await this.interactionRepository
            .createQueryBuilder()
            .delete()
            .where("contentId IN (:...ids)", { ids: contentIds })
            .execute();
        const comments = await this.commentRepository.find({
            where: contentIds.map(id => ({ contentId: id })),
            select: ["id"],
        });
        if (comments.length > 0) {
            const commentIds = comments.map(c => c.id);
            await this.commentLikeRepository
                .createQueryBuilder()
                .delete()
                .where("commentId IN (:...ids)", { ids: commentIds })
                .execute();
        }
        await this.commentRepository
            .createQueryBuilder()
            .delete()
            .where("contentId IN (:...ids)", { ids: contentIds })
            .execute();
        await this.contentRepository.remove(contents);
        await this.redisService.invalidateFeedCache();
    }
    async likeContent(contentId, userId) {
        const content = await this.findContentEntity(contentId);
        const existingLike = await this.interactionRepository.findOne({
            where: { contentId, userId, type: "like" },
        });
        if (existingLike) {
            await this.interactionRepository.remove(existingLike);
            content.likeCount = Math.max(0, content.likeCount - 1);
            await this.contentRepository.save(content);
            return { liked: false, likesCount: content.likeCount };
        }
        else {
            const interaction = this.interactionRepository.create({
                contentId,
                userId,
                type: "like",
            });
            await this.interactionRepository.save(interaction);
            content.likeCount += 1;
            await this.contentRepository.save(content);
            await this.notificationsService.createLikeNotification(contentId, content.userId, userId);
            if (this.userPreferenceLearningService) {
                this.userPreferenceLearningService
                    .updatePreferencesFromEngagement(userId, contentId, { type: "like" })
                    .catch(error => this.logger.warn(`Failed to update preferences after like: ${error.message}`));
            }
            return { liked: true, likesCount: content.likeCount };
        }
    }
    async viewContent(contentId, userId) {
        const content = await this.findContentEntity(contentId);
        if (userId) {
            const existingView = await this.interactionRepository.findOne({
                where: { contentId, userId, type: "view" },
            });
            if (!existingView) {
                const interaction = this.interactionRepository.create({
                    contentId,
                    userId,
                    type: "view",
                });
                await this.interactionRepository.save(interaction);
                content.viewCount += 1;
                await this.contentRepository.save(content);
            }
        }
        else {
            content.viewCount += 1;
            await this.contentRepository.save(content);
        }
    }
    async trackBatchViews(postIds, userId) {
        let tracked = 0;
        const views = {};
        const VIEW_COOLDOWN_MS = 30 * 60 * 1000;
        const firstSlides = await this.contentRepository.find({
            where: postIds.map(postId => ({ postId, sortOrder: 0 })),
        });
        for (const slide of firstSlides) {
            const lastView = await this.interactionRepository.findOne({
                where: { contentId: slide.id, userId, type: "view" },
                order: { createdAt: "DESC" },
            });
            const now = new Date();
            const canCount = !lastView || (now.getTime() - new Date(lastView.createdAt).getTime() >= VIEW_COOLDOWN_MS);
            if (canCount) {
                const interaction = this.interactionRepository.create({
                    contentId: slide.id,
                    userId,
                    type: "view",
                });
                await this.interactionRepository.save(interaction);
                slide.viewCount += 1;
                await this.contentRepository.save(slide);
                tracked++;
            }
            views[slide.postId] = slide.viewCount;
        }
        if (tracked > 0) {
            await this.redisService.invalidateFeedCache(userId);
        }
        return { tracked, views };
    }
    async addComment(contentId, userId, createCommentDto) {
        const content = await this.findContentEntity(contentId);
        const comment = this.commentRepository.create({
            contentId,
            userId,
            text: createCommentDto.text,
            parentId: createCommentDto.parentId,
        });
        const savedComment = await this.commentRepository.save(comment);
        content.commentCount += 1;
        await this.contentRepository.save(content);
        await this.saveMentions(createCommentDto.text, userId, contentId, savedComment.id);
        if (createCommentDto.parentId) {
            const parentComment = await this.commentRepository.findOne({
                where: { id: createCommentDto.parentId },
            });
            if (parentComment) {
                await this.notificationsService.createReplyNotification(parentComment.userId, userId, contentId, savedComment.id);
            }
        }
        else {
            await this.notificationsService.createCommentNotification(contentId, content.userId, userId, savedComment.id);
        }
        if (this.userPreferenceLearningService) {
            this.userPreferenceLearningService
                .updatePreferencesFromEngagement(userId, contentId, { type: "comment" })
                .catch((error) => this.logger.warn(`Failed to update preferences after comment: ${error.message}`));
        }
        const commentWithUser = await this.commentRepository.findOne({
            where: { id: savedComment.id },
            relations: ["user"],
        });
        if (commentWithUser) {
            commentWithUser.user = this.safeUser(commentWithUser.user);
        }
        return commentWithUser;
    }
    async getComments(contentId, userId, page = 1, limit = 20) {
        const [comments, total] = await this.commentRepository.findAndCount({
            where: { contentId, parentId: (0, typeorm_1.IsNull)() },
            relations: ["user", "replies", "replies.user"],
            order: { createdAt: "DESC" },
            skip: (page - 1) * limit,
            take: limit,
        });
        const allCommentIds = comments.flatMap(c => [
            c.id,
            ...(c.replies || []).map(r => r.id),
        ]);
        let likedCommentIds = new Set();
        if (userId && allCommentIds.length > 0) {
            const userLikes = await this.commentLikeRepository.find({
                where: { commentId: (0, typeorm_1.In)(allCommentIds), userId },
            });
            likedCommentIds = new Set(userLikes.map(l => l.commentId));
        }
        const enrichedComments = comments.map((comment) => ({
            ...comment,
            user: this.safeUser(comment.user),
            isLiked: likedCommentIds.has(comment.id),
            replies: (comment.replies || []).map((reply) => ({
                ...reply,
                user: this.safeUser(reply.user),
                isLiked: likedCommentIds.has(reply.id),
            })),
        }));
        return {
            data: enrichedComments,
            total,
            page,
            limit,
            hasNext: page * limit < total,
            hasPrev: page > 1,
        };
    }
    async getNewPostsCount(since) {
        const sinceDate = new Date(since);
        if (isNaN(sinceDate.getTime())) {
            return { count: 0 };
        }
        const count = await this.contentRepository.count({
            where: {
                isActive: true,
                sortOrder: 0,
                createdAt: (0, typeorm_1.MoreThan)(sinceDate),
            },
        });
        return { count };
    }
    async getFeed(userId, page = 1, limit = 20) {
        const queryBuilder = this.contentRepository
            .createQueryBuilder("content")
            .leftJoinAndSelect("content.user", "user")
            .where("content.isActive = :isActive", { isActive: true })
            .andWhere("user.isActive = :userActive", { userActive: true });
        const [contents, total] = await queryBuilder
            .orderBy("content.createdAt", "DESC")
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        const enrichedContents = await Promise.all(contents.map(async (content) => {
            const interactions = await this.getContentInteractions(content.id, userId);
            return {
                ...content,
                user: {
                    id: content.user.id,
                    name: content.user.displayName || content.user.username,
                    avatar: content.user.avatarUrl,
                    isVerified: content.user.isVerified,
                },
                interactions,
            };
        }));
        return {
            data: enrichedContents,
            total,
            page,
            limit,
            hasNext: page * limit < total,
            hasPrev: page > 1,
        };
    }
    async getContentInteractions(contentId, userId) {
        const content = await this.contentRepository.findOne({ where: { id: contentId } });
        let isLiked = false;
        let isBookmarked = false;
        if (userId) {
            const like = await this.interactionRepository.findOne({
                where: { contentId, userId, type: "like" },
            });
            const bookmark = await this.interactionRepository.findOne({
                where: { contentId, userId, type: "bookmark" },
            });
            isLiked = !!like;
            isBookmarked = !!bookmark;
        }
        return {
            likes: content.likeCount,
            comments: content.commentCount,
            shares: content.shareCount,
            views: content.viewCount,
            isLiked,
            isBookmarked,
        };
    }
    async interactWithContent(postId, userId, type) {
        const firstSlide = await this.contentRepository.findOne({
            where: { postId, sortOrder: 0 },
        });
        if (!firstSlide) {
            throw new common_1.NotFoundException("Post not found");
        }
        const existingInteraction = await this.interactionRepository.findOne({
            where: { contentId: firstSlide.id, userId, type },
        });
        if (existingInteraction) {
            await this.interactionRepository.remove(existingInteraction);
            if (type === "like") {
                firstSlide.likeCount = Math.max(0, firstSlide.likeCount - 1);
            }
            else if (type === "share") {
                firstSlide.shareCount = Math.max(0, firstSlide.shareCount - 1);
            }
            await this.contentRepository.save(firstSlide);
            return { success: true, action: "removed", type, count: type === "like" ? firstSlide.likeCount : firstSlide.shareCount };
        }
        else {
            const interaction = this.interactionRepository.create({
                contentId: firstSlide.id,
                userId,
                type,
            });
            await this.interactionRepository.save(interaction);
            if (type === "like") {
                firstSlide.likeCount += 1;
                await this.notificationsService.createLikeNotification(firstSlide.id, firstSlide.userId, userId);
            }
            else if (type === "share") {
                firstSlide.shareCount += 1;
                if (this.userPreferenceLearningService) {
                    this.userPreferenceLearningService
                        .updatePreferencesFromEngagement(userId, firstSlide.id, { type: "share" })
                        .catch((error) => this.logger.warn(`Failed to update preferences after share: ${error.message}`));
                }
            }
            else if (type === "bookmark") {
                if (this.userPreferenceLearningService) {
                    this.userPreferenceLearningService
                        .updatePreferencesFromEngagement(userId, firstSlide.id, { type: "save" })
                        .catch((error) => this.logger.warn(`Failed to update preferences after save: ${error.message}`));
                }
            }
            await this.contentRepository.save(firstSlide);
            return { success: true, action: "added", type, count: type === "like" ? firstSlide.likeCount : firstSlide.shareCount };
        }
    }
    async getPostInteractors(postId, type, page = 1, limit = 50) {
        const firstSlide = await this.contentRepository.findOne({
            where: { postId, sortOrder: 0 },
        });
        if (!firstSlide) {
            throw new common_1.NotFoundException("Post not found");
        }
        const [interactions, total] = await this.interactionRepository.findAndCount({
            where: { contentId: firstSlide.id, type },
            relations: ["user"],
            order: { createdAt: "DESC" },
            skip: (page - 1) * limit,
            take: limit,
        });
        const users = interactions.map((interaction) => ({
            id: interaction.user.id,
            username: interaction.user.username,
            displayName: interaction.user.displayName || interaction.user.username,
            avatarUrl: interaction.user.avatarUrl,
            isVerified: interaction.user.isVerified,
            interactedAt: interaction.createdAt,
        }));
        return {
            data: users,
            total,
            page,
            limit,
            hasNext: page * limit < total,
            hasPrev: page > 1,
        };
    }
    async deleteComment(commentId, userId) {
        const comment = await this.commentRepository.findOne({
            where: { id: commentId },
            relations: ["replies"],
        });
        if (!comment) {
            throw new common_1.NotFoundException("Comment not found");
        }
        const content = await this.contentRepository.findOne({ where: { id: comment.contentId } });
        if (comment.userId !== userId && content?.userId !== userId) {
            throw new common_1.ForbiddenException("You can only delete your own comments");
        }
        const replyCount = comment.replies?.length || 0;
        const totalRemoved = 1 + replyCount;
        await this.commentRepository.remove(comment);
        if (content) {
            content.commentCount = Math.max(0, content.commentCount - totalRemoved);
            await this.contentRepository.save(content);
        }
        return { success: true, deleted: true, removedCount: totalRemoved };
    }
    async likeComment(commentId, userId) {
        const comment = await this.commentRepository.findOne({
            where: { id: commentId },
        });
        if (!comment) {
            throw new common_1.NotFoundException("Comment not found");
        }
        const existingLike = await this.commentLikeRepository.findOne({
            where: { commentId, userId },
        });
        if (existingLike) {
            await this.commentLikeRepository.remove(existingLike);
            comment.likes = Math.max(0, comment.likes - 1);
            await this.commentRepository.save(comment);
            return { success: true, action: "removed", likes: comment.likes, isLiked: false };
        }
        else {
            const like = this.commentLikeRepository.create({
                commentId,
                userId,
            });
            await this.commentLikeRepository.save(like);
            comment.likes += 1;
            await this.commentRepository.save(comment);
            return { success: true, action: "added", likes: comment.likes, isLiked: true };
        }
    }
    async getCommentWithLikeStatus(comment, userId) {
        let isLiked = false;
        if (userId) {
            const like = await this.commentLikeRepository.findOne({
                where: { commentId: comment.id, userId },
            });
            isLiked = !!like;
        }
        return {
            ...comment,
            isLiked,
        };
    }
    async trackEngagementSignals(userId, signals) {
        if (!userId || userId === "undefined" || userId === "null") {
            this.logger.warn(`trackEngagementSignals called with invalid userId: "${userId}"`);
            return { tracked: 0, metrics: {} };
        }
        const enriched = signals.map((s) => ({ ...s, userId }));
        const entities = enriched.map((s) => this.engagementSignalRepository.create({
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
        }));
        try {
            await this.engagementSignalRepository.save(entities);
        }
        catch (err) {
            if (err?.code === "23503") {
                return { tracked: 0, metrics: {} };
            }
            throw err;
        }
        if (this.userPreferenceLearningService) {
            for (const signal of enriched) {
                if ((signal.contentType === "video" || signal.contentType === "audio") &&
                    signal.mediaProgress !== undefined &&
                    signal.mediaProgress !== null) {
                    if (!signal.userId || !signal.contentId) {
                        this.logger.warn(`Skipping preference update - missing IDs: userId="${signal.userId}", contentId="${signal.contentId}"`);
                        continue;
                    }
                    const watchTimePercent = signal.mediaProgress * 100;
                    this.userPreferenceLearningService
                        .updatePreferencesFromEngagement(signal.userId, signal.contentId, {
                        type: "watch",
                        metadata: { watchTimePercent },
                    })
                        .catch((error) => this.logger.warn(`Failed to update preferences after watch signal: ${error.message}`));
                }
            }
        }
        const postIds = [...new Set(enriched.map((s) => s.postId))];
        const metrics = {};
        if (postIds.length > 0) {
            try {
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
        `, [postIds]);
                for (const row of result) {
                    metrics[row.postId] = {
                        completionRate: parseFloat(row.completionRate) || 0,
                        avgWatchTime: parseFloat(row.avgWatchTime) || 0,
                        avgDwellTime: parseFloat(row.avgDwellTime) || 0,
                        engagementScore: parseFloat(row.engagementScore) || 0,
                        viralityScore: parseFloat(row.viralityScore) || 0,
                    };
                }
            }
            catch (err) {
                this.logger.warn(`Failed to aggregate signals for posts: ${err.message}`);
            }
        }
        return { tracked: entities.length, metrics };
    }
    async flushSignalsToDb() {
        if (!this.redisService.isConnected)
            return 0;
        const raw = await this.redisService.drainSignals(500);
        if (raw.length === 0)
            return 0;
        const signals = [];
        for (const item of raw) {
            try {
                signals.push(JSON.parse(item));
            }
            catch {
            }
        }
        if (signals.length === 0)
            return 0;
        const entities = signals.map((s) => this.engagementSignalRepository.create({
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
        }));
        await this.engagementSignalRepository.save(entities);
        return entities.length;
    }
    async aggregateEngagementSignals() {
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
    `);
    }
    async downloadSlideSegment(slideId, res) {
        const slide = await this.contentRepository.findOne({ where: { id: slideId } });
        if (!slide) {
            throw new common_1.NotFoundException("Slide not found");
        }
        if (!slide.mediaUrl) {
            throw new common_1.BadRequestException("Slide has no media");
        }
        if (slide.videoTrimStart == null || slide.videoTrimEnd == null) {
            res.redirect(slide.mediaUrl);
            return;
        }
        const trimStart = slide.videoTrimStart;
        const duration = slide.videoTrimEnd - slide.videoTrimStart;
        const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "dl-segment-"));
        const outputPath = path.join(tmpDir, "segment.mp4");
        try {
            await execFileAsync("ffmpeg", [
                "-ss", String(trimStart),
                "-i", slide.mediaUrl,
                "-t", String(duration),
                "-c", "copy",
                "-movflags", "+faststart",
                "-avoid_negative_ts", "make_zero",
                "-y", outputPath,
            ], { timeout: 30000 });
            const stat = await fs.stat(outputPath);
            const postId = slide.postId || slideId;
            const filename = `tagmi_${postId}_slide${slide.sortOrder}.mp4`;
            res.set({
                "Content-Type": "video/mp4",
                "Content-Length": stat.size,
                "Content-Disposition": `attachment; filename="${filename}"`,
            });
            const stream = (0, fs_1.createReadStream)(outputPath);
            stream.pipe(res);
            stream.on("end", () => {
                fs.unlink(outputPath).catch(() => { });
                fs.rmdir(tmpDir).catch(() => { });
            });
            stream.on("error", () => {
                fs.unlink(outputPath).catch(() => { });
                fs.rmdir(tmpDir).catch(() => { });
            });
        }
        catch (err) {
            await fs.unlink(outputPath).catch(() => { });
            await fs.rmdir(tmpDir).catch(() => { });
            this.logger.error(`Failed to extract segment for slide ${slideId}: ${err.message}`);
            res.redirect(slide.mediaUrl);
        }
    }
};
exports.ContentService = ContentService;
__decorate([
    (0, schedule_1.Cron)("* * * * *"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContentService.prototype, "publishScheduledPosts", null);
exports.ContentService = ContentService = ContentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(10, (0, common_1.Inject)((0, common_1.forwardRef)(() => notifications_service_1.NotificationsService))),
    __param(11, (0, common_1.Optional)()),
    __param(11, (0, common_1.Inject)((0, common_1.forwardRef)(() => validation_pipeline_service_1.ValidationPipelineService))),
    __param(12, (0, common_1.Optional)()),
    __param(13, (0, common_1.Optional)()),
    __param(14, (0, common_1.Optional)()),
    __param(15, (0, common_1.Optional)()),
    __param(16, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [content_repository_1.ContentRepository,
        content_interaction_repository_1.ContentInteractionRepository,
        comment_repository_1.CommentRepository,
        comment_like_repository_1.CommentLikeRepository,
        mention_repository_1.MentionRepository,
        user_repository_1.UserRepository,
        follow_repository_1.FollowRepository,
        engagement_signal_repository_1.EngagementSignalRepository,
        storage_service_1.StorageService,
        redis_service_1.RedisService,
        notifications_service_1.NotificationsService,
        validation_pipeline_service_1.ValidationPipelineService,
        media_analysis_service_1.MediaAnalysisService,
        categorization_service_1.CategorizationService,
        user_preference_repository_1.UserPreferenceRepository,
        user_preference_learning_service_1.UserPreferenceLearningService,
        personalized_feed_service_1.PersonalizedFeedService])
], ContentService);
//# sourceMappingURL=content.service.js.map