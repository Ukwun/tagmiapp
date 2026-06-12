import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Livestream } from './livestream.entity';
import { User } from '../../users/entities/user.entity';

export enum LivestreamRole {
  HOST = 'HOST',
  PRESENTER = 'PRESENTER',
  PARTICIPANT = 'PARTICIPANT',
  MODERATOR = 'MODERATOR',
}

@Entity('livestream_participants')
export class LivestreamParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  livestreamId: string;

  @ManyToOne(() => Livestream)
  @JoinColumn({ name: 'livestreamId' })
  livestream: Livestream;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: LivestreamRole, default: LivestreamRole.PARTICIPANT })
  role: LivestreamRole;

  @CreateDateColumn()
  joinedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  leftAt: Date;
}