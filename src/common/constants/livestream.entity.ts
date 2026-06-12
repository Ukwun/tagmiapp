import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('livestreams')
export class Livestream {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  hostId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'hostId' })
  host: User;

  @Column({ default: 'scheduled' }) // scheduled, live, ended
  status: string;

  @Column({ default: false })
  isScreenSharing: boolean;

  @Column({ nullable: true })
  activePresentationUrl: string; // URL to the PDF being presented

  @Column({ default: 1 })
  currentPdfPage: number;

  @Column({ unique: true })
  roomName: string; // The WebRTC room identifier

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}