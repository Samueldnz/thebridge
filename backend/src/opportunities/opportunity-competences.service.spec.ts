import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { OpportunityCompetencesService } from './opportunity-competences.service.js';

describe('OpportunityCompetencesService - matching triggers', () => {
  const prismaMock = {
    opportunity: {
      findFirst: vi.fn(),
    },

    competence: {
      findUnique: vi.fn(),
    },

    opportunityCompetence: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },

    project: {
      findMany: vi.fn(),
    },
  };

  const matchingServiceMock = {
    calculateAndPersist: vi.fn(),
  };

  let service: OpportunityCompetencesService;

  beforeEach(() => {
    vi.clearAllMocks();

    service = new OpportunityCompetencesService(
      prismaMock as never,
      matchingServiceMock as never,
    );
  });

  it('calculates matches when a competence is added to an open opportunity', async () => {
    prismaMock.opportunity.findFirst.mockResolvedValue({
      id: 'opportunity-1',
      status: 'OPEN',
    });

    prismaMock.competence.findUnique.mockResolvedValue({
      id: 'competence-1',
      isActive: true,
    });

    prismaMock.opportunityCompetence.findUnique.mockResolvedValue(
      null,
    );

    prismaMock.opportunityCompetence.create.mockResolvedValue({
      competenceId: 'competence-1',
      weight: 5,
    });

    prismaMock.project.findMany.mockResolvedValue([
      { id: 'project-1' },
      { id: 'project-2' },
    ]);

    await service.addCompetence(
      'opportunity-1',
      'competence-1',
      'user-1',
      5,
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
      'opportunity-1',
      'project-2',
    );
  });

  it('does not calculate matches when a competence is added to a draft opportunity', async () => {
    prismaMock.opportunity.findFirst.mockResolvedValue({
      id: 'opportunity-1',
      status: 'DRAFT',
    });

    prismaMock.competence.findUnique.mockResolvedValue({
      id: 'competence-1',
      isActive: true,
    });

    prismaMock.opportunityCompetence.findUnique.mockResolvedValue(
      null,
    );

    prismaMock.opportunityCompetence.create.mockResolvedValue({
      competenceId: 'competence-1',
      weight: 5,
    });

    await service.addCompetence(
      'opportunity-1',
      'competence-1',
      'user-1',
      5,
    );

    expect(
      matchingServiceMock.calculateAndPersist,
    ).not.toHaveBeenCalled();

    expect(
      prismaMock.project.findMany,
    ).not.toHaveBeenCalled();
  });

  it('calculates matches when a competence weight is updated on an open opportunity', async () => {
    prismaMock.opportunity.findFirst.mockResolvedValue({
      id: 'opportunity-1',
      status: 'OPEN',
    });

    prismaMock.opportunityCompetence.findUnique.mockResolvedValue({
      opportunityId: 'opportunity-1',
      competenceId: 'competence-1',
    });

    prismaMock.opportunityCompetence.update.mockResolvedValue({
      competenceId: 'competence-1',
      weight: 4,
    });

    prismaMock.project.findMany.mockResolvedValue([
      { id: 'project-1' },
    ]);

    await service.updateCompetence(
      'opportunity-1',
      'competence-1',
      'user-1',
      {
        weight: 4,
      } as never,
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

  it('calculates matches when a competence is removed from an open opportunity', async () => {
    prismaMock.opportunity.findFirst.mockResolvedValue({
      id: 'opportunity-1',
      status: 'OPEN',
    });

    prismaMock.opportunityCompetence.findUnique.mockResolvedValue({
      opportunityId: 'opportunity-1',
      competenceId: 'competence-1',
    });

    prismaMock.opportunityCompetence.delete.mockResolvedValue({
      opportunityId: 'opportunity-1',
      competenceId: 'competence-1',
    });

    prismaMock.project.findMany.mockResolvedValue([
      { id: 'project-1' },
    ]);

    await service.removeCompetence(
      'opportunity-1',
      'competence-1',
      'user-1',
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

  it('does not calculate matches when a competence is removed from a draft opportunity', async () => {
    prismaMock.opportunity.findFirst.mockResolvedValue({
      id: 'opportunity-1',
      status: 'DRAFT',
    });

    prismaMock.opportunityCompetence.findUnique.mockResolvedValue({
      opportunityId: 'opportunity-1',
      competenceId: 'competence-1',
    });

    prismaMock.opportunityCompetence.delete.mockResolvedValue({
      opportunityId: 'opportunity-1',
      competenceId: 'competence-1',
    });

    await service.removeCompetence(
      'opportunity-1',
      'competence-1',
      'user-1',
    );

    expect(
      matchingServiceMock.calculateAndPersist,
    ).not.toHaveBeenCalled();

    expect(
      prismaMock.project.findMany,
    ).not.toHaveBeenCalled();
  });
});