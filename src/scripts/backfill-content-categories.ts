/**
 * Backfill Script: Content Categorization
 *
 * This script analyzes all existing content (images and videos) that don't have
 * AI-generated categories yet and categorizes them using Claude Vision.
 *
 * Features:
 * - Processes in batches of 50 (parallel analysis)
 * - Resumable (skips already categorized content)
 * - Rate limit aware (50 req/min for Haiku)
 * - Progress logging every 50 posts
 * - Saves results immediately after each batch completes
 *
 * Usage:
 *   npm run build
 *   node dist/scripts/backfill-content-categories.js
 */

import { NestFactory } from "@nestjs/core"
import { AppModule } from "../app.module"
import { MediaAnalysisService } from "../ai/media-analysis/media-analysis.service"
import { ContentRepository } from "../content/repositories/content.repository"

const BATCH_SIZE = 50
const RATE_LIMIT_DELAY_MS = 1200 // ~50 req/min = 1 request per 1.2 seconds

async function main() {
  console.log("🚀 Starting content categorization backfill...")
  console.log(`⚙️  Batch size: ${BATCH_SIZE}`)
  console.log(`⏱️  Rate limit: ~50 requests/min\n`)

  const app = await NestFactory.createApplicationContext(AppModule)
  const mediaAnalysisService = app.get(MediaAnalysisService)
  const contentRepository = app.get(ContentRepository)

  // Fetch all uncategorized content (where categories IS NULL)
  console.log("📊 Fetching uncategorized content...")
  const uncategorizedContent = await contentRepository
    .createQueryBuilder("content")
    .where("content.categories IS NULL")
    .andWhere("content.contentType IN (:...types)", { types: ["image", "video"] })
    .orderBy("content.createdAt", "DESC") // newest first
    .getMany()

  const totalCount = uncategorizedContent.length
  console.log(`📝 Found ${totalCount} uncategorized posts\n`)

  if (totalCount === 0) {
    console.log("✅ All content already categorized!")
    await app.close()
    return
  }

  let processedCount = 0
  let successCount = 0
  let failCount = 0
  const startTime = Date.now()

  // Process in batches
  for (let i = 0; i < uncategorizedContent.length; i += BATCH_SIZE) {
    const batch = uncategorizedContent.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(totalCount / BATCH_SIZE)

    console.log(`\n${"=".repeat(60)}`)
    console.log(`📦 Batch ${batchNum}/${totalBatches} (${batch.length} posts)`)
    console.log(`${"=".repeat(60)}`)

    // Process batch in parallel with rate limiting delay between items
    const batchPromises = batch.map(async (content, index) => {
      // Stagger requests within batch to avoid hitting rate limit
      await new Promise(resolve => setTimeout(resolve, index * RATE_LIMIT_DELAY_MS))

      try {
        console.log(`\n[${i + index + 1}/${totalCount}] Analyzing: ${content.id}`)
        console.log(`  Type: ${content.contentType}`)
        console.log(`  URL: ${content.mediaUrl}`)
        console.log(`  Caption: ${content.caption?.slice(0, 60) || "(none)"}...`)

        const analysisStart = Date.now()
        const result = await mediaAnalysisService.analyzeContent(
          content.contentType as "image" | "video",
          content.mediaUrl,
          content.caption,
        )
        const analysisTime = ((Date.now() - analysisStart) / 1000).toFixed(1)

        // Update database immediately
        const updates: any = {}
        if (result.aiDescription) updates.aiDescription = result.aiDescription
        if (result.categories) updates.categories = result.categories
        if (result.transcription) updates.transcription = result.transcription

        if (Object.keys(updates).length > 0) {
          await contentRepository.update(content.id, updates)

          console.log(`  ✅ Success (${analysisTime}s)`)
          if (result.categories && result.categories.length > 0) {
            console.log(`  Categories:`)
            result.categories.forEach(cat => {
              const bar = "█".repeat(Math.round(cat.confidence * 10))
              console.log(`    ${cat.category.padEnd(15)} ${(cat.confidence * 100).toFixed(0)}% ${bar}`)
            })
          }
          successCount++
        } else {
          console.log(`  ⚠️  No analysis results returned`)
          failCount++
        }

        processedCount++
      } catch (error) {
        console.error(`  ❌ Failed: ${error.message}`)
        failCount++
        processedCount++
      }
    })

    // Wait for entire batch to complete
    await Promise.all(batchPromises)

    // Progress summary after each batch
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
    const remaining = totalCount - processedCount
    const avgTimePerPost = processedCount > 0 ? (Date.now() - startTime) / processedCount / 1000 : 0
    const estimatedRemainingTime = remaining > 0 ? ((remaining * avgTimePerPost) / 60).toFixed(0) : 0

    console.log(`\n📊 Progress: ${processedCount}/${totalCount} (${((processedCount / totalCount) * 100).toFixed(1)}%)`)
    console.log(`✅ Success: ${successCount} | ❌ Failed: ${failCount}`)
    console.log(`⏱️  Elapsed: ${elapsed}s | Est. remaining: ~${estimatedRemainingTime}min`)

    // Small delay between batches
    if (i + BATCH_SIZE < uncategorizedContent.length) {
      console.log(`\n⏸️  Pausing 2 seconds before next batch...`)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  // Final summary
  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1)
  console.log(`\n\n${"=".repeat(60)}`)
  console.log(`🎉 BACKFILL COMPLETE`)
  console.log(`${"=".repeat(60)}`)
  console.log(`Total processed: ${processedCount}`)
  console.log(`✅ Successful: ${successCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log(`⏱️  Total time: ${totalTime} minutes`)
  console.log(`📈 Success rate: ${((successCount / processedCount) * 100).toFixed(1)}%`)
  console.log(`${"=".repeat(60)}\n`)

  await app.close()
  process.exit(0)
}

main().catch(error => {
  console.error("\n❌ Backfill script failed:", error)
  process.exit(1)
})
