import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../database/prisma/prisma.service.js';
import { CreateOpportunityDto } from './dto/create-opportunity.dto.js';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto.js';
import { ListOpportunitiesQueryDto } from './dto/list-opportunities-query.dto.js';

@Injectable()
export class OpportunitiesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async listOpportunities(
    query: ListOpportunitiesQueryDto,
    ) {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const where = {
        status: 'OPEN' as const,

        ...(query.ownerId
            ? {
                ownerId: query.ownerId,
            }
            : {}),

        ...(query.organizationId
            ? {
                organizationId: query.organizationId,
            }
            : {}),
    };

    const [opportunities, total] =
        await this.prisma.$transaction([
        this.prisma.opportunity.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
            createdAt: 'desc',
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
        }),

        this.prisma.opportunity.count({
            where,
        }),
        ]);

    return {
        data: opportunities,
        meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        },
    };
    }

  private async getCompanyOrganization(
    userId: string,
  ) {
    const membership =
      await this.prisma.organizationMember.findFirst({
        where: {
          userId,
          organization: {
            type: 'COMPANY',
          },
        },
        select: {
          organizationId: true,
        },
      });

    if (!membership) {
      throw new ForbiddenException(
        'User is not associated with a company organization',
      );
    }

    return membership.organizationId;
  }

  async createOpportunity(
    userId: string,
    dto: CreateOpportunityDto,
  ) {
    const organizationId =
      await this.getCompanyOrganization(userId);

    if (
      dto.budgetMin !== undefined &&
      dto.budgetMax !== undefined &&
      dto.budgetMin > dto.budgetMax
    ) {
      throw new ConflictException(
        'budgetMin cannot be greater than budgetMax',
      );
    }

    return this.prisma.opportunity.create({
      data: {
        ownerId: userId,
        organizationId,
        title: dto.title,
        description: dto.description,
        keywords: dto.keywords,
        industrySector: dto.industrySector,
        desiredTechnology: dto.desiredTechnology,
        minTrl: dto.minTrl,
        desiredCrl: dto.desiredCrl,
        patentRequirement: dto.patentRequirement,
        budgetMin: dto.budgetMin,
        budgetMax: dto.budgetMax,
        currency: dto.currency,
        timeline: dto.timeline,
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
      },
    });
  }

  async getOpportunity(
    userId: string,
    opportunityId: string,
  ) {
    const opportunity =
      await this.prisma.opportunity.findUnique({
        where: {
          id: opportunityId,
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
        },
      });

    if (!opportunity) {
      throw new NotFoundException(
        'Opportunity not found',
      );
    }

    if (opportunity.status === 'ARCHIVED') {
      throw new NotFoundException(
        'Opportunity not found',
      );
    }

    if (opportunity.ownerId !== userId) {
      throw new NotFoundException(
        'Opportunity not found',
      );
    }

    return opportunity;
  }

  async updateOpportunity(
    userId: string,
    opportunityId: string,
    dto: UpdateOpportunityDto,
  ) {
    const opportunity =
      await this.prisma.opportunity.findUnique({
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
      throw new NotFoundException(
        'Opportunity not found',
      );
    }

    if (opportunity.ownerId !== userId) {
      throw new NotFoundException(
        'Opportunity not found',
      );
    }

    if (opportunity.status === 'ARCHIVED') {
      throw new ConflictException(
        'Archived opportunities cannot be updated',
      );
    }

    if (
      dto.budgetMin !== undefined &&
      dto.budgetMax !== undefined &&
      dto.budgetMin > dto.budgetMax
    ) {
      throw new ConflictException(
        'budgetMin cannot be greater than budgetMax',
      );
    }

    return this.prisma.opportunity.update({
      where: {
        id: opportunityId,
      },
      data: {
        title: dto.title,
        description: dto.description,
        keywords: dto.keywords,
        industrySector: dto.industrySector,
        desiredTechnology: dto.desiredTechnology,
        minTrl: dto.minTrl,
        desiredCrl: dto.desiredCrl,
        patentRequirement: dto.patentRequirement,
        budgetMin: dto.budgetMin,
        budgetMax: dto.budgetMax,
        currency: dto.currency,
        timeline: dto.timeline,
        status: dto.status,
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
      },
    });
  }

  async removeOpportunity(
    userId: string,
    opportunityId: string,
  ) {
    const opportunity =
      await this.prisma.opportunity.findUnique({
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
      throw new NotFoundException(
        'Opportunity not found',
      );
    }

    if (opportunity.ownerId !== userId) {
      throw new NotFoundException(
        'Opportunity not found',
      );
    }

    if (opportunity.status === 'ARCHIVED') {
      return {
        success: true,
        alreadyArchived: true,
      };
    }

    await this.prisma.opportunity.update({
      where: {
        id: opportunityId,
      },
      data: {
        status: 'ARCHIVED',
      },
    });

    return {
      success: true,
    };
  }
}