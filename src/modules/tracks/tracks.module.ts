import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TracksService } from './tracks.service';
import { TracksController } from './tracks.controller';
import { Track } from './entities/track.entity';
import { User } from '../users/entities/user.entity';
import { CloudinaryModule } from '../../cloudinary/cloudinary.module';
import { LikesModule } from '../likes/likes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Track, User]),
    CloudinaryModule,
    LikesModule,
  ],
  controllers: [TracksController],
  providers: [TracksService],
})
export class TracksModule {}
