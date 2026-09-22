import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DiscoveryService } from './discovery.service.js';

describe('DiscoveryService', () => {
  const prismaMock = {
    opportunity: {
      findMany: vi.fn(),
    },
    project: {
      findMany: vi.fn(),
    },
    match: {
      findMany: vi.fn(),
    },
  };

  let service: DiscoveryService;

  beforeEach(() => {
    vi.clearAllMocks();

    service = new DiscoveryService(
      prismaMock as never,
    );
  });

  describe('listOpportunities', () => {
    it('returns open opportunities ranked by the best match for the researcher', async () => {
      prismaMock.opportunity.findMany.mockResolvedValue([
        {
          id: 'opportunity-1',
          ownerId: 'company-1',
          organizationId: 'organization-1',
          title: 'Opportunity A',
          description: 'Description A',
          keywords: 'AI',
          industrySector: 'Industry',
          desiredTechnology: 'Computer Vision',
          minTrl: 7,
          desiredCrl: 6,
          patentRequirement: 'NOT_REQUIRED',
          budgetMin: null,
          budgetMax: null,
          currency: 'BRL',
          timeline: null,
          status: 'OPEN',
          createdAt: new Date('2026-01-02'),
          updatedAt: new Date('2026-01-02'),
          organization: {
            id: 'organization-1',
            legalName: 'Company A',
            tradeName: 'Company A',
          },
        },
        {
          id: 'opportunity-2',
          ownerId: 'company-2',
          organizationId: 'organization-2',
          title: 'Opportunity B',
          description: 'Description B',
          keywords: 'Robotics',
          industrySector: 'Industry',
          desiredTechnology: 'Robotics',
          minTrl: 6,
          desiredCrl: 5,
          patentRequirement: 'NOT_REQUIRED',
          budgetMin: null,
          budgetMax: null,
          currency: 'BRL',
          timeline: null,
          status: 'OPEN',
          createdAt: new Date('2026-01-01'),
          updatedAt: new Date('2026-01-01'),
          organization: {
            id: 'organization-2',
            legalName: 'Company B',
            tradeName: 'Company B',
          },
        },
      ]);

      prismaMock.match.findMany.mockResolvedValue([
        {
          id: 'match-1',
          opportunityId: 'opportunity-1',
          projectId: 'project-1',
          score: 0.91,
          project: {
            id: 'project-1',
            title: 'Project A',
          },
        },
        {
          id: 'match-2',
          opportunityId: 'opportunity-1',
          projectId: 'project-2',
          score: 0.73,
          project: {
            id: 'project-2',
            title: 'Project B',
          },
        },
        {
          id: 'match-3',
          opportunityId: 'opportunity-2',
          projectId: 'project-3',
          score: 0.84,
          project: {
            id: 'project-3',
            title: 'Project C',
          },
        },
      ]);

      const result =
        await service.listOpportunities(
          'researcher-1',
          {
            page: 1,
            limit: 20,
          },
        );

      expect(result.data).toHaveLength(2);

      expect(result.data[0].id).toBe(
        'opportunity-1',
      );

      expect(result.data[0].rankingScore).toBe(
        0.91,
      );

      expect(
        result.data[0].rankingPercentage,
      ).toBe(91);

      expect(
        result.data[0].bestMatch?.id,
      ).toBe('match-1');

      expect(result.data[1].id).toBe(
        'opportunity-2',
      );

      expect(result.data[1].rankingScore).toBe(
        0.84,
      );
    });

    it('uses only matches belonging to the researcher projects', async () => {
      prismaMock.opportunity.findMany.mockResolvedValue([
        {
          id: 'opportunity-1',
          ownerId: 'company-1',
          organizationId: 'organization-1',
          title: 'Opportunity A',
          description: 'Description A',
          keywords: null,
          industrySector: null,
          desiredTechnology: null,
          minTrl: null,
          desiredCrl: null,
          patentRequirement: 'NOT_REQUIRED',
          budgetMin: null,
          budgetMax: null,
          currency: 'BRL',
          timeline: null,
          status: 'OPEN',
          createdAt: new Date(),
          updatedAt: new Date(),
          organization: {
            id: 'organization-1',
            legalName: 'Company A',
            tradeName: null,
          },
        },
      ]);

      prismaMock.match.findMany.mockResolvedValue([]);

      await service.listOpportunities(
        'researcher-1',
        {
          page: 1,
          limit: 20,
        },
      );

      expect(
        prismaMock.match.findMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            project: {
              ownerId: 'researcher-1',
              status: 'PUBLISHED',
            },
          }),
        }),
      );
    });

    it('places opportunities without a match after ranked opportunities', async () => {
      prismaMock.opportunity.findMany.mockResolvedValue([
        {
          id: 'opportunity-no-match',
          ownerId: 'company-1',
          organizationId: 'organization-1',
          title: 'No Match',
          description: 'Description',
          keywords: null,
          industrySector: null,
          desiredTechnology: null,
          minTrl: null,
          desiredCrl: null,
          patentRequirement: 'NOT_REQUIRED',
          budgetMin: null,
          budgetMax: null,
          currency: 'BRL',
          timeline: null,
          status: 'OPEN',
          createdAt: new Date('2026-01-02'),
          updatedAt: new Date('2026-01-02'),
          organization: {
            id: 'organization-1',
            legalName: 'Company A',
            tradeName: null,
          },
        },
        {
          id: 'opportunity-match',
          ownerId: 'company-2',
          organizationId: 'organization-2',
          title: 'With Match',
          description: 'Description',
          keywords: null,
          industrySector: null,
          desiredTechnology: null,
          minTrl: null,
          desiredCrl: null,
          patentRequirement: 'NOT_REQUIRED',
          budgetMin: null,
          budgetMax: null,
          currency: 'BRL',
          timeline: null,
          status: 'OPEN',
          createdAt: new Date('2026-01-01'),
          updatedAt: new Date('2026-01-01'),
          organization: {
            id: 'organization-2',
            legalName: 'Company B',
            tradeName: null,
          },
        },
      ]);

      prismaMock.match.findMany.mockResolvedValue([
        {
          id: 'match-1',
          opportunityId: 'opportunity-match',
          projectId: 'project-1',
          score: 0.75,
          project: {
            id: 'project-1',
            title: 'Project A',
          },
        },
      ]);

      const result =
        await service.listOpportunities(
          'researcher-1',
          {
            page: 1,
            limit: 20,
          },
        );

      expect(result.data[0].id).toBe(
        'opportunity-match',
      );

      expect(result.data[1].id).toBe(
        'opportunity-no-match',
      );

      expect(
        result.data[1].rankingScore,
      ).toBeNull();
    });

    it('paginates after ranking', async () => {
      prismaMock.opportunity.findMany.mockResolvedValue(
        Array.from(
          { length: 3 },
          (_, index) => ({
            id: `opportunity-${index + 1}`,
            ownerId: `company-${index + 1}`,
            organizationId: `organization-${index + 1}`,
            title: `Opportunity ${index + 1}`,
            description: 'Description',
            keywords: null,
            industrySector: null,
            desiredTechnology: null,
            minTrl: null,
            desiredCrl: null,
            patentRequirement: 'NOT_REQUIRED',
            budgetMin: null,
            budgetMax: null,
            currency: 'BRL',
            timeline: null,
            status: 'OPEN',
            createdAt: new Date(
              `2026-01-0${index + 1}`,
            ),
            updatedAt: new Date(
              `2026-01-0${index + 1}`,
            ),
            organization: {
              id: `organization-${index + 1}`,
              legalName: `Company ${index + 1}`,
              tradeName: null,
            },
          }),
        ),
      );

      prismaMock.match.findMany.mockResolvedValue([
        {
          id: 'match-1',
          opportunityId: 'opportunity-1',
          projectId: 'project-1',
          score: 0.9,
          project: {
            id: 'project-1',
            title: 'Project 1',
          },
        },
        {
          id: 'match-2',
          opportunityId: 'opportunity-2',
          projectId: 'project-2',
          score: 0.8,
          project: {
            id: 'project-2',
            title: 'Project 2',
          },
        },
        {
          id: 'match-3',
          opportunityId: 'opportunity-3',
          projectId: 'project-3',
          score: 0.7,
          project: {
            id: 'project-3',
            title: 'Project 3',
          },
        },
      ]);

      const result =
        await service.listOpportunities(
          'researcher-1',
          {
            page: 2,
            limit: 1,
          },
        );

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(
        'opportunity-2',
      );

      expect(result.meta).toEqual({
        page: 2,
        limit: 1,
        total: 3,
        totalPages: 3,
      });
    });

    it('rejects an invalid TRL range', async () => {
      await expect(
        service.listOpportunities(
          'researcher-1',
          {
            page: 1,
            limit: 20,
            minTrl: 8,
            maxTrl: 5,
          },
        ),
      ).rejects.toThrow(
        'TRL minimum cannot be greater than maximum',
      );

      expect(
        prismaMock.opportunity.findMany,
      ).not.toHaveBeenCalled();
    });

    it('returns empty pagination when there are no opportunities', async () => {
      prismaMock.opportunity.findMany.mockResolvedValue(
        [],
      );

      const result =
        await service.listOpportunities(
          'researcher-1',
          {
            page: 1,
            limit: 20,
          },
        );

      expect(result).toEqual({
        data: [],
        meta: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      });

      expect(
        prismaMock.match.findMany,
      ).not.toHaveBeenCalled();
    });
  });

  describe('listProjects', () => {
    it('returns published projects ranked by the best match for the company', async () => {
      prismaMock.project.findMany.mockResolvedValue([
        {
          id: 'project-1',
          ownerId: 'researcher-1',
          organizationId: null,
          title: 'Project A',
          description: 'Description A',
          keywords: 'AI',
          researchField: 'Artificial Intelligence',
          trl: 7,
          crl: 6,
          patentStatus: 'PENDING',
          status: 'PUBLISHED',
          createdAt: new Date('2026-01-02'),
          updatedAt: new Date('2026-01-02'),
          owner: {
            id: 'researcher-1',
            name: 'Researcher A',
            profileType: 'RESEARCHER',
          },
          organization: null,
        },
        {
          id: 'project-2',
          ownerId: 'researcher-2',
          organizationId: null,
          title: 'Project B',
          description: 'Description B',
          keywords: 'Robotics',
          researchField: 'Robotics',
          trl: 6,
          crl: 5,
          patentStatus: 'NONE',
          status: 'PUBLISHED',
          createdAt: new Date('2026-01-01'),
          updatedAt: new Date('2026-01-01'),
          owner: {
            id: 'researcher-2',
            name: 'Researcher B',
            profileType: 'RESEARCHER',
          },
          organization: null,
        },
      ]);

      prismaMock.match.findMany.mockResolvedValue([
        {
          id: 'match-1',
          opportunityId: 'opportunity-1',
          projectId: 'project-1',
          score: 0.95,
          opportunity: {
            id: 'opportunity-1',
            title: 'Opportunity A',
          },
        },
        {
          id: 'match-2',
          opportunityId: 'opportunity-2',
          projectId: 'project-1',
          score: 0.82,
          opportunity: {
            id: 'opportunity-2',
            title: 'Opportunity B',
          },
        },
        {
          id: 'match-3',
          opportunityId: 'opportunity-3',
          projectId: 'project-2',
          score: 0.88,
          opportunity: {
            id: 'opportunity-3',
            title: 'Opportunity C',
          },
        },
      ]);

      const result =
        await service.listProjects(
          'company-1',
          {
            page: 1,
            limit: 20,
          },
        );

      expect(result.data).toHaveLength(2);

      expect(result.data[0].id).toBe(
        'project-1',
      );

      expect(result.data[0].rankingScore).toBe(
        0.95,
      );

      expect(
        result.data[0].rankingPercentage,
      ).toBe(95);

      expect(
        result.data[0].bestMatch?.id,
      ).toBe('match-1');

      expect(result.data[1].id).toBe(
        'project-2',
      );

      expect(result.data[1].rankingScore).toBe(
        0.88,
      );
    });

    it('uses only matches belonging to the company opportunities', async () => {
      prismaMock.project.findMany.mockResolvedValue([
        {
          id: 'project-1',
          ownerId: 'researcher-1',
          organizationId: null,
          title: 'Project A',
          description: 'Description A',
          keywords: null,
          researchField: null,
          trl: null,
          crl: null,
          patentStatus: 'NONE',
          status: 'PUBLISHED',
          createdAt: new Date(),
          updatedAt: new Date(),
          owner: {
            id: 'researcher-1',
            name: 'Researcher A',
            profileType: 'RESEARCHER',
          },
          organization: null,
        },
      ]);

      prismaMock.match.findMany.mockResolvedValue([]);

      await service.listProjects('company-1', {
        page: 1,
        limit: 20,
      });

      expect(
        prismaMock.match.findMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            opportunity: {
              ownerId: 'company-1',
              status: 'OPEN',
            },
          }),
        }),
      );
    });

    it('places projects without a match after ranked projects', async () => {
      prismaMock.project.findMany.mockResolvedValue([
        {
          id: 'project-no-match',
          ownerId: 'researcher-1',
          organizationId: null,
          title: 'No Match',
          description: 'Description',
          keywords: null,
          researchField: null,
          trl: null,
          crl: null,
          patentStatus: 'NONE',
          status: 'PUBLISHED',
          createdAt: new Date('2026-01-02'),
          updatedAt: new Date('2026-01-02'),
          owner: {
            id: 'researcher-1',
            name: 'Researcher A',
            profileType: 'RESEARCHER',
          },
          organization: null,
        },
        {
          id: 'project-match',
          ownerId: 'researcher-2',
          organizationId: null,
          title: 'With Match',
          description: 'Description',
          keywords: null,
          researchField: null,
          trl: null,
          crl: null,
          patentStatus: 'NONE',
          status: 'PUBLISHED',
          createdAt: new Date('2026-01-01'),
          updatedAt: new Date('2026-01-01'),
          owner: {
            id: 'researcher-2',
            name: 'Researcher B',
            profileType: 'RESEARCHER',
          },
          organization: null,
        },
      ]);

      prismaMock.match.findMany.mockResolvedValue([
        {
          id: 'match-1',
          opportunityId: 'opportunity-1',
          projectId: 'project-match',
          score: 0.76,
          opportunity: {
            id: 'opportunity-1',
            title: 'Opportunity A',
          },
        },
      ]);

      const result =
        await service.listProjects(
          'company-1',
          {
            page: 1,
            limit: 20,
          },
        );

      expect(result.data[0].id).toBe(
        'project-match',
      );

      expect(result.data[1].id).toBe(
        'project-no-match',
      );

      expect(
        result.data[1].rankingScore,
      ).toBeNull();
    });

    it('paginates after ranking', async () => {
      prismaMock.project.findMany.mockResolvedValue(
        Array.from(
          { length: 3 },
          (_, index) => ({
            id: `project-${index + 1}`,
            ownerId: `researcher-${index + 1}`,
            organizationId: null,
            title: `Project ${index + 1}`,
            description: 'Description',
            keywords: null,
            researchField: null,
            trl: null,
            crl: null,
            patentStatus: 'NONE',
            status: 'PUBLISHED',
            createdAt: new Date(
              `2026-01-0${index + 1}`,
            ),
            updatedAt: new Date(
              `2026-01-0${index + 1}`,
            ),
            owner: {
              id: `researcher-${index + 1}`,
              name: `Researcher ${index + 1}`,
              profileType: 'RESEARCHER',
            },
            organization: null,
          }),
        ),
      );

      prismaMock.match.findMany.mockResolvedValue([
        {
          id: 'match-1',
          opportunityId: 'opportunity-1',
          projectId: 'project-1',
          score: 0.9,
          opportunity: {
            id: 'opportunity-1',
            title: 'Opportunity 1',
          },
        },
        {
          id: 'match-2',
          opportunityId: 'opportunity-2',
          projectId: 'project-2',
          score: 0.8,
          opportunity: {
            id: 'opportunity-2',
            title: 'Opportunity 2',
          },
        },
        {
          id: 'match-3',
          opportunityId: 'opportunity-3',
          projectId: 'project-3',
          score: 0.7,
          opportunity: {
            id: 'opportunity-3',
            title: 'Opportunity 3',
          },
        },
      ]);

      const result =
        await service.listProjects('company-1', {
          page: 2,
          limit: 1,
        });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(
        'project-2',
      );

      expect(result.meta).toEqual({
        page: 2,
        limit: 1,
        total: 3,
        totalPages: 3,
      });
    });

    it('rejects an invalid CRL range', async () => {
      await expect(
        service.listProjects('company-1', {
          page: 1,
          limit: 20,
          minCrl: 8,
          maxCrl: 5,
        }),
      ).rejects.toThrow(
        'CRL minimum cannot be greater than maximum',
      );

      expect(
        prismaMock.project.findMany,
      ).not.toHaveBeenCalled();
    });

    it('returns empty pagination when there are no projects', async () => {
      prismaMock.project.findMany.mockResolvedValue(
        [],
      );

      const result =
        await service.listProjects('company-1', {
          page: 1,
          limit: 20,
        });

      expect(result).toEqual({
        data: [],
        meta: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      });

      expect(
        prismaMock.match.findMany,
      ).not.toHaveBeenCalled();
    });
  });
});