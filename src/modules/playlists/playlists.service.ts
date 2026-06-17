import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Playlist } from './entities/playlist.entity';
import { Track } from '../tracks/entities/track.entity';
import { User } from '../users/entities/user.entity';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { VisibilityStatus } from '../../enums/visibility-status.enum';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@Injectable()
export class PlaylistsService {
  constructor(
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>,
    @InjectRepository(Track)
    private trackRepository: Repository<Track>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly cloudinary: CloudinaryService,
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
    const playlist = await this.playlistRepository.findOne({
      where: { id: playlistId },
      relations: { tracks: true, user: true },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }
    return playlist;
  }

  async checkOwnership(playlistId: string, userId: string) {
    const playlist = await this.playlistRepository.findOne({
      where: { id: playlistId },
      relations: { user: true },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (!playlist.user || playlist.user.id !== userId) {
      throw new ForbiddenException('You are not the owner of this playlist');
    }
  }

  async addTrackToPlaylist(playlistId: string, trackId: string) {
    const playlist = await this.findOneWithTracks(playlistId);

    const track = await this.trackRepository.findOne({ where: { id: trackId } });
    if (!track) {
      throw new NotFoundException('Track not found');
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

  async findAllByUser(userId: string) {
    return this.playlistRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUsername(username: string) {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) throw new NotFoundException('User not found');
    return await this.playlistRepository.find({
      where: { user: { id: user.id }, visibility: VisibilityStatus.PUBLIC },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findAllPublic(status: VisibilityStatus) {
    return this.playlistRepository.find({
      where: { visibility: VisibilityStatus.PUBLIC },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string, userId: string) {
    const playlist = await this.playlistRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (!playlist.user || playlist.user.id !== userId) {
      throw new ForbiddenException('You are not the owner of this playlist');
    }

    await this.playlistRepository.remove(playlist);
    return { message: 'Playlist deleted successfully' };
  }

  async update(id: string, dto: UpdatePlaylistDto, userId: string) {
    const playlist = await this.playlistRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (!playlist.user || playlist.user.id !== userId) {
      throw new ForbiddenException('You are not the owner of this playlist');
    }

    Object.assign(playlist, dto);
    return this.playlistRepository.save(playlist);
  }

  async updateCover(id: string, userId: string, base64String: string) {
    const playlist = await this.playlistRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (!playlist.user || playlist.user.id !== userId) {
      throw new ForbiddenException('You are not the owner of this playlist');
    }

    const upload = await this.cloudinary.uploadImageBase64(base64String);
    playlist.coverUrl = upload.secure_url;
    return this.playlistRepository.save(playlist);
  }

  async updateVisibility(playlistId: string, userId: string, status: VisibilityStatus) {
    const playlist = await this.playlistRepository.findOne({
      where: { id: playlistId },
      relations: { user: true },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (!playlist.user || playlist.user.id !== userId) {
      throw new ForbiddenException('You are not the owner of this playlist');
    }

    playlist.visibility = status;
    return this.playlistRepository.save(playlist);
  }
}
