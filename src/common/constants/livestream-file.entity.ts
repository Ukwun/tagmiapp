import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Livestream } from './livestream.entity';

@Entity('livestream_files')
export class LivestreamFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  livestreamId: string;

  @ManyToOne(() => Livestream)
  @JoinColumn({ name: 'livestreamId' })
  livestream: Livestream;

  @Column()
  uploadedBy: string;

  @Column()
  fileUrl: string;

  @Column()
  fileType: string; // e.g., 'application/pdf'

  @CreateDateColumn()
  createdAt: Date;
}