"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const dataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});
async function verifyStructure() {
    try {
        await dataSource.initialize();
        console.log("Database connection established\n");
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
    `);
        console.log("Posts with slides structure:\n");
        posts.forEach((post, index) => {
            console.log(`\n=== Post ${index + 1} (postId: ${post.postId}) ===`);
            post.slides.forEach((slide) => {
                console.log(`\nSlide ${slide.sortOrder}:`);
                console.log(`  Type: ${slide.contentType}`);
                console.log(`  Caption: ${slide.caption || '(empty)'}`);
                if (slide.contentType === 'text') {
                    console.log(`  Background: ${slide.backgroundColor}`);
                    console.log(`  Font Style: ${slide.fontStyle}`);
                }
                if (slide.mediaUrl) {
                    console.log(`  Media URL: ${slide.mediaUrl.substring(0, 60)}...`);
                }
            });
        });
        console.log("\n✅ Structure verification complete!");
        await dataSource.destroy();
    }
    catch (error) {
        console.error("Error during verification:", error);
        process.exit(1);
    }
}
verifyStructure();
//# sourceMappingURL=verify-structure.js.map