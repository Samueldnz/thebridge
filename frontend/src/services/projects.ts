import { env } from "../config/env";
import { authService } from "./auth";

export type PatentStatus = "NONE" | "PENDING" | "GRANTED";
export type ProjectStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface ProjectCompetenceItem {
  competenceId: string;
  level: number; // 1-5
  name?: string;
}

export interface Project {
  id: string;
  ownerId?: string;
  title: string;
  description: string;
  keywords?: string;
  researchField?: string;
  trl: number;
  crl: number;
  patentStatus: PatentStatus;
  status: ProjectStatus;
  competences: ProjectCompetenceItem[];
  createdAt: string;
  ownerName?: string;
}

export interface CreateProjectPayload {
  title: string;
  description: string;
  keywords?: string;
  researchField?: string;
  trl: number;
  crl: number;
  patentStatus: PatentStatus;
  status?: ProjectStatus;
  competences: { competenceId: string; level: number }[];
}

const STORAGE_KEY = "thebridge_demo_projects";

const defaultInitialProjects: Project[] = [
  {
    id: "proj-nanobio-01",
    ownerId: "demo-researcher-1",
    title: "Nanopartículas Poliméricas para Entrega Guiada de Quimioterápicos",
    description:
      "Desenvolvimento de nanocarreadores funcionalizados biocompatíveis capazes de direcionar agentes citotóxicos diretamente a células tumorais, minimizando efeitos colaterais sistêmicos e aumentando a meia-vida sérica.",
    keywords: "nanotecnologia, liberação controlada, oncologia, polímeros",
    researchField: "Nanobiotecnologia & Farmacologia",
    trl: 5,
    crl: 4,
    patentStatus: "GRANTED",
    status: "PUBLISHED",
    ownerName: "Dra. Carolina Fontes (Lab. Nanomedicina USP)",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    competences: [
      { competenceId: "comp-materials", level: 5, name: "Nanotecnologia & Novos Materiais" },
      { competenceId: "comp-pharma", level: 4, name: "Farmacologia & Formulação de Medicamentos" },
      { competenceId: "comp-biotech", level: 4, name: "Biotecnologia & Engenharia Genética" },
    ],
  },
  {
    id: "proj-solargreen-02",
    ownerId: "demo-researcher-1",
    title: "Células Solares de Perovskita com Alta Estabilidade Térmica",
    description:
      "Arquitetura tandem perovskita-silício com aditivos iônicos que evitam a degradação sob umidade e temperaturas elevadas, alcançando eficiência de conversão fotoelétrica superior a 27% em escala laboratorial.",
    keywords: "perovskita, energia fotovoltaica, semicondutores, transição energética",
    researchField: "Energia Solar & Novos Materiais",
    trl: 6,
    crl: 5,
    patentStatus: "PENDING",
    status: "PUBLISHED",
    ownerName: "Dra. Carolina Fontes (Lab. Nanomedicina USP)",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    competences: [
      { competenceId: "comp-energy", level: 5, name: "Energias Renováveis & Armazenamento" },
      { competenceId: "comp-materials", level: 5, name: "Nanotecnologia & Novos Materiais" },
    ],
  },
  {
    id: "proj-bioinsumo-03",
    ownerId: "other-researcher-02",
    title: "Biofertilizante Baseado em Consórcio Microbiano Fixador de Nitrogênio",
    description:
      "Formulação líquida estável contendo bactérias diazotróficas endofíticas nativas que reduzem em até 40% a necessidade de adubação química nitrogenada na cultura de milho e soja.",
    keywords: "bioinsumos, fixação biológica, sustentabilidade agrícola, microbioma",
    researchField: "Biotecnologia Agrícola",
    trl: 7,
    crl: 6,
    patentStatus: "GRANTED",
    status: "PUBLISHED",
    ownerName: "Dra. Beatriz Mendes (Embrapa / UFRGS)",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    competences: [
      { competenceId: "comp-agritech", level: 5, name: "Agricultura de Precisão & Bioinsumos" },
      { competenceId: "comp-biotech", level: 5, name: "Biotecnologia & Engenharia Genética" },
    ],
  },
];

export const projectsService = {
  getStoredProjects(): Project[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // fallback
    }
    this.saveStoredProjects(defaultInitialProjects);
    return defaultInitialProjects;
  },

  saveStoredProjects(projects: Project[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch {
      // fallback
    }
  },

  async getProjects(): Promise<Project[]> {
    const token = authService.getStoredToken();
    try {
      const res = await fetch(`${env.apiUrl}/projects`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.data || data)) {
          return (data.data || data);
        }
      }
    } catch {
      // Offline fallback
    }
    return this.getStoredProjects();
  },

  async getMyProjects(userId?: string): Promise<Project[]> {
    const all = await this.getProjects();
    const currentUser = authService.getStoredUser();
    const targetOwnerId = userId || currentUser?.id || "demo-researcher-1";
    return all.filter((p) => (p.ownerId === targetOwnerId) || (!p.ownerId && targetOwnerId === "demo-researcher-1"));
  },

  async getProject(id: string): Promise<Project | null> {
    const all = await this.getProjects();
    return all.find((p) => p.id === id) || null;
  },

  async createProject(payload: CreateProjectPayload): Promise<Project> {
    const token = authService.getStoredToken();
    const currentUser = authService.getStoredUser();
    const ownerId = currentUser?.id || "demo-researcher-1";

    // Enforce 5 projects maximum quota
    const myProjects = await this.getMyProjects(ownerId);
    if (myProjects.length >= 5) {
      throw new Error("Limite máximo de 5 projetos atingido para este perfil. Edite um projeto existente.");
    }

    // Try backend first
    try {
      const res = await fetch(`${env.apiUrl}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: payload.title,
          description: payload.description,
          keywords: payload.keywords,
          researchField: payload.researchField,
          trl: payload.trl,
          crl: payload.crl,
          patentStatus: payload.patentStatus,
        }),
      });

      if (res.ok) {
        const createdProject = await res.json();
        for (const comp of payload.competences) {
          try {
            await fetch(`${env.apiUrl}/projects/${createdProject.id}/competences/${comp.competenceId}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({ level: comp.level }),
            });
          } catch {
            // Ignore single competence error
          }
        }
        return createdProject;
      }
    } catch {
      // Fallback to local persistence
    }

    // Local Persistence Fallback
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      ownerId,
      title: payload.title,
      description: payload.description,
      keywords: payload.keywords,
      researchField: payload.researchField,
      trl: payload.trl,
      crl: payload.crl,
      patentStatus: payload.patentStatus,
      status: payload.status || "PUBLISHED",
      competences: payload.competences,
      createdAt: new Date().toISOString(),
      ownerName: currentUser?.name || "Dra. Carolina Fontes (Lab. Nanomedicina USP)",
    };

    const currentList = this.getStoredProjects();
    const updated = [newProject, ...currentList];
    this.saveStoredProjects(updated);

    return newProject;
  },

  async updateProject(id: string, payload: Partial<CreateProjectPayload>): Promise<Project> {
    const token = authService.getStoredToken();

    // Try backend first
    try {
      const res = await fetch(`${env.apiUrl}/projects/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updatedFromApi = await res.json();
        return updatedFromApi;
      }
    } catch {
      // fallback
    }

    // Local Persistence Fallback
    const currentList = this.getStoredProjects();
    const index = currentList.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error("Projeto não encontrado para edição.");
    }

    const existing = currentList[index];
    const updatedProject: Project = {
      ...existing,
      title: payload.title !== undefined ? payload.title : existing.title,
      description: payload.description !== undefined ? payload.description : existing.description,
      keywords: payload.keywords !== undefined ? payload.keywords : existing.keywords,
      researchField: payload.researchField !== undefined ? payload.researchField : existing.researchField,
      trl: payload.trl !== undefined ? payload.trl : existing.trl,
      crl: payload.crl !== undefined ? payload.crl : existing.crl,
      patentStatus: payload.patentStatus !== undefined ? payload.patentStatus : existing.patentStatus,
      status: payload.status !== undefined ? payload.status : existing.status,
      competences: payload.competences !== undefined ? payload.competences : existing.competences,
    };

    currentList[index] = updatedProject;
    this.saveStoredProjects([...currentList]);

    return updatedProject;
  },
};
