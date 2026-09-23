import { env } from "../config/env";
import { authService } from "./auth";
import { projectsService, type Project } from "./projects";
import { opportunitiesService, type Opportunity } from "./opportunities";
import { defaultCompetences } from "./competences";

export interface MatchExplanation {
  version: "v1";
  score: number; // 0..1
  percentage: number; // 0..100
  components: {
    competence: {
      weight: number;
      score: number;
      percentage: number;
      details: Array<{
        competenceId: string;
        name: string;
        weight: number;
        level: number;
        attained: number; // 0..1
      }>;
    };
    trl: {
      weight: number;
      score: number;
      percentage: number;
      projectTrl: number;
      desiredTrl: number;
    };
    crl: {
      weight: number;
      score: number;
      percentage: number;
      projectCrl: number;
      desiredCrl: number;
    };
  };
}

export interface MatchItem {
  id: string;
  opportunityId: string;
  projectId: string;
  score: number; // 0..1
  percentage: number; // 0..100
  status: "GENERATED" | "VIEWED" | "CONTACTED" | "DISMISSED";
  explanation: MatchExplanation;
  createdAt: string;
  project: Project;
  opportunity: Opportunity;
}

const WEIGHTS = {
  competence: 0.6,
  trl: 0.2,
  crl: 0.2,
} as const;

export const matchingService = {
  calculateMatchPair(opportunity: Opportunity, project: Project): MatchItem | null {
    // 1. Patent filter: If opportunity requires patent, project cannot be NONE
    if (opportunity.patentRequirement === "REQUIRED" && project.patentStatus === "NONE") {
      return null;
    }

    const competenceNameMap = new Map<string, string>();
    defaultCompetences.forEach((c) => competenceNameMap.set(c.id, c.name));

    // 2. Weights redistribution check
    const competenceRequired = opportunity.competences && opportunity.competences.length > 0;
    const trlRequired = typeof opportunity.minTrl === "number" && opportunity.minTrl > 0;
    const crlRequired = typeof opportunity.desiredCrl === "number" && opportunity.desiredCrl > 0;

    const activeTotalWeight =
      (competenceRequired ? WEIGHTS.competence : 0) +
      (trlRequired ? WEIGHTS.trl : 0) +
      (crlRequired ? WEIGHTS.crl : 0);

    if (activeTotalWeight === 0) {
      return null;
    }

    const effectiveWeightComp = competenceRequired ? WEIGHTS.competence / activeTotalWeight : 0;
    const effectiveWeightTrl = trlRequired ? WEIGHTS.trl / activeTotalWeight : 0;
    const effectiveWeightCrl = crlRequired ? WEIGHTS.crl / activeTotalWeight : 0;

    // 3. Competence Calculation
    let competenceScore = 0;
    const compDetails: Array<{
      competenceId: string;
      name: string;
      weight: number;
      level: number;
      attained: number;
    }> = [];

    if (competenceRequired) {
      let weightedLevelSum = 0;
      let totalWeightSum = 0;

      for (const oppComp of opportunity.competences) {
        const foundProjComp = project.competences.find((pc) => pc.competenceId === oppComp.competenceId);
        const projLevel = foundProjComp ? foundProjComp.level : 0;
        const normLevel = Math.min(Math.max(projLevel / 5, 0), 1);
        weightedLevelSum += oppComp.weight * normLevel;
        totalWeightSum += oppComp.weight;

        compDetails.push({
          competenceId: oppComp.competenceId,
          name: oppComp.name || competenceNameMap.get(oppComp.competenceId) || oppComp.competenceId,
          weight: oppComp.weight,
          level: projLevel,
          attained: normLevel,
        });
      }

      competenceScore = totalWeightSum > 0 ? weightedLevelSum / totalWeightSum : 0;
    }

    // 4. TRL Calculation
    let trlScore = 0;
    const projTrl = project.trl || 1;
    const reqTrl = opportunity.minTrl || 1;
    if (trlRequired) {
      trlScore = Math.min(projTrl / reqTrl, 1.0);
    }

    // 5. CRL Calculation
    let crlScore = 0;
    const projCrl = project.crl || 1;
    const reqCrl = opportunity.desiredCrl || 1;
    if (crlRequired) {
      crlScore = Math.min(projCrl / reqCrl, 1.0);
    }

    // 6. Final Weighted Score
    const finalScore =
      competenceScore * effectiveWeightComp +
      trlScore * effectiveWeightTrl +
      crlScore * effectiveWeightCrl;

    const percentage = Math.round(finalScore * 100);

    const explanation: MatchExplanation = {
      version: "v1",
      score: Math.round(finalScore * 10000) / 10000,
      percentage,
      components: {
        competence: {
          weight: Math.round(effectiveWeightComp * 100),
          score: Math.round(competenceScore * 10000) / 10000,
          percentage: Math.round(competenceScore * 100),
          details: compDetails,
        },
        trl: {
          weight: Math.round(effectiveWeightTrl * 100),
          score: Math.round(trlScore * 10000) / 10000,
          percentage: Math.round(trlScore * 100),
          projectTrl: projTrl,
          desiredTrl: reqTrl,
        },
        crl: {
          weight: Math.round(effectiveWeightCrl * 100),
          score: Math.round(crlScore * 10000) / 10000,
          percentage: Math.round(crlScore * 100),
          projectCrl: projCrl,
          desiredCrl: reqCrl,
        },
      },
    };

    return {
      id: `match-${opportunity.id}-${project.id}`,
      opportunityId: opportunity.id,
      projectId: project.id,
      score: finalScore,
      percentage,
      status: "GENERATED",
      explanation,
      createdAt: new Date().toISOString(),
      project,
      opportunity,
    };
  },

  async runMatchingEngine(): Promise<MatchItem[]> {
    const token = authService.getStoredToken();

    // 1. Try to fetch matches from API
    try {
      const res = await fetch(`${env.apiUrl}/matches`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const json = await res.json();
        const apiData = Array.isArray(json.data) ? json.data : json;
        if (Array.isArray(apiData) && apiData.length > 0) {
          return apiData.map((item: any) => ({
            id: item.id,
            opportunityId: item.opportunityId,
            projectId: item.projectId,
            score: Number(item.score),
            percentage: Math.round(Number(item.score) * 100),
            status: item.status,
            explanation: item.explanation,
            createdAt: item.createdAt,
            project: item.project,
            opportunity: item.opportunity,
          }));
        }
      }
    } catch {
      // Backend offline fallback
    }

    // 2. Client-side deterministic calculation on stored projects & opportunities
    // STRICT RULE: The user can ONLY see matches for their OWN submissions.
    const currentUser = authService.getStoredUser();
    const isResearcher = currentUser?.profileType === "RESEARCHER";

    const matches: MatchItem[] = [];

    if (isResearcher) {
      // Researcher sees matches for their OWN projects against market opportunities
      const myProjects = await projectsService.getMyProjects(currentUser?.id);
      const allOpportunities = await opportunitiesService.getOpportunities();

      for (const proj of myProjects) {
        for (const opp of allOpportunities) {
          const result = this.calculateMatchPair(opp, proj);
          if (result && result.percentage > 0) {
            matches.push(result);
          }
        }
      }
    } else {
      // Company sees matches for their OWN opportunities against research projects
      const myOpportunities = await opportunitiesService.getMyOpportunities(currentUser?.id);
      const allProjects = await projectsService.getProjects();

      for (const opp of myOpportunities) {
        for (const proj of allProjects) {
          const result = this.calculateMatchPair(opp, proj);
          if (result && result.percentage > 0) {
            matches.push(result);
          }
        }
      }
    }

    // Order by score descending
    matches.sort((a, b) => b.score - a.score);

    return matches;
  },

  async runRematch(): Promise<MatchItem[]> {
    return this.runMatchingEngine();
  },
};
