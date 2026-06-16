import { DataSource } from "typeorm"
import * as bcrypt from "bcryptjs"
import { User } from "../../users/entities/user.entity"
import { TalentProfile } from "../../users/entities/talent-profile.entity"

export interface SeededUser {
  email: string
  password: string
  username: string
  displayName: string
  role: "talent" | "client"
}

export const SEEDED_USERS: SeededUser[] = [
  {
    email: "sarah.johnson@yopmail.com",
    password: "TalentHub2024!",
    username: "sarah_creates",
    displayName: "Sarah Johnson",
    role: "talent",
  },
  {
    email: "mike.williams@yopmail.com",
    password: "TalentHub2024!",
    username: "mike_photo",
    displayName: "Mike Williams",
    role: "talent",
  },
  {
    email: "emma.davis@yopmail.com",
    password: "TalentHub2024!",
    username: "emma_designs",
    displayName: "Emma Davis",
    role: "talent",
  },
  {
    email: "james.miller@yopmail.com",
    password: "TalentHub2024!",
    username: "james_music",
    displayName: "James Miller",
    role: "talent",
  },
  {
    email: "olivia.brown@yopmail.com",
    password: "TalentHub2024!",
    username: "olivia_writes",
    displayName: "Olivia Brown",
    role: "talent",
  },
  {
    email: "noah.garcia@yopmail.com",
    password: "TalentHub2024!",
    username: "noah_films",
    displayName: "Noah Garcia",
    role: "talent",
  },
  {
    email: "ava.martinez@yopmail.com",
    password: "TalentHub2024!",
    username: "ava_dances",
    displayName: "Ava Martinez",
    role: "talent",
  },
  {
    email: "liam.rodriguez@yopmail.com",
    password: "TalentHub2024!",
    username: "liam_codes",
    displayName: "Liam Rodriguez",
    role: "talent",
  },
  {
    email: "sophia.wilson@yopmail.com",
    password: "TalentHub2024!",
    username: "sophia_models",
    displayName: "Sophia Wilson",
    role: "talent",
  },
  {
    email: "jackson.lee@yopmail.com",
    password: "TalentHub2024!",
    username: "jackson_voice",
    displayName: "Jackson Lee",
    role: "talent",
  },
]

