import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import type { AuthUser } from './auth.types';

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers['authorization'];
    if (!header || !header.startsWith('Bearer ')) throw new UnauthorizedException('Bearer token required.');
    request.user = await this.authService.verifyToken(header.slice(7));
    return true;
  }
}
