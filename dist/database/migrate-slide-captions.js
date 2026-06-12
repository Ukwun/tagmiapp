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
async function migrateSlideCaption() {
    try {
        await dataSource.initialize();
        console.log("Database connection established");
        const result = await dataSource.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='content' AND column_name='fontStyle';
    `);
        if (result.length === 0) {
            console.log("Adding fontStyle column to content table...");
            await dataSource.query(`
        ALTER TABLE content
        ADD COLUMN "fontStyle" VARCHAR;
      `);
            console.log("fontStyle column added successfully");
        }
        else {
            console.log("fontStyle column already exists");
        }
        await dataSource.query(`
      UPDATE content
      SET "fontStyle" = 'normal'
      WHERE "contentType" = 'text' AND ("fontStyle" IS NULL OR "fontStyle" = '');
    `);
        console.log("Updated text slides with default fontStyle");
        const contents = await dataSource.query(`
      SELECT id, "postId", "sortOrder", "contentType", caption, "backgroundColor", "fontStyle"
      FROM content
      ORDER BY "createdAt" DESC
      LIMIT 10;
    `);
        console.log("\nCurrent content structure (latest 10):");
        console.table(contents);
        console.log("\nMigration completed successfully!");
        await dataSource.destroy();
    }
    catch (error) {
        console.error("Error during migration:", error);
        process.exit(1);
    }
}
migrateSlideCaption();
//# sourceMappingURL=migrate-slide-captions.js.map