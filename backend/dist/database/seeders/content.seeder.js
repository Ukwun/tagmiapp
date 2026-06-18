"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedContent = seedContent;
const user_entity_1 = require("../../users/entities/user.entity");
const content_entity_1 = require("../../content/entities/content.entity");
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
    "Creating magic with my team today ✨",
    "New skills unlocked! 🎯",
    "Blessed to work with amazing clients 🙏",
    "Innovation meets creativity 🎨",
    "Another day, another masterpiece 🖼️",
    "Teamwork makes the dream work 👥",
    "Elevating the craft daily 📈",
    "Inspired and ready to create 💫",
    "This project has my heart 💙",
    "Making moves and breaking barriers 🏆",
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
const IMAGE_URLS = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
    "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4",
    "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6",
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
    "https://images.unsplash.com/photo-1509967419530-da38b4704bc6",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04",
    "https://images.unsplash.com/photo-1519345182560-3f2917c472ef",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd6",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6",
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c",
    "https://images.unsplash.com/photo-1485968579580-b6d095142e6e",
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c",
    "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b",
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f",
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
    "https://images.unsplash.com/photo-1511367461989-f85a21fda167",
    "https://images.unsplash.com/photo-1456086272160-b28b0645b729",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29",
    "https://images.unsplash.com/photo-1444723121867-7a241cacace9",
    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000",
    "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f",
    "https://images.unsplash.com/photo-1550439062-609e1531270e",
    "https://images.unsplash.com/photo-1496024840928-4c417adf211d",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
    "https://images.unsplash.com/photo-1518770660439-4636190af475",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd",
    "https://images.unsplash.com/photo-1537884944318-390069bb8665",
    "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745",
    "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae",
    "https://images.unsplash.com/photo-1459749411175-04bf5292ceea",
    "https://images.unsplash.com/photo-1510915361894-db8b60106cb1",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
    "https://images.unsplash.com/photo-1506157786151-b8491531f063",
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a",
    "https://images.unsplash.com/photo-1511192336575-5a79af67a629",
    "https://images.unsplash.com/photo-1519683109079-d5f539e1542f",
    "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea",
    "https://images.unsplash.com/photo-1518834107812-67b0b7c58434",
    "https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff",
    "https://images.unsplash.com/photo-1524594152303-9fd13543fe6e",
    "https://images.unsplash.com/photo-1504609813442-a8924e83f76e",
    "https://images.unsplash.com/photo-1518611012118-696072aa579a",
    "https://images.unsplash.com/photo-1536623975707-c4b3b2af565d",
    "https://images.unsplash.com/photo-1547153760-18fc9498041f",
    "https://images.unsplash.com/photo-1505455184862-554165e5f6ba",
    "https://images.unsplash.com/photo-1483721310020-03333e577078",
];
const VIDEO_URLS = [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
    "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4",
    "https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4",
    "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4",
    "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
    "https://www.w3schools.com/html/mov_bbb.mp4",
    "https://filesamples.com/samples/video/mp4/sample_640x360.mp4",
    "https://filesamples.com/samples/video/mp4/sample_960x540.mp4",
];
const AUDIO_URLS = [
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
    "https://filesamples.com/samples/audio/mp3/sample1.mp3",
    "https://filesamples.com/samples/audio/mp3/sample2.mp3",
    "https://filesamples.com/samples/audio/mp3/sample3.mp3",
    "https://filesamples.com/samples/audio/mp3/sample4.mp3",
];
const BACKGROUND_COLORS = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8",
    "#F7DC6F", "#BB8FCE", "#85C1E2", "#F8B88B", "#FAD7A0",
];
const TEXT_CONTENTS = [
    "Every masterpiece starts with a single brushstroke",
    "Dream big, work hard, stay focused",
    "Creativity is intelligence having fun",
    "The only way to do great work is to love what you do",
    "Art is not what you see, but what you make others see",
    "Success is the sum of small efforts repeated day in and day out",
    "Innovation distinguishes between a leader and a follower",
    "The future belongs to those who believe in the beauty of their dreams",
    "Your vibe attracts your tribe",
    "Create with passion, deliver with excellence",
];
async function seedContent(dataSource, userMap) {
    const contentRepository = dataSource.getRepository(content_entity_1.Content);
    const userRepository = dataSource.getRepository(user_entity_1.User);
    const allContent = [];
    const users = Array.from(userMap.values());
    for (const user of users) {
        console.log(`\n📝 Creating content for ${user.username}...`);
        for (let i = 0; i < 20; i++) {
            const rand = Math.random();
            let contentType;
            let mediaUrl = null;
            let thumbnailUrl = null;
            let backgroundColor = null;
            let textContent = null;
            let duration = null;
            if (rand < 0.6) {
                contentType = "image";
                const imgIndex = Math.floor(Math.random() * IMAGE_URLS.length);
                mediaUrl = `${IMAGE_URLS[imgIndex]}?w=1080&h=1920&fit=crop`;
                thumbnailUrl = `${IMAGE_URLS[imgIndex]}?w=400&h=600&fit=crop`;
            }
            else if (rand < 0.85) {
                contentType = "video";
                const vidIndex = Math.floor(Math.random() * VIDEO_URLS.length);
                mediaUrl = VIDEO_URLS[vidIndex];
                thumbnailUrl = `${IMAGE_URLS[Math.floor(Math.random() * IMAGE_URLS.length)]}?w=400&h=600&fit=crop`;
                duration = Math.floor(Math.random() * 50) + 10;
            }
            else if (rand < 0.95) {
                contentType = "audio";
                const audioIndex = Math.floor(Math.random() * AUDIO_URLS.length);
                mediaUrl = AUDIO_URLS[audioIndex];
                thumbnailUrl = `${IMAGE_URLS[Math.floor(Math.random() * IMAGE_URLS.length)]}?w=400&h=600&fit=crop`;
                duration = Math.floor(Math.random() * 180) + 60;
            }
            else {
                contentType = "text";
                backgroundColor = BACKGROUND_COLORS[Math.floor(Math.random() * BACKGROUND_COLORS.length)];
                textContent = TEXT_CONTENTS[Math.floor(Math.random() * TEXT_CONTENTS.length)];
            }
            const caption = CAPTIONS[Math.floor(Math.random() * CAPTIONS.length)];
            const hashtags = HASHTAG_SETS[Math.floor(Math.random() * HASHTAG_SETS.length)];
            const viewCount = Math.floor(Math.random() * 10000) + 100;
            const likeCount = Math.floor(Math.random() * (viewCount * 0.3));
            const commentCount = Math.floor(Math.random() * (likeCount * 0.2));
            const shareCount = Math.floor(Math.random() * (likeCount * 0.1));
            const daysAgo = Math.floor(Math.random() * 30);
            const createdAt = new Date();
            createdAt.setDate(createdAt.getDate() - daysAgo);
            const content = contentRepository.create({
                userId: user.id,
                contentType,
                mediaUrl,
                thumbnailUrl,
                caption,
                backgroundColor,
                hashtags,
                duration,
                viewCount,
                likeCount,
                commentCount,
                shareCount,
                isActive: true,
                createdAt,
                updatedAt: createdAt,
            });
            const savedContent = await contentRepository.save(content);
            allContent.push(savedContent);
            user.postCount += 1;
        }
        await userRepository.save(user);
        console.log(`✅ Created 20 posts for ${user.username}`);
    }
    console.log(`\n🎉 Total content created: ${allContent.length}`);
    return allContent;
}
//# sourceMappingURL=content.seeder.js.map