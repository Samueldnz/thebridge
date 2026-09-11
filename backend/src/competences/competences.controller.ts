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
import { SystemRole } from '../auth/system-role.decorator.js';
import { SystemRoleGuard } from '../auth/system-role.guard.js';
import { CreateCompetenceDto } from './dto/create-competence.dto.js';
import { ResearcherCompetenceDto } from './dto/researcher-competence.dto.js';
import { UpdateCompetenceDto } from './dto/update-competence.dto.js';
import { CompetencesService } from './competences.service.js';

@Controller()
export class CompetencesController {
  constructor(
    private readonly competencesService: CompetencesService,
  ) {}

  @Get('competences')
  listCompetences() {
    return this.competencesService.listCompetences();
  }

  @Get('competences/:id')
  getCompetence(@Param('id') id: string) {
    return this.competencesService.getCompetence(id);
  }

  @Post('competences')
  @UseGuards(AuthGuard, SystemRoleGuard)
  @SystemRole('ADMIN')
  createCompetence(
    @Body() dto: CreateCompetenceDto,
  ) {
    return this.competencesService.createCompetence(dto);
  }

  @Patch('competences/:id')
  @UseGuards(AuthGuard, SystemRoleGuard)
  @SystemRole('ADMIN')
  updateCompetence(
    @Param('id') id: string,
    @Body() dto: UpdateCompetenceDto,
  ) {
    return this.competencesService.updateCompetence(
      id,
      dto,
    );
  }

  @Delete('competences/:id')
  @UseGuards(AuthGuard, SystemRoleGuard)
  @SystemRole('ADMIN')
  removeCompetence(@Param('id') id: string) {
    return this.competencesService.removeCompetence(id);
  }

  @UseGuards(AuthGuard)
  @Get('profiles/researcher/me/competences')
  listResearcherCompetences(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.competencesService.listResearcherCompetences(
      request.user.sub,
    );
  }

  @UseGuards(AuthGuard)
  @Post(
    'profiles/researcher/me/competences/:competenceId',
  )
  addResearcherCompetence(
    @Req() request: AuthenticatedRequest,
    @Param('competenceId') competenceId: string,
    @Body() dto: ResearcherCompetenceDto,
  ) {
    return this.competencesService.addResearcherCompetence(
      request.user.sub,
      competenceId,
      dto,
    );
  }

  @UseGuards(AuthGuard)
  @Patch(
    'profiles/researcher/me/competences/:competenceId',
  )
  updateResearcherCompetence(
    @Req() request: AuthenticatedRequest,
    @Param('competenceId') competenceId: string,
    @Body() dto: ResearcherCompetenceDto,
  ) {
    return this.competencesService.updateResearcherCompetence(
      request.user.sub,
      competenceId,
      dto,
    );
  }

  @UseGuards(AuthGuard)
  @Delete(
    'profiles/researcher/me/competences/:competenceId',
  )
  removeResearcherCompetence(
    @Req() request: AuthenticatedRequest,
    @Param('competenceId') competenceId: string,
  ) {
    return this.competencesService.removeResearcherCompetence(
      request.user.sub,
      competenceId,
    );
  }
}