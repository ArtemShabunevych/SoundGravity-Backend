import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Track } from '../../tracks/entities/track.entity';
import { Playlist } from '../../playlists/entities/playlist.entity';

@Entity('likes')
@Unique(['user', 'track'])
@Unique(['user', 'playlist'])
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
  @ManyToOne(() => Track, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'trackId' })
  track: Track | null;

  @ManyToOne(() => Playlist, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'playlistId' })
  playlist: Playlist | null;

  @CreateDateColumn()
  createdAt: Date;
}