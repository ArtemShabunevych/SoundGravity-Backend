import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  Get,
  Param,
  Patch,
  Delete,
  BadRequestException, UseGuards, Req,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { TracksService } from './tracks.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';
import { VisibilityStatus } from '../../enums/visibility-status.enum';
import { LikesService } from '../likes/likes.service';


@Controller('tracks')
@UseGuards(JwtAuthGuard)
export class TracksController {
  constructor(
    private readonly tracksService: TracksService,
    private readonly likesService: LikesService,
  ) {}
  @Post()
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

  @Get()
  findAll() {
    return this.tracksService.findAll();
  }

  @Get('my-tracks')
  findMyTracks(@Req() req: any) {
    return this.tracksService.findAllByUser(req.user.userId);
  }

  @Get('liked')
  findLiked(@Req() req: any) {
    return this.likesService.findLikedTracks(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tracksService.findOne(id);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTrackDto: UpdateTrackDto, @Req() req: any) {
    return this.tracksService.update(id, updateTrackDto, req.user.userId);
  }

  @Post(':id/like')
  toggleLike(@Param('id') id: string, @Req() req: any) {
    return this.likesService.toggleTrackLike(id, req.user.userId);
  }

  @Delete(':id/like')
  removeLike(@Param('id') id: string, @Req() req: any) {
    return this.likesService.toggleTrackLike(id, req.user.userId);
  }

  @Delete(':id')
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