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
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const talent_profile_entity_1 = require("../users/entities/talent-profile.entity");
const client_profile_entity_1 = require("../users/entities/client-profile.entity");
const content_entity_1 = require("../content/entities/content.entity");
const content_interaction_entity_1 = require("../content/entities/content-interaction.entity");
const comment_entity_1 = require("../content/entities/comment.entity");
const comment_like_entity_1 = require("../content/entities/comment-like.entity");
const users_seeder_1 = require("./seeders/users.seeder");
const multi_slide_content_seeder_1 = require("./seeders/multi-slide-content.seeder");
const interactions_seeder_1 = require("./seeders/interactions.seeder");
async function seed() {
    const dataSource = new typeorm_1.DataSource({
        type: "postgres",
        host: process.env.DB_HOST || "localhost",
        port: Number.parseInt(process.env.DB_PORT) || 5432,
        username: process.env.DB_USERNAME || "postgres",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_DATABASE || "hashtag_db",
        entities: [user_entity_1.User, talent_profile_entity_1.TalentProfile, client_profile_entity_1.ClientProfile, content_entity_1.Content, content_interaction_entity_1.ContentInteraction, comment_entity_1.Comment, comment_like_entity_1.CommentLike],
        synchronize: false,
    });
    try {
        await dataSource.initialize();
        console.log("✅ Database connection established");
        console.log("\n🌱 Starting database seeding with multi-slide posts...\n");
        console.log("🧹 Clearing existing content and interactions...");
        await dataSource.getRepository(comment_like_entity_1.CommentLike).delete({});
        await dataSource.getRepository(comment_entity_1.Comment).delete({});
        await dataSource.getRepository(content_interaction_entity_1.ContentInteraction).delete({});
        await dataSource.getRepository(content_entity_1.Content).delete({});
        console.log("✅ Cleared existing data\n");
        console.log("👥 Seeding users...");
        const userMap = await (0, users_seeder_1.seedUsers)(dataSource);
        const users = Array.from(userMap.values());
        console.log(`✅ Seeded ${users.length} users\n`);
        console.log("📝 Seeding multi-slide content...");
        const allContent = await (0, multi_slide_content_seeder_1.seedMultiSlideContent)(dataSource, users);
        console.log(`✅ Seeded ${allContent.length} content slides\n`);
        console.log("❤️ Seeding interactions (likes, comments, shares, bookmarks)...");
        await (0, interactions_seeder_1.seedInteractions)(dataSource, users, allContent);
        console.log("✅ Seeded all interactions\n");
        console.log("\n🎉 Database seeding completed successfully!");
        console.log("\n📋 Summary:");
        console.log(`   - ${users.length} users`);
        console.log(`   - ${allContent.length} content slides (grouped into multi-slide posts)`);
        console.log("   - Likes, bookmarks, shares, comments, and comment likes added\n");
        await dataSource.destroy();
    }
    catch (error) {
        console.error("❌ Error during seeding:", error);
        process.exit(1);
    }
}
seed();
//# sourceMappingURL=seed-multi-slide.js.map