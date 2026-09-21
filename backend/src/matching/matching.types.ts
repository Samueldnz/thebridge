export interface MatchingCompetence {
  competenceId: string;
  level: number;
}

export interface OpportunityCompetenceRequirement {
  competenceId: string;
  weight: number;
}

export interface MatchingInput {
  opportunity: {
    competences: OpportunityCompetenceRequirement[];
    minTrl: number | null;
    desiredCrl: number | null;
  };

  project: {
    competences: MatchingCompetence[];
    trl: number | null;
    crl: number | null;
  };
}

export interface MatchingComponent {
  score: number;
  originalWeight: number;
  effectiveWeight: number;
}

export interface MatchingExplanation {
  version: 'v1';
  score: number;
  percentage: number;
  components: {
    competence?: MatchingComponent;
    trl?: MatchingComponent;
    crl?: MatchingComponent;
  };
}

export interface MatchingResult {
  score: number;
  percentage: number;
  explanation: MatchingExplanation;
}