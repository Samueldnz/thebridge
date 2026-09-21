import { describe, expect, it } from 'vitest';
import { MatchingService } from './matching.service.js';

describe('MatchingService', () => {
  const service = new MatchingService();

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
});