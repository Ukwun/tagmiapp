import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DataSource } from 'typeorm'
import { User } from './users/entities/user.entity'
import { Content } from './content/entities/content.entity'

// Sample captions for different content types
const videoCaptions = [
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
]

const imageCaptions = [
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
]

const audioCaptions = [
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
]

const textCaptions = [
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
]

// Sample hashtags for different categories
const hashtags = {
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
}

// Sample Cloudinary URLs (placeholder URLs that follow typical patterns)
const sampleUrls = {
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
}

async function seedContent() {
  const app = await NestFactory.createApplicationContext(AppModule)
  const dataSource = app.get(DataSource)

  console.log('🌱 Starting content seeding...')

  try {
    // Get all users to distribute content among them
    const userRepository = dataSource.getRepository(User)
    const contentRepository = dataSource.getRepository(Content)

    const users = await userRepository.find({ where: { isActive: true } })

    if (users.length === 0) {
      console.error('❌ No users found! Please create users first.')
      await app.close()
      return
    }

    console.log(`📊 Found ${users.length} users`)

    const contentTypes: ('image' | 'video' | 'audio' | 'text')[] = ['image', 'video', 'audio', 'text']
    const categories = Object.keys(hashtags)
    let contentCount = 0

    // Create 100 pieces of content
    for (let i = 0; i < 100; i++) {
      // Randomly select content type
      const contentType = contentTypes[i % contentTypes.length]

      // Randomly select a user
      const randomUser = users[Math.floor(Math.random() * users.length)]

      // Select caption based on content type
      let caption = ''
      let selectedHashtags: string[] = []
      const randomCategory = categories[Math.floor(Math.random() * categories.length)]

      switch (contentType) {
        case 'video':
          caption = videoCaptions[Math.floor(Math.random() * videoCaptions.length)]
          break
        case 'image':
          caption = imageCaptions[Math.floor(Math.random() * imageCaptions.length)]
          break
        case 'audio':
          caption = audioCaptions[Math.floor(Math.random() * audioCaptions.length)]
          break
        case 'text':
          caption = textCaptions[Math.floor(Math.random() * textCaptions.length)]
          break
      }

      // Add category hashtags
      selectedHashtags = hashtags[randomCategory].slice(0, 3 + Math.floor(Math.random() * 3))

      // Select media URL based on content type
      let mediaUrl = ''
      let thumbnailUrl = ''

      if (contentType !== 'text') {
        const urls = sampleUrls[contentType]
        mediaUrl = urls[Math.floor(Math.random() * urls.length)]

        if (contentType === 'video') {
          // For videos, use an image as thumbnail
          thumbnailUrl = sampleUrls.image[Math.floor(Math.random() * sampleUrls.image.length)]
        } else {
          thumbnailUrl = mediaUrl
        }
      } else {
        // For text posts, no media URL needed
        mediaUrl = ''
        thumbnailUrl = ''
      }

      // Simulate random engagement
      const likeCount = Math.floor(Math.random() * 500)
      const viewCount = Math.floor(Math.random() * 2000) + likeCount
      const commentCount = Math.floor(Math.random() * 50)
      const shareCount = Math.floor(Math.random() * 30)

      // Create content using raw repository to bypass file upload requirement
      const content = contentRepository.create({
        userId: randomUser.id,
        contentType,
        mediaUrl: mediaUrl || null,
        thumbnailUrl: thumbnailUrl || null,
        caption,
        hashtags: selectedHashtags,
        likeCount,
        viewCount,
        commentCount,
        shareCount,
        isActive: true,
      })

      await contentRepository.save(content)
      contentCount++

      if (contentCount % 10 === 0) {
        console.log(`✅ Created ${contentCount} content items...`)
      }
    }

    console.log(`🎉 Successfully seeded ${contentCount} content items!`)

    // Display summary
    console.log('\n📈 Content Summary:')
    const imageCnt = await contentRepository.count({ where: { contentType: 'image' } })
    const videoCnt = await contentRepository.count({ where: { contentType: 'video' } })
    const audioCnt = await contentRepository.count({ where: { contentType: 'audio' } })
    const textCnt = await contentRepository.count({ where: { contentType: 'text' } })

    console.log(`  - Images: ${imageCnt}`)
    console.log(`  - Videos: ${videoCnt}`)
    console.log(`  - Audio: ${audioCnt}`)
    console.log(`  - Text: ${textCnt}`)
    console.log(`  - Total: ${imageCnt + videoCnt + audioCnt + textCnt}`)

  } catch (error) {
    console.error('❌ Error seeding content:', error)
  } finally {
    await app.close()
  }
}

seedContent()