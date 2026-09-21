import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { OpportunitiesService } from './opportunities.service.js';

describe('OpportunitiesService - matching triggers', () => {
  const prismaMock = {
    opportunity: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },

    organizationMember: {
      findFirst: vi.fn(),
    },

    project: {
      findMany: vi.fn(),
    },
  };

  const matchingServiceMock = {
    calculateAndPersist: vi.fn(),
  };

  let service: OpportunitiesService;

  beforeEach(() => {
    vi.clearAllMocks();

    service = new OpportunitiesService(
      prismaMock as never,
      matchingServiceMock as never,
    );
  });

  it('calculates matches when an opportunity is created as OPEN', async () => {
    prismaMock.organizationMember.findFirst.mockResolvedValue({
      organizationId: 'organization-1',
    });

    prismaMock.opportunity.create.mockResolvedValue({
      id: 'opportunity-1',
      ownerId: 'user-1',
      organizationId: 'organization-1',
      title: 'Opportunity',
      description: 'Opportunity description',
      keywords: 'technology',
      industrySector: 'Technology',
      desiredTechnology: 'AI',
      minTrl: 5,
      desiredCrl: 4,
      patentRequirement: 'NOT_REQUIRED',
      budgetMin: null,
      budgetMax: null,
      currency: null,
      timeline: null,
      status: 'OPEN',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    prismaMock.project.findMany.mockResolvedValue([
      { id: 'project-1' },
      { id: 'project-2' },
    ]);

    await service.createOpportunity(
      'user-1',
      {
        title: 'Opportunity',
        description: 'Opportunity description',
      } as never,
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

  it('does not calculate matches when an opportunity is created as DRAFT', async () => {
    prismaMock.organizationMember.findFirst.mockResolvedValue({
      organizationId: 'organization-1',
    });

    prismaMock.opportunity.create.mockResolvedValue({
      id: 'opportunity-1',
      ownerId: 'user-1',
      organizationId: 'organization-1',
      title: 'Opportunity',
      description: 'Opportunity description',
      keywords: 'technology',
      industrySector: 'Technology',
      desiredTechnology: 'AI',
      minTrl: 5,
      desiredCrl: 4,
      patentRequirement: 'NOT_REQUIRED',
      budgetMin: null,
      budgetMax: null,
      currency: null,
      timeline: null,
      status: 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await service.createOpportunity(
      'user-1',
      {
        title: 'Opportunity',
        description: 'Opportunity description',
      } as never,
    );

    expect(
      matchingServiceMock.calculateAndPersist,
    ).not.toHaveBeenCalled();

    expect(
      prismaMock.project.findMany,
    ).not.toHaveBeenCalled();
  });

  it('calculates matches when minTrl changes on an open opportunity', async () => {
    prismaMock.opportunity.findUnique.mockResolvedValue({
      id: 'opportunity-1',
      ownerId: 'user-1',
      status: 'OPEN',
    });

    prismaMock.opportunity.update.mockResolvedValue({
      id: 'opportunity-1',
      ownerId: 'user-1',
      organizationId: 'organization-1',
      title: 'Opportunity',
      description: 'Opportunity description',
      keywords: 'technology',
      industrySector: 'Technology',
      desiredTechnology: 'AI',
      minTrl: 6,
      desiredCrl: 4,
      patentRequirement: 'NOT_REQUIRED',
      budgetMin: null,
      budgetMax: null,
      currency: null,
      timeline: null,
      status: 'OPEN',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    prismaMock.project.findMany.mockResolvedValue([
      { id: 'project-1' },
    ]);

    await service.updateOpportunity(
      'user-1',
      'opportunity-1',
      {
        minTrl: 6,
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

  it('does not calculate matches when only the title changes', async () => {
    prismaMock.opportunity.findUnique.mockResolvedValue({
      id: 'opportunity-1',
      ownerId: 'user-1',
      status: 'OPEN',
    });

    prismaMock.opportunity.update.mockResolvedValue({
      id: 'opportunity-1',
      ownerId: 'user-1',
      organizationId: 'organization-1',
      title: 'New title',
      description: 'Opportunity description',
      keywords: 'technology',
      industrySector: 'Technology',
      desiredTechnology: 'AI',
      minTrl: 5,
      desiredCrl: 4,
      patentRequirement: 'NOT_REQUIRED',
      budgetMin: null,
      budgetMax: null,
      currency: null,
      timeline: null,
      status: 'OPEN',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await service.updateOpportunity(
      'user-1',
      'opportunity-1',
      {
        title: 'New title',
      } as never,
    );

    expect(
      matchingServiceMock.calculateAndPersist,
    ).not.toHaveBeenCalled();

    expect(
      prismaMock.project.findMany,
    ).not.toHaveBeenCalled();
  });

  it('calculates matches when an opportunity becomes OPEN', async () => {
    prismaMock.opportunity.findUnique.mockResolvedValue({
      id: 'opportunity-1',
      ownerId: 'user-1',
      status: 'DRAFT',
    });

    prismaMock.opportunity.update.mockResolvedValue({
      id: 'opportunity-1',
      ownerId: 'user-1',
      organizationId: 'organization-1',
      title: 'Opportunity',
      description: 'Opportunity description',
      keywords: 'technology',
      industrySector: 'Technology',
      desiredTechnology: 'AI',
      minTrl: 5,
      desiredCrl: 4,
      patentRequirement: 'NOT_REQUIRED',
      budgetMin: null,
      budgetMax: null,
      currency: null,
      timeline: null,
      status: 'OPEN',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    prismaMock.project.findMany.mockResolvedValue([
      { id: 'project-1' },
    ]);

    await service.updateOpportunity(
      'user-1',
      'opportunity-1',
      {
        status: 'OPEN',
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
});