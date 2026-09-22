import {
  ConflictException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../database/prisma/prisma.service.js';
import { DiscoveryOpportunitiesQueryDto } from './dto/iscovery-opportunities-query.dto.js';
import { DiscoveryProjectsQueryDto } from './dto/discovery-projects-query.dto.js';

@Injectable()
export class DiscoveryService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async listOpportunities(
    userId: string,
    query: DiscoveryOpportunitiesQueryDto,
  ) {
    this.validateRanges(
      query.minTrl,
      query.maxTrl,
      'TRL',
    );

    this.validateRanges(
      query.minCrl,
      query.maxCrl,
      'CRL',
    );

    const opportunities =
      await this.prisma.opportunity.findMany({
        where: {
          status: 'OPEN',

          ...(query.competenceId
            ? {
                competences: {
                  some: {
                    competenceId: query.competenceId,
                  },
                },
              }
            : {}),

          ...(query.industrySector
            ? {
                industrySector: query.industrySector,
              }
            : {}),

          ...(query.desiredTechnology
            ? {
                desiredTechnology:
                  query.desiredTechnology,
              }
            : {}),

          ...(query.minTrl !== undefined
            ? {
                minTrl: {
                  gte: query.minTrl,
                },
              }
            : {}),

          ...(query.maxTrl !== undefined
            ? {
                minTrl: {
                  lte: query.maxTrl,
                },
              }
            : {}),

          ...(query.minCrl !== undefined
            ? {
                desiredCrl: {
                  gte: query.minCrl,
                },
              }
            : {}),

          ...(query.maxCrl !== undefined
            ? {
                desiredCrl: {
                  lte: query.maxCrl,
                },
              }
            : {}),

          ...(query.patentRequirement
            ? {
                patentRequirement:
                  query.patentRequirement,
              }
            : {}),
        },

        select: {
          id: true,
          ownerId: true,
          organizationId: true,
          title: true,
          description: true,
          keywords: true,
          industrySector: true,
          desiredTechnology: true,
          minTrl: true,
          desiredCrl: true,
          patentRequirement: true,
          budgetMin: true,
          budgetMax: true,
          currency: true,
          timeline: true,
          status: true,
          createdAt: true,
          updatedAt: true,

          organization: {
            select: {
              id: true,
              legalName: true,
              tradeName: true,
            },
          },
        },
      });

    if (opportunities.length === 0) {
      return {
        data: [],
        meta: {
          page: query.page,
          limit: query.limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    const opportunityIds =
      opportunities.map(
        (opportunity) => opportunity.id,
      );

    const matches =
      await this.prisma.match.findMany({
        where: {
          opportunityId: {
            in: opportunityIds,
          },

          modelVersion: 'v1',

          opportunity: {
            status: 'OPEN',
          },

          project: {
            ownerId: userId,
            status: 'PUBLISHED',
          },
        },

        orderBy: [
          {
            score: 'desc',
          },
          {
            createdAt: 'desc',
          },
        ],

        select: {
          id: true,
          opportunityId: true,
          projectId: true,
          score: true,

          project: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

    const bestMatches =
      new Map<
        string,
        (typeof matches)[number]
      >();

    for (const match of matches) {
      if (!bestMatches.has(match.opportunityId)) {
        bestMatches.set(
          match.opportunityId,
          match,
        );
      }
    }

    const ranked = opportunities
      .map((opportunity) => {
        const bestMatch =
          bestMatches.get(opportunity.id);

        return {
          ...opportunity,

          rankingScore: bestMatch
            ? Number(bestMatch.score)
            : null,

          rankingPercentage: bestMatch
            ? Number(bestMatch.score) * 100
            : null,

          bestMatch: bestMatch
            ? {
                id: bestMatch.id,
                projectId: bestMatch.projectId,
                score: Number(bestMatch.score),
                percentage:
                  Number(bestMatch.score) * 100,
                project: bestMatch.project,
              }
            : null,
        };
      })
      .sort((a, b) => {
        if (
          a.rankingScore === null &&
          b.rankingScore === null
        ) {
          return (
            b.createdAt.getTime() -
            a.createdAt.getTime()
          );
        }

        if (a.rankingScore === null) {
          return 1;
        }

        if (b.rankingScore === null) {
          return -1;
        }

        if (
          b.rankingScore !== a.rankingScore
        ) {
          return (
            b.rankingScore -
            a.rankingScore
          );
        }

        return (
          b.createdAt.getTime() -
          a.createdAt.getTime()
        );
      });

    return this.paginate(
      ranked,
      query.page,
      query.limit,
    );
  }

  async listProjects(
    userId: string,
    query: DiscoveryProjectsQueryDto,
  ) {
    this.validateRanges(
      query.minTrl,
      query.maxTrl,
      'TRL',
    );

    this.validateRanges(
      query.minCrl,
      query.maxCrl,
      'CRL',
    );

    const projects =
      await this.prisma.project.findMany({
        where: {
          status: 'PUBLISHED',

          ...(query.competenceId
            ? {
                competences: {
                  some: {
                    competenceId: query.competenceId,
                  },
                },
              }
            : {}),

          ...(query.researchField
            ? {
                researchField:
                  query.researchField,
              }
            : {}),

          ...(query.minTrl !== undefined
            ? {
                trl: {
                  gte: query.minTrl,
                },
              }
            : {}),

          ...(query.maxTrl !== undefined
            ? {
                trl: {
                  lte: query.maxTrl,
                },
              }
            : {}),

          ...(query.minCrl !== undefined
            ? {
                crl: {
                  gte: query.minCrl,
                },
              }
            : {}),

          ...(query.maxCrl !== undefined
            ? {
                crl: {
                  lte: query.maxCrl,
                },
              }
            : {}),

          ...(query.patentStatus
            ? {
                patentStatus:
                  query.patentStatus,
              }
            : {}),
        },

        select: {
          id: true,
          ownerId: true,
          organizationId: true,
          title: true,
          description: true,
          keywords: true,
          researchField: true,
          trl: true,
          crl: true,
          patentStatus: true,
          status: true,
          createdAt: true,
          updatedAt: true,

          owner: {
            select: {
              id: true,
              name: true,
              profileType: true,
            },
          },

          organization: {
            select: {
              id: true,
              legalName: true,
              tradeName: true,
            },
          },
        },
      });

    if (projects.length === 0) {
      return {
        data: [],
        meta: {
          page: query.page,
          limit: query.limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    const projectIds =
      projects.map(
        (project) => project.id,
      );

    const matches =
      await this.prisma.match.findMany({
        where: {
          projectId: {
            in: projectIds,
          },

          modelVersion: 'v1',

          opportunity: {
            ownerId: userId,
            status: 'OPEN',
          },

          project: {
            status: 'PUBLISHED',
          },
        },

        orderBy: [
          {
            score: 'desc',
          },
          {
            createdAt: 'desc',
          },
        ],

        select: {
          id: true,
          opportunityId: true,
          projectId: true,
          score: true,

          opportunity: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

    const bestMatches =
      new Map<
        string,
        (typeof matches)[number]
      >();

    for (const match of matches) {
      if (!bestMatches.has(match.projectId)) {
        bestMatches.set(match.projectId, match);
      }
    }

    const ranked = projects
      .map((project) => {
        const bestMatch =
          bestMatches.get(project.id);

        return {
          ...project,

          rankingScore: bestMatch
            ? Number(bestMatch.score)
            : null,

          rankingPercentage: bestMatch
            ? Number(bestMatch.score) * 100
            : null,

          bestMatch: bestMatch
            ? {
                id: bestMatch.id,
                opportunityId:
                  bestMatch.opportunityId,
                score: Number(bestMatch.score),
                percentage:
                  Number(bestMatch.score) * 100,
                opportunity:
                  bestMatch.opportunity,
              }
            : null,
        };
      })
      .sort((a, b) => {
        if (
          a.rankingScore === null &&
          b.rankingScore === null
        ) {
          return (
            b.createdAt.getTime() -
            a.createdAt.getTime()
          );
        }

        if (a.rankingScore === null) {
          return 1;
        }

        if (b.rankingScore === null) {
          return -1;
        }

        if (
          b.rankingScore !== a.rankingScore
        ) {
          return (
            b.rankingScore -
            a.rankingScore
          );
        }

        return (
          b.createdAt.getTime() -
          a.createdAt.getTime()
        );
      });

    return this.paginate(
      ranked,
      query.page,
      query.limit,
    );
  }

  private validateRanges(
    min: number | undefined,
    max: number | undefined,
    field: string,
  ): void {
    if (
      min !== undefined &&
      max !== undefined &&
      min > max
    ) {
      throw new ConflictException(
        `${field} minimum cannot be greater than maximum`,
      );
    }
  }

  private paginate<T>(
    items: T[],
    page: number,
    limit: number,
  ) {
    const total = items.length;
    const skip = (page - 1) * limit;

    return {
      data: items.slice(
        skip,
        skip + limit,
      ),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(
          total / limit,
        ),
      },
    };
  }
}