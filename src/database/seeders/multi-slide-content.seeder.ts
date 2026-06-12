import { DataSource } from "typeorm"
import { User } from "../../users/entities/user.entity"
import { Content } from "../../content/entities/content.entity"

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
]

const HASHTAG_SETS = [
  ["photography", "art", "creative"],
  ["videography", "filmmaker", "content"],
  ["design", "branding", "graphicdesign"],
  ["music", "producer", "afrobeats"],
  ["writing", "copywriting", "content"],
]

// Real high-quality Unsplash images (60 images)
const IMAGE_URLS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1542190891-2093d38760f2?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1546456073-92b9f0a8d413?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1530268729831-4b0b9e170218?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1541271696563-3be2f555fc4e?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1463453091185-61582044d556?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1508243771214-6e95d137426b?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1518577915332-c2a19f149a75?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1549351236-caca0f174515?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1560424865-0ebf3edf1fa0?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1601412436009-d964bd02edbc?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1616091216791-a5360b5fc78a?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1618641986557-1ecd230959aa?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1475823678248-624fc6f85785?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1485178575877-1a13bf489dfe?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1523438097201-512ae7d59c44?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1528991435120-e73e05a58897?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1548142813-c348350df52b?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1080&h=1920&fit=crop&q=80",
  "https://images.unsplash.com/photo-1619975179420-0e7cae29c7e2?w=1080&h=1920&fit=crop&q=80",
]

// Real video URLs (20 videos)
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
  "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4",
  "https://storage.googleapis.com/coverr-main/mp4/Footboys.mp4",
  "https://storage.googleapis.com/coverr-main/mp4/Typing.mp4",
  "https://storage.googleapis.com/coverr-main/mp4/Canoe.mp4",
  "https://storage.googleapis.com/coverr-main/mp4/Hacking.mp4",
  "https://storage.googleapis.com/coverr-main/mp4/Camping.mp4",
  "https://storage.googleapis.com/coverr-main/mp4/Cocktail.mp4",
]

// Background music URLs (20 audio files)
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
  "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3",
  "https://cdn.pixabay.com/audio/2022/03/10/audio_4e3f4b524e.mp3",
  "https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c7443c.mp3",
  "https://cdn.pixabay.com/audio/2022/01/18/audio_bb630cc098.mp3",
]

// Background colors for text posts
const BG_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8",
  "#F7DC6F", "#BB8FCE", "#85C1E2", "#F8B195", "#C06C84",
]

export async function seedMultiSlideContent(dataSource: DataSource, users: User[]): Promise<Content[]> {
  const contentRepository = dataSource.getRepository(Content)
  const userRepository = dataSource.getRepository(User)

  const allContent: Content[] = []

  console.log("\n📸 Creating multi-slide posts...")

  for (const user of users) {
    console.log(`\n📝 Creating 20 posts for ${user.username}...`)

    // Define post distribution: 12 image, 5 video, 3 text
    const postTypes = [
      ...Array(12).fill("image"),
      ...Array(5).fill("video"),
      ...Array(3).fill("text"),
    ]

    // Shuffle the post types for variety
    postTypes.sort(() => Math.random() - 0.5)

    // Create 20 posts per user
    for (let postNum = 0; postNum < 20; postNum++) {
      const postType = postTypes[postNum]
      const numSlides = postType === "text" ? 1 : Math.floor(Math.random() * 4) + 2 // text=1, others=2-5
      const caption = CAPTIONS[Math.floor(Math.random() * CAPTIONS.length)]
      const hashtags = HASHTAG_SETS[Math.floor(Math.random() * HASHTAG_SETS.length)]

      const daysAgo = Math.floor(Math.random() * 30)
      const createdAt = new Date()
      createdAt.setDate(createdAt.getDate() - daysAgo)

      // Generate a unique postId for this post
      const postId = `${user.id}-post-${postNum}`

      // Randomly add background music to image and text posts (50% chance)
      const shouldHaveMusic = (postType === "image" || postType === "text") && Math.random() > 0.5
      const backgroundMusicUrl = shouldHaveMusic
        ? AUDIO_URLS[Math.floor(Math.random() * AUDIO_URLS.length)]
        : null

      // Create slides for this post
      for (let slideNum = 0; slideNum < numSlides; slideNum++) {
        let mediaUrl: string | null = null
        let thumbnailUrl: string | null = null
        let contentType: "image" | "video" | "text" = postType as any
        let backgroundColor: string | null = null
        let duration: number | null = null

        if (postType === "image") {
          const imgIndex = Math.floor(Math.random() * IMAGE_URLS.length)
          mediaUrl = IMAGE_URLS[imgIndex]
          thumbnailUrl = mediaUrl.replace("w=1080&h=1920", "w=400&h=600")
        } else if (postType === "video") {
          const vidIndex = Math.floor(Math.random() * VIDEO_URLS.length)
          mediaUrl = VIDEO_URLS[vidIndex]
          thumbnailUrl = null // Will be generated server-side
          duration = Math.floor(Math.random() * 60) + 15 // 15-75 seconds
        } else if (postType === "text") {
          mediaUrl = null
          backgroundColor = BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)]
        }

        const content = contentRepository.create({
          userId: user.id,
          postId, // All slides share the same postId
          sortOrder: slideNum, // 0, 1, 2, 3...
          contentType,
          mediaUrl,
          thumbnailUrl,
          backgroundColor,
          duration,
          backgroundMusicUrl: slideNum === 0 ? backgroundMusicUrl : null, // Only first slide has music
          // Only first slide has caption and hashtags
          caption: slideNum === 0 ? caption : null,
          hashtags: slideNum === 0 ? hashtags : [],
          isSplitVideo: false,
          viewCount: slideNum === 0 ? Math.floor(Math.random() * 10000) + 100 : 0,
          likeCount: 0,
          commentCount: 0,
          shareCount: 0,
          isActive: true,
          createdAt,
          updatedAt: createdAt,
        })

        const savedContent = await contentRepository.save(content)
        allContent.push(savedContent)
      }

      // Update user post count
      user.postCount += 1
    }

    await userRepository.save(user)
    console.log(`✅ Created 20 posts (12 image, 5 video, 3 text) for ${user.username}`)
  }

  console.log(`\n🎉 Total slides created: ${allContent.length}`)
  return allContent
}
