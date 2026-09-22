import { Module } from '@nestjs/common';

import { PrismaModule } from '../database/prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { MatchingService } from './matching.service.js';
import { MatchesController } from './matches.controller.js';
import { MatchesService } from './matches.service.js';

@Module({
  imports: [PrismaModule, AuthModule,],
  providers: [MatchingService, MatchesService],
  exports: [MatchingService],
  controllers: [MatchesController],
})
export class MatchingModule {}