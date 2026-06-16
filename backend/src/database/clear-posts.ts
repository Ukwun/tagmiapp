import "dotenv/config"
import { DataSource } from "typeorm"
import * as path from "path"

async function clearPosts() {
  const isProd = process.env.DB_HOST && process.env.DB_HOST !== "localhost" && process.env.DB_HOST !== "127.0.0.1"
  const dataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number.parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "hashtag_db",
    // Load ALL entities via glob so TypeORM can resolve cross-entity relations.
    // We only run raw SQL below, but metadata must still build successfully.
    entities: [path.join(__dirname, "..", "**", "*.entity.{ts,js}")],
    synchronize: false,
    ...(isProd && { ssl: { rejectUnauthorized: false } }),
  })

  // Order: children first, then content last. Each wrapped so a missing table
  // doesn't abort the whole run.
  const tables = [
    "content_interactions",
    "comment_likes",
    "comments",
    "engagement_signals",
    "mentions",
    "drafts",
    "content",
  ]

  try {
    await dataSource.initialize()
    console.log("Database connection established")

    for (const table of tables) {
      try {
        await dataSource.query(`TRUNCATE TABLE "${table}" CASCADE`)
        console.log(`Truncated ${table}`)
      } catch (err: any) {
        // Table may not exist yet if that feature was never used
        if (err?.code === "42P01") {
          console.log(`Skipped ${table} (table does not exist)`)
        } else {
          throw err
        }
      }
    }

    console.log("All posts cleared successfully!")
  } catch (error) {
    console.error("Error clearing posts:", error)
    throw error
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy()
    }
  }
}

clearPosts()
  .then(() => {
    console.log("Done!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Failed:", error)
    process.exit(1)
  })
