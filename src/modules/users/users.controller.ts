import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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

  @Patch('/update-username')
  @UseGuards(JwtAuthGuard)
  updateUsername(@Body() dto: UpdateUsernameDto, @Req() req) {
    return this.usersService.updateUsername(dto.newUsername, req.user.userId);
  }
}
