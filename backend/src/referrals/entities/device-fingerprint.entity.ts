import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm"
import { User } from "../../users/entities/user.entity"

@Entity("device_fingerprints")
@Index(["fingerprintHash"])
@Index(["userId"])
export class DeviceFingerprint {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid" })
  userId: string

  @Column()
  fingerprintHash: string

  @Column({ nullable: true })
  ip: string

  @Column({ nullable: true })
  ipSubnet: string

  @Column({ type: "simple-json", nullable: true })
  components: Record<string, any>

  @Column({ nullable: true })
  userAgent: string

  @Column({ nullable: true })
  timezone: string

  @Column({ nullable: true })
  screenResolution: string

  @Column({ nullable: true })
  language: string

  @Column({ default: false })
  isVpn: boolean

  @Column({ default: false })
  isProxy: boolean

  @Column({ default: false })
  isDatacenter: boolean

  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User
}


