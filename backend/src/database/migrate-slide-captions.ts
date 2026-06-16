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

async function migrateSlideCaption() {
  try {
    await dataSource.initialize()
    console.log("Database connection established")

    // The current structure is correct - caption is already stored per slide in the content table
    // We just need to verify that the fontStyle column exists

    // Check if fontStyle column exists
    const result = await dataSource.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='content' AND column_name='fontStyle';
    `)

    if (result.length === 0) {
      console.log("Adding fontStyle column to content table...")
      await dataSource.query(`
        ALTER TABLE content
        ADD COLUMN "fontStyle" VARCHAR;
      `)
      console.log("fontStyle column added successfully")
    } else {
      console.log("fontStyle column already exists")
    }

    // Update any text slides that don't have a fontStyle set to 'normal'
    await dataSource.query(`
      UPDATE content
      SET "fontStyle" = 'normal'
      WHERE "contentType" = 'text' AND ("fontStyle" IS NULL OR "fontStyle" = '');
    `)
    console.log("Updated text slides with default fontStyle")

    // Display current content structure
    const contents = await dataSource.query(`
      SELECT id, "postId", "sortOrder", "contentType", caption, "backgroundColor", "fontStyle"
      FROM content
      ORDER BY "createdAt" DESC
      LIMIT 10;
    `)

    console.log("\nCurrent content structure (latest 10):")
    console.table(contents)

    console.log("\nMigration completed successfully!")
    await dataSource.destroy()
  } catch (error) {
    console.error("Error during migration:", error)
    process.exit(1)
  }
}

migrateSlideCaption()
