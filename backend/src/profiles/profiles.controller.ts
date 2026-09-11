import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '../auth/auth.guard.js';
import type { AuthenticatedRequest } from '../auth/auth.guard.js';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto.js';
import { UpdateResearcherProfileDto } from './dto/update-researcher-profile.dto.js';
import { ProfileType } from './profile-type.decorator.js';
import { ProfileTypeGuard } from './profile-type.guard.js';
import { ProfilesService } from './profiles.service.js';

@Controller('profiles')
@UseGuards(AuthGuard, ProfileTypeGuard)
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
  ) {}

  @Get('researcher/me')
  @ProfileType('RESEARCHER')
  getResearcherProfile(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.profilesService.getResearcherProfile(
      request.user.sub,
    );
  }

  @Patch('researcher/me')
  @ProfileType('RESEARCHER')
  updateResearcherProfile(
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateResearcherProfileDto,
  ) {
    return this.profilesService.updateResearcherProfile(
      request.user.sub,
      dto,
    );
  }

  @Get('company/me')
  @ProfileType('COMPANY')
  getCompanyProfile(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.profilesService.getCompanyProfile(
      request.user.sub,
    );
  }

  @Patch('company/me')
  @ProfileType('COMPANY')
  updateCompanyProfile(
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateCompanyProfileDto,
  ) {
    return this.profilesService.updateCompanyProfile(
      request.user.sub,
      dto,
    );
  }
}