const TALENT_PROFILES = [
  {
    bio: "Professional content creator specializing in lifestyle and fashion photography. Based in Lagos.",
    location: "Lagos, Nigeria",
    skills: ["Photography", "Content Creation", "Social Media", "Brand Partnerships"],
    categories: ["Photography", "Fashion", "Lifestyle"],
    hourlyRate: 50000,
    languages: ["English", "Yoruba"],
    portfolioUrl: "https://sarahcreates.com",
    availabilityStatus: "available" as const,
    rating: 4.8,
    totalBookings: 45,
    services: [
      { name: "Photo Shoot", description: "1-hour professional photo session", price: 50000 },
      { name: "Content Package", description: "5 edited photos for social media", price: 35000 },
      { name: "Brand Campaign", description: "Full-day shoot with 20+ edited images", price: 150000 },
    ],
  },
  {
    bio: "Award-winning photographer with 10+ years experience in commercial and portrait photography.",
    location: "Abuja, Nigeria",
    skills: ["Photography", "Photo Editing", "Studio Lighting", "Portrait Photography"],
    categories: ["Photography", "Commercial", "Portraits"],
    hourlyRate: 75000,
    languages: ["English"],
    portfolioUrl: "https://mikephoto.com",
    availabilityStatus: "available" as const,
    rating: 4.9,
    totalBookings: 78,
    services: [
      { name: "Portrait Session", description: "1-hour studio portrait session", price: 75000 },
      { name: "Commercial Shoot", description: "Half-day commercial photography", price: 200000 },
      { name: "Event Coverage", description: "Full event photography coverage", price: 300000 },
    ],
  },
  {
    bio: "Creative graphic designer and illustrator. I bring brands to life through visual storytelling.",
    location: "Lagos, Nigeria",
    skills: ["Graphic Design", "Illustration", "Branding", "UI/UX Design"],
    categories: ["Design", "Branding", "Illustration"],
    hourlyRate: 40000,
    languages: ["English", "French"],
    portfolioUrl: "https://emmadesigns.com",
    availabilityStatus: "busy" as const,
    rating: 4.7,
    totalBookings: 62,
    services: [
      { name: "Logo Design", description: "Custom logo with 3 revisions", price: 80000 },
      { name: "Brand Identity", description: "Full brand kit: logo, colors, typography", price: 200000 },
      { name: "Social Media Kit", description: "10 branded social media templates", price: 50000 },
    ],
  },
  {
    bio: "Music producer and composer. Specializing in Afrobeats, Hip-hop, and cinematic soundtracks.",
    location: "Lagos, Nigeria",
    skills: ["Music Production", "Composition", "Sound Design", "Audio Engineering"],
    categories: ["Music", "Audio", "Production"],
    hourlyRate: 60000,
    languages: ["English", "Igbo"],
    portfolioUrl: "https://jamesmusic.com",
    availabilityStatus: "available" as const,
    rating: 4.9,
    totalBookings: 54,
    services: [
      { name: "Beat Production", description: "Custom beat/instrumental production", price: 60000 },
      { name: "Mixing & Mastering", description: "Professional mix and master for 1 track", price: 40000 },
      { name: "Full Track Production", description: "Complete song production from scratch", price: 150000 },
    ],
  },
  {
    bio: "Professional copywriter and content strategist. Crafting compelling stories for brands.",
    location: "Port Harcourt, Nigeria",
    skills: ["Copywriting", "Content Strategy", "SEO Writing", "Brand Voice"],
    categories: ["Writing", "Marketing", "Content"],
    hourlyRate: 35000,
    languages: ["English"],
    portfolioUrl: "https://oliviawrites.com",
    availabilityStatus: "available" as const,
    rating: 4.6,
    totalBookings: 38,
    services: [
      { name: "Blog Post", description: "1000-word SEO-optimized blog article", price: 25000 },
      { name: "Website Copy", description: "Full website copywriting (up to 5 pages)", price: 100000 },
      { name: "Content Strategy", description: "1-month content calendar and strategy", price: 70000 },
    ],
  },
  {
    bio: "Filmmaker and video editor. Creating cinematic content for brands and individuals.",
    location: "Lagos, Nigeria",
    skills: ["Videography", "Video Editing", "Color Grading", "Motion Graphics"],
    categories: ["Video", "Film", "Editing"],
    hourlyRate: 80000,
    languages: ["English", "Spanish"],
    portfolioUrl: "https://noahfilms.com",
    availabilityStatus: "available" as const,
    rating: 4.8,
    totalBookings: 66,
    services: [
      { name: "Short Film", description: "1-3 minute cinematic video", price: 150000 },
      { name: "Video Editing", description: "Professional editing for 1 video", price: 50000 },
      { name: "Music Video", description: "Full music video production", price: 300000 },
    ],
  },
  {
    bio: "Professional dancer and choreographer. Specializing in contemporary and Afro-fusion dance.",
    location: "Lagos, Nigeria",
    skills: ["Dance", "Choreography", "Performance", "Dance Instruction"],
    categories: ["Dance", "Performance", "Entertainment"],
    hourlyRate: 45000,
    languages: ["English", "Yoruba"],
    portfolioUrl: "https://avadances.com",
    availabilityStatus: "available" as const,
    rating: 4.7,
    totalBookings: 51,
    services: [
      { name: "Dance Class", description: "1-hour group or private dance class", price: 30000 },
      { name: "Choreography", description: "Custom choreography for events or videos", price: 80000 },
      { name: "Event Performance", description: "Live dance performance for events", price: 120000 },
    ],
  },
  {
    bio: "Full-stack developer and tech educator. Building digital solutions and teaching others to code.",
    location: "Abuja, Nigeria",
    skills: ["Web Development", "Mobile Apps", "Tech Education", "UI/UX"],
    categories: ["Technology", "Development", "Education"],
    hourlyRate: 70000,
    languages: ["English"],
    portfolioUrl: "https://liamcodes.com",
    availabilityStatus: "busy" as const,
    rating: 4.9,
    totalBookings: 42,
    services: [
      { name: "1-on-1 Mentoring", description: "1-hour coding mentorship session", price: 50000 },
      { name: "Code Review", description: "In-depth code review and feedback", price: 40000 },
      { name: "MVP Development", description: "Build a minimum viable product", price: 500000 },
    ],
  },
  {
    bio: "Fashion model and brand ambassador. Available for runway, editorial, and commercial shoots.",
    location: "Lagos, Nigeria",
    skills: ["Modeling", "Brand Ambassador", "Fashion", "Runway"],
    categories: ["Modeling", "Fashion", "Brand"],
    hourlyRate: 55000,
    languages: ["English", "French"],
    portfolioUrl: "https://sophiamodels.com",
    availabilityStatus: "available" as const,
    rating: 4.8,
    totalBookings: 72,
    services: [
      { name: "Photo Modeling", description: "1-hour modeling session for photoshoots", price: 55000 },
      { name: "Brand Ambassador", description: "Brand representation at events", price: 100000 },
      { name: "Runway Show", description: "Runway modeling for fashion shows", price: 80000 },
    ],
  },
  {
    bio: "Voice-over artist and podcast host. Lending my voice to commercials, animations, and audiobooks.",
    location: "Lagos, Nigeria",
    skills: ["Voice Over", "Podcasting", "Audio Narration", "Commercial Voice"],
    categories: ["Voice", "Audio", "Podcast"],
    hourlyRate: 40000,
    languages: ["English", "Hausa"],
    portfolioUrl: "https://jacksonvoice.com",
    availabilityStatus: "available" as const,
    rating: 4.7,
    totalBookings: 48,
    services: [
      { name: "Voice Over", description: "30-second to 1-minute voice recording", price: 25000 },
      { name: "Podcast Guest", description: "Guest appearance on your podcast", price: 40000 },
      { name: "Audiobook Narration", description: "Per-chapter audiobook narration", price: 60000 },
    ],
  },
]

const AVATAR_URLS = [
  "https://i.pravatar.cc/300?img=1",
  "https://i.pravatar.cc/300?img=2",
  "https://i.pravatar.cc/300?img=3",
  "https://i.pravatar.cc/300?img=4",
  "https://i.pravatar.cc/300?img=5",
  "https://i.pravatar.cc/300?img=6",
  "https://i.pravatar.cc/300?img=7",
  "https://i.pravatar.cc/300?img=8",
  "https://i.pravatar.cc/300?img=9",
  "https://i.pravatar.cc/300?img=10",
]

const COVER_URLS = [
  "https://images.unsplash.com/photo-1557683316-973673baf926",
  "https://images.unsplash.com/photo-1557682250-33bd709cbe85",
  "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809",
  "https://images.unsplash.com/photo-1579546929662-711aa81148cf",
  "https://images.unsplash.com/photo-1557683311-eac922347aa1",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
  "https://images.unsplash.com/photo-1558618666-d0a4a6d63e8e",
  "https://images.unsplash.com/photo-1558618666-6f32ceb819ea",
  "https://images.unsplash.com/photo-1558618666-ff4e02b0e2c1",
]

export async function seedUsers(dataSource: DataSource): Promise<Map<string, User>> {
  const userRepository = dataSource.getRepository(User)
  const talentProfileRepository = dataSource.getRepository(TalentProfile)

  const userMap = new Map<string, User>()

  for (let i = 0; i < SEEDED_USERS.length; i++) {
    const userData = SEEDED_USERS[i]
    const talentData = TALENT_PROFILES[i]

    // Check if user already exists
    let user = await userRepository.findOne({ where: { email: userData.email } })

    if (!user) {
      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 10)

      // Create user
      user = userRepository.create({
        email: userData.email,
        username: userData.username,
        displayName: userData.displayName,
        passwordHash,
        role: userData.role,
        bio: talentData.bio,
        avatarUrl: AVATAR_URLS[i],
        isVerified: Math.random() > 0.3, // 70% verified
        isActive: true,
        postCount: 0,
        followersCount: Math.floor(Math.random() * 5000) + 500,
        followingCount: Math.floor(Math.random() * 1000) + 100,
      })

      user = await userRepository.save(user)

      // Create talent profile if role is talent
      if (userData.role === "talent") {
        const talentProfile = talentProfileRepository.create({
          userId: user.id,
          ...talentData,
          profileImageUrl: AVATAR_URLS[i],
          coverImageUrl: COVER_URLS[i],
          followerCount: user.followersCount,
          followingCount: user.followingCount,
        })

        await talentProfileRepository.save(talentProfile)
      }

      console.log(`✅ Created user: ${user.username} (${user.email})`)
    } else {
      console.log(`⏭️  User already exists: ${user.username}`)
    }

    userMap.set(user.username, user)
  }

  return userMap
}
