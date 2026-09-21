import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { ProjectsService } from './projects.service.js';

describe('ProjectsService - matching triggers', () => {
  const prismaMock = {
    project: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    opportunity: {
      findMany: vi.fn(),
    },
  };

  const matchingServiceMock = {
    calculateAndPersist: vi.fn(),
  };

  let service: ProjectsService;

  beforeEach(() => {
    vi.clearAllMocks();

    service = new ProjectsService(
      prismaMock as never,
      matchingServiceMock as never,
    );
  });

  it('calculates matches when a project is created as PUBLISHED', async () => {
    prismaMock.project.create.mockResolvedValue({
      id: 'project-1',
      ownerId: 'user-1',
      organizationId: null,
      title: 'Project',
      description: null,
      keywords: null,
      researchField: null,
      trl: 5,
      crl: 4,
      patentStatus: 'NONE',
      status: 'PUBLISHED',
      source: 'PLATFORM',
      sourceExternalId: null,
      sourceUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    prismaMock.opportunity.findMany.mockResolvedValue([
      { id: 'opportunity-1' },
      { id: 'opportunity-2' },
    ]);

    await service.createProject('user-1', {
      title: 'Project',
      description: 'Project description',
        keywords: 'research, technology',
        researchField: 'Technology',
      trl: 5,
      crl: 4,
      patentStatus: 'NONE',
    });

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

  it('does not calculate matches when a project is created as DRAFT', async () => {
    prismaMock.project.create.mockResolvedValue({
      id: 'project-1',
      ownerId: 'user-1',
      organizationId: null,
      title: 'Project',
      description: null,
      keywords: null,
      researchField: null,
      trl: 5,
      crl: 4,
      patentStatus: 'NONE',
      status: 'DRAFT',
      source: 'PLATFORM',
      sourceExternalId: null,
      sourceUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await service.createProject('user-1', {
      title: 'Project',
      description: 'Project description',
        keywords: 'research, technology',
        researchField: 'Technology',
      trl: 5,
      crl: 4,
      patentStatus: 'NONE',
    });

    expect(
      matchingServiceMock.calculateAndPersist,
    ).not.toHaveBeenCalled();

    expect(
      prismaMock.opportunity.findMany,
    ).not.toHaveBeenCalled();
  });

  it('calculates matches when TRL changes on a published project', async () => {
    prismaMock.project.findUnique.mockResolvedValue({
        id: 'project-1',
        ownerId: 'user-1',
        status: 'PUBLISHED',
        trl: 4,
        crl: 4,
        patentStatus: 'NONE',
    });

    prismaMock.project.update.mockResolvedValue({
        id: 'project-1',
        ownerId: 'user-1',
        organizationId: null,
        title: 'Project',
        description: null,
        keywords: null,
        researchField: null,
        trl: 5,
        crl: 4,
        patentStatus: 'NONE',
        status: 'PUBLISHED',
        source: 'PLATFORM',
        sourceExternalId: null,
        sourceUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    prismaMock.opportunity.findMany.mockResolvedValue([
        { id: 'opportunity-1' },
    ]);

    await service.updateProject(
        'user-1',
        'project-1',
        {
        trl: 5,
        },
    );

    expect(
        matchingServiceMock.calculateAndPersist,
    ).toHaveBeenCalledWith(
        'opportunity-1',
        'project-1',
    );
    });

    it('does not calculate matches when only the title changes', async () => {
        prismaMock.project.findUnique.mockResolvedValue({
            id: 'project-1',
            ownerId: 'user-1',
            status: 'PUBLISHED',
            trl: 5,
            crl: 4,
            patentStatus: 'NONE',
        });

        prismaMock.project.update.mockResolvedValue({
            id: 'project-1',
            ownerId: 'user-1',
            organizationId: null,
            title: 'New title',
            description: null,
            keywords: null,
            researchField: null,
            trl: 5,
            crl: 4,
            patentStatus: 'NONE',
            status: 'PUBLISHED',
            source: 'PLATFORM',
            sourceExternalId: null,
            sourceUrl: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await service.updateProject(
            'user-1',
            'project-1',
            {
            title: 'New title',
            },
        );

        expect(
            matchingServiceMock.calculateAndPersist,
        ).not.toHaveBeenCalled();

        expect(
            prismaMock.opportunity.findMany,
        ).not.toHaveBeenCalled();
    });

    it('calculates matches when a project becomes PUBLISHED', async () => {
        prismaMock.project.findUnique.mockResolvedValue({
            id: 'project-1',
            ownerId: 'user-1',
            status: 'DRAFT',
            trl: 5,
            crl: 4,
            patentStatus: 'NONE',
        });

        prismaMock.project.update.mockResolvedValue({
            id: 'project-1',
            ownerId: 'user-1',
            organizationId: null,
            title: 'Project',
            description: null,
            keywords: null,
            researchField: null,
            trl: 5,
            crl: 4,
            patentStatus: 'NONE',
            status: 'PUBLISHED',
            source: 'PLATFORM',
            sourceExternalId: null,
            sourceUrl: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        prismaMock.opportunity.findMany.mockResolvedValue([
            { id: 'opportunity-1' },
        ]);

        await service.updateProject(
            'user-1',
            'project-1',
            {
            status: 'PUBLISHED',
            },
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

    it('does not calculate matches when a project becomes ARCHIVED', async () => {
        prismaMock.project.findUnique.mockResolvedValue({
            id: 'project-1',
            ownerId: 'user-1',
            status: 'PUBLISHED',
            trl: 5,
            crl: 4,
            patentStatus: 'NONE',
        });

        prismaMock.project.update.mockResolvedValue({
            id: 'project-1',
            ownerId: 'user-1',
            organizationId: null,
            title: 'Project',
            description: null,
            keywords: null,
            researchField: null,
            trl: 5,
            crl: 4,
            patentStatus: 'NONE',
            status: 'ARCHIVED',
            source: 'PLATFORM',
            sourceExternalId: null,
            sourceUrl: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await service.updateProject(
            'user-1',
            'project-1',
            {
            status: 'ARCHIVED',
            },
        );

        expect(
            matchingServiceMock.calculateAndPersist,
        ).not.toHaveBeenCalled();
    });

    
});