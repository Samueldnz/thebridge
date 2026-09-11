import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { AuthenticatedRequest } from '../auth/auth.guard.js';
import {
  PROFILE_TYPE_KEY,
  type AllowedProfileType,
} from './profile-type.decorator.js';

@Injectable()
export class ProfileTypeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredProfileType =
      this.reflector.getAllAndOverride<AllowedProfileType>(
        PROFILE_TYPE_KEY,
        [context.getHandler(), context.getClass()],
      );

    if (!requiredProfileType) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    if (request.user.profileType !== requiredProfileType) {
      throw new ForbiddenException(
        `This endpoint requires profile type ${requiredProfileType}`,
      );
    }

    return true;
  }
}