import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Playlist } from './entities/playlist.entity'; 
import { Track } from '../tracks/entities/track.entity';   
import { CreatePlaylistDto } from './dto/create-playlist.dto';

@Injectable()
export class PlaylistsService {
  constructor(
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>,
    @InjectRepository(Track)
    private trackRepository: Repository<Track>,
  ) {}

  async create(dto: CreatePlaylistDto, userId: string) {
    const playlist = this.playlistRepository.create({
      ...dto,
      user: { id: userId },
      tracks: [],
    });
    return this.playlistRepository.save(playlist);
  }

  async findOneWithTracks(playlistId: string) {
    const [playlist] = await Promise.all([this.playlistRepository.findOne({
      where: { id: playlistId },
      relations: {'tracks': true},
    })]);

    if (!playlist) {
      throw new NotFoundException('Плейліст не знайдено');
    }
    return playlist;
  }

  async addTrackToPlaylist(playlistId: string, trackId: string) {
    const playlist = await this.findOneWithTracks(playlistId);

    const track = await this.trackRepository.findOne({ where: { id: trackId } });
    if (!track) {
      throw new NotFoundException('Трек не знайдено');
    }

    const trackExists = playlist.tracks.some((t) => t.id === trackId);
    if (!trackExists) {
      playlist.tracks.push(track);
      await this.playlistRepository.save(playlist);
    }

    return playlist;
  }

  async removeTrackFromPlaylist(playlistId: string, trackId: string) {
    const playlist = await this.findOneWithTracks(playlistId);

    playlist.tracks = playlist.tracks.filter((track) => track.id !== trackId);
    await this.playlistRepository.save(playlist);

    return playlist;
  }
}