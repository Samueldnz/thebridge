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
import { UpdateOpportunityCompetenceDto } from './dto/update-opportunity-competence.dto.js';
import { OpportunitiesService } from './opportunities.service.js';
import { ListOpportunitiesQueryDto } from './dto/list-opportunities-query.dto.js';
import { OpportunityCompetencesService } from './opportunity-competences.service.js';

@Controller('opportunities')
export class OpportunitiesController {
  constructor(
    private readonly opportunitiesService: OpportunitiesService,
    private readonly opportunityCompetencesService: OpportunityCompetencesService,
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

  @Get(':id/competences')
  @UseGuards(AuthGuard, ProfileTypeGuard)
  @ProfileType('COMPANY')
  listOpportunityCompetences(
    @Param('id') opportunityId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.opportunityCompetencesService.listCompetences(
      opportunityId,
      request.user.sub,
    );
  }

  @Post(':id/competences/:competenceId')
  @UseGuards(AuthGuard, ProfileTypeGuard)
  @ProfileType('COMPANY')
  addOpportunityCompetence(
    @Param('id') opportunityId: string,
    @Param('competenceId') competenceId: string,
    @Body() body: UpdateOpportunityCompetenceDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.opportunityCompetencesService.addCompetence(
      opportunityId,
      competenceId,
      request.user.sub,
      body.weight,
    );
  }

  @Patch(':id/competences/:competenceId')
  @UseGuards(AuthGuard, ProfileTypeGuard)
  @ProfileType('COMPANY')
  updateOpportunityCompetence(
    @Param('id') opportunityId: string,
    @Param('competenceId') competenceId: string,
    @Body() body: UpdateOpportunityCompetenceDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.opportunityCompetencesService.updateCompetence(
      opportunityId,
      competenceId,
      request.user.sub,
      body,
    );
  }

  @Delete(':id/competences/:competenceId')
  @UseGuards(AuthGuard, ProfileTypeGuard)
  @ProfileType('COMPANY')
  removeOpportunityCompetence(
    @Param('id') opportunityId: string,
    @Param('competenceId') competenceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.opportunityCompetencesService.removeCompetence(
      opportunityId,
      competenceId,
      request.user.sub,
    );
  }

}