import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../database/prisma/prisma.service.js';
import { CompanyOnboardingDto } from './dto/company-onboarding.dto.js';
import { ResearcherOnboardingDto } from './dto/researcher-onboarding.dto.js';

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async onboardResearcher(
    userId: string,
    dto: ResearcherOnboardingDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        profileType: true,
        profileCompleted: true,
        researcherProfile: {
          select: { id: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.profileType !== 'RESEARCHER') {
      throw new ForbiddenException(
        'Only researcher users can complete researcher onboarding',
      );
    }

    if (user.profileCompleted || user.researcherProfile) {
      throw new ConflictException(
        'Researcher onboarding has already been completed',
      );
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const profile = await tx.researcherProfile.create({
          data: {
            userId: user.id,
            cpf: dto.cpf?.trim() || null,
            bio: dto.bio?.trim() || null,
            academicTitle: dto.academicTitle?.trim() || null,
            researchField: dto.researchField?.trim() || null,
            lattesUrl: dto.lattesUrl?.trim() || null,
            orcidUrl: dto.orcidUrl?.trim() || null,
            linkedinUrl: dto.linkedinUrl?.trim() || null,
          },
        });

        await tx.user.update({
          where: { id: user.id },
          data: {
            profileCompleted: true,
          },
        });

        return {
          profile,
          profileCompleted: true,
        };
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException(
          'Researcher profile or CPF already exists',
        );
      }

      throw error;
    }
  }

  async onboardCompany(
    userId: string,
    dto: CompanyOnboardingDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        profileType: true,
        profileCompleted: true,
        organizationMemberships: {
          select: {
            id: true,
          },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.profileType !== 'COMPANY') {
      throw new ForbiddenException(
        'Only company users can complete company onboarding',
      );
    }

    if (user.profileCompleted || user.organizationMemberships.length > 0) {
      throw new ConflictException(
        'Company onboarding has already been completed',
      );
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const organization = await tx.organization.create({
          data: {
            type: 'COMPANY',
            legalName: dto.legalName.trim(),
            tradeName: dto.tradeName?.trim() || null,
            cnpj: dto.cnpj?.trim() || null,
            description: dto.description?.trim() || null,
            website: dto.website?.trim() || null,
            email: dto.email?.trim() || null,
            phone: dto.phone?.trim() || null,
            source: 'PLATFORM',
          },
        });

        await tx.organizationMember.create({
          data: {
            userId: user.id,
            organizationId: organization.id,
            role: 'OWNER',
          },
        });

        await tx.user.update({
          where: { id: user.id },
          data: {
            profileCompleted: true,
          },
        });

        return {
          organization,
          profileCompleted: true,
        };
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException(
          'Organization or CNPJ already exists',
        );
      }

      throw error;
    }
  }
}