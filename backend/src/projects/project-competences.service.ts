import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../database/prisma/prisma.service.js';

@Injectable()
export class ProjectCompetencesService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOwnedActiveProject(
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
        'You do not have access to this project',
      );
    }

    if (project.status === 'ARCHIVED') {
      throw new ConflictException(
        'Archived projects cannot be modified',
      );
    }

    return project;
  }

  async listProjectCompetences(
    userId: string,
    projectId: string,
  ) {
    await this.getOwnedActiveProject(userId, projectId);

    return this.prisma.projectCompetence.findMany({
      where: {
        projectId,
      },
      select: {
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
      orderBy: {
        competence: {
          name: 'asc',
        },
      },
    });
  }

  async addProjectCompetence(
    userId: string,
    projectId: string,
    competenceId: string,
  ) {
    await this.getOwnedActiveProject(userId, projectId);

    const competence =
      await this.prisma.competence.findUnique({
        where: {
          id: competenceId,
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
      throw new NotFoundException(
        'Competence not found',
      );
    }

    if (!competence.isActive) {
      throw new NotFoundException(
        'Competence not found',
      );
    }

    const existing =
      await this.prisma.projectCompetence.findUnique({
        where: {
          projectId_competenceId: {
            projectId,
            competenceId,
          },
        },
      });

    if (existing) {
      throw new ConflictException(
        'Competence is already associated with this project',
      );
    }

    await this.prisma.projectCompetence.create({
      data: {
        projectId,
        competenceId,
      },
    });

    return competence;
  }

  async removeProjectCompetence(
    userId: string,
    projectId: string,
    competenceId: string,
  ) {
    await this.getOwnedActiveProject(userId, projectId);

    const existing =
      await this.prisma.projectCompetence.findUnique({
        where: {
          projectId_competenceId: {
            projectId,
            competenceId,
          },
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'Project competence association not found',
      );
    }

    await this.prisma.projectCompetence.delete({
      where: {
        projectId_competenceId: {
          projectId,
          competenceId,
        },
      },
    });

    return {
      success: true,
    };
  }
}