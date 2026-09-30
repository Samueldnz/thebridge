import { env } from "../config/env";
import { authService } from "./auth";
import { defaultCompetences } from "./competences";

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
  competences: { competenceId: string; level: number; name?: string }[];
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
    const stored = this.getStoredProjects();

    try {
      const res = await fetch(`${env.apiUrl}/projects`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const data = await res.json();
        const apiList = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);

        const projectMap = new Map<string, Project>();

        // 1. Manter catalogo inicial padrao
        defaultInitialProjects.forEach((p) => projectMap.set(p.id, p));

        // 2. Manter submissoes locais ja gravadas pelo usuario
        stored.forEach((p) => projectMap.set(p.id, p));

        // 3. Adicionar projetos vindos do backend
        apiList.forEach((p: any) => {
          projectMap.set(p.id, {
            ...p,
            ownerName: p.owner?.name || p.ownerName || "Pesquisador",
            competences: p.competences || [],
            status: p.status || "PUBLISHED",
          });
        });

        const merged = Array.from(projectMap.values());
        this.saveStoredProjects(merged);
        return merged;
      }
    } catch {
      // Offline fallback
    }

    return stored;
  },

  async getMyProjects(userId?: string): Promise<Project[]> {
    const all = await this.getProjects();
    const currentUser = authService.getStoredUser();
    const targetOwnerId = userId || currentUser?.id;
    if (!targetOwnerId) return [];
    return all.filter((p) => p.ownerId === targetOwnerId || (p as any).owner?.id === targetOwnerId);
  },

  async getProject(id: string): Promise<Project | null> {
    const all = await this.getProjects();
    return all.find((p) => p.id === id) || null;
  },

  async createProject(payload: CreateProjectPayload): Promise<Project> {
    const token = authService.getStoredToken();
    const currentUser = authService.getStoredUser();
    const ownerId = currentUser?.id;
    if (!ownerId) {
      throw new Error("Usuário não autenticado. Faça login para cadastrar projetos.");
    }

    // Enforce 5 projects maximum quota
    const myProjects = await this.getMyProjects(ownerId);
    if (myProjects.length >= 5) {
      throw new Error("Limite máximo de 5 projetos atingido para este perfil. Edite um projeto existente.");
    }

    // 1. Criar e persistir localmente DE IMEDIATO para que a submissão nunca seja perdida
    let newProject: Project = {
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
      competences: payload.competences.map((c) => ({
        competenceId: c.competenceId,
        level: c.level,
        name: c.name || defaultCompetences.find((dc) => dc.id === c.competenceId)?.name || c.competenceId,
      })),
      createdAt: new Date().toISOString(),
      ownerName: currentUser?.name || "Pesquisador",
    };

    const currentList = this.getStoredProjects();
    this.saveStoredProjects([newProject, ...currentList.filter((p) => p.id !== newProject.id)]);

    // 2. Sincronizar com a API no backend
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
        if (createdProject && createdProject.id) {
          newProject = {
            ...newProject,
            id: createdProject.id,
            status: "PUBLISHED",
          };

          const syncedList = [newProject, ...currentList.filter((p) => p.id !== newProject.id && p.id !== createdProject.id)];
          this.saveStoredProjects(syncedList);

          // Associar competências no backend
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
        }
      }
    } catch {
      // Backend indisponível, submissão já garantida localmente
    }

    return newProject;
  },

  async updateProject(id: string, payload: Partial<CreateProjectPayload>): Promise<Project> {
    const token = authService.getStoredToken();
    const currentList = this.getStoredProjects();
    const index = currentList.findIndex((p) => p.id === id);

    let updatedProject: Project;
    if (index !== -1) {
      const existing = currentList[index];
      updatedProject = {
        ...existing,
        title: payload.title !== undefined ? payload.title : existing.title,
        description: payload.description !== undefined ? payload.description : existing.description,
        keywords: payload.keywords !== undefined ? payload.keywords : existing.keywords,
        researchField: payload.researchField !== undefined ? payload.researchField : existing.researchField,
        trl: payload.trl !== undefined ? payload.trl : existing.trl,
        crl: payload.crl !== undefined ? payload.crl : existing.crl,
        patentStatus: payload.patentStatus !== undefined ? payload.patentStatus : existing.patentStatus,
        competences:
          payload.competences !== undefined
            ? payload.competences.map((c) => ({
                competenceId: c.competenceId,
                level: c.level,
                name: c.name || defaultCompetences.find((dc) => dc.id === c.competenceId)?.name || c.competenceId,
              }))
            : existing.competences,
      };
      currentList[index] = updatedProject;
      this.saveStoredProjects([...currentList]);
    } else {
      throw new Error("Projeto não encontrado para edição.");
    }

    // Tentar atualizar no backend
    try {
      await fetch(`${env.apiUrl}/projects/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
    } catch {
      // fallback
    }

    return updatedProject;
  },
};
