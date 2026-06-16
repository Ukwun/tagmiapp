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

@Entity("livestream_files")
export class LivestreamFile {
@PrimaryGeneratedColumn("uuid")
id: string;

@Column({ nullable: true })
livestreamId: string;

@Column({ nullable: true })
uploadedBy: string;

@Column({ nullable: true })
fileUrl: string;

@Column({ nullable: true })
fileName: string;

@Column({ nullable: true })
fileType: string;

@CreateDateColumn()
createdAt: Date;

  @ManyToOne(() => Livestream, (l) => l.files)
  @JoinColumn({ name: "livestreamId" })
  livestream: Livestream;

  @ManyToOne(() => User)
  @JoinColumn({ name: "uploadedBy" })
  user: User;
}
