import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service.js';

import type {
  MatchingInput,
  MatchingResult,
  MatchingComponent,
} from './matching.types.js';

const WEIGHTS = {
  competence: 0.6,
  trl: 0.2,
  crl: 0.2,
} as const;

@Injectable()
export class MatchingService {

  constructor(private readonly prisma: PrismaService) {}

  async calculateForPair(
    opportunityId: string,
    projectId: string,
  ): Promise<MatchingResult> {
    const [opportunity, project] = await Promise.all([
      this.prisma.opportunity.findUnique({
        where: {
          id: opportunityId,
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
      }),

      this.prisma.project.findUnique({
        where: {
          id: projectId,
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
      }),
    ]);

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const input: MatchingInput = {
      opportunity: {
        competences: opportunity.competences.map((competence) => ({
          competenceId: competence.competenceId,
          weight: competence.weight,
        })),
        minTrl: opportunity.minTrl,
        desiredCrl: opportunity.desiredCrl,
      },

      project: {
        competences: project.competences.map((competence) => ({
          competenceId: competence.competenceId,
          level: competence.level,
        })),
        trl: project.trl,
        crl: project.crl,
      },
    };

    return this.calculate(input);
  }




  calculate(input: MatchingInput): MatchingResult {
    const competenceRequired =
      input.opportunity.competences.length > 0;

    const trlRequired = input.opportunity.minTrl !== null;

    const crlRequired = input.opportunity.desiredCrl !== null;

    const availableWeight =
      (competenceRequired ? WEIGHTS.competence : 0) +
      (trlRequired ? WEIGHTS.trl : 0) +
      (crlRequired ? WEIGHTS.crl : 0);

    if (availableWeight === 0) {
      return {
        score: 0,
        percentage: 0,
        explanation: {
          version: 'v1',
          score: 0,
          percentage: 0,
          components: {},
        },
      };
    }

    const competenceScore = competenceRequired
      ? this.calculateCompetenceScore(input)
      : null;

    const trlScore = trlRequired
      ? this.calculateTrlScore(input)
      : null;

    const crlScore = crlRequired
      ? this.calculateCrlScore(input)
      : null;

    const components: MatchingResult['explanation']['components'] = {};

    if (competenceScore !== null) {
      components.competence = this.createComponent(
        competenceScore,
        WEIGHTS.competence,
        availableWeight,
      );
    }

    if (trlScore !== null) {
      components.trl = this.createComponent(
        trlScore,
        WEIGHTS.trl,
        availableWeight,
      );
    }

    if (crlScore !== null) {
      components.crl = this.createComponent(
        crlScore,
        WEIGHTS.crl,
        availableWeight,
      );
    }

    const score =
      (competenceScore !== null
        ? competenceScore * (WEIGHTS.competence / availableWeight)
        : 0) +
      (trlScore !== null
        ? trlScore * (WEIGHTS.trl / availableWeight)
        : 0) +
      (crlScore !== null
        ? crlScore * (WEIGHTS.crl / availableWeight)
        : 0);

    const normalizedScore = this.round(score);

    return {
      score: normalizedScore,
      percentage: this.round(normalizedScore * 100),
      explanation: {
        version: 'v1',
        score: normalizedScore,
        percentage: this.round(normalizedScore * 100),
        components,
      },
    };
  }

  private calculateCompetenceScore(input: MatchingInput): number {
    const projectCompetences = new Map(
      input.project.competences.map((competence) => [
        competence.competenceId,
        competence.level,
      ]),
    );

    const totalWeight = input.opportunity.competences.reduce(
      (sum, competence) => sum + competence.weight,
      0,
    );

    if (totalWeight === 0) {
      return 0;
    }

    const weightedScore = input.opportunity.competences.reduce(
      (sum, requirement) => {
        const projectLevel =
          projectCompetences.get(requirement.competenceId) ?? 0;

        const normalizedLevel = projectLevel / 5;

        return (
          sum +
          requirement.weight * normalizedLevel
        );
      },
      0,
    );

    return this.round(weightedScore / totalWeight);
  }

  private calculateTrlScore(input: MatchingInput): number {
    const requiredTrl = input.opportunity.minTrl;

    if (requiredTrl === null) {
      return 0;
    }

    const projectTrl = input.project.trl;

    if (projectTrl === null) {
      return 0;
    }

    return this.round(
      Math.min(projectTrl / requiredTrl, 1),
    );
  }

  private calculateCrlScore(input: MatchingInput): number {
    const requiredCrl = input.opportunity.desiredCrl;

    if (requiredCrl === null) {
      return 0;
    }

    const projectCrl = input.project.crl;

    if (projectCrl === null) {
      return 0;
    }

    return this.round(
      Math.min(projectCrl / requiredCrl, 1),
    );
  }

  private createComponent(
    score: number,
    originalWeight: number,
    availableWeight: number,
  ): MatchingComponent {
    return {
      score,
      originalWeight,
      effectiveWeight: this.round(
        originalWeight / availableWeight,
      ),
    };
  }

  private round(value: number): number {
    return Math.round(value * 1_000_000) / 1_000_000;
  }
}