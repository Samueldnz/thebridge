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
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { ListProjectsQueryDto } from './dto/list-projects-query.dto.js';
import { ProjectsService } from './projects.service.js';
import { ProjectCompetencesService } from './project-competences.service.js';
import { AddProjectCompetenceDto } from './dto/add-project-competence.dto.js';
import { UpdateProjectCompetenceDto } from './dto/update-project-competence.dto.js';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly projectCompetencesService: ProjectCompetencesService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, ProfileTypeGuard)
  @ProfileType('RESEARCHER')
  createProject(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.createProject(
      request.user.sub,
      dto,
    );
  }

  @Get()
  listProjects(
    @Query() query: ListProjectsQueryDto,
  ) {
    return this.projectsService.listProjects(query);
  }

  @Get(':id')
  @UseGuards(AuthGuard, ProfileTypeGuard)
  @ProfileType('RESEARCHER')
  getProject(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.projectsService.getProject(
      request.user.sub,
      id,
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard, ProfileTypeGuard)
  @ProfileType('RESEARCHER')
  updateProject(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.updateProject(
      request.user.sub,
      id,
      dto,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard, ProfileTypeGuard)
  @ProfileType('RESEARCHER')
  removeProject(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.projectsService.removeProject(
      request.user.sub,
      id,
    );
  }

  @Get(':id/competences')
  @UseGuards(AuthGuard, ProfileTypeGuard)
  @ProfileType('RESEARCHER')
  listProjectCompetences(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.projectCompetencesService.listProjectCompetences(
      request.user.sub,
      id,
    );
  }

  @Post(':id/competences/:competenceId')
  @UseGuards(AuthGuard, ProfileTypeGuard)
  @ProfileType('RESEARCHER')
  addProjectCompetence(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('competenceId') competenceId: string,
    @Body() dto: AddProjectCompetenceDto,
  ) {
    return this.projectCompetencesService.addProjectCompetence(
      request.user.sub,
      id,
      competenceId,
      dto.level,
    );
  }

  @Patch(':id/competences/:competenceId')
  @UseGuards(AuthGuard, ProfileTypeGuard)
  @ProfileType('RESEARCHER')
  updateProjectCompetence(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('competenceId') competenceId: string,
    @Body() dto: UpdateProjectCompetenceDto,
  ) {
    return this.projectCompetencesService.updateProjectCompetence(
      request.user.sub,
      id,
      competenceId,
      dto.level,
    );
  }

  @Delete(':id/competences/:competenceId')
  @UseGuards(AuthGuard, ProfileTypeGuard)
  @ProfileType('RESEARCHER')
  removeProjectCompetence(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('competenceId') competenceId: string,
  ) {
    return this.projectCompetencesService.removeProjectCompetence(
      request.user.sub,
      id,
      competenceId,
    );
  }
}