import {
Entity,
PrimaryGeneratedColumn,
Column,
CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Livestream } from "./livestream.entity";
import { User } from "../users/entities/user.entity";

export enum LivestreamRole {
HOST = "HOST",
PRESENTER = "PRESENTER",
PARTICIPANT = "PARTICIPANT",
}

@Entity("livestream_participants")
export class LivestreamParticipant {
@PrimaryGeneratedColumn("uuid")
id: string;

@Column()
livestreamId: string;

@Column()
userId: string;

@Column({
type: "simple-enum",
enum: LivestreamRole,
default: LivestreamRole.PARTICIPANT,
})
role: LivestreamRole;

@CreateDateColumn()
joinedAt: Date;

@Column({ nullable: true, type: "timestamp" })
leftAt: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  lastActiveAt: Date;

  @ManyToOne(() => Livestream, (l) => l.participants)
  @JoinColumn({ name: "livestreamId" })
  livestream: Livestream;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;
}

