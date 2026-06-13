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


@Controller('tracks')
@UseGuards(JwtAuthGuard)
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}
  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'audio', maxCount: 1 }
  ]))
  create(
    @Body() createTrackDto: CreateTrackDto,
    @UploadedFiles() files: { audio?: Express.Multer.File[] },
  ) {
    const audioFile = files?.audio?.[0];
    if (!audioFile) {
      throw new BadRequestException('Аудіофайл (audio) є обов’язковим для завантаження');
    }
    return this.tracksService.create(createTrackDto, audioFile);
  }

  @Get()
  findAll() {
    return this.tracksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tracksService.findOne(id);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTrackDto: UpdateTrackDto) {
    return this.tracksService.update(id, updateTrackDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tracksService.remove(id);
  }
  @Patch(':id/visibility')
  @UseGuards(JwtAuthGuard)
  async updateVisibility(
    @Param('id') trackId: string,
    @Req() req: any,
    @Body('status') status: VisibilityStatus,
  ) {
    return this.tracksService.updateVisibility(trackId, req.user.id, status);
  }
}