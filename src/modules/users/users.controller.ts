import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SetDescriptionDto } from './dto/set-description.dto';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  getUser(@Req() req) {
    return this.usersService.getUserProfile(req.user.userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req) {
    return this.usersService.getMyProfile(req.user.userId);
  }

  @Get('username/:username')
  findByUsername(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('description')
  @UseGuards(JwtAuthGuard)
  async updateDescription(@Req() req: any, @Body() dto: SetDescriptionDto) {
    return this.usersService.setDescription(req.user.userId, dto);
  }

  @Patch('/update-username')
  @UseGuards(JwtAuthGuard)
  updateUsername(@Body() dto: UpdateUsernameDto, @Req() req) {
    return this.usersService.updateUsername(dto.newUsername, req.user.userId);
  }
  @Patch('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @Req() req: any,
    @Body('avatar') base64String: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      return this.usersService.updateAvatar(req.user.userId, base64);
    }

    if (!base64String) {
      throw new BadRequestException('Avatar file or base64 string is required');
    }

    return this.usersService.updateAvatar(req.user.userId, base64String);
  }
}
