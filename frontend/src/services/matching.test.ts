import { describe, expect, it } from "bun:test";
import { matchingService } from "./matching";
import type { Project } from "./projects";
import type { Opportunity } from "./opportunities";

describe("Frontend Matching Engine Unit Tests", () => {
  it("calculates exact 60/20/20 weighted score for competences, TRL, and CRL", () => {
    const project: Partial<Project> = {
      id: "proj-1",
      title: "Desenvolvimento de Nanocompósitos",
      trl: 4,
      crl: 3,
      patentStatus: "FILED",
      competences: [
        { competenceId: "comp-1", name: "Polímeros", level: 5 },
        { competenceId: "comp-2", name: "Nanotecnologia", level: 5 },
      ],
      technicalDossier: {
        problemStatement: "Substituição de materiais fósseis",
        methodology: "Polimerização in situ",
        documents: [
          { title: "Artigo SBPMat 2023", fileUrl: "https://example.com/doc.pdf" }
        ]
      }
    };

    const opportunity: Partial<Opportunity> = {
      id: "opp-1",
      title: "Demanda por Nanomateriais Condutores",
      minTrl: 4,
      desiredCrl: 3,
      patentRequirement: "OPTIONAL",
      competences: [
        { competenceId: "comp-1", name: "Polímeros", weight: 1 },
        { competenceId: "comp-2", name: "Nanotecnologia", weight: 1 },
      ]
    };

    const match = matchingService.calculateMatchPair(opportunity as Opportunity, project as Project);

    expect(match).not.toBeNull();
    if (match) {
      // 100% competences + 100% TRL + 100% CRL
      expect(match.percentage).toBe(100);
      expect(match.explanation.components.competence.percentage).toBe(100);
      expect(match.explanation.components.trl.percentage).toBe(100);
      expect(match.explanation.components.crl.percentage).toBe(100);
    }
  });

  it("CRITICAL RULE: Technical dossier and documents MUST NOT enter or alter the numeric matching score formula", () => {
    const baseProject: Partial<Project> = {
      id: "proj-10",
      title: "Projeto de Teste de Materiais",
      trl: 5,
      crl: 4,
      patentStatus: "FILED",
      competences: [
        { competenceId: "comp-1", name: "Polímeros", level: 4 }
      ]
    };

    const opportunity: Partial<Opportunity> = {
      id: "opp-10",
      title: "Demanda Industrial",
      minTrl: 5,
      desiredCrl: 4,
      patentRequirement: "OPTIONAL",
      competences: [
        { competenceId: "comp-1", name: "Polímeros", weight: 1 }
      ]
    };

    // Calculate score without dossier
    const matchWithoutDossier = matchingService.calculateMatchPair(opportunity as Opportunity, baseProject as Project);

    // Calculate score with rich dossier and multiple document attachments
    const projectWithDossier: Partial<Project> = {
      ...baseProject,
      technicalDossier: {
        executiveSummary: "Resumo executivo completo e extenso...",
        problemStatement: "Problema detalhado...",
        scientificRelevance: "Altíssima relevância técnica...",
        methodology: "Metodologia comprovada...",
        expectedResults: "Resultados obtidos com sucesso...",
        budgetSummary: "R$ 500.000",
        documents: [
          { title: "Artigo 1", fileUrl: "https://doc1.pdf" },
          { title: "Artigo 2", fileUrl: "https://doc2.pdf" },
          { title: "Certificado", fileUrl: "https://cert.pdf" }
        ]
      }
    };

    const matchWithDossier = matchingService.calculateMatchPair(opportunity as Opportunity, projectWithDossier as Project);

    expect(matchWithoutDossier).not.toBeNull();
    expect(matchWithDossier).not.toBeNull();

    // The mathematical score must remain identical regardless of dossier/documents
    expect(matchWithDossier?.score).toBe(matchWithoutDossier?.score);
    expect(matchWithDossier?.percentage).toBe(matchWithoutDossier?.percentage);
  });

  it("filters out project if opportunity strictly requires patent and project has NONE", () => {
    const projectNoPatent: Partial<Project> = {
      id: "proj-no-pat",
      title: "Projeto Sem Patente",
      trl: 5,
      crl: 4,
      patentStatus: "NONE",
      competences: [{ competenceId: "comp-1", level: 5 }]
    };

    const oppRequiringPatent: Partial<Opportunity> = {
      id: "opp-req-pat",
      title: "Demanda que exige patente registrada",
      minTrl: 3,
      desiredCrl: 3,
      patentRequirement: "REQUIRED",
      competences: [{ competenceId: "comp-1", weight: 1 }]
    };

    const match = matchingService.calculateMatchPair(oppRequiringPatent as Opportunity, projectNoPatent as Project);
    expect(match).toBeNull();
  });
});
