import * as dotenv from "dotenv"
dotenv.config()

import { DataSource } from "typeorm"
import { User } from "../users/entities/user.entity"
import { TalentProfile } from "../users/entities/talent-profile.entity"
import { ClientProfile } from "../users/entities/client-profile.entity"
import { Content } from "../content/entities/content.entity"
import { ContentInteraction } from "../content/entities/content-interaction.entity"
import { Comment } from "../content/entities/comment.entity"
import { CommentLike } from "../content/entities/comment-like.entity"

async function cleanupInteractions() {
  const dataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number.parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "hashtag_db",
    entities: [User, TalentProfile, ClientProfile, Content, ContentInteraction, Comment, CommentLike],
    synchronize: false,
  })

  try {
    await dataSource.initialize()
    console.log("✅ Database connection established\n")

    console.log("🗑️  Cleaning up seeded interactions...\n")

    // Delete all comment likes
    console.log("Deleting comment likes...")
    const commentLikeRepo = dataSource.getRepository(CommentLike)
    const deletedCommentLikes = await commentLikeRepo.delete({})
    console.log(`✅ Deleted ${deletedCommentLikes.affected || 0} comment likes\n`)

    // Delete all comments
    console.log("Deleting comments...")
    const commentRepo = dataSource.getRepository(Comment)
    const deletedComments = await commentRepo.delete({})
    console.log(`✅ Deleted ${deletedComments.affected || 0} comments\n`)

    // Delete all content interactions
    console.log("Deleting content interactions (likes, bookmarks, shares, views)...")
    const interactionRepo = dataSource.getRepository(ContentInteraction)
    const deletedInteractions = await interactionRepo.delete({})
    console.log(`✅ Deleted ${deletedInteractions.affected || 0} interactions\n`)

    // Reset all content engagement counts
    console.log("Resetting content engagement counts...")
    const contentRepo = dataSource.getRepository(Content)
    await contentRepo.update({}, {
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      viewCount: 0,
    })
    console.log("✅ Reset all engagement counts to 0\n")

    console.log("🎉 Cleanup completed successfully!")
    console.log("\n📋 Summary:")
    console.log(`   - ${deletedCommentLikes.affected || 0} comment likes removed`)
    console.log(`   - ${deletedComments.affected || 0} comments removed`)
    console.log(`   - ${deletedInteractions.affected || 0} interactions removed`)
    console.log("   - All content engagement counts reset to 0")
    console.log("\n✨ Database is now clean for real user testing!\n")

    await dataSource.destroy()
  } catch (error) {
    console.error("❌ Error during cleanup:", error)
    process.exit(1)
  }
}

cleanupInteractions()
