import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { ProfilesModule } from '../profiles/profiles.module.js';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';
import { ProjectCompetencesService } from './project-competences.service.js';

@Module({
  imports: [
    AuthModule,
    ProfilesModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectCompetencesService,],
})
export class ProjectsModule {}