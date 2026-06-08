// src/tracks/tracks.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Track } from './entities/track.entity';
import { CreateTrackDto } from './dto/create-track.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdateTrackDto } from './dto/update-track.dto';

@Injectable()
export class TracksService {
  constructor(
    @InjectRepository(Track)
    private trackRepository: Repository<Track>,
    private cloudinary: CloudinaryService,
  ) {}

  async create(createTrackDto: CreateTrackDto, audioFile: any): Promise<Track> {
    if (!audioFile) {
      throw new NotFoundException('Аудіофайл обов’язковий для завантаження');
    }

    const [audioUpload, coverUpload] = await Promise.all([
      this.cloudinary.uploadAudioStream(audioFile.buffer),
      this.cloudinary.uploadImageBase64(createTrackDto.cover),
    ]);

    const dominantColor = coverUpload.colors?..[0]?.[0] || '#121212';


    const newTrack = this.trackRepository.create({
      title: createTrackDto.title,
      genre: createTrackDto.genre,
      audioUrl: audioUpload.secure_url,
      coverUrl: coverUpload.secure_url,
      dominantColor: dominantColor,
    });

    return await this.trackRepository.save(newTrack);
  }

  async findAll(): Promise<Track[]> {
    return await this.trackRepository.find();
  }

  async findOne(id: string): Promise<Track> {
    const track = await this.trackRepository.findOne({ where: { id } });
    if (!track) throw new NotFoundException(`Трек з ID ${id} не знайдено`);
    return track;
  }

  async remove(id: string) {
    const track = await this.findOne(id);
    await this.trackRepository.remove(track);
    return { message: 'Трек успішно видалено' };
  }
  async update(id: string, updateTrackDto: UpdateTrackDto){
    const track = await this.findOne(id);
    await this.trackRepository.update(id, track);
    return { message: 'Трек успішно оновлено' };
  }
}