import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../modules/auth/auth.service';
import {
  AuthCookiesService,
  REFRESH_COOKIE,
} from '../modules/auth/auth-cookies.service';

type CookieRequest = {
  cookies?: Record<string, string>;
  headers: { authorization?: string | string[] };
};

@Injectable()
export class RefreshAccessTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly authCookiesService: AuthCookiesService,
  ) {}

  async use(req: CookieRequest, res: Response, next: NextFunction) {
    const rawAuthHeader = req.headers['authorization'];
    const authHeader = Array.isArray(rawAuthHeader)
      ? rawAuthHeader[0]
      : rawAuthHeader;
    const accessToken = authHeader?.split(' ')[1];
    const refreshToken = req.cookies?.[REFRESH_COOKIE];

    if (!accessToken || !refreshToken) {
      return next();
    }

    try {
      this.authService.verifyAccessToken(accessToken);
      return next();
    } catch (err: unknown) {
      const errName = (err as { name?: string } | null)?.name;
      if (errName === 'TokenExpiredError') {
        try {
          const { accessToken: newAccessToken } =
            await this.authService.refresh(refreshToken);

          this.authCookiesService.setRefreshCookie(res, refreshToken);
          req.headers['authorization'] = `Bearer ${newAccessToken}`;
        } catch {
          throw new UnauthorizedException('Invalid refresh token');
        }
      }
    }
    return next();
  }
}
