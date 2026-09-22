import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '../auth/auth.guard.js';
import type { AuthenticatedRequest } from '../auth/auth.guard.js';
import { ProfileType } from '../profiles/profile-type.decorator.js';
import { ProfileTypeGuard } from '../profiles/profile-type.guard.js';

import { DiscoveryService } from './discovery.service.js';
import { DiscoveryOpportunitiesQueryDto } from './dto/iscovery-opportunities-query.dto.js';
import { DiscoveryProjectsQueryDto } from './dto/discovery-projects-query.dto.js';

@Controller('discovery')
@UseGuards(AuthGuard, ProfileTypeGuard)
export class DiscoveryController {
  constructor(
    private readonly discoveryService: DiscoveryService,
  ) {}

  @Get('opportunities')
  @ProfileType('RESEARCHER')
  listOpportunities(
    @Req() request: AuthenticatedRequest,
    @Query() query: DiscoveryOpportunitiesQueryDto,
  ) {
    return this.discoveryService.listOpportunities(
      request.user.sub,
      query,
    );
  }

  @Get('projects')
  @ProfileType('COMPANY')
  listProjects(
    @Req() request: AuthenticatedRequest,
    @Query() query: DiscoveryProjectsQueryDto,
  ) {
    return this.discoveryService.listProjects(
      request.user.sub,
      query,
    );
  }
}