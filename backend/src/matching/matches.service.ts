import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service.js';
import type { MatchQueryDto } from './dto/match-query.dto.js';

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, query: MatchQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      opportunity: {
        status: 'OPEN' as const,
      },
      project: {
        status: 'PUBLISHED' as const,
      },
      OR: [
        {
          opportunity: {
            ownerId: userId,
          },
        },
        {
          project: {
            ownerId: userId,
          },
        },
      ],
    };

    const [matches, total] = await Promise.all([
      this.prisma.match.findMany({
        where,
        orderBy: [
          { score: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
        select: this.matchSelect(),
      }),
      this.prisma.match.count({ where }),
    ]);

    return {
      data: matches,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: string, matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: {
        id: matchId,
      },
      select: this.matchSelect(),
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    this.ensureVisible(
      userId,
      match.opportunity.ownerId,
      match.project.ownerId,
    );

    if (
      match.opportunity.status !== 'OPEN' ||
      match.project.status !== 'PUBLISHED'
    ) {
      throw new NotFoundException('Match not found');
    }

    return match;
  }

  async findByOpportunity(
    userId: string,
    opportunityId: string,
    query: MatchQueryDto,
  ) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: {
        id: opportunityId,
      },
      select: {
        id: true,
        ownerId: true,
        status: true,
      },
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    if (opportunity.ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this opportunity',
      );
    }

    return this.findForOpportunity(opportunityId, query);
  }

  async findByProject(
    userId: string,
    projectId: string,
    query: MatchQueryDto,
  ) {
    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
      },
      select: {
        id: true,
        ownerId: true,
        status: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this project',
      );
    }

    return this.findForProject(projectId, query);
  }

  private async findForOpportunity(
    opportunityId: string,
    query: MatchQueryDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      opportunityId,
      opportunity: {
        status: 'OPEN' as const,
      },
      project: {
        status: 'PUBLISHED' as const,
      },
    };

    const [matches, total] = await Promise.all([
      this.prisma.match.findMany({
        where,
        orderBy: [
          { score: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
        select: this.matchSelect(),
      }),
      this.prisma.match.count({ where }),
    ]);

    return {
      data: matches,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async findForProject(
    projectId: string,
    query: MatchQueryDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      projectId,
      opportunity: {
        status: 'OPEN' as const,
      },
      project: {
        status: 'PUBLISHED' as const,
      },
    };

    const [matches, total] = await Promise.all([
      this.prisma.match.findMany({
        where,
        orderBy: [
          { score: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
        select: this.matchSelect(),
      }),
      this.prisma.match.count({ where }),
    ]);

    return {
      data: matches,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private ensureVisible(
    userId: string,
    opportunityOwnerId: string,
    projectOwnerId: string | null,
  ): void {
    if (
      opportunityOwnerId !== userId &&
      projectOwnerId !== userId
    ) {
      throw new ForbiddenException(
        'You do not have access to this match',
      );
    }
  }

  private matchSelect() {
    return {
      id: true,
      opportunityId: true,
      projectId: true,
      score: true,
      modelName: true,
      modelVersion: true,
      status: true,
      explanation: true,
      viewedAt: true,
      createdAt: true,
      updatedAt: true,
      opportunity: {
        select: {
          id: true,
          ownerId: true,
          title: true,
          status: true,
        },
      },
      project: {
        select: {
          id: true,
          ownerId: true,
          title: true,
          status: true,
        },
      },
    };
  }
}