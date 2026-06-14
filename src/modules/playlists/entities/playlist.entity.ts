import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Track } from '../../tracks/entities/track.entity';
import { Like } from '../../likes/entities/like.entity';
import { IsOptional, IsString } from 'class-validator';
import { VisibilityStatus } from '../../../enums/visibility-status.enum';

@Entity('playlists')
export class Playlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Column({ nullable: true })
  coverUrl: string;

  @CreateDateColumn()
  createdAt: Date;



  @Column({
    type: 'enum',
    enum: VisibilityStatus,
    default: VisibilityStatus.PUBLIC,
  })
  visibility: VisibilityStatus;

  @Column({ default: 0 })
  likesCount: number;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  user: User;

  @ManyToMany(() => Track)
  @JoinTable({ name: 'playlist_tracks' })
  tracks: Track[];

  @OneToMany(() => Like, (like) => like.playlist)
  likes: Like[];
}