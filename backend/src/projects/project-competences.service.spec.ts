import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { ProjectCompetencesService } from './project-competences.service.js';

describe('ProjectCompetencesService - matching triggers', () => {
  const prismaMock = {
    project: {
      findUnique: vi.fn(),
    },
    competence: {
      findUnique: vi.fn(),
    },
    projectCompetence: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    opportunity: {
      findMany: vi.fn(),
    },
  };

  const matchingServiceMock = {
    calculateAndPersist: vi.fn(),
  };

  let service: ProjectCompetencesService;

  beforeEach(() => {
    vi.clearAllMocks();

    service = new ProjectCompetencesService(
      prismaMock as never,
      matchingServiceMock as never,
    );
  });

  it('calculates matches when a competence is added to a published project', async () => {
    prismaMock.project.findUnique.mockResolvedValue({
      id: 'project-1',
      ownerId: 'user-1',
      status: 'PUBLISHED',
    });

    prismaMock.competence.findUnique.mockResolvedValue({
      id: 'competence-1',
      isActive: true,
    });

    prismaMock.projectCompetence.findUnique.mockResolvedValue(null);

    prismaMock.projectCompetence.create.mockResolvedValue({
      projectId: 'project-1',
      competenceId: 'competence-1',
    });

    prismaMock.opportunity.findMany.mockResolvedValue([
      { id: 'opportunity-1' },
      { id: 'opportunity-2' },
    ]);

    await service.addProjectCompetence(
      'user-1',
      'project-1',
      'competence-1',
      5
    );

    expect(
      matchingServiceMock.calculateAndPersist,
    ).toHaveBeenCalledTimes(2);

    expect(
      matchingServiceMock.calculateAndPersist,
    ).toHaveBeenCalledWith(
      'opportunity-1',
      'project-1',
    );

    expect(
      matchingServiceMock.calculateAndPersist,
    ).toHaveBeenCalledWith(
      'opportunity-2',
      'project-1',
    );
  });

  it('does not calculate matches when a competence is added to a draft project', async () => {
    prismaMock.project.findUnique.mockResolvedValue({
      id: 'project-1',
      ownerId: 'user-1',
      status: 'DRAFT',
    });

    prismaMock.competence.findUnique.mockResolvedValue({
      id: 'competence-1',
      isActive: true,
    });

    prismaMock.projectCompetence.findUnique.mockResolvedValue(null);

    prismaMock.projectCompetence.create.mockResolvedValue({
      projectId: 'project-1',
      competenceId: 'competence-1',
      level: 5,
    });

    await service.addProjectCompetence(
      'user-1',
      'project-1',
      'competence-1',
      5
    );

    expect(
      matchingServiceMock.calculateAndPersist,
    ).not.toHaveBeenCalled();

    expect(
      prismaMock.opportunity.findMany,
    ).not.toHaveBeenCalled();
  });

  it('calculates matches when a competence is removed from a published project', async () => {
    prismaMock.project.findUnique.mockResolvedValue({
      id: 'project-1',
      ownerId: 'user-1',
      status: 'PUBLISHED',
    });

    prismaMock.projectCompetence.findUnique.mockResolvedValue({
      projectId: 'project-1',
      competenceId: 'competence-1',
    });

    prismaMock.projectCompetence.delete.mockResolvedValue({
      projectId: 'project-1',
      competenceId: 'competence-1',
    });

    prismaMock.opportunity.findMany.mockResolvedValue([
      { id: 'opportunity-1' },
    ]);

    await service.removeProjectCompetence(
      'user-1',
      'project-1',
      'competence-1',
    );

    expect(
      matchingServiceMock.calculateAndPersist,
    ).toHaveBeenCalledTimes(1);

    expect(
      matchingServiceMock.calculateAndPersist,
    ).toHaveBeenCalledWith(
      'opportunity-1',
      'project-1',
    );
  });

  it('does not calculate matches when a competence is removed from a draft project', async () => {
    prismaMock.project.findUnique.mockResolvedValue({
      id: 'project-1',
      ownerId: 'user-1',
      status: 'DRAFT',
    });

    prismaMock.projectCompetence.findUnique.mockResolvedValue({
      projectId: 'project-1',
      competenceId: 'competence-1',
    });

    prismaMock.projectCompetence.delete.mockResolvedValue({
      projectId: 'project-1',
      competenceId: 'competence-1',
    });

    await service.removeProjectCompetence(
      'user-1',
      'project-1',
      'competence-1',
    );

    expect(
      matchingServiceMock.calculateAndPersist,
    ).not.toHaveBeenCalled();

    expect(
      prismaMock.opportunity.findMany,
    ).not.toHaveBeenCalled();
  });

  it('creates a project competence with the requested level', async () => {
    prismaMock.project.findUnique.mockResolvedValue({
      id: 'project-1',
      ownerId: 'user-1',
      status: 'DRAFT',
    });

    prismaMock.competence.findUnique.mockResolvedValue({
      id: 'competence-1',
      isActive: true,
    });

    prismaMock.projectCompetence.findUnique.mockResolvedValue(
      null,
    );

    prismaMock.projectCompetence.create.mockResolvedValue({
      projectId: 'project-1',
      competenceId: 'competence-1',
      level: 4,
    });

    await service.addProjectCompetence(
      'user-1',
      'project-1',
      'competence-1',
      4,
    );

    expect(
      prismaMock.projectCompetence.create,
    ).toHaveBeenCalledWith({
      data: {
        projectId: 'project-1',
        competenceId: 'competence-1',
        level: 4,
      },
    });
  });

  it('updates project competence level and recalculates matches when project is published', async () => {
    prismaMock.project.findUnique.mockResolvedValue({
      id: 'project-1',
      ownerId: 'user-1',
      status: 'PUBLISHED',
    });

    prismaMock.projectCompetence.findUnique.mockResolvedValue({
      projectId: 'project-1',
      competenceId: 'competence-1',
      level: 3,
    });

    prismaMock.projectCompetence.update.mockResolvedValue({
      level: 5,
      competence: {
        id: 'competence-1',
        name: 'Machine Learning',
        slug: 'machine-learning',
        description: null,
        parentId: null,
        isActive: true,
      },
    });

    prismaMock.opportunity.findMany.mockResolvedValue([
      { id: 'opportunity-1' },
      { id: 'opportunity-2' },
    ]);

    const result =
      await service.updateProjectCompetence(
        'user-1',
        'project-1',
        'competence-1',
        5,
      );

    expect(result.level).toBe(5);

    expect(
      prismaMock.projectCompetence.update,
    ).toHaveBeenCalledWith({
      where: {
        projectId_competenceId: {
          projectId: 'project-1',
          competenceId: 'competence-1',
        },
      },
      data: {
        level: 5,
      },
      select: {
        level: true,
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

    expect(
      matchingServiceMock.calculateAndPersist,
    ).toHaveBeenCalledTimes(2);
  });

  it('rejects an invalid project competence level', async () => {
    await expect(
      service.addProjectCompetence(
        'user-1',
        'project-1',
        'competence-1',
        6,
      ),
    ).rejects.toThrow(
      'Project competence level must be between 1 and 5',
    );

    expect(
      prismaMock.project.findUnique,
    ).not.toHaveBeenCalled();
  });
});