import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TracksService } from './tracks.service';
import { TracksController } from './tracks.controller';
import { Track } from './entities/track.entity';
import { User } from '../users/entities/user.entity';
import { CloudinaryModule } from '../../cloudinary/cloudinary.module';
import { AuthModule } from '../auth/auth.module';
import { Like } from '../likes/entities/like.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Track, User, Like ]),
    CloudinaryModule,AuthModule
  ],
  controllers: [TracksController],
  providers: [TracksService],
})
export class TracksModule {}