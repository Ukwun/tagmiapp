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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedRealMultiSlidePosts = seedRealMultiSlidePosts;
const user_entity_1 = require("../../users/entities/user.entity");
const content_entity_1 = require("../../content/entities/content.entity");
const axios_1 = __importDefault(require("axios"));
const FormData = __importStar(require("form-data"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const REAL_IMAGE_URLS = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1080&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1080&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1080&q=80",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1080&q=80",
    "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=1080&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1080&q=80",
    "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=1080&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1080&q=80",
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1080&q=80",
    "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=1080&q=80",
];
const CAPTIONS = [
    "Just wrapped up an amazing shoot today! 📸✨",
    "New project coming soon... stay tuned! 🎬",
    "Behind the scenes of my creative process 💡",
    "Grateful for another opportunity to do what I love ❤️",
    "Collaboration is key to great work 🤝",
    "Pushing boundaries and trying new things 🚀",
    "This is what passion looks like 🔥",
    "Every project teaches me something new 📚",
    "Living my dream one day at a time 🌟",
    "The grind never stops! 💪",
];
const HASHTAG_SETS = [
    ["photography", "art", "creative"],
    ["videography", "filmmaker", "content"],
    ["design", "branding", "graphicdesign"],
    ["music", "producer", "afrobeats"],
    ["writing", "copywriting", "content"],
    ["dance", "choreography", "performance"],
    ["tech", "developer", "coding"],
    ["fashion", "model", "style"],
    ["voiceover", "audio", "podcast"],
    ["lifestyle", "creator", "inspiration"],
];
async function downloadImage(url, filepath) {
    const response = await (0, axios_1.default)({
        url,
        method: "GET",
        responseType: "stream",
    });
    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
    });
}
async function seedRealMultiSlidePosts(dataSource, users) {
    const contentRepository = dataSource.getRepository(content_entity_1.Content);
    const userRepository = dataSource.getRepository(user_entity_1.User);
    console.log("\n📸 Creating real multi-slide posts...");
    const tempDir = path.join(os.tmpdir(), "hashtag-seeder");
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }
    for (const user of users) {
        console.log(`\n📝 Creating 5 multi-slide posts for ${user.username}...`);
        for (let postNum = 0; postNum < 5; postNum++) {
            const numSlides = Math.floor(Math.random() * 3) + 2;
            const caption = CAPTIONS[Math.floor(Math.random() * CAPTIONS.length)];
            const hashtags = HASHTAG_SETS[Math.floor(Math.random() * HASHTAG_SETS.length)];
            console.log(`  Creating post ${postNum + 1} with ${numSlides} slides...`);
            for (let slideNum = 0; slideNum < numSlides; slideNum++) {
                const imageUrl = REAL_IMAGE_URLS[Math.floor(Math.random() * REAL_IMAGE_URLS.length)];
                const tempFilePath = path.join(tempDir, `${user.id}-${postNum}-${slideNum}.jpg`);
                try {
                    await downloadImage(imageUrl, tempFilePath);
                    const fileBuffer = fs.readFileSync(tempFilePath);
                    const formData = new FormData();
                    formData.append("file", fileBuffer, {
                        filename: `slide-${slideNum}.jpg`,
                        contentType: "image/jpeg",
                    });
                    formData.append("title", caption);
                    formData.append("description", caption);
                    formData.append("tags", JSON.stringify(hashtags));
                    formData.append("isPublic", "true");
                    const content = contentRepository.create({
                        userId: user.id,
                        contentType: "image",
                        mediaUrl: imageUrl,
                        thumbnailUrl: imageUrl.replace("w=1080", "w=400"),
                        caption: slideNum === 0 ? caption : null,
                        hashtags: slideNum === 0 ? hashtags : [],
                        viewCount: Math.floor(Math.random() * 10000) + 100,
                        likeCount: 0,
                        commentCount: 0,
                        shareCount: 0,
                        isActive: true,
                        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                    });
                    await contentRepository.save(content);
                    fs.unlinkSync(tempFilePath);
                }
                catch (error) {
                    console.error(`    Error creating slide ${slideNum}:`, error.message);
                }
            }
            user.postCount += 1;
        }
        await userRepository.save(user);
        console.log(`  ✅ Created 5 multi-slide posts for ${user.username}`);
    }
    fs.rmdirSync(tempDir, { recursive: true });
    console.log("\n🎉 Real multi-slide posts created!");
}
//# sourceMappingURL=real-posts.seeder.js.map