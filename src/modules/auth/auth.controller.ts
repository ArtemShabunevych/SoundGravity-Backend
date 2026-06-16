import { Body, Controller, Get, Post, UnauthorizedException, Req, UseGuards, Res, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() dto: CreateUserDto) {
    return this.authService.create(dto);
  }

  @Post('login')
  login(@Body() dto: LoginUserDto) {
    return this.authService.login(dto);
  }

  @Post('verify')
  verify(@Body('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }
    try {
      return this.authService.verifyAccessToken(token);
    } catch {
      throw new UnauthorizedException();
    }
  }

  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }
    return this.authService.refresh(refreshToken);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.loginOrCreateGoogleUser(req.user as { email: string; firstName: string });

    const frontendUrl = `http://localhost:5173/auth/callback?token=${result.accessToken}&refreshToken=${result.refreshToken}`;

    return res.redirect(frontendUrl);
  }
}
