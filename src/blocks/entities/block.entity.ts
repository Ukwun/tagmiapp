import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from "typeorm"
import { User } from "../../users/entities/user.entity"

@Entity("blocks")
@Unique(["blockerId", "blockedId"])
export class Block {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  blockerId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: "blockerId" })
  blocker: User

  @Column()
  blockedId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: "blockedId" })
  blocked: User

  @CreateDateColumn()
  createdAt: Date
}
