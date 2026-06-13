import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { User } from '../users/entities/user.entity';
import { Playlist } from '../playlists/entities/playlist.entity';
import { Track } from '../tracks/entities/track.entity';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [TypeOrmModule.forFeature([Like, User, Track, Playlist]),AuthModule],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
