import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { MatchingService } from './matching.service.js';

describe('MatchingService', () => {
  const prismaMock = {
    opportunity: {
      findUnique: vi.fn(),
    },
    project: {
      findUnique: vi.fn(),
    },
    match: {
      upsert: vi.fn(),
    },
  };

  const service = new MatchingService(
    prismaMock as never,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calculates all components using 60/20/20 weights', () => {
    const result = service.calculate({
      opportunity: {
        competences: [
          {
            competenceId: 'ml',
            weight: 5,
          },
          {
            competenceId: 'python',
            weight: 3,
          },
        ],
        minTrl: 7,
        desiredCrl: 6,
      },
      project: {
        competences: [
          {
            competenceId: 'ml',
            level: 4,
          },
          {
            competenceId: 'python',
            level: 5,
          },
        ],
        trl: 5,
        crl: 4,
      },
    });

    expect(result.score).toBeCloseTo(0.8012, 4);
    expect(result.percentage).toBeCloseTo(80.12, 2);

    expect(result.explanation.components.competence).toEqual({
      score: 0.875,
      originalWeight: 0.6,
      effectiveWeight: 0.6,
    });

    expect(result.explanation.components.trl).toEqual({
      score: 0.714286,
      originalWeight: 0.2,
      effectiveWeight: 0.2,
    });

    expect(result.explanation.components.crl).toEqual({
      score: 0.666667,
      originalWeight: 0.2,
      effectiveWeight: 0.2,
    });
  });

  it('redistributes weight when opportunity has no competence requirements', () => {
    const result = service.calculate({
      opportunity: {
        competences: [],
        minTrl: 7,
        desiredCrl: 6,
      },
      project: {
        competences: [],
        trl: 5,
        crl: 6,
      },
    });

    expect(result.score).toBeCloseTo(0.857143, 5);
    expect(result.percentage).toBeCloseTo(85.7143, 2);

    expect(result.explanation.components.competence).toBeUndefined();

    expect(result.explanation.components.trl?.effectiveWeight).toBe(0.5);
    expect(result.explanation.components.crl?.effectiveWeight).toBe(0.5);
  });

  it('redistributes weight when opportunity has no TRL requirement', () => {
    const result = service.calculate({
      opportunity: {
        competences: [
          {
            competenceId: 'ml',
            weight: 5,
          },
        ],
        minTrl: null,
        desiredCrl: 6,
      },
      project: {
        competences: [
          {
            competenceId: 'ml',
            level: 5,
          },
        ],
        trl: null,
        crl: 3,
      },
    });

    expect(result.score).toBeCloseTo(0.875, 5);

    expect(result.explanation.components.competence?.effectiveWeight)
      .toBe(0.75);

    expect(result.explanation.components.crl?.effectiveWeight)
      .toBe(0.25);

    expect(result.explanation.components.trl).toBeUndefined();
  });

  it('redistributes weight when opportunity has no CRL requirement', () => {
    const result = service.calculate({
      opportunity: {
        competences: [],
        minTrl: 8,
        desiredCrl: null,
      },
      project: {
        competences: [],
        trl: 4,
        crl: null,
      },
    });

    expect(result.score).toBe(0.5);
    expect(result.percentage).toBe(50);

    expect(result.explanation.components.trl?.effectiveWeight)
      .toBe(1);

    expect(result.explanation.components.crl).toBeUndefined();
  });

  it('gives zero when project does not have a required competence', () => {
    const result = service.calculate({
      opportunity: {
        competences: [
          {
            competenceId: 'machine-learning',
            weight: 5,
          },
        ],
        minTrl: null,
        desiredCrl: null,
      },
      project: {
        competences: [],
        trl: null,
        crl: null,
      },
    });

    expect(result.score).toBe(0);
    expect(result.percentage).toBe(0);
  });

  it('gives zero when project TRL is missing but opportunity requires it', () => {
    const result = service.calculate({
      opportunity: {
        competences: [],
        minTrl: 7,
        desiredCrl: null,
      },
      project: {
        competences: [],
        trl: null,
        crl: null,
      },
    });

    expect(result.score).toBe(0);
    expect(result.percentage).toBe(0);
  });

  it('gives zero when project CRL is missing but opportunity requires it', () => {
    const result = service.calculate({
      opportunity: {
        competences: [],
        minTrl: null,
        desiredCrl: 6,
      },
      project: {
        competences: [],
        trl: null,
        crl: null,
      },
    });

    expect(result.score).toBe(0);
    expect(result.percentage).toBe(0);
  });

  it('caps TRL score at 1 when project exceeds requirement', () => {
    const result = service.calculate({
      opportunity: {
        competences: [],
        minTrl: 7,
        desiredCrl: null,
      },
      project: {
        competences: [],
        trl: 9,
        crl: null,
      },
    });

    expect(result.score).toBe(1);
    expect(result.percentage).toBe(100);
  });

  it('caps CRL score at 1 when project exceeds requirement', () => {
    const result = service.calculate({
      opportunity: {
        competences: [],
        minTrl: null,
        desiredCrl: 6,
      },
      project: {
        competences: [],
        trl: null,
        crl: 9,
      },
    });

    expect(result.score).toBe(1);
    expect(result.percentage).toBe(100);
  });

  it('does not consider project competencies that are not required', () => {
    const result = service.calculate({
      opportunity: {
        competences: [
          {
            competenceId: 'python',
            weight: 5,
          },
        ],
        minTrl: null,
        desiredCrl: null,
      },
      project: {
        competences: [
          {
            competenceId: 'python',
            level: 4,
          },
          {
            competenceId: 'java',
            level: 5,
          },
        ],
        trl: null,
        crl: null,
      },
    });

    expect(result.score).toBe(0.8);
    expect(result.percentage).toBe(80);
  });

  it('returns zero when opportunity has no scoring criteria', () => {
    const result = service.calculate({
      opportunity: {
        competences: [],
        minTrl: null,
        desiredCrl: null,
      },
      project: {
        competences: [],
        trl: null,
        crl: null,
      },
    });

    expect(result.score).toBe(0);
    expect(result.percentage).toBe(0);
    expect(result.explanation.components).toEqual({});
  });

  it('loads opportunity and project from Prisma and calculates the match', async () => {
    prismaMock.opportunity.findUnique.mockResolvedValue({
      id: 'opportunity-1',
      status: 'OPEN',
      minTrl: 7,
      desiredCrl: 6,
      patentRequirement: 'NOT_REQUIRED',
      competences: [
        {
          competenceId: 'ml',
          weight: 5,
        },
        {
          competenceId: 'python',
          weight: 3,
        },
      ],
    });

    prismaMock.project.findUnique.mockResolvedValue({
      id: 'project-1',
      status: 'PUBLISHED',
      trl: 5,
      crl: 4,
      patentStatus: 'NONE',
      competences: [
        {
          competenceId: 'ml',
          level: 4,
        },
        {
          competenceId: 'python',
          level: 5,
        },
      ],
    });

    const result = await service.calculateForPair(
      'opportunity-1',
      'project-1',
    );

    expect(result.score).toBeCloseTo(
      0.801191,
      5,
    );

    expect(result.percentage).toBeCloseTo(
      80.1191,
      2,
    );

    expect(
      prismaMock.opportunity.findUnique,
    ).toHaveBeenCalledWith({
      where: {
        id: 'opportunity-1',
      },
      select: {
        id: true,
        status: true,
        minTrl: true,
        desiredCrl: true,
        patentRequirement: true,
        competences: {
          select: {
            competenceId: true,
            weight: true,
          },
        },
      },
    });

    expect(
      prismaMock.project.findUnique,
    ).toHaveBeenCalledWith({
      where: {
        id: 'project-1',
      },
      select: {
        id: true,
        status: true,
        trl: true,
        crl: true,
        patentStatus: true,
        competences: {
          select: {
            competenceId: true,
            level: true,
          },
        },
      },
    });
  });

  it('throws when project does not exist', async () => {
    prismaMock.opportunity.findUnique.mockResolvedValue({
      id: 'opportunity-1',
      status: 'OPEN',
      minTrl: 7,
      desiredCrl: 6,
      patentRequirement: 'NOT_REQUIRED',
      competences: [],
    });

    prismaMock.project.findUnique.mockResolvedValue(
      null,
    );

    await expect(
      service.calculateForPair(
        'opportunity-1',
        'invalid-project',
      ),
    ).rejects.toThrow(
      'Project not found',
    );
  });

  it('calculates and creates a new match', async () => {
    prismaMock.opportunity.findUnique.mockResolvedValue({
      id: 'opportunity-1',
      status: 'OPEN',
      minTrl: 7,
      desiredCrl: 6,
      patentRequirement: 'NOT_REQUIRED',
      competences: [
        {
          competenceId: 'ml',
          weight: 5,
        },
      ],
    });

    prismaMock.project.findUnique.mockResolvedValue({
      id: 'project-1',
      status: 'PUBLISHED',
      trl: 7,
      crl: 6,
      patentStatus: 'NONE',
      competences: [
        {
          competenceId: 'ml',
          level: 5,
        },
      ],
    });

    prismaMock.match.upsert.mockResolvedValue({
      id: 'match-1',
      opportunityId: 'opportunity-1',
      projectId: 'project-1',
      score: 1,
      modelName: 'deterministic',
      modelVersion: 'v1',
      status: 'GENERATED',
      explanation: {
        version: 'v1',
        score: 1,
        percentage: 100,
        components: {
          competence: {
            score: 1,
            originalWeight: 0.6,
            effectiveWeight: 0.6,
          },
          trl: {
            score: 1,
            originalWeight: 0.2,
            effectiveWeight: 0.2,
          },
          crl: {
            score: 1,
            originalWeight: 0.2,
            effectiveWeight: 0.2,
          },
        },
      },
    });

    const result = await service.calculateAndPersist(
      'opportunity-1',
      'project-1',
    );

    expect(result.id).toBe('match-1');

    expect(
      prismaMock.match.upsert,
    ).toHaveBeenCalledWith({
      where: {
        opportunityId_projectId_modelVersion: {
          opportunityId: 'opportunity-1',
          projectId: 'project-1',
          modelVersion: 'v1',
        },
      },

      create: {
        opportunityId: 'opportunity-1',
        projectId: 'project-1',
        score: 1,
        modelName: 'deterministic',
        modelVersion: 'v1',
        status: 'GENERATED',
        explanation: {
          version: 'v1',
          score: 1,
          percentage: 100,
          components: {
            competence: {
              score: 1,
              originalWeight: 0.6,
              effectiveWeight: 0.6,
            },
            trl: {
              score: 1,
              originalWeight: 0.2,
              effectiveWeight: 0.2,
            },
            crl: {
              score: 1,
              originalWeight: 0.2,
              effectiveWeight: 0.2,
            },
          },
        },
      },

      update: {
        score: 1,
        modelName: 'deterministic',
        explanation: {
          version: 'v1',
          score: 1,
          percentage: 100,
          components: {
            competence: {
              score: 1,
              originalWeight: 0.6,
              effectiveWeight: 0.6,
            },
            trl: {
              score: 1,
              originalWeight: 0.2,
              effectiveWeight: 0.2,
            },
            crl: {
              score: 1,
              originalWeight: 0.2,
              effectiveWeight: 0.2,
            },
          },
        },
      },
    });
  });

  it('updates an existing v1 match instead of creating another one', async () => {
    prismaMock.opportunity.findUnique.mockResolvedValue({
      id: 'opportunity-1',
      status: 'OPEN',
      minTrl: 7,
      desiredCrl: 6,
      patentRequirement: 'NOT_REQUIRED',
      competences: [
        {
          competenceId: 'ml',
          weight: 5,
        },
      ],
    });

    prismaMock.project.findUnique.mockResolvedValue({
      id: 'project-1',
      status: 'PUBLISHED',
      trl: 5,
      crl: 4,
      patentStatus: 'NONE',
      competences: [
        {
          competenceId: 'ml',
          level: 4,
        },
      ],
    });

    prismaMock.match.upsert.mockResolvedValue({
      id: 'existing-match',
      opportunityId: 'opportunity-1',
      projectId: 'project-1',
      score: 0.809524,
      modelName: 'deterministic',
      modelVersion: 'v1',
      status: 'VIEWED',
    });

    const result = await service.calculateAndPersist(
      'opportunity-1',
      'project-1',
    );

    expect(result.id).toBe('existing-match');

    expect(
      prismaMock.match.upsert,
    ).toHaveBeenCalledTimes(1);

    const call =
      prismaMock.match.upsert.mock.calls[0][0];

    expect(call.where).toEqual({
      opportunityId_projectId_modelVersion: {
        opportunityId: 'opportunity-1',
        projectId: 'project-1',
        modelVersion: 'v1',
      },
    });

    expect(call.update).not.toHaveProperty(
      'status',
    );
  });

  it('does not persist when opportunity does not exist', async () => {
    prismaMock.opportunity.findUnique.mockResolvedValue(
      null,
    );

    prismaMock.project.findUnique.mockResolvedValue({
      id: 'project-1',
      status: 'PUBLISHED',
      trl: 7,
      crl: 6,
      patentStatus: 'NONE',
      competences: [],
    });

    await expect(
      service.calculateAndPersist(
        'invalid-opportunity',
        'project-1',
      ),
    ).rejects.toThrow(
      'Opportunity not found',
    );

    expect(
      prismaMock.match.upsert,
    ).not.toHaveBeenCalled();
  });

  it('does not persist when project does not exist', async () => {
    prismaMock.opportunity.findUnique.mockResolvedValue({
      id: 'opportunity-1',
      status: 'OPEN',
      minTrl: 7,
      desiredCrl: 6,
      patentRequirement: 'NOT_REQUIRED',
      competences: [],
    });

    prismaMock.project.findUnique.mockResolvedValue(
      null,
    );

    await expect(
      service.calculateAndPersist(
        'opportunity-1',
        'invalid-project',
      ),
    ).rejects.toThrow(
      'Project not found',
    );

    expect(
      prismaMock.match.upsert,
    ).not.toHaveBeenCalled();
  });


});