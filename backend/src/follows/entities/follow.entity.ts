import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Check,
} from "typeorm"
import { User } from "../../users/entities/user.entity"

@Entity("follows")
@Unique(["followerId", "followingId"])
@Check(`"followerId" != "followingId"`)
export class Follow {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  followerId: string

  @Column("uuid")
  followingId: string

  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(() => User)
  @JoinColumn({ name: "followerId" })
  follower: User

  @ManyToOne(() => User)
  @JoinColumn({ name: "followingId" })
  following: User
}