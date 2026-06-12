import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from "typeorm"
import { Exclude } from "class-transformer"
import { Content } from "../../content/entities/content.entity"
import { TalentProfile } from "./talent-profile.entity"

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  email: string

  @Column({ unique: true })
  username: string

  @Column({ nullable: true })
  displayName: string

  @Exclude()
  @Column()
  passwordHash: string

  @Column({
    type: "enum",
    enum: ["talent", "client", "manager"],
    default: "client",
  })
  role: "talent" | "client" | "manager"

  @Column({ type: "timestamp", nullable: true })
  lastLogin: Date

  @Column({ nullable: true })
  avatarUrl: string

  @Column({ nullable: true })
  coverImageUrl: string

  @Column({ type: "text", nullable: true })
  bio: string

  // Male, Female, Non-binary, or Prefer not to say.
  // Null means the user has not set a gender yet.
  @Column({ nullable: true })
  gender: string

  // Used for age calculation and birthday features (e.g. birthday rewards).
  // Stored as a date, displayed as age or formatted date on the frontend.
  @Column({ type: "date", nullable: true })
  dateOfBirth: Date

  // Free-text city/country, e.g. "Lagos, Nigeria".
  // Lives on the main User entity so both talents and clients can set it.
  @Column({ nullable: true })
  location: string

  @Column({ type: "simple-array", nullable: true })
  interests: string[]

  @Column({ default: 0 })
  followersCount: number

  @Column({ default: 0 })
  followingCount: number

  @Column({ default: 0 })
  postCount: number

  @Column({ default: false })
  isVerified: boolean

  @Column({ default: true })
  isActive: boolean

  @Column({ type: "uuid", nullable: true })
  referredBy: string

  @Exclude()
  @Column({ nullable: true })
  phoneHash: string

  @Column({ default: 0 })
  validReferralCount: number

  @Column({ default: 1 })
  referralLevel: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(
    () => Content,
    (content) => content.user,
  )
  content: Content[]

  @OneToOne(() => TalentProfile, (tp) => tp.user)
  talentProfile: TalentProfile
}
