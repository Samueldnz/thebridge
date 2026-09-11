import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../database/prisma/prisma.service.js';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto.js';
import { UpdateResearcherProfileDto } from './dto/update-researcher-profile.dto.js';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async getResearcherProfile(userId: string) {
    const profile = await this.prisma.researcherProfile.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
        userId: true,
        cpf: true,
        bio: true,
        academicTitle: true,
        researchField: true,
        lattesUrl: true,
        orcidUrl: true,
        linkedinUrl: true,
        trustBadge: true,
        affiliations: {
          select: {
            id: true,
            role: true,
            title: true,
            isPrimary: true,
            startedAt: true,
            endedAt: true,
            organization: {
              select: {
                id: true,
                legalName: true,
                tradeName: true,
                type: true,
              },
            },
          },
        },
        competences: {
          select: {
            level: true,
            competence: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException(
        'Researcher profile not found',
      );
    }

    return profile;
  }

  async updateResearcherProfile(
    userId: string,
    dto: UpdateResearcherProfileDto,
  ) {
    const profile = await this.prisma.researcherProfile.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!profile) {
      throw new NotFoundException(
        'Researcher profile not found',
      );
    }

    try {
      return await this.prisma.researcherProfile.update({
        where: {
          userId,
        },
        data: {
          ...(dto.cpf !== undefined && {
            cpf: dto.cpf.trim() || null,
          }),
          ...(dto.bio !== undefined && {
            bio: dto.bio.trim() || null,
          }),
          ...(dto.academicTitle !== undefined && {
            academicTitle: dto.academicTitle.trim() || null,
          }),
          ...(dto.researchField !== undefined && {
            researchField: dto.researchField.trim() || null,
          }),
          ...(dto.lattesUrl !== undefined && {
            lattesUrl: dto.lattesUrl.trim() || null,
          }),
          ...(dto.orcidUrl !== undefined && {
            orcidUrl: dto.orcidUrl.trim() || null,
          }),
          ...(dto.linkedinUrl !== undefined && {
            linkedinUrl: dto.linkedinUrl.trim() || null,
          }),
        },
        select: {
          id: true,
          userId: true,
          cpf: true,
          bio: true,
          academicTitle: true,
          researchField: true,
          lattesUrl: true,
          orcidUrl: true,
          linkedinUrl: true,
          trustBadge: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException(
          'CPF already registered',
        );
      }

      throw error;
    }
  }

  async getCompanyProfile(userId: string) {
    const membership =
      await this.prisma.organizationMember.findFirst({
        where: {
          userId,
          organization: {
            type: 'COMPANY',
          },
        },
        select: {
          id: true,
          role: true,
          organization: {
            select: {
              id: true,
              type: true,
              legalName: true,
              tradeName: true,
              cnpj: true,
              description: true,
              website: true,
              email: true,
              phone: true,
              logoUrl: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

    if (!membership) {
      throw new NotFoundException(
        'Company organization not found',
      );
    }

    return {
      role: membership.role,
      organization: membership.organization,
    };
  }

  async updateCompanyProfile(
    userId: string,
    dto: UpdateCompanyProfileDto,
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
          role: true,
          organizationId: true,
        },
      });

    if (!membership) {
      throw new NotFoundException(
        'Company organization not found',
      );
    }

    if (
      membership.role !== 'OWNER' &&
      membership.role !== 'ADMIN'
    ) {
      throw new ForbiddenException(
        'You do not have permission to update this organization',
      );
    }

    try {
      return await this.prisma.organization.update({
        where: {
          id: membership.organizationId,
        },
        data: {
          ...(dto.legalName !== undefined && {
            legalName: dto.legalName.trim(),
          }),
          ...(dto.tradeName !== undefined && {
            tradeName: dto.tradeName.trim() || null,
          }),
          ...(dto.cnpj !== undefined && {
            cnpj: dto.cnpj.trim() || null,
          }),
          ...(dto.description !== undefined && {
            description: dto.description.trim() || null,
          }),
          ...(dto.website !== undefined && {
            website: dto.website.trim() || null,
          }),
          ...(dto.email !== undefined && {
            email: dto.email.trim() || null,
          }),
          ...(dto.phone !== undefined && {
            phone: dto.phone.trim() || null,
          }),
        },
        select: {
          id: true,
          type: true,
          legalName: true,
          tradeName: true,
          cnpj: true,
          description: true,
          website: true,
          email: true,
          phone: true,
          logoUrl: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException(
          'CNPJ already registered',
        );
      }

      throw error;
    }
  }
}