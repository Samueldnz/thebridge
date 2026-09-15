import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '../auth/auth.guard.js';
import type { AuthenticatedRequest } from '../auth/auth.guard.js';
import { ProfileType } from '../profiles/profile-type.decorator.js';
import { ProfileTypeGuard } from '../profiles/profile-type.guard.js';
import { CreateOpportunityDto } from './dto/create-opportunity.dto.js';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto.js';
import { OpportunitiesService } from './opportunities.service.js';
import { ListOpportunitiesQueryDto } from './dto/list-opportunities-query.dto.js';

@Controller('opportunities')
export class OpportunitiesController {
  constructor(
    private readonly opportunitiesService: OpportunitiesService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, ProfileTypeGuard)
  @ProfileType('COMPANY')
  createOpportunity(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateOpportunityDto,
  ) {
    return this.opportunitiesService.createOpportunity(
      request.user.sub,
      dto,
    );
  }

    @Get()
    listOpportunities(
    @Query() query: ListOpportunitiesQueryDto,
    ) {
    return this.opportunitiesService.listOpportunities(query);
    }

  @Get(':id')
  @UseGuards(AuthGuard, ProfileTypeGuard)
  @ProfileType('COMPANY')
  getOpportunity(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.opportunitiesService.getOpportunity(
      request.user.sub,
      id,
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard, ProfileTypeGuard)
  @ProfileType('COMPANY')
  updateOpportunity(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateOpportunityDto,
  ) {
    return this.opportunitiesService.updateOpportunity(
      request.user.sub,
      id,
      dto,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard, ProfileTypeGuard)
  @ProfileType('COMPANY')
  removeOpportunity(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.opportunitiesService.removeOpportunity(
      request.user.sub,
      id,
    );
  }
}