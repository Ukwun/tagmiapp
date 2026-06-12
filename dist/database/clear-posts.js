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
require("dotenv/config");
const typeorm_1 = require("typeorm");
const path = __importStar(require("path"));
async function clearPosts() {
    const isProd = process.env.DB_HOST && process.env.DB_HOST !== "localhost" && process.env.DB_HOST !== "127.0.0.1";
    const dataSource = new typeorm_1.DataSource({
        type: "postgres",
        host: process.env.DB_HOST || "localhost",
        port: Number.parseInt(process.env.DB_PORT || "5432"),
        username: process.env.DB_USERNAME || "postgres",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_DATABASE || "hashtag_db",
        entities: [path.join(__dirname, "..", "**", "*.entity.{ts,js}")],
        synchronize: false,
        ...(isProd && { ssl: { rejectUnauthorized: false } }),
    });
    const tables = [
        "content_interactions",
        "comment_likes",
        "comments",
        "engagement_signals",
        "mentions",
        "drafts",
        "content",
    ];
    try {
        await dataSource.initialize();
        console.log("Database connection established");
        for (const table of tables) {
            try {
                await dataSource.query(`TRUNCATE TABLE "${table}" CASCADE`);
                console.log(`Truncated ${table}`);
            }
            catch (err) {
                if (err?.code === "42P01") {
                    console.log(`Skipped ${table} (table does not exist)`);
                }
                else {
                    throw err;
                }
            }
        }
        console.log("All posts cleared successfully!");
    }
    catch (error) {
        console.error("Error clearing posts:", error);
        throw error;
    }
    finally {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
        }
    }
}
clearPosts()
    .then(() => {
    console.log("Done!");
    process.exit(0);
})
    .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
});
//# sourceMappingURL=clear-posts.js.map