import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import * as crypto from 'node:crypto';

export const REFRESH_COOKIE = 'refresh_token';
export const CSRF_COOKIE = 'csrf_token';
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthCookiesService {
  constructor(private readonly configService: ConfigService) {}

  generateCsrfToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private baseOptions(httpOnly: boolean) {
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';
    const sameSite = (this.configService.get<string>('COOKIE_SAMESITE') ||
      (isProduction ? 'none' : 'lax')) as 'lax' | 'strict' | 'none';
    const secureOverride = this.configService.get<string>('COOKIE_SECURE');
    const secure = secureOverride
      ? secureOverride === 'true'
      : isProduction || sameSite === 'none';

    return { httpOnly, secure, sameSite, path: '/' };
  }

  setAuthCookies(res: Response, refreshToken: string, csrfToken: string) {
    this.setRefreshCookie(res, refreshToken);
    this.setCsrfCookie(res, csrfToken);
  }

  setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie(REFRESH_COOKIE, refreshToken, {
      ...this.baseOptions(true),
      maxAge: REFRESH_TOKEN_TTL_MS,
    });
  }

  setCsrfCookie(res: Response, csrfToken: string) {
    res.cookie(CSRF_COOKIE, csrfToken, {
      ...this.baseOptions(false),
      maxAge: REFRESH_TOKEN_TTL_MS,
    });
  }

  clearAuthCookies(res: Response) {
    res.clearCookie(REFRESH_COOKIE, this.baseOptions(true));
    res.clearCookie(CSRF_COOKIE, this.baseOptions(false));
  }
}
