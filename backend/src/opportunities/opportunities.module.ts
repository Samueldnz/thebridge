import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { ProfilesModule } from '../profiles/profiles.module.js';
import { OpportunitiesController } from './opportunities.controller.js';
import { OpportunitiesService } from './opportunities.service.js';
import { OpportunityCompetencesService } from './opportunity-competences.service.js';

@Module({
  imports: [
    AuthModule,
    ProfilesModule,
  ],
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService, OpportunityCompetencesService,],
})
export class OpportunitiesModule {}