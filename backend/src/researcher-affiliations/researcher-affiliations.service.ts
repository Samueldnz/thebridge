import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../database/prisma/prisma.service.js';
import { CreateResearcherAffiliationDto } from './dto/create-researcher-affiliation.dto.js';
import { UpdateResearcherAffiliationDto } from './dto/update-researcher-affiliation.dto.js';

@Injectable()
export class ResearcherAffiliationsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private async getResearcherProfile(userId: string) {
    const researcher =
      await this.prisma.researcherProfile.findUnique({
        where: {
          userId,
        },
        select: {
          id: true,
        },
      });

    if (!researcher) {
      throw new NotFoundException(
        'Researcher profile not found',
      );
    }

    return researcher;
  }

  async list(userId: string) {
    const researcher =
      await this.getResearcherProfile(userId);

    return this.prisma.researcherAffiliation.findMany({
      where: {
        researcherId: researcher.id,
      },
      orderBy: [
        {
          isPrimary: 'desc',
        },
        {
          startedAt: 'desc',
        },
      ],
      select: {
        organizationId: true,
        role: true,
        title: true,
        isPrimary: true,
        startedAt: true,
        endedAt: true,
        organization: {
          select: {
            id: true,
            type: true,
            legalName: true,
            tradeName: true,
          },
        },
      },
    });
  }

  async create(
    userId: string,
    dto: CreateResearcherAffiliationDto,
  ) {
    const researcher =
      await this.getResearcherProfile(userId);

    const organization =
      await this.prisma.organization.findUnique({
        where: {
          id: dto.organizationId,
        },
        select: {
          id: true,
        },
      });

    if (!organization) {
      throw new NotFoundException(
        'Organization not found',
      );
    }

    const existing =
      await this.prisma.researcherAffiliation.findUnique({
        where: {
          researcherId_organizationId: {
            researcherId: researcher.id,
            organizationId: dto.organizationId,
          },
        },
      });

    if (existing) {
      throw new ConflictException(
        'Researcher is already affiliated with this organization',
      );
    }

    if (
      dto.startedAt &&
      dto.endedAt &&
      new Date(dto.endedAt) < new Date(dto.startedAt)
    ) {
      throw new ConflictException(
        'endedAt cannot be earlier than startedAt',
      );
    }

    if (dto.isPrimary) {
      await this.prisma.researcherAffiliation.updateMany({
        where: {
          researcherId: researcher.id,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    return this.prisma.researcherAffiliation.create({
      data: {
        researcherId: researcher.id,
        organizationId: dto.organizationId,
        role: dto.role,
        title: dto.title,
        isPrimary: dto.isPrimary ?? false,
        startedAt: dto.startedAt
          ? new Date(dto.startedAt)
          : null,
        endedAt: dto.endedAt
          ? new Date(dto.endedAt)
          : null,
      },
      select: {
        organizationId: true,
        role: true,
        title: true,
        isPrimary: true,
        startedAt: true,
        endedAt: true,
        organization: {
          select: {
            id: true,
            type: true,
            legalName: true,
            tradeName: true,
          },
        },
      },
    });
  }

  async update(
    userId: string,
    organizationId: string,
    dto: UpdateResearcherAffiliationDto,
  ) {
    const researcher =
      await this.getResearcherProfile(userId);

    const affiliation =
      await this.prisma.researcherAffiliation.findUnique({
        where: {
          researcherId_organizationId: {
            researcherId: researcher.id,
            organizationId,
          },
        },
      });

    if (!affiliation) {
      throw new NotFoundException(
        'Researcher affiliation not found',
      );
    }

    if (
      dto.startedAt &&
      dto.endedAt &&
      new Date(dto.endedAt) < new Date(dto.startedAt)
    ) {
      throw new ConflictException(
        'endedAt cannot be earlier than startedAt',
      );
    }

    if (dto.isPrimary) {
      await this.prisma.researcherAffiliation.updateMany({
        where: {
          researcherId: researcher.id,
          isPrimary: true,
          organizationId: {
            not: organizationId,
          },
        },
        data: {
          isPrimary: false,
        },
      });
    }

    return this.prisma.researcherAffiliation.update({
      where: {
        researcherId_organizationId: {
          researcherId: researcher.id,
          organizationId,
        },
      },
      data: {
        ...(dto.role !== undefined
          ? { role: dto.role }
          : {}),
        ...(dto.title !== undefined
          ? { title: dto.title }
          : {}),
        ...(dto.isPrimary !== undefined
          ? { isPrimary: dto.isPrimary }
          : {}),
        ...(dto.startedAt !== undefined
          ? {
              startedAt: dto.startedAt
                ? new Date(dto.startedAt)
                : null,
            }
          : {}),
        ...(dto.endedAt !== undefined
          ? {
              endedAt: dto.endedAt
                ? new Date(dto.endedAt)
                : null,
            }
          : {}),
      },
      select: {
        organizationId: true,
        role: true,
        title: true,
        isPrimary: true,
        startedAt: true,
        endedAt: true,
        organization: {
          select: {
            id: true,
            type: true,
            legalName: true,
            tradeName: true,
          },
        },
      },
    });
  }

  async remove(
    userId: string,
    organizationId: string,
  ) {
    const researcher =
      await this.getResearcherProfile(userId);

    const affiliation =
      await this.prisma.researcherAffiliation.findUnique({
        where: {
          researcherId_organizationId: {
            researcherId: researcher.id,
            organizationId,
          },
        },
      });

    if (!affiliation) {
      throw new NotFoundException(
        'Researcher affiliation not found',
      );
    }

    await this.prisma.researcherAffiliation.delete({
      where: {
        researcherId_organizationId: {
          researcherId: researcher.id,
          organizationId,
        },
      },
    });

    return {
      success: true,
    };
  }
}