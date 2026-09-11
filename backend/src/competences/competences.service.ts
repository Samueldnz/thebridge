import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../database/prisma/prisma.service.js';
import { ResearcherCompetenceDto } from './dto/researcher-competence.dto.js';
import { CreateCompetenceDto } from './dto/create-competence.dto.js';
import { UpdateCompetenceDto } from './dto/update-competence.dto.js';

@Injectable()
export class CompetencesService {
  constructor(private readonly prisma: PrismaService) {}

  async listCompetences() {
    return this.prisma.competence.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        {
          name: 'asc',
        },
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        parentId: true,
        isActive: true,
      },
    });
  }

  async getCompetence(id: string) {
    const competence = await this.prisma.competence.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        parentId: true,
        isActive: true,
      },
    });

    if (!competence) {
      throw new NotFoundException('Competence not found');
    }

    return competence;
  }

  async listResearcherCompetences(userId: string) {
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

    return this.prisma.researcherCompetence.findMany({
      where: {
        researcherId: researcher.id,
        competence: {
          isActive: true,
        },
      },
      orderBy: {
        competence: {
          name: 'asc',
        },
      },
      select: {
        competenceId: true,
        level: true,
        competence: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            parentId: true,
          },
        },
      },
    });
  }

  async addResearcherCompetence(
    userId: string,
    competenceId: string,
    dto: ResearcherCompetenceDto,
  ) {
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

    const competence =
      await this.prisma.competence.findUnique({
        where: {
          id: competenceId,
        },
        select: {
          id: true,
          isActive: true,
        },
      });

    if (!competence || !competence.isActive) {
      throw new NotFoundException(
        'Competence not found',
      );
    }

    try {
      return await this.prisma.researcherCompetence.create({
        data: {
          researcherId: researcher.id,
          competenceId,
          level: dto.level,
        },
        select: {
          competenceId: true,
          level: true,
          competence: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              parentId: true,
            },
          },
        },
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException(
          'Researcher already has this competence',
        );
      }

      throw error;
    }
  }

  async updateResearcherCompetence(
    userId: string,
    competenceId: string,
    dto: ResearcherCompetenceDto,
  ) {
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

    const existing =
      await this.prisma.researcherCompetence.findUnique({
        where: {
          researcherId_competenceId: {
            researcherId: researcher.id,
            competenceId,
          },
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'Researcher competence not found',
      );
    }

    return this.prisma.researcherCompetence.update({
      where: {
        researcherId_competenceId: {
          researcherId: researcher.id,
          competenceId,
        },
      },
      data: {
        level: dto.level,
      },
      select: {
        competenceId: true,
        level: true,
        competence: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            parentId: true,
          },
        },
      },
    });
  }

  async removeResearcherCompetence(
    userId: string,
    competenceId: string,
  ) {
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

    const existing =
      await this.prisma.researcherCompetence.findUnique({
        where: {
          researcherId_competenceId: {
            researcherId: researcher.id,
            competenceId,
          },
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'Researcher competence not found',
      );
    }

    await this.prisma.researcherCompetence.delete({
      where: {
        researcherId_competenceId: {
          researcherId: researcher.id,
          competenceId,
        },
      },
    });

    return {
      success: true,
    };
  }

  async createCompetence(dto: CreateCompetenceDto) {
    const parentId = dto.parentId ?? null;

    if (parentId) {
        const parent = await this.prisma.competence.findUnique({
        where: {
            id: parentId,
        },
        select: {
            id: true,
            isActive: true,
        },
        });

        if (!parent || !parent.isActive) {
        throw new NotFoundException(
            'Parent competence not found',
        );
        }
    }

    try {
        return await this.prisma.competence.create({
        data: {
            name: dto.name.trim(),
            slug: dto.slug.trim(),
            description: dto.description?.trim() || null,
            parentId,
        },
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            parentId: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        },
        });
    } catch (error) {
        if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException(
            'Competence slug already exists',
        );
        }

        throw error;
    }
    }

    async updateCompetence(
    id: string,
    dto: UpdateCompetenceDto,
    ) {
    const existing =
        await this.prisma.competence.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
        },
        });

    if (!existing) {
        throw new NotFoundException('Competence not found');
    }

    if (dto.parentId === id) {
        throw new BadRequestException(
        'A competence cannot be its own parent',
        );
    }

    if (dto.parentId) {
        const parent =
        await this.prisma.competence.findUnique({
            where: {
            id: dto.parentId,
            },
            select: {
            id: true,
            isActive: true,
            },
        });

        if (!parent || !parent.isActive) {
        throw new NotFoundException(
            'Parent competence not found',
        );
        }
    }

    try {
        return await this.prisma.competence.update({
        where: {
            id,
        },
        data: {
            ...(dto.name !== undefined && {
            name: dto.name.trim(),
            }),
            ...(dto.slug !== undefined && {
            slug: dto.slug.trim(),
            }),
            ...(dto.description !== undefined && {
            description: dto.description.trim() || null,
            }),
            ...(dto.parentId !== undefined && {
            parentId: dto.parentId,
            }),
            ...(dto.isActive !== undefined && {
            isActive: dto.isActive,
            }),
        },
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            parentId: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        },
        });
    } catch (error) {
        if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException(
            'Competence slug already exists',
        );
        }

        throw error;
    }
    }

    async removeCompetence(id: string) {
    const existing =
        await this.prisma.competence.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
            isActive: true,
        },
        });

    if (!existing) {
        throw new NotFoundException('Competence not found');
    }

    if (!existing.isActive) {
        return {
        success: true,
        alreadyInactive: true,
        };
    }

    await this.prisma.competence.update({
        where: {
        id,
        },
        data: {
        isActive: false,
        },
    });

    return {
        success: true,
    };
    }
}