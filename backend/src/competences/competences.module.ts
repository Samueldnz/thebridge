import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { CompetencesController } from './competences.controller.js';
import { CompetencesService } from './competences.service.js';

@Module({
  imports: [AuthModule],
  controllers: [CompetencesController],
  providers: [CompetencesService],
})
export class CompetencesModule {}