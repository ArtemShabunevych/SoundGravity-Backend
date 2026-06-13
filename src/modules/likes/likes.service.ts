import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { User } from '../users/entities/user.entity';
import { Track } from '../tracks/entities/track.entity';
import { Playlist } from '../playlists/entities/playlist.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like) private readonly likeRepository: Repository<Like>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Track) private readonly trackRepository: Repository<Track>,
    @InjectRepository(Playlist) private readonly playlistRepository: Repository<Playlist>,
  ) {}

  async toggleTrackLike(trackId: string, userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    const track = await this.trackRepository.findOneBy({ id: trackId });

    if (!user || !track) {
      throw new NotFoundException('User or Track not found');
    }

    const existingLike = await this.likeRepository.findOne({
      where: {
        user: { id: userId },
        track: { id: trackId },
      },
    });

    if (existingLike) {
      await this.likeRepository.remove(existingLike);
      return { liked: false, type: 'track' };
    }

    const newLike = this.likeRepository.create({ user, track, playlist: null });
    await this.likeRepository.save(newLike);
    return { liked: true, type: 'track' };
  }

  async togglePlaylistLike(playlistId: string, userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    const playlist = await this.playlistRepository.findOneBy({ id: playlistId });

    if (!user || !playlist) {
      throw new NotFoundException('User or Playlist not found');
    }

    const existingLike = await this.likeRepository.findOne({
      where: {
        user: { id: userId },
        playlist: { id: playlistId },
      },
    });

    if (existingLike) {
      await this.likeRepository.remove(existingLike);
      return { liked: false, type: 'playlist' };
    }

    const newLike = this.likeRepository.create({ user, playlist, track: null });
    await this.likeRepository.save(newLike);
    return { liked: true, type: 'playlist' };
  }
}