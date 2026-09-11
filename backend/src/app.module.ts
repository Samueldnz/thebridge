import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { validate } from './config/env.validation.js';
import { PrismaModule } from './database/prisma/prisma.module.js';
import { HealthModule } from './health/health.module.js';
import { AuthModule } from './auth/auth.module.js';
import { OnboardingModule } from './onboarding/onboarding.module.js';
import { ProfilesModule } from './profiles/profiles.module.js';
import { CompetencesModule } from './competences/competences.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate,
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    OnboardingModule,
    ProfilesModule,
    CompetencesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}