import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { ProfileTypeGuard } from './profile-type.guard.js';
import { ProfilesController } from './profiles.controller.js';
import { ProfilesService } from './profiles.service.js';

@Module({
  imports: [AuthModule],
  controllers: [ProfilesController],
  providers: [
    ProfilesService,
    ProfileTypeGuard,
  ],
})
export class ProfilesModule {}