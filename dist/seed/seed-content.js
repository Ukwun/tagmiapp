"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@nestjs/core");
var app_module_1 = require("./app.module");
var typeorm_1 = require("typeorm");
var user_entity_1 = require("./entities/user.entity");
var content_entity_1 = require("./entities/content.entity");
// Sample captions for different content types
var videoCaptions = [
    'Just finished this amazing dance routine! 💃 #dance #dancevideo #trending',
    'Quick tutorial on my art process 🎨 #art #tutorial #creative',
    'Behind the scenes of my latest photoshoot 📸 #photography #bts #photoshoot',
    'Cooking my favorite recipe 🍳 #cooking #foodie #recipe',
    'Workout routine for beginners 💪 #fitness #workout #health',
    'Gaming highlights from last night 🎮 #gaming #gameplay #streaming',
    'Travel vlog from my recent trip ✈️ #travel #vlog #adventure',
    'Music cover of a popular song 🎵 #music #cover #singing',
    'Comedy skit that will make you laugh 😂 #comedy #funny #skit',
    'Fashion haul and styling tips 👗 #fashion #style #haul',
];
var imageCaptions = [
    'Golden hour shots never disappoint 🌅 #photography #goldenhour #nature',
    'My latest artwork - what do you think? 🎨 #art #digitalart #illustration',
    'Street style inspiration 👟 #fashion #streetstyle #ootd',
    'Minimalist design concept 🖼️ #design #minimalism #graphics',
    'Food photography at its finest 🍕 #foodphotography #foodie #delicious',
    'Architecture that inspires 🏢 #architecture #design #urban',
    'Portrait session results ✨ #portrait #photography #model',
    'Branding project showcase 💼 #branding #graphicdesign #logo',
    'Nature photography from the mountains ⛰️ #nature #landscape #hiking',
    'Product photography for my latest collection 📦 #product #ecommerce #photography',
];
var audioCaptions = [
    'New beat I just produced 🎹 #music #producer #beats',
    'Podcast episode about creativity 🎙️ #podcast #creativity #inspiration',
    'Acoustic guitar session 🎸 #guitar #acoustic #music',
    'Electronic music mix 🎧 #edm #dj #electronic',
    'Vocal warm-up exercises 🎤 #singing #vocal #music',
    'Sound design for video games 🎮 #sounddesign #gameaudio #music',
    'Jazz improvisation session 🎺 #jazz #music #improvisation',
    'Voice over demo reel 🗣️ #voiceover #voice #audio',
    'Lo-fi beats to study to 📚 #lofi #beats #study',
    'Piano composition I wrote 🎹 #piano #composition #classical',
];
var textCaptions = [
    'Thoughts on creative entrepreneurship 💭 #entrepreneur #creativity #business',
    'Writing tips for beginners ✍️ #writing #tips #author',
    'My journey as a freelancer 🚀 #freelance #journey #success',
    'Poetry about love and loss 💔 #poetry #writing #love',
    'Blog post about productivity hacks ⏰ #productivity #tips #life',
    'Short story I wrote today 📖 #shortstory #writing #fiction',
    'Personal reflections on growth 🌱 #growth #personal #development',
    'Tech review and recommendations 💻 #tech #review #gadgets',
    'Marketing strategies that work 📊 #marketing #strategy #business',
    'Life lessons learned this year 🎓 #life #lessons #wisdom',
];
// Sample hashtags for different categories
var hashtags = {
    dance: ['dance', 'dancing', 'choreography', 'dancer', 'movement'],
    art: ['art', 'artist', 'artwork', 'creative', 'painting', 'drawing'],
    music: ['music', 'musician', 'producer', 'beats', 'audio'],
    photography: ['photography', 'photographer', 'photo', 'camera', 'portrait'],
    fashion: ['fashion', 'style', 'ootd', 'fashionista', 'clothing'],
    fitness: ['fitness', 'workout', 'health', 'gym', 'exercise'],
    food: ['food', 'foodie', 'cooking', 'recipe', 'chef'],
    gaming: ['gaming', 'gamer', 'gameplay', 'streaming', 'esports'],
    travel: ['travel', 'wanderlust', 'adventure', 'explore', 'vacation'],
    comedy: ['comedy', 'funny', 'humor', 'laugh', 'comedian'],
    design: ['design', 'designer', 'graphicdesign', 'branding', 'creative'],
    technology: ['tech', 'technology', 'innovation', 'gadgets', 'digital'],
};
// Sample Cloudinary URLs (placeholder URLs that follow typical patterns)
var sampleUrls = {
    image: [
        'https://res.cloudinary.com/demo/image/upload/v1/sample1.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1/sample2.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1/sample3.jpg',
        'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba',
        'https://images.unsplash.com/photo-1682687221038-404cb8830901',
    ],
    video: [
        'https://res.cloudinary.com/demo/video/upload/v1/sample-video1.mp4',
        'https://res.cloudinary.com/demo/video/upload/v1/sample-video2.mp4',
        'https://res.cloudinary.com/demo/video/upload/v1/sample-video3.mp4',
    ],
    audio: [
        'https://res.cloudinary.com/demo/video/upload/v1/sample-audio1.mp3',
        'https://res.cloudinary.com/demo/video/upload/v1/sample-audio2.mp3',
        'https://res.cloudinary.com/demo/video/upload/v1/sample-audio3.mp3',
    ],
};
function seedContent() {
    return __awaiter(this, void 0, void 0, function () {
        var app, dataSource, userRepository, contentRepository, users, contentTypes, categories, contentCount, i, contentType, randomUser, caption, selectedHashtags, randomCategory, mediaUrl, thumbnailUrl, urls, likeCount, viewCount, commentCount, shareCount, content, imageCnt, videoCnt, audioCnt, textCnt, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, core_1.NestFactory.createApplicationContext(app_module_1.AppModule)];
                case 1:
                    app = _a.sent();
                    dataSource = app.get(typeorm_1.DataSource);
                    console.log('🌱 Starting content seeding...');
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 14, 15, 17]);
                    userRepository = dataSource.getRepository(user_entity_1.User);
                    contentRepository = dataSource.getRepository(content_entity_1.Content);
                    return [4 /*yield*/, userRepository.find({ where: { isActive: true } })];
                case 3:
                    users = _a.sent();
                    if (!(users.length === 0)) return [3 /*break*/, 5];
                    console.error('❌ No users found! Please create users first.');
                    return [4 /*yield*/, app.close()];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
                case 5:
                    console.log("\uD83D\uDCCA Found ".concat(users.length, " users"));
                    contentTypes = ['image', 'video', 'audio', 'text'];
                    categories = Object.keys(hashtags);
                    contentCount = 0;
                    i = 0;
                    _a.label = 6;
                case 6:
                    if (!(i < 100)) return [3 /*break*/, 9];
                    contentType = contentTypes[i % contentTypes.length];
                    randomUser = users[Math.floor(Math.random() * users.length)];
                    caption = '';
                    selectedHashtags = [];
                    randomCategory = categories[Math.floor(Math.random() * categories.length)];
                    switch (contentType) {
                        case 'video':
                            caption = videoCaptions[Math.floor(Math.random() * videoCaptions.length)];
                            break;
                        case 'image':
                            caption = imageCaptions[Math.floor(Math.random() * imageCaptions.length)];
                            break;
                        case 'audio':
                            caption = audioCaptions[Math.floor(Math.random() * audioCaptions.length)];
                            break;
                        case 'text':
                            caption = textCaptions[Math.floor(Math.random() * textCaptions.length)];
                            break;
                    }
                    // Add category hashtags
                    selectedHashtags = hashtags[randomCategory].slice(0, 3 + Math.floor(Math.random() * 3));
                    mediaUrl = '';
                    thumbnailUrl = '';
                    if (contentType !== 'text') {
                        urls = sampleUrls[contentType];
                        mediaUrl = urls[Math.floor(Math.random() * urls.length)];
                        if (contentType === 'video') {
                            // For videos, use an image as thumbnail
                            thumbnailUrl = sampleUrls.image[Math.floor(Math.random() * sampleUrls.image.length)];
                        }
                        else {
                            thumbnailUrl = mediaUrl;
                        }
                    }
                    else {
                        // For text posts, no media URL needed
                        mediaUrl = '';
                        thumbnailUrl = '';
                    }
                    likeCount = Math.floor(Math.random() * 500);
                    viewCount = Math.floor(Math.random() * 2000) + likeCount;
                    commentCount = Math.floor(Math.random() * 50);
                    shareCount = Math.floor(Math.random() * 30);
                    content = contentRepository.create({
                        userId: randomUser.id,
                        contentType: contentType,
                        mediaUrl: mediaUrl || null,
                        thumbnailUrl: thumbnailUrl || null,
                        caption: caption,
                        hashtags: selectedHashtags,
                        likeCount: likeCount,
                        viewCount: viewCount,
                        commentCount: commentCount,
                        shareCount: shareCount,
                        isActive: true,
                    });
                    return [4 /*yield*/, contentRepository.save(content)];
                case 7:
                    _a.sent();
                    contentCount++;
                    if (contentCount % 10 === 0) {
                        console.log("\u2705 Created ".concat(contentCount, " content items..."));
                    }
                    _a.label = 8;
                case 8:
                    i++;
                    return [3 /*break*/, 6];
                case 9:
                    console.log("\uD83C\uDF89 Successfully seeded ".concat(contentCount, " content items!"));
                    // Display summary
                    console.log('\n📈 Content Summary:');
                    return [4 /*yield*/, contentRepository.count({ where: { contentType: 'image' } })];
                case 10:
                    imageCnt = _a.sent();
                    return [4 /*yield*/, contentRepository.count({ where: { contentType: 'video' } })];
                case 11:
                    videoCnt = _a.sent();
                    return [4 /*yield*/, contentRepository.count({ where: { contentType: 'audio' } })];
                case 12:
                    audioCnt = _a.sent();
                    return [4 /*yield*/, contentRepository.count({ where: { contentType: 'text' } })];
                case 13:
                    textCnt = _a.sent();
                    console.log("  - Images: ".concat(imageCnt));
                    console.log("  - Videos: ".concat(videoCnt));
                    console.log("  - Audio: ".concat(audioCnt));
                    console.log("  - Text: ".concat(textCnt));
                    console.log("  - Total: ".concat(imageCnt + videoCnt + audioCnt + textCnt));
                    return [3 /*break*/, 17];
                case 14:
                    error_1 = _a.sent();
                    console.error('❌ Error seeding content:', error_1);
                    return [3 /*break*/, 17];
                case 15: return [4 /*yield*/, app.close()];
                case 16:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 17: return [2 /*return*/];
            }
        });
    });
}
seedContent();
