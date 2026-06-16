import { DataSource } from "typeorm"
import { User } from "../../users/entities/user.entity"
import { Content } from "../../content/entities/content.entity"
import { ContentInteraction } from "../../content/entities/content-interaction.entity"
import { Comment } from "../../content/entities/comment.entity"
import { CommentLike } from "../../content/entities/comment-like.entity"

const COMMENT_TEXTS = [
  "This is amazing! 🔥",
  "Love your work! Keep it up 💪",
  "So inspiring! ✨",
  "This is pure talent 👏",
  "Absolutely incredible!",
  "You never disappoint! 🙌",
  "This deserves more recognition!",
  "Stunning work as always 😍",
  "Can't wait to see more!",
  "You're so talented! 💯",
  "This is exactly what I needed to see today!",
  "Your creativity knows no bounds 🎨",
  "How do you do it? Share your secrets! 🤔",
  "This is next level! 🚀",
  "Beautiful work! 💙",
  "You inspire me every day!",
  "This is goals! 🎯",
  "Perfection! 👌",
  "Your best work yet!",
  "Speechless! 😱",
]

const COMMENT_REPLIES = [
  "Thank you so much! 🙏",
  "I really appreciate it! ❤️",
  "Thanks for the support! 💪",
  "Glad you liked it! 😊",
  "More coming soon! 🔜",
  "You're too kind! 🥰",
  "Thank you! That means a lot 💙",
  "Appreciate you! 🙌",
  "Thanks for always supporting! ✨",
  "Your words mean everything! 💫",
]

export async function seedInteractions(
  dataSource: DataSource,
  users: User[],
  allContent: Content[]
): Promise<void> {
  const interactionRepository = dataSource.getRepository(ContentInteraction)
  const commentRepository = dataSource.getRepository(Comment)
  const commentLikeRepository = dataSource.getRepository(CommentLike)
  const contentRepository = dataSource.getRepository(Content)

  console.log("\n🔄 Seeding interactions...")

  // For each content, add random likes, bookmarks, and shares from other users
  for (const content of allContent) {
    // Skip the content owner
    const otherUsers = users.filter((u) => u.id !== content.userId)

    // Random number of likes (30-70% of other users)
    const numLikes = Math.floor(Math.random() * (otherUsers.length * 0.4)) + Math.floor(otherUsers.length * 0.3)
    const likingUsers = shuffleArray(otherUsers).slice(0, numLikes)

    for (const user of likingUsers) {
      // Check if interaction already exists
      const existing = await interactionRepository.findOne({
        where: { contentId: content.id, userId: user.id, type: "like" },
      })

      if (!existing) {
        const interaction = interactionRepository.create({
          contentId: content.id,
          userId: user.id,
          type: "like",
        })
        await interactionRepository.save(interaction)
      }
    }

    // Random bookmarks (10-20% of liking users)
    const numBookmarks = Math.floor(numLikes * 0.15)
    const bookmarkingUsers = shuffleArray(likingUsers).slice(0, numBookmarks)

    for (const user of bookmarkingUsers) {
      const existing = await interactionRepository.findOne({
        where: { contentId: content.id, userId: user.id, type: "bookmark" },
      })

      if (!existing) {
        const interaction = interactionRepository.create({
          contentId: content.id,
          userId: user.id,
          type: "bookmark",
        })
        await interactionRepository.save(interaction)
      }
    }

    // Random shares (5-10% of liking users)
    const numShares = Math.floor(numLikes * 0.08)
    const sharingUsers = shuffleArray(likingUsers).slice(0, numShares)

    for (const user of sharingUsers) {
      const existing = await interactionRepository.findOne({
        where: { contentId: content.id, userId: user.id, type: "share" },
      })

      if (!existing) {
        const interaction = interactionRepository.create({
          contentId: content.id,
          userId: user.id,
          type: "share",
        })
        await interactionRepository.save(interaction)
      }
    }

    // Update content counts
    const actualLikes = await interactionRepository.count({
      where: { contentId: content.id, type: "like" },
    })
    const actualShares = await interactionRepository.count({
      where: { contentId: content.id, type: "share" },
    })

    content.likeCount = actualLikes
    content.shareCount = actualShares

    // Random comments (10-30% of liking users)
    const numComments = Math.floor(Math.random() * (numLikes * 0.2)) + Math.floor(numLikes * 0.1)
    const commentingUsers = shuffleArray(likingUsers).slice(0, numComments)

    for (const user of commentingUsers) {
      const commentText = COMMENT_TEXTS[Math.floor(Math.random() * COMMENT_TEXTS.length)]

      const comment = commentRepository.create({
        contentId: content.id,
        userId: user.id,
        text: commentText,
        likes: 0,
      })

      const savedComment = await commentRepository.save(comment)

      // 30% chance the content owner replies
      if (Math.random() < 0.3) {
        const replyText = COMMENT_REPLIES[Math.floor(Math.random() * COMMENT_REPLIES.length)]

        const reply = commentRepository.create({
          contentId: content.id,
          userId: content.userId, // Content owner replies
          text: replyText,
          parentId: savedComment.id,
          likes: 0,
        })

        await commentRepository.save(reply)
      }

      // Random comment likes (20-50% of other users)
      const numCommentLikes = Math.floor(Math.random() * (otherUsers.length * 0.3)) + Math.floor(otherUsers.length * 0.2)
      const commentLikingUsers = shuffleArray(otherUsers).slice(0, numCommentLikes)

      for (const likeUser of commentLikingUsers) {
        const existing = await commentLikeRepository.findOne({
          where: { commentId: savedComment.id, userId: likeUser.id },
        })

        if (!existing) {
          const commentLike = commentLikeRepository.create({
            commentId: savedComment.id,
            userId: likeUser.id,
          })
          await commentLikeRepository.save(commentLike)

          // Update comment like count
          savedComment.likes += 1
          await commentRepository.save(savedComment)
        }
      }
    }

    // Update comment count
    const actualComments = await commentRepository.count({
      where: { contentId: content.id, parentId: null }, // Only top-level comments
    })

    content.commentCount = actualComments
    await contentRepository.save(content)
  }

  console.log("✅ Interactions seeded successfully!")
}

// Utility function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}
