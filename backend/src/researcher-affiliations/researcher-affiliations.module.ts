import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { ResearcherAffiliationsController } from './researcher-affiliations.controller.js';
import { ResearcherAffiliationsService } from './researcher-affiliations.service.js';

@Module({
  imports: [AuthModule],
  controllers: [ResearcherAffiliationsController],
  providers: [ResearcherAffiliationsService],
})
export class ResearcherAffiliationsModule {}