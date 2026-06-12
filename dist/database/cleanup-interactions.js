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
async function cleanupInteractions() {
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
        console.log("✅ Database connection established\n");
        console.log("🗑️  Cleaning up seeded interactions...\n");
        console.log("Deleting comment likes...");
        const commentLikeRepo = dataSource.getRepository(comment_like_entity_1.CommentLike);
        const deletedCommentLikes = await commentLikeRepo.delete({});
        console.log(`✅ Deleted ${deletedCommentLikes.affected || 0} comment likes\n`);
        console.log("Deleting comments...");
        const commentRepo = dataSource.getRepository(comment_entity_1.Comment);
        const deletedComments = await commentRepo.delete({});
        console.log(`✅ Deleted ${deletedComments.affected || 0} comments\n`);
        console.log("Deleting content interactions (likes, bookmarks, shares, views)...");
        const interactionRepo = dataSource.getRepository(content_interaction_entity_1.ContentInteraction);
        const deletedInteractions = await interactionRepo.delete({});
        console.log(`✅ Deleted ${deletedInteractions.affected || 0} interactions\n`);
        console.log("Resetting content engagement counts...");
        const contentRepo = dataSource.getRepository(content_entity_1.Content);
        await contentRepo.update({}, {
            likeCount: 0,
            commentCount: 0,
            shareCount: 0,
            viewCount: 0,
        });
        console.log("✅ Reset all engagement counts to 0\n");
        console.log("🎉 Cleanup completed successfully!");
        console.log("\n📋 Summary:");
        console.log(`   - ${deletedCommentLikes.affected || 0} comment likes removed`);
        console.log(`   - ${deletedComments.affected || 0} comments removed`);
        console.log(`   - ${deletedInteractions.affected || 0} interactions removed`);
        console.log("   - All content engagement counts reset to 0");
        console.log("\n✨ Database is now clean for real user testing!\n");
        await dataSource.destroy();
    }
    catch (error) {
        console.error("❌ Error during cleanup:", error);
        process.exit(1);
    }
}
cleanupInteractions();
//# sourceMappingURL=cleanup-interactions.js.map