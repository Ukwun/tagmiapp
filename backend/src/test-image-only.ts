/**
 * Quick test: image captioning only.
 * Usage: npm run build && node dist/test-image-only.js
 */
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { MediaAnalysisService } from "./ai/media-analysis/media-analysis.service"
import { CategorizationService } from "./ai/categorization/categorization.service"
import { Repository } from "typeorm"
import { Content } from "./content/entities/content.entity"
import { getRepositoryToken } from "@nestjs/typeorm"

async function main() {
  console.log("Bootstrapping NestJS app...")
  const app = await NestFactory.createApplicationContext(AppModule)

  const mediaAnalysisService = app.get(MediaAnalysisService)
  const categorizationService = app.get(CategorizationService)
  const contentRepo = app.get<Repository<Content>>(getRepositoryToken(Content))

  // Get 3 image posts with captions (so we can compare AI description vs caption)
  const images = await contentRepo.find({
    where: { contentType: "image", sortOrder: 0 },
    order: { createdAt: "DESC" },
    take: 3,
  })

  console.log(`\nFound ${images.length} images to analyze\n`)

  for (let i = 0; i < images.length; i++) {
    const item = images[i]
    console.log(`\n${"=".repeat(60)}`)
    console.log(`[${i + 1}/${images.length}] IMAGE: ${item.id}`)
    console.log(`Caption: ${item.caption?.slice(0, 80) || "(no caption)"}`)
    console.log(`URL: ${item.mediaUrl}`)
    console.log(`${"=".repeat(60)}`)

    try {
      console.log("\nRunning image analysis...")
      const startTime = Date.now()
      const result = await mediaAnalysisService.analyzeContent("image", item.mediaUrl)
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

      console.log(`\nResult in ${elapsed}s:`)
      console.log(`  AI Description: ${result.aiDescription ? `"${result.aiDescription}"` : "(none)"}`)

      if (result.aiDescription) {
        // Categorize
        const parts: string[] = []
        if (item.caption) parts.push(item.caption)
        if (result.aiDescription) parts.push(result.aiDescription)
        const text = parts.join(" ").trim()
        const categories = await categorizationService.categorize(text, 5)
        console.log("\nCategories:")
        for (const cat of categories) {
          const bar = "█".repeat(Math.round(cat.confidence * 50))
          console.log(`  ${cat.category.padEnd(15)} ${(cat.confidence * 100).toFixed(1)}% ${bar}`)
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(`\nFAILED: ${(err as any).message}`, (err as any).stack);
      } else {
        console.error(`\nFAILED: ${String(err)}`);
      }
    }
  }

  console.log("\n\nDone!")
  await app.close()
}

main().catch(err => {
  console.error("Test failed:", err)
  process.exit(1)
})

