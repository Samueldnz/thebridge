import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { ProfilesModule } from '../profiles/profiles.module.js';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';
import { ProjectCompetencesService } from './project-competences.service.js';
import { MatchingModule } from '../matching/matching.module.js';

@Module({
  imports: [
    AuthModule,
    ProfilesModule,
    MatchingModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectCompetencesService,],
})
export class ProjectsModule {}