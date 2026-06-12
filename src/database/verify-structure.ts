import { DataSource } from "typeorm"
import * as dotenv from "dotenv"

dotenv.config()

const dataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
})

async function verifyStructure() {
  try {
    await dataSource.initialize()
    console.log("Database connection established\n")

    // Get all posts grouped by postId
    const posts = await dataSource.query(`
      SELECT
        "postId",
        json_agg(
          json_build_object(
            'id', id,
            'sortOrder', "sortOrder",
            'contentType', "contentType",
            'caption', caption,
            'mediaUrl', "mediaUrl",
            'backgroundColor', "backgroundColor",
            'fontStyle', "fontStyle"
          ) ORDER BY "sortOrder"
        ) as slides
      FROM content
      WHERE "postId" IS NOT NULL
      GROUP BY "postId"
      ORDER BY MAX("createdAt") DESC
      LIMIT 5;
    `)

    console.log("Posts with slides structure:\n")
    posts.forEach((post: any, index: number) => {
      console.log(`\n=== Post ${index + 1} (postId: ${post.postId}) ===`)
      post.slides.forEach((slide: any) => {
        console.log(`\nSlide ${slide.sortOrder}:`)
        console.log(`  Type: ${slide.contentType}`)
        console.log(`  Caption: ${slide.caption || '(empty)'}`)
        if (slide.contentType === 'text') {
          console.log(`  Background: ${slide.backgroundColor}`)
          console.log(`  Font Style: ${slide.fontStyle}`)
        }
        if (slide.mediaUrl) {
          console.log(`  Media URL: ${slide.mediaUrl.substring(0, 60)}...`)
        }
      })
    })

    console.log("\n✅ Structure verification complete!")
    await dataSource.destroy()
  } catch (error) {
    console.error("Error during verification:", error)
    process.exit(1)
  }
}

verifyStructure()
