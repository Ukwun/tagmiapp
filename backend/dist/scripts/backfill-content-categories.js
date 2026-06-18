"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const media_analysis_service_1 = require("../ai/media-analysis/media-analysis.service");
const content_repository_1 = require("../content/repositories/content.repository");
const BATCH_SIZE = 50;
const RATE_LIMIT_DELAY_MS = 1200;
async function main() {
    console.log("🚀 Starting content categorization backfill...");
    console.log(`⚙️  Batch size: ${BATCH_SIZE}`);
    console.log(`⏱️  Rate limit: ~50 requests/min\n`);
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const mediaAnalysisService = app.get(media_analysis_service_1.MediaAnalysisService);
    const contentRepository = app.get(content_repository_1.ContentRepository);
    console.log("📊 Fetching uncategorized content...");
    const uncategorizedContent = await contentRepository
        .createQueryBuilder("content")
        .where("content.categories IS NULL")
        .andWhere("content.contentType IN (:...types)", { types: ["image", "video"] })
        .orderBy("content.createdAt", "DESC")
        .getMany();
    const totalCount = uncategorizedContent.length;
    console.log(`📝 Found ${totalCount} uncategorized posts\n`);
    if (totalCount === 0) {
        console.log("✅ All content already categorized!");
        await app.close();
        return;
    }
    let processedCount = 0;
    let successCount = 0;
    let failCount = 0;
    const startTime = Date.now();
    for (let i = 0; i < uncategorizedContent.length; i += BATCH_SIZE) {
        const batch = uncategorizedContent.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(totalCount / BATCH_SIZE);
        console.log(`\n${"=".repeat(60)}`);
        console.log(`📦 Batch ${batchNum}/${totalBatches} (${batch.length} posts)`);
        console.log(`${"=".repeat(60)}`);
        const batchPromises = batch.map(async (content, index) => {
            await new Promise(resolve => setTimeout(resolve, index * RATE_LIMIT_DELAY_MS));
            try {
                console.log(`\n[${i + index + 1}/${totalCount}] Analyzing: ${content.id}`);
                console.log(`  Type: ${content.contentType}`);
                console.log(`  URL: ${content.mediaUrl}`);
                console.log(`  Caption: ${content.caption?.slice(0, 60) || "(none)"}...`);
                const analysisStart = Date.now();
                const result = await mediaAnalysisService.analyzeContent(content.contentType, content.mediaUrl, content.caption);
                const analysisTime = ((Date.now() - analysisStart) / 1000).toFixed(1);
                const updates = {};
                if (result.aiDescription)
                    updates.aiDescription = result.aiDescription;
                if (result.categories)
                    updates.categories = result.categories;
                if (result.transcription)
                    updates.transcription = result.transcription;
                if (Object.keys(updates).length > 0) {
                    await contentRepository.update(content.id, updates);
                    console.log(`  ✅ Success (${analysisTime}s)`);
                    if (result.categories && result.categories.length > 0) {
                        console.log(`  Categories:`);
                        result.categories.forEach(cat => {
                            const bar = "█".repeat(Math.round(cat.confidence * 10));
                            console.log(`    ${cat.category.padEnd(15)} ${(cat.confidence * 100).toFixed(0)}% ${bar}`);
                        });
                    }
                    successCount++;
                }
                else {
                    console.log(`  ⚠️  No analysis results returned`);
                    failCount++;
                }
                processedCount++;
            }
            catch (error) {
                console.error(`  ❌ Failed: ${error.message}`);
                failCount++;
                processedCount++;
            }
        });
        await Promise.all(batchPromises);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
        const remaining = totalCount - processedCount;
        const avgTimePerPost = processedCount > 0 ? (Date.now() - startTime) / processedCount / 1000 : 0;
        const estimatedRemainingTime = remaining > 0 ? ((remaining * avgTimePerPost) / 60).toFixed(0) : 0;
        console.log(`\n📊 Progress: ${processedCount}/${totalCount} (${((processedCount / totalCount) * 100).toFixed(1)}%)`);
        console.log(`✅ Success: ${successCount} | ❌ Failed: ${failCount}`);
        console.log(`⏱️  Elapsed: ${elapsed}s | Est. remaining: ~${estimatedRemainingTime}min`);
        if (i + BATCH_SIZE < uncategorizedContent.length) {
            console.log(`\n⏸️  Pausing 2 seconds before next batch...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    console.log(`\n\n${"=".repeat(60)}`);
    console.log(`🎉 BACKFILL COMPLETE`);
    console.log(`${"=".repeat(60)}`);
    console.log(`Total processed: ${processedCount}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`⏱️  Total time: ${totalTime} minutes`);
    console.log(`📈 Success rate: ${((successCount / processedCount) * 100).toFixed(1)}%`);
    console.log(`${"=".repeat(60)}\n`);
    await app.close();
    process.exit(0);
}
main().catch(error => {
    console.error("\n❌ Backfill script failed:", error);
    process.exit(1);
});
//# sourceMappingURL=backfill-content-categories.js.map