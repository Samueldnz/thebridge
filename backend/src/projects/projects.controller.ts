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
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { ProjectsService } from './projects.service.js';

@Controller('projects')
@UseGuards(AuthGuard, ProfileTypeGuard)
@ProfileType('RESEARCHER')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
  ) {}

  @Post()
  createProject(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.createProject(
      request.user.sub,
      dto,
    );
  }

  @Get(':id')
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
  removeProject(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.projectsService.removeProject(
      request.user.sub,
      id,
    );
  }
}