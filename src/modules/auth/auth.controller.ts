import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  Req,
  UseGuards,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { CsrfGuard } from './guards/csrf.guard';
import {
  AuthCookiesService,
  CSRF_COOKIE,
  REFRESH_COOKIE,
} from './auth-cookies.service';

type CookieRequest = { cookies?: Record<string, string> };

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCookiesService: AuthCookiesService,
  ) {}

  @Post('register')
  async create(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.create(dto);
    const csrfToken = this.authCookiesService.generateCsrfToken();
    this.authCookiesService.setAuthCookies(res, result.refreshToken, csrfToken);
    return { user: result.user, accessToken: result.accessToken, csrfToken };
  }

  @Post('login')
  async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    const csrfToken = this.authCookiesService.generateCsrfToken();
    this.authCookiesService.setAuthCookies(res, result.refreshToken, csrfToken);
    return { user: result.user, accessToken: result.accessToken, csrfToken };
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

  @Get('csrf')
  csrf(@Req() req: CookieRequest, @Res({ passthrough: true }) res: Response) {
    let csrfToken = req.cookies?.[CSRF_COOKIE];
    if (typeof csrfToken !== 'string' || csrfToken.length === 0) {
      csrfToken = this.authCookiesService.generateCsrfToken();
      this.authCookiesService.setCsrfCookie(res, csrfToken);
    }
    return { csrfToken };
  }

  @Post('refresh')
  @UseGuards(CsrfGuard)
  async refresh(
    @Req() req: CookieRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }
    const result = await this.authService.refresh(refreshToken);
    const csrfToken = this.authCookiesService.generateCsrfToken();
    this.authCookiesService.setAuthCookies(res, refreshToken, csrfToken);
    return { accessToken: result.accessToken, csrfToken };
  }

  @Post('logout')
  @UseGuards(CsrfGuard)
  logout(@Res({ passthrough: true }) res: Response) {
    this.authCookiesService.clearAuthCookies(res);
    return { success: true };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.loginOrCreateGoogleUser(
      req.user as { email: string; firstName: string },
    );

    const csrfToken = this.authCookiesService.generateCsrfToken();
    this.authCookiesService.setAuthCookies(res, result.refreshToken, csrfToken);

    const frontendBase =
      process.env.FRONTEND_URL ||
      process.env.CORS_ORIGIN ||
      'http://localhost:5173';
    const frontendUrl = `${frontendBase}/auth/callback`;

    return res.redirect(frontendUrl);
  }
}
