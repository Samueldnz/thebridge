import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '../auth/auth.guard.js';
import type { AuthenticatedRequest } from '../auth/auth.guard.js';
import { ProfileType } from '../profiles/profile-type.decorator.js';
import { ProfileTypeGuard } from '../profiles/profile-type.guard.js';
import { CreateResearcherAffiliationDto } from './dto/create-researcher-affiliation.dto.js';
import { UpdateResearcherAffiliationDto } from './dto/update-researcher-affiliation.dto.js';
import { ResearcherAffiliationsService } from './researcher-affiliations.service.js';

@Controller('profiles/researcher/me/affiliations')
@UseGuards(AuthGuard, ProfileTypeGuard)
@ProfileType('RESEARCHER')
export class ResearcherAffiliationsController {
  constructor(
    private readonly service: ResearcherAffiliationsService,
  ) {}

  @Get()
  list(@Req() request: AuthenticatedRequest) {
    return this.service.list(request.user.sub);
  }

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateResearcherAffiliationDto,
  ) {
    return this.service.create(
      request.user.sub,
      dto,
    );
  }

  @Patch(':organizationId')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Body() dto: UpdateResearcherAffiliationDto,
  ) {
    return this.service.update(
      request.user.sub,
      organizationId,
      dto,
    );
  }

  @Delete(':organizationId')
  remove(
    @Req() request: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
  ) {
    return this.service.remove(
      request.user.sub,
      organizationId,
    );
  }
}