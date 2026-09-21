import { Module } from '@nestjs/common';

import { PrismaModule } from '../database/prisma/prisma.module.js';
import { MatchingService } from './matching.service.js';

@Module({
  imports: [PrismaModule],
  providers: [MatchingService],
  exports: [MatchingService],
})
export class MatchingModule {}