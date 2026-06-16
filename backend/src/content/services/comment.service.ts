/**
 * CommentService - Handles comment creation, retrieval, and likes
 */
import { Injectable, Inject, forwardRef } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { IsNull, In } from "typeorm"
import { Comment } from "../entities/comment.entity"
import { CommentLike } from "../entities/comment-like.entity"
import { Content } from "../entities/content.entity"
import { Mention } from "../entities/mention.entity"
import { User } from "../../users/entities/user.entity"
import { NotificationsService } from "../../notifications/notifications.service"
import type { CreateCommentDto } from "../dto/create-comment.dto"
import { ErrorHandler } from "../../common/exceptions/error.handler"
import { ERROR_MESSAGES } from "../../common/constants/error-messages.constant"

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(CommentLike)
    private commentLikeRepository: Repository<CommentLike>,
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    @InjectRepository(Mention)
    private mentionRepository: Repository<Mention>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

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

  private async saveMentions(
    text: string,
    mentionedByUserId: string,
    contentId: string,
    commentId?: string,
  ): Promise<void> {
    const usernames = this.extractMentions(text)
    if (usernames.length === 0) return

    const users = await this.userRepository.find({
      where: usernames.map(username => ({ username })),
    })

    const mentions = users.map(user =>
      this.mentionRepository.create({
        mentionedUserId: user.id,
        mentionedByUserId,
        contentId,
        commentId,
      }),
    )

    if (mentions.length > 0) {
      await this.mentionRepository.save(mentions)

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

  async addComment(contentId: string, userId: string, createCommentDto: CreateCommentDto): Promise<Comment> {
    const content = await this.contentRepository.findOne({ where: { id: contentId } })

    if (!content) {
      ErrorHandler.notFound("Content")
    }

    const comment = this.commentRepository.create({
      contentId,
      userId,
      text: createCommentDto.text,
      parentId: createCommentDto.parentId,
    })

    const savedComment = await this.commentRepository.save(comment)

    content.commentCount += 1
    await this.contentRepository.save(content)

    await this.saveMentions(createCommentDto.text, userId, contentId, savedComment.id)

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
      await this.notificationsService.createCommentNotification(
        contentId,
        content.userId,
        userId,
        savedComment.id,
      )
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
      where: { contentId, parentId: IsNull() },
      relations: ["user", "replies", "replies.user"],
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    })

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

  async likeComment(commentId: string, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    })

    if (!comment) {
      ErrorHandler.notFound("Comment")
    }

    const existingLike = await this.commentLikeRepository.findOne({
      where: { commentId, userId },
    })

    if (existingLike) {
      await this.commentLikeRepository.remove(existingLike)
      comment.likes = Math.max(0, comment.likes - 1)
      await this.commentRepository.save(comment)

      return { success: true, action: "removed", likes: comment.likes, isLiked: false }
    } else {
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
}
