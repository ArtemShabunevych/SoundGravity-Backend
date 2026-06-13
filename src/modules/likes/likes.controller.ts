import { Controller, Post, Param, UseGuards, Req } from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';

@Controller('likes')
@UseGuards(JwtAuthGuard)
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post('track/:trackId')
  async toggleTrack(@Param('trackId') trackId: string, @Req() req: any) {
    return this.likesService.toggleTrackLike(trackId, req.user.userId);
  }

  @Post('playlist/:playlistId')
  async togglePlaylist(@Param('playlistId') playlistId: string, @Req() req: any) {
    return this.likesService.togglePlaylistLike(playlistId, req.user.userId);
  }
}