import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '../auth/auth.guard.js';
import type { AuthenticatedRequest } from '../auth/auth.guard.js';
import { CompanyOnboardingDto } from './dto/company-onboarding.dto.js';
import { ResearcherOnboardingDto } from './dto/researcher-onboarding.dto.js';
import { OnboardingService } from './onboarding.service.js';

@Controller('onboarding')
@UseGuards(AuthGuard)
export class OnboardingController {
  constructor(
    private readonly onboardingService: OnboardingService,
  ) {}

  @Post('researcher')
  onboardResearcher(
    @Req() request: AuthenticatedRequest,
    @Body() dto: ResearcherOnboardingDto,
  ) {
    return this.onboardingService.onboardResearcher(
      request.user.sub,
      dto,
    );
  }

  @Post('company')
  onboardCompany(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CompanyOnboardingDto,
  ) {
    return this.onboardingService.onboardCompany(
      request.user.sub,
      dto,
    );
  }
}