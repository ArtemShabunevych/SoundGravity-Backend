import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

      const [audioUpload, coverUpload] = await Promise.all([
        this.cloudinary.uploadAudioStream(audioFile.buffer),
        this.cloudinary.uploadImageBase64(createTrackDto.cover),
      ]);

      const dominantColor = coverUpload.colors?.[0]?.[0] || '#121212';

      const newTrack = this.trackRepository.create({
        title: createTrackDto.title,
        genre: createTrackDto.genre,
        description: createTrackDto.description,
        audioUrl: audioUpload.secure_url,
        coverUrl: coverUpload.secure_url,
        dominantColor: dominantColor,
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

  async findOne(id: string): Promise<Track> {
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