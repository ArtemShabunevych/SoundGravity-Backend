import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Track } from './entities/track.entity';
import { User } from '../users/entities/user.entity';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { VisibilityStatus } from '../../enums/visibility-status.enum';


@Injectable()
export class TracksService {
  constructor(
    @InjectRepository(Track)
    private trackRepository: Repository<Track>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private cloudinary: CloudinaryService,
  ) {
  }

  async create(createTrackDto: CreateTrackDto, audioFile: Express.Multer.File, userId: string): Promise<Track> {
    if (!audioFile) {
      throw new BadRequestException('Audio file (audio) is required in form-data format');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    try {
      const audioUpload = await this.cloudinary.uploadAudioStream(audioFile.buffer);

      let coverUrl: string | undefined;
      let dominantColor = '#121212';

      if (createTrackDto.cover) {
        const coverUpload = await this.cloudinary.uploadImageBase64(createTrackDto.cover);
        coverUrl = coverUpload.secure_url;
        dominantColor = coverUpload.colors?.[0]?.[0] || '#121212';
      }

      const newTrack = this.trackRepository.create({
        title: createTrackDto.title,
        genre: createTrackDto.genre,
        description: createTrackDto.description,
        audioUrl: audioUpload.secure_url,
        coverUrl,
        dominantColor,
        user: user,
      });

      return await this.trackRepository.save(newTrack);
    } catch (error: any) {
      throw new BadRequestException(`Media upload failed: ${error.message || error}`);
    }
  }

  async findAll(): Promise<Track[]> {
    return await this.trackRepository.find({
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findAllByUser(userId: string): Promise<Track[]> {
    return await this.trackRepository.find({
      where: { user: { id: userId } },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUsername(username: string): Promise<Track[]> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) throw new NotFoundException('User not found');
    return await this.trackRepository.find({
      where: { user: { id: user.id }, visibility: VisibilityStatus.PUBLIC },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findWithPagination(limit: number, cursor?: string) {
    const take = limit || 10;
    const where: any = {};

    if (cursor) {
      where.createdAt = LessThan(cursor);
    }

    const tracks = await this.trackRepository.find({
      where,
      relations: { user: true },
      order: { createdAt: 'DESC' },
      take: take + 1,
    });

    const hasMore = tracks.length > take;
    if (hasMore) tracks.pop();

    return {
      tracks,
      nextCursor: hasMore ? tracks[tracks.length - 1].createdAt.toISOString() : null,
    };
  }

  async uploadTemp(file: Express.Multer.File): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const upload = await this.cloudinary.uploadAudioStream(file.buffer);
    return { url: upload.secure_url };
  }

  async findOne(id: string): Promise<Track> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) throw new NotFoundException('Track not found');

    const track = await this.trackRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!track) throw new NotFoundException('Track not found');
    return track;
  }

  async update(id: string, updateTrackDto: UpdateTrackDto, userId: string): Promise<Track> {
    const track = await this.trackRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!track) throw new NotFoundException('Track not found');
    if (!track.user || track.user.id !== userId) {
      throw new ForbiddenException('You are not the owner of this track');
    }
    Object.assign(track, updateTrackDto);
    return await this.trackRepository.save(track);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const track = await this.trackRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!track) throw new NotFoundException('Track not found');
    if (!track.user || track.user.id !== userId) {
      throw new ForbiddenException('You are not the owner of this track');
    }
    await this.trackRepository.remove(track);
    return { message: 'Track deleted successfully' };
  }

  async updateVisibility(trackId: string, userId: string, status: VisibilityStatus) {
    const track = await this.trackRepository.findOne({
      where: { id: trackId },
      relations: { user: true },
    });

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    if (!track.user || track.user.id.toString() !== userId.toString()) {
      throw new ForbiddenException('You are not the owner of this track');
    }

    track.visibility = status;
    return this.trackRepository.save(track);
  }
}