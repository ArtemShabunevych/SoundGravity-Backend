import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  Get,
  Param,
  Patch,
  Delete,
  BadRequestException, UseGuards, Req, Query,
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { TracksService } from './tracks.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';
import { VisibilityStatus } from '../../enums/visibility-status.enum';
import { LikesService } from '../likes/likes.service';


@Controller('tracks')
export class TracksController {
  constructor(
    private readonly tracksService: TracksService,
    private readonly likesService: LikesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'audio', maxCount: 1 }
  ]))
  create(
    @Body() createTrackDto: CreateTrackDto,
    @UploadedFiles() files: { audio?: Express.Multer.File[] },
    @Req() req: any,
  ) {
    const audioFile = files?.audio?.[0];
    if (!audioFile) {
      throw new BadRequestException('Audio file (audio) is required');
    }
    return this.tracksService.create(createTrackDto, audioFile, req.user.userId);
  }

  @Post('upload-temp')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async uploadTemp(@UploadedFile() file: Express.Multer.File) {
    return this.tracksService.uploadTemp(file);
  }

  @Get()
  findAll() {
    return this.tracksService.findAll();
  }

  @Get('my-tracks')
  @UseGuards(JwtAuthGuard)
  findMyTracks(@Req() req: any) {
    return this.tracksService.findAllByUser(req.user.userId);
  }

  @Get('liked')
  @UseGuards(JwtAuthGuard)
  findLiked(@Req() req: any) {
    return this.likesService.findLikedTracks(req.user.userId);
  }

  @Get('pagination')
  findWithPagination(
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.tracksService.findWithPagination(limit ? parseInt(limit, 10) : 10, cursor || undefined);
  }

  @Get('user/:username')
  async findByUsername(@Param('username') username: string) {
    return this.tracksService.findByUsername(username);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tracksService.findOne(id);
  }

  @Get(':id/like-status')
  @UseGuards(JwtAuthGuard)
  getLikeStatus(@Param('id') id: string, @Req() req: any) {
    return this.likesService.getTrackLikeStatus(id, req.user.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateTrackDto: UpdateTrackDto, @Req() req: any) {
    return this.tracksService.update(id, updateTrackDto, req.user.userId);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  toggleLike(@Param('id') id: string, @Req() req: any) {
    return this.likesService.toggleTrackLike(id, req.user.userId);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  removeLike(@Param('id') id: string, @Req() req: any) {
    return this.likesService.toggleTrackLike(id, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.tracksService.remove(id, req.user.userId);
  }

  @Patch(':id/visibility')
  @UseGuards(JwtAuthGuard)
  async updateVisibility(
    @Param('id') trackId: string,
    @Req() req: any,
    @Body('status') status: VisibilityStatus,
  ) {
    return this.tracksService.updateVisibility(trackId, req.user.userId, status);
  }
}