import { PlaylistsService } from './playlists.service'; // ⚠️ ДОДАЙ ЦЕЙ РЯДОК ВГОРІ
import { Controller, Post, Body, Req, Param, Delete, Get, UseGuards } from '@nestjs/common';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';

@Controller('playlists')
@UseGuards(JwtAuthGuard)
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}
  @Post()
  async create(@Body() dto: CreatePlaylistDto, @Req() req: any) {
    const userId = req.user.userId;
    return this.playlistsService.create(dto, userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.playlistsService.findOneWithTracks(id);
  }
  @Post(':playlistId/tracks/:trackId')
  async addTrack(
    @Param('playlistId') playlistId: string,
    @Param('trackId') trackId: string,
  ) {
    return this.playlistsService.addTrackToPlaylist(playlistId, trackId);
  }
  @Delete(':playlistId/tracks/:trackId')
  async removeTrack(
    @Param('playlistId') playlistId: string,
    @Param('trackId') trackId: string,
  ) {
    return this.playlistsService.removeTrackFromPlaylist(playlistId, trackId);
  }
}