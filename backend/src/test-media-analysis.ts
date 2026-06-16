/**
 * Quick test script to run Claude Vision media analysis on video and image posts.
 * Tests that Claude accurately describes and categorizes content.
 * Usage: npm run build && node dist/test-media-analysis.js
 */
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { MediaAnalysisService } from "./ai/media-analysis/media-analysis.service"
import { Repository } from "typeorm"
import { Content } from "./content/entities/content.entity"
import { getRepositoryToken } from "@nestjs/typeorm"

async function main() {
  console.log("Bootstrapping NestJS app...")
  const app = await NestFactory.createApplicationContext(AppModule)

  const mediaAnalysisService = app.get(MediaAnalysisService)
  const contentRepo = app.get<Repository<Content>>(getRepositoryToken(Content))

  // Get 5 different video posts (skip first 3 already tested)
  const videos = await contentRepo.find({
    where: { contentType: "video", sortOrder: 0 },
    order: { createdAt: "DESC" },
    skip: 3,
    take: 5,
  })

  const allContent = videos.map(v => ({ ...v, _type: "video" as const }))

  console.log(`\nFound ${videos.length} videos to analyze\n`)

  let successCount = 0
  let failCount = 0

  for (let i = 0; i < allContent.length; i++) {
    const item = allContent[i]
    const label = item._type.toUpperCase()

    console.log(`\n${"=".repeat(60)}`)
    console.log(`[${i + 1}/${allContent.length}] ${label}: ${item.id}`)
    console.log(`Caption: ${item.caption?.slice(0, 80) || "(no caption)"}`)
    console.log(`URL: ${item.mediaUrl}`)
    console.log(`${"=".repeat(60)}`)

    try {
      console.log("\nRunning Claude Vision analysis...")
      const startTime = Date.now()

      // Claude Vision returns description + categories in one call
      const result = await mediaAnalysisService.analyzeContent(
        item._type,
        item.mediaUrl,
        item.caption,
      )

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

      console.log(`\nResult (${elapsed}s):`)
      if (result.transcription) {
        console.log(`  Transcription: "${result.transcription.slice(0, 150)}${result.transcription.length > 150 ? '...' : ''}"`)
      }
      console.log(`  Description: ${result.aiDescription ? `"${result.aiDescription}"` : "(none)"}`)

      if (result.categories && result.categories.length > 0) {
        console.log(`  Categories:`)
        for (const cat of result.categories) {
          const bar = "█".repeat(Math.round(cat.confidence * 20))
          console.log(`    ${cat.category.padEnd(15)} ${(cat.confidence * 100).toFixed(0)}% ${bar}`)
        }
      } else {
        console.log(`  Categories: (none)`)
      }

      // Save results to DB
      const updates: Partial<Content> = {}
      if (result.transcription) updates.transcription = result.transcription
      if (result.aiDescription) updates.aiDescription = result.aiDescription
      if (result.categories) updates.categories = result.categories
      if (Object.keys(updates).length > 0) {
        await contentRepo.update(item.id, updates)
        console.log(`  Saved to DB`)
      }

      successCount++
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(`\nFAILED: ${err.message}`, err.stack);
      } else {
        console.error(`\nFAILED: ${String(err)}`);
      }
      failCount++
    }
  }

  console.log(`\n\n${"=".repeat(60)}`)
  console.log(`RESULTS: ${successCount} succeeded, ${failCount} failed out of ${allContent.length}`)
  console.log(`${"=".repeat(60)}`)
  console.log("\nDone!")
  await app.close()
}

main().catch(err => {
  console.error("Test failed:", err)
  process.exit(1)
})
