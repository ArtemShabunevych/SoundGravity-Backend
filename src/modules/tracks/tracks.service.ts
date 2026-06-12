// src/modules/tracks/tracks.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Track } from './entities/track.entity';
import { User } from '../users/entities/user.entity';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@Injectable()
export class TracksService {
  constructor(
    @InjectRepository(Track)
    private trackRepository: Repository<Track>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private cloudinary: CloudinaryService,
  ) {}

  async create(createTrackDto: CreateTrackDto, audioFile: Express.Multer.File): Promise<Track> {
    if (!audioFile) {
      throw new BadRequestException('Аудіофайл (audio) є обов’язковим у форматі form-data');
    }

    const user = await this.userRepository.findOne({ where: { id: createTrackDto.userId } });
    if (!user) {
      throw new NotFoundException(`Користувача з ID ${createTrackDto.userId} не знайдено`);
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
    } catch (error) {
      throw new BadRequestException(`Помилка завантаження медіафайлів: ${error.message}`);
    }
  }

  async findAll(): Promise<Track[]> {
    return await this.trackRepository.find({
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Track> {
    const track = await this.trackRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!track) throw new NotFoundException(`Трек з ID ${id} не знайдено`);
    return track;
  }

  async update(id: string, updateTrackDto: UpdateTrackDto): Promise<Track> {
    const track = await this.findOne(id);
    Object.assign(track, updateTrackDto);
    return await this.trackRepository.save(track);
  }

  async remove(id: string): Promise<{ message: string }> {
    const track = await this.findOne(id);
    await this.trackRepository.remove(track);
    return { message: 'Трек успішно видалено' };
  }
}