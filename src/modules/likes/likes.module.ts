import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikesService } from './likes.service';
import { Like } from './entities/like.entity';
import { User } from '../users/entities/user.entity';
import { Playlist } from '../playlists/entities/playlist.entity';
import { Track } from '../tracks/entities/track.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Like, User, Track, Playlist])],
  providers: [LikesService],
  exports: [LikesService],
})
export class LikesModule {}
