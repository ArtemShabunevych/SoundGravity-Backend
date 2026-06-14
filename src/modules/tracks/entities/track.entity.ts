import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { IsOptional, IsString } from 'class-validator';
import { Like } from '../../likes/entities/like.entity';
import { VisibilityStatus } from '../../../enums/visibility-status.enum';

@Entity('tracks')
export class Track {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  genre: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Column()
  audioUrl: string;

  @Column()
  coverUrl: string;

  @Column({ nullable: true })
  dominantColor: string;

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

  @ManyToOne(() => User, (user) => user.tracks, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => Like, (like) => like.track)
  likes: Like[];
}
