import { PlaylistsService } from './playlists.service';
import { Controller, Post, Body, Req, Param, Delete, Get, UseGuards, Patch, ForbiddenException } from '@nestjs/common';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';
import { VisibilityStatus } from '../../enums/visibility-status.enum';
import { LikesService } from '../likes/likes.service';

@Controller('playlists')
@UseGuards(JwtAuthGuard)
export class PlaylistsController  {

  constructor(
    private readonly playlistsService: PlaylistsService,
    private readonly likesService: LikesService,
  ) {
  }

  @Post()
  async create(@Body() dto: CreatePlaylistDto, @Req() req: any) {
    const userId = req.user.userId;
    return this.playlistsService.create(dto, userId);
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.playlistsService.findAllByUser(req.user.userId);
  }

  @Get('public')
  async findPublicPlaylists() {
    return this.playlistsService.findAllPublic(VisibilityStatus.PUBLIC);
  }

  @Get('my-playlists')
  async findMyPlaylists(@Req() req: any) {
    return this.playlistsService.findAllByUser(req.user.userId);
  }

  @Get('liked')
  async findLiked(@Req() req: any) {
    return this.likesService.findLikedPlaylists(req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.playlistsService.findOneWithTracks(id);
  }

  @Post(':playlistId/tracks/:trackId')
  async addTrack(
    @Param('playlistId') playlistId: string,
    @Param('trackId') trackId: string,
    @Req() req: any,
  ) {
    await this.playlistsService.checkOwnership(playlistId, req.user.userId);
    return this.playlistsService.addTrackToPlaylist(playlistId, trackId);
  }

  @Delete(':playlistId/tracks/:trackId')
  async removeTrack(
    @Param('playlistId') playlistId: string,
    @Param('trackId') trackId: string,
    @Req() req: any,
  ) {
    await this.playlistsService.checkOwnership(playlistId, req.user.userId);
    return this.playlistsService.removeTrackFromPlaylist(playlistId, trackId);
  }

  @Patch(':id/visibility')
  @UseGuards(JwtAuthGuard)
  async updateVisibility(
    @Param('id') playlistId: string,
    @Req() req: any,
    @Body('status') status: VisibilityStatus,
  ) {
    return this.playlistsService.updateVisibility(playlistId, req.user.userId, status);
  }
}
