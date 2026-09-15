import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../database/prisma/prisma.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { ListProjectsQueryDto } from './dto/list-projects-query.dto.js';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProject(
    userId: string,
    dto: CreateProjectDto,
  ) {
    return this.prisma.project.create({
      data: {
        ownerId: userId,
        title: dto.title,
        description: dto.description,
        keywords: dto.keywords,
        researchField: dto.researchField,
        trl: dto.trl,
        crl: dto.crl,
        patentStatus: dto.patentStatus,
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
        source: true,
        sourceExternalId: true,
        sourceUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getProject(
    userId: string,
    projectId: string,
  ) {
    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
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
        source: true,
        sourceExternalId: true,
        sourceUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.status === 'ARCHIVED') {
      throw new NotFoundException('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this project',
      );
    }

    return project;
  }

  async updateProject(
    userId: string,
    projectId: string,
    dto: UpdateProjectDto,
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
        'You cannot update this project',
      );
    }

    if (project.status === 'ARCHIVED') {
      throw new ConflictException(
        'Archived projects cannot be updated',
      );
    }

    return this.prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        title: dto.title,
        description: dto.description,
        keywords: dto.keywords,
        researchField: dto.researchField,
        trl: dto.trl,
        crl: dto.crl,
        patentStatus: dto.patentStatus,
        status: dto.status,
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
        source: true,
        sourceExternalId: true,
        sourceUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async removeProject(
    userId: string,
    projectId: string,
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
        'You cannot delete this project',
      );
    }

    if (project.status === 'ARCHIVED') {
      return {
        success: true,
        alreadyArchived: true,
      };
    }

    await this.prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        status: 'ARCHIVED',
      },
    });

    return {
      success: true,
    };
  }

  async listProjects(query: ListProjectsQueryDto) {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const where = {
      status: 'PUBLISHED' as const,
      ...(query.ownerId
        ? {
            ownerId: query.ownerId,
          }
        : {}),
    };

    const [projects, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
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
        },
      }),

      this.prisma.project.count({
        where,
      }),
    ]);

    return {
      data: projects,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}