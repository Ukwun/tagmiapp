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
import { seedUsers } from "./seeders/users.seeder"
import { seedMultiSlideContent } from "./seeders/multi-slide-content.seeder"
import { seedInteractions } from "./seeders/interactions.seeder"

async function seed() {
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
    console.log("✅ Database connection established")

    console.log("\n🌱 Starting database seeding with multi-slide posts...\n")

    // Clear existing content and interactions
    console.log("🧹 Clearing existing content and interactions...")
    await dataSource.getRepository(CommentLike).delete({})
    await dataSource.getRepository(Comment).delete({})
    await dataSource.getRepository(ContentInteraction).delete({})
    await dataSource.getRepository(Content).delete({})
    console.log("✅ Cleared existing data\n")

    // Step 1: Seed users (or get existing)
    console.log("👥 Seeding users...")
    const userMap = await seedUsers(dataSource)
    const users = Array.from(userMap.values())
    console.log(`✅ Seeded ${users.length} users\n`)

    // Step 2: Seed multi-slide content
    console.log("📝 Seeding multi-slide content...")
    const allContent = await seedMultiSlideContent(dataSource, users)
    console.log(`✅ Seeded ${allContent.length} content slides\n`)

    // Step 3: Seed interactions
    console.log("❤️ Seeding interactions (likes, comments, shares, bookmarks)...")
    await seedInteractions(dataSource, users, allContent)
    console.log("✅ Seeded all interactions\n")

    console.log("\n🎉 Database seeding completed successfully!")
    console.log("\n📋 Summary:")
    console.log(`   - ${users.length} users`)
    console.log(`   - ${allContent.length} content slides (grouped into multi-slide posts)`)
    console.log("   - Likes, bookmarks, shares, comments, and comment likes added\n")

    await dataSource.destroy()
  } catch (error) {
    console.error("❌ Error during seeding:", error)
    process.exit(1)
  }
}

seed()
