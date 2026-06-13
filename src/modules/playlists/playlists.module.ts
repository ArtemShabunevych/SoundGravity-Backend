import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaylistsService } from './playlists.service';
import { PlaylistsController } from './playlists.controller';
import { Playlist } from './entities/playlist.entity';
import { Track } from '../tracks/entities/track.entity';
import { AuthModule } from '../auth/auth.module';
import { Like } from '../likes/entities/like.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Playlist, Track, Like]),AuthModule
  ],
  controllers: [PlaylistsController],
  providers: [PlaylistsService],
  exports: [PlaylistsService],
})
export class PlaylistsModule {}