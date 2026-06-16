import {
Entity,
PrimaryGeneratedColumn,
Column,
CreateDateColumn,
UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "../users/entities/user.entity";
import { LivestreamParticipant } from "./livestream.participant.entity";
import { LivestreamFile } from "./livestream.file.entity";

@Entity("livestreams")
export class Livestream {
@PrimaryGeneratedColumn("uuid")
id: string;

@Column({ nullable: true })
title: string;

@Column({ nullable: true })
description: string;

@Column({ nullable: true })
hostId: string;

@Column({ nullable: true })
roomName: string;

@Column({ default: "scheduled" })
status: string;

@Column({ default: false })
isScreenSharing: boolean;

@Column({ nullable: true })
activePresentationUrl: string;

@Column({ default: 1 })
currentPdfPage: number;

@Column({ nullable: true, type: "timestamp" })
startedAt: Date;

@Column({ nullable: true, type: "timestamp" })
endedAt: Date;

@CreateDateColumn()
createdAt: Date;

@UpdateDateColumn()
updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: "hostId" })
  host: User;

  @OneToMany(() => LivestreamParticipant, (p) => p.livestream)
  participants: LivestreamParticipant[];

  @OneToMany(() => LivestreamFile, (f) => f.livestream)
  files: LivestreamFile[];
}
