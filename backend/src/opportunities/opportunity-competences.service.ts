import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../database/prisma/prisma.service.js';
import { MatchingService } from '../matching/matching.service.js';

import { OpportunityStatus } from '../generated/prisma/enums.js';
import { UpdateOpportunityCompetenceDto } from './dto/update-opportunity-competence.dto.js';

@Injectable()
export class OpportunityCompetencesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly matchingService: MatchingService,
  ) {}

  private async recalculateOpportunityMatches(
    opportunityId: string,
  ): Promise<void> {
    const projects =
      await this.prisma.project.findMany({
        where: {
          status: 'PUBLISHED',
        },
        select: {
          id: true,
        },
      });

    await Promise.all(
      projects.map((project) =>
        this.matchingService.calculateAndPersist(
          opportunityId,
          project.id,
        ),
      ),
    );
  }

  private async getOwnedOpportunity(
    opportunityId: string,
    userId: string,
  ) {
    const opportunity = await this.prisma.opportunity.findFirst({
      where: {
        id: opportunityId,
        ownerId: userId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    if (opportunity.status === OpportunityStatus.ARCHIVED) {
      throw new ConflictException(
        'Archived opportunities cannot be modified',
      );
    }

    return opportunity;
  }

  async listCompetences(
    opportunityId: string,
    userId: string,
  ) {
    await this.getOwnedOpportunity(opportunityId, userId);

    return this.prisma.opportunityCompetence.findMany({
      where: {
        opportunityId,
      },
      orderBy: {
        weight: 'desc',
      },
      select: {
        competenceId: true,
        weight: true,
        competence: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            parentId: true,
            isActive: true,
          },
        },
      },
    });
  }

  async addCompetence(
    opportunityId: string,
    competenceId: string,
    userId: string,
    weight: number,
  ) {
    const opportunity =
    await this.getOwnedOpportunity(
      opportunityId,
      userId,
    );

    const competence = await this.prisma.competence.findUnique({
      where: {
        id: competenceId,
      },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!competence) {
      throw new NotFoundException('Competence not found');
    }

    if (!competence.isActive) {
      throw new ConflictException(
        'Inactive competences cannot be added',
      );
    }

    const existing =
      await this.prisma.opportunityCompetence.findUnique({
        where: {
          opportunityId_competenceId: {
            opportunityId,
            competenceId,
          },
        },
      });

    if (existing) {
      throw new ConflictException(
        'Competence is already associated with this opportunity',
      );
    }

    const relation = await this.prisma.opportunityCompetence.create({
      data: {
        opportunityId,
        competenceId,
        weight,
      },
      select: {
        competenceId: true,
        weight: true,
        competence: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            parentId: true,
            isActive: true,
          },
        },
      },
    });

    if (opportunity.status === 'OPEN') {
      await this.recalculateOpportunityMatches(
        opportunity.id,
      );
    }

    return relation;
  }

  async updateCompetence(
    opportunityId: string,
    competenceId: string,
    userId: string,
    dto: UpdateOpportunityCompetenceDto,
  ) {
    const opportunity =
    await this.getOwnedOpportunity(
      opportunityId,
      userId,
    );

    const relation =
      await this.prisma.opportunityCompetence.findUnique({
        where: {
          opportunityId_competenceId: {
            opportunityId,
            competenceId,
          },
        },
      });

    if (!relation) {
      throw new NotFoundException(
        'Competence is not associated with this opportunity',
      );
    }

    const relationUp = await this.prisma.opportunityCompetence.update({
      where: {
        opportunityId_competenceId: {
          opportunityId,
          competenceId,
        },
      },
      data: {
        weight: dto.weight,
      },
      select: {
        competenceId: true,
        weight: true,
        competence: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            parentId: true,
            isActive: true,
          },
        },
      },
    });

    if (opportunity.status === 'OPEN') {
      await this.recalculateOpportunityMatches(
        opportunity.id,
      );
    }

    return relationUp;
  }

  async removeCompetence(
    opportunityId: string,
    competenceId: string,
    userId: string,
  ) {
    const opportunity =
    await this.getOwnedOpportunity(
      opportunityId,
      userId,
    );

    const relation =
      await this.prisma.opportunityCompetence.findUnique({
        where: {
          opportunityId_competenceId: {
            opportunityId,
            competenceId,
          },
        },
      });

    if (!relation) {
      throw new NotFoundException(
        'Competence is not associated with this opportunity',
      );
    }

    await this.prisma.opportunityCompetence.delete({
      where: {
        opportunityId_competenceId: {
          opportunityId,
          competenceId,
        },
      },
    });

    if (opportunity.status === 'OPEN') {
      await this.recalculateOpportunityMatches(
        opportunity.id,
      );
    }

    return {
      success: true,
    };
  }
}