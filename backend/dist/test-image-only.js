"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const media_analysis_service_1 = require("./ai/media-analysis/media-analysis.service");
const categorization_service_1 = require("./ai/categorization/categorization.service");
const content_entity_1 = require("./content/entities/content.entity");
const typeorm_1 = require("@nestjs/typeorm");
async function main() {
    console.log("Bootstrapping NestJS app...");
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const mediaAnalysisService = app.get(media_analysis_service_1.MediaAnalysisService);
    const categorizationService = app.get(categorization_service_1.CategorizationService);
    const contentRepo = app.get((0, typeorm_1.getRepositoryToken)(content_entity_1.Content));
    const images = await contentRepo.find({
        where: { contentType: "image", sortOrder: 0 },
        order: { createdAt: "DESC" },
        take: 3,
    });
    console.log(`\nFound ${images.length} images to analyze\n`);
    for (let i = 0; i < images.length; i++) {
        const item = images[i];
        console.log(`\n${"=".repeat(60)}`);
        console.log(`[${i + 1}/${images.length}] IMAGE: ${item.id}`);
        console.log(`Caption: ${item.caption?.slice(0, 80) || "(no caption)"}`);
        console.log(`URL: ${item.mediaUrl}`);
        console.log(`${"=".repeat(60)}`);
        try {
            console.log("\nRunning image analysis...");
            const startTime = Date.now();
            const result = await mediaAnalysisService.analyzeContent("image", item.mediaUrl);
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`\nResult in ${elapsed}s:`);
            console.log(`  AI Description: ${result.aiDescription ? `"${result.aiDescription}"` : "(none)"}`);
            if (result.aiDescription) {
                const parts = [];
                if (item.caption)
                    parts.push(item.caption);
                if (result.aiDescription)
                    parts.push(result.aiDescription);
                const text = parts.join(" ").trim();
                const categories = await categorizationService.categorize(text, 5);
                console.log("\nCategories:");
                for (const cat of categories) {
                    const bar = "█".repeat(Math.round(cat.confidence * 50));
                    console.log(`  ${cat.category.padEnd(15)} ${(cat.confidence * 100).toFixed(1)}% ${bar}`);
                }
            }
        }
        catch (err) {
            if (err instanceof Error) {
                console.error(`\nFAILED: ${err.message}`, err.stack);
            }
            else {
                console.error(`\nFAILED: ${String(err)}`);
            }
        }
    }
    console.log("\n\nDone!");
    await app.close();
}
main().catch(err => {
    console.error("Test failed:", err);
    process.exit(1);
});
//# sourceMappingURL=test-image-only.js.map