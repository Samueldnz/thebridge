import { describe, expect, it, beforeAll } from "bun:test";
import "../test-setup";
import { projectsService, type CreateProjectPayload } from "./projects";
import type { User } from "./auth";

beforeAll(() => {
  const mockUser: User = {
    id: "usr-researcher-test-1",
    name: "Dr. Roberto Silveira",
    email: "roberto.silveira@ufsc.br",
    profileType: "RESEARCHER",
    university: "Universidade Federal de Santa Catarina",
  };
  localStorage.setItem("thebridge_auth_token", "mock-jwt-token-123");
  localStorage.setItem("thebridge_auth_user", JSON.stringify(mockUser));
});

describe("Projects Service Unit Tests", () => {
  it("creates and retrieves a project with technical dossier and documents", async () => {
    const newProjData: CreateProjectPayload = {
      title: "Desenvolvimento de Bioplásticos à Base de Lignina",
      description: "Pesquisa voltada à substituição de termoplásticos de origem fóssil por resinas modificadas.",
      researchField: "Química e Polímeros",
      trl: 4,
      crl: 3,
      patentStatus: "PENDING",
      keywords: "lignina, biopolímeros, biodegradabilidade",
      competences: [
        { competenceId: "comp-1", name: "química de polímeros", level: 4 }
      ],
      dossier: {
        industryProblem: "Redução de pegada de carbono em embalagens rígidas",
        competitiveAdvantage: "35% maior resistência térmica que PLA padrão",
        documents: [
          {
            id: "doc-1",
            title: "Artigo CBPol 2023",
            linkOrDoi: "https://doi.org/10.1016/j.polym.2023.001",
            type: "Artigo Científico"
          }
        ]
      }
    };

    const created = await projectsService.createProject(newProjData);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.title).toBe(newProjData.title);
    expect(created.dossier?.documents?.length).toBe(1);
    expect(created.dossier?.documents?.[0].title).toBe("Artigo CBPol 2023");

    // Retrieve by ID
    const retrieved = await projectsService.getProject(created.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(created.id);
    expect(retrieved?.dossier?.industryProblem).toBe("Redução de pegada de carbono em embalagens rígidas");
  });

  it("updates an existing project and appends new documents to dossier", async () => {
    const proj = await projectsService.createProject({
      title: "Projeto de Teste de Atualização",
      description: "Resumo inicial do projeto",
      researchField: "Agronegócio",
      trl: 2,
      crl: 1,
      patentStatus: "NONE",
      competences: []
    });

    const updated = await projectsService.updateProject(proj.id, {
      title: "Projeto de Teste Atualizado",
      trl: 3,
      dossier: {
        industryProblem: "Nova dor industrial identificada",
        documents: [
          { id: "doc-add", title: "Doc Adicional", linkOrDoi: "https://example.com/doc.pdf" }
        ]
      }
    });

    expect(updated.title).toBe("Projeto de Teste Atualizado");
    expect(updated.trl).toBe(3);
    expect(updated.dossier?.documents?.length).toBe(1);
  });
});
