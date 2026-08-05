import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import * as crypto from 'node:crypto';
import { CSRF_COOKIE } from '../auth-cookies.service';

interface CsrfRequest {
  cookies?: Record<string, string>;
  headers: {
    'x-csrf-token'?: string | string[];
    origin?: string | string[];
    referer?: string | string[];
  };
}

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<CsrfRequest>();

    this.assertAllowedOrigin(req);

    const cookieToken = req.cookies?.[CSRF_COOKIE];
    const rawHeader = req.headers['x-csrf-token'];
    const headerToken = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

    if (
      typeof cookieToken !== 'string' ||
      typeof headerToken !== 'string' ||
      cookieToken.length === 0 ||
      cookieToken.length !== headerToken.length
    ) {
      throw new ForbiddenException('CSRF token validation failed');
    }

    const isValid = crypto.timingSafeEqual(
      Buffer.from(cookieToken),
      Buffer.from(headerToken),
    );

    if (!isValid) {
      throw new ForbiddenException('CSRF token validation failed');
    }

    return true;
  }

  private assertAllowedOrigin(req: CsrfRequest): void {
    const rawHeader = req.headers['origin'] ?? req.headers['referer'];
    const header = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

    if (!header) {
      throw new ForbiddenException('Origin header is required');
    }

    let origin: string;
    try {
      origin = new URL(header).origin;
    } catch {
      throw new ForbiddenException('Invalid Origin header');
    }

    const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
      .split(',')
      .map((o) => o.trim());

    const isAllowed = allowedOrigins.some((o) => o === origin);
    if (!isAllowed) {
      throw new ForbiddenException('Origin is not allowed');
    }
  }
}
