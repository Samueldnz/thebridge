import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { AuthenticatedRequest } from './auth.guard.js';
import {
  SYSTEM_ROLE_KEY,
  type AllowedSystemRole,
} from './system-role.decorator.js';

@Injectable()
export class SystemRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole =
      this.reflector.getAllAndOverride<AllowedSystemRole>(
        SYSTEM_ROLE_KEY,
        [context.getHandler(), context.getClass()],
      );

    if (!requiredRole) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    if (request.user.systemRole !== requiredRole) {
      throw new ForbiddenException(
        `This endpoint requires system role ${requiredRole}`,
      );
    }

    return true;
  }
}