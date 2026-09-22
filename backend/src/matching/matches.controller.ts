import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { MatchesService } from './matches.service.js';
import { MatchQueryDto } from './dto/match-query.dto.js';

@Controller('matches')
@UseGuards(AuthGuard)
export class MatchesController {
  constructor(
    private readonly matchesService: MatchesService,
  ) {}

  @Get()
  findAll(
    @CurrentUser('sub') userId: string,
    @Query() query: MatchQueryDto,
  ) {
    return this.matchesService.findAll(userId, query);
  }

  @Get('/opportunities/:opportunityId')
  findByOpportunity(
    @CurrentUser('sub') userId: string,
    @Param('opportunityId') opportunityId: string,
    @Query() query: MatchQueryDto,
  ) {
    return this.matchesService.findByOpportunity(
      userId,
      opportunityId,
      query,
    );
  }

  @Get('/projects/:projectId')
  findByProject(
    @CurrentUser('sub') userId: string,
    @Param('projectId') projectId: string,
    @Query() query: MatchQueryDto,
  ) {
    return this.matchesService.findByProject(
      userId,
      projectId,
      query,
    );
  }

  @Get(':id')
  findOne(
    @CurrentUser('sub') userId: string,
    @Param('id') matchId: string,
  ) {
    return this.matchesService.findOne(userId, matchId);
  }
}