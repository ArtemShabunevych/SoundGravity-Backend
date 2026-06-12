import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { IsOptional, IsString } from 'class-validator';

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

  @ManyToOne(() => User, (user) => user.tracks, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}