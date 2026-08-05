import { PlaylistsService } from './playlists.service';
import {
  Controller,
  Post,
  Body,
  Req,
  Param,
  Delete,
  Get,
  UseGuards,
  Patch,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';
import { VisibilityStatus } from '../../enums/visibility-status.enum';
import { LikesService } from '../likes/likes.service';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request';

@Controller('playlists')
export class PlaylistsController {
  constructor(
    private readonly playlistsService: PlaylistsService,
    private readonly likesService: LikesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() dto: CreatePlaylistDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.userId;
    return this.playlistsService.create(dto, userId);
  }

  @Get()
  async findAll() {
    return this.playlistsService.findAllPublic();
  }

  @Get('my-playlists')
  @UseGuards(JwtAuthGuard)
  async findMyPlaylists(@Req() req: AuthenticatedRequest) {
    return this.playlistsService.findAllByUser(req.user.userId);
  }

  @Get('liked')
  @UseGuards(JwtAuthGuard)
  async findLiked(@Req() req: AuthenticatedRequest) {
    return this.likesService.findLikedPlaylists(req.user.userId);
  }

  @Get('user/:username')
  async findByUsername(@Param('username') username: string) {
    return this.playlistsService.findByUsername(username);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.playlistsService.findOneWithTracks(id);
  }

  @Get(':id/like-status')
  @UseGuards(JwtAuthGuard)
  async getLikeStatus(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.likesService.getPlaylistLikeStatus(id, req.user.userId);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  async toggleLike(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.likesService.togglePlaylistLike(id, req.user.userId);
  }

  @Patch(':id/cover')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('cover'))
  async uploadCover(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body('cover') base64String: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let coverData = base64String;

    if (file) {
      coverData = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    }

    if (!coverData) {
      throw new BadRequestException('Cover file or base64 string is required');
    }

    return this.playlistsService.updateCover(id, req.user.userId, coverData);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePlaylistDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.playlistsService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.playlistsService.remove(id, req.user.userId);
  }

  @Post(':playlistId/tracks/:trackId')
  @UseGuards(JwtAuthGuard)
  async addTrack(
    @Param('playlistId') playlistId: string,
    @Param('trackId') trackId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.playlistsService.checkOwnership(playlistId, req.user.userId);
    return this.playlistsService.addTrackToPlaylist(playlistId, trackId);
  }

  @Delete(':playlistId/tracks/:trackId')
  @UseGuards(JwtAuthGuard)
  async removeTrack(
    @Param('playlistId') playlistId: string,
    @Param('trackId') trackId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.playlistsService.checkOwnership(playlistId, req.user.userId);
    return this.playlistsService.removeTrackFromPlaylist(playlistId, trackId);
  }

  @Patch(':id/visibility')
  @UseGuards(JwtAuthGuard)
  async updateVisibility(
    @Param('id') playlistId: string,
    @Req() req: AuthenticatedRequest,
    @Body('status') status: VisibilityStatus,
  ) {
    return this.playlistsService.updateVisibility(
      playlistId,
      req.user.userId,
      status,
    );
  }
}
