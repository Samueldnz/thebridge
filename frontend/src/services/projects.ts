import { env } from "../config/env";
import { authService } from "./auth";
import { defaultCompetences } from "./competences";
import { savedMatchesService } from "./savedMatches";
import { scientificMatchingService } from "./scientificMatching";

export type PatentStatus = "NONE" | "PENDING" | "GRANTED";
export type ProjectStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface ProjectCompetenceItem {
  competenceId: string;
  level: number; // 1-5
  name?: string;
}

export interface ProjectDocumentItem {
  id: string;
  title: string;
  linkOrDoi?: string;
  type?: string;
}

export interface TechnicalDossier {
  industryProblem?: string; // Dor da Indústria (Problema real que resolve no mercado)
  competitiveAdvantage?: string; // Diferencial Competitivo / Benchmark Quantitativo (ex: 30% mais eficiente, menor custo)
  partnershipGoals?: string[]; // Objetivos com a Parceria (Co-desenvolvimento, Licenciamento, Prova de conceito piloto, etc.)

  operatingConditions?: string; // Condições operacionais e escala de bancada comprovada
  scalabilityGaps?: string; // Gaps conhecidos para a escala piloto / industrial
  estimatedBudget?: string; // Faixa de orçamento estimado para a fase piloto/industrial
  estimatedTimelineMonths?: string; // Prazo estimado até protótipo/piloto
  evidenceLinks?: string; // Links/referências de laudos de ensaio, relatórios descaracterizados ou artigos
  documents?: ProjectDocumentItem[]; // Lista dinâmica de documentos e artigos do projeto

  ownershipType?: "UNIVERSIDADE" | "NIT" | "INDEPENDENTE" | "LABORATORIO_PRIVADO" | "EMPRESA_SPINOFF"; // Titularidade da tecnologia
  patentClaimsSummary?: string; // Reivindicações da patente (sem o número confidencial)
  priorFunding?: string; // Fomento prévio (FAPESP, CNPq, Finep, Embrapii, Nenhum)
  hasExclusiveCommitment?: boolean; // Há exclusividade com terceiros?
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
  ownerEmail?: string;
  ownerAffiliation?: string;
  dossier?: TechnicalDossier;
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
  dossier?: TechnicalDossier;
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
    ownerEmail: "carolina.fontes@usp.br",
    ownerAffiliation: "Universidade de São Paulo (USP) - Lab. Nanomedicina",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    competences: [
      { competenceId: "comp-materials", level: 5, name: "Nanotecnologia & Novos Materiais" },
      { competenceId: "comp-pharma", level: 4, name: "Farmacologia & Formulação de Medicamentos" },
      { competenceId: "comp-biotech", level: 4, name: "Biotecnologia & Engenharia Genética" },
    ],
    dossier: {
      industryProblem: "Baixa seletividade de quimioterápicos convencionais gera alta toxicidade sistêmica, danos cardiovasculares severos e obriga a interrupção prematura de tratamentos oncológicos.",
      competitiveAdvantage: "Aumento de 3,4x na meia-vida sérica do princípio ativo e redução de 65% na toxicidade cardíaca em modelos pré-clínicos in vivo vs. doxorrubicina comercial livre.",
      partnershipGoals: [
        "Co-desenvolvimento conjunto (P&D)",
        "Licenciamento de tecnologia / royalties",
        "Desenvolvimento de protótipo industrial piloto",
      ],
      operatingConditions: "Bateladas laboratoriais de 250ml com taxa de encapsulamento de 88% e estabilidade coloidal comprovada por 12 meses a 4°C em ambiente estéril.",
      scalabilityGaps: "Necessidade de adaptação do processo de nanoemulsificação para microfluídica contínua de alta vazão e ensaios toxicológicos em ambiente BPL para registro Anvisa.",
      estimatedBudget: "R$ 180.000 a R$ 350.000 (reagentes, insumos para batelada piloto de 5L e 1 bolsista pós-doc)",
      estimatedTimelineMonths: "12 a 18 meses",
      evidenceLinks: "Artigo indexado no Journal of Controlled Release (2025) e laudos de espectrometria e difração de raios-X disponíveis sob NDA.",
      ownershipType: "UNIVERSIDADE",
      patentClaimsSummary: "Composição de nanocarreador lipídico-polimérico funcionalizado, método de síntese em batelada contínua e aplicação em fármacos citotóxicos.",
      priorFunding: "FAPESP (Auxílio à Pesquisa Regular) e Bolsa Produtividade CNPq",
      hasExclusiveCommitment: false,
    },
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
    ownerEmail: "carolina.fontes@usp.br",
    ownerAffiliation: "Universidade de São Paulo (USP) - Lab. Nanomedicina",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    competences: [
      { competenceId: "comp-energy", level: 5, name: "Energias Renováveis & Armazenamento" },
      { competenceId: "comp-materials", level: 5, name: "Nanotecnologia & Novos Materiais" },
    ],
    dossier: {
      industryProblem: "Células solares de perovskita sofrem degradação fotoquímica acelerada sob umidade relativa acima de 50% e estresse térmico prolongado (>65°C), inviabilizando módulos comerciais tradicionais.",
      competitiveAdvantage: "Estabilidade comprovada superior a 2.000 horas sob radiação contínua com retenção de 94% da eficiência original e conversão fotoelétrica recorde de 27,4%.",
      partnershipGoals: [
        "Co-desenvolvimento conjunto (P&D)",
        "Desenvolvimento de protótipo industrial piloto",
      ],
      operatingConditions: "Células de 5x5 cm² fabricadas em atmosfera de nitrogênio e testadas sob simulador solar classe AAA com calibração rastreável.",
      scalabilityGaps: "Deposição em substratos maiores (módulos 30x30 cm²) por técnica roll-to-roll e desenvolvimento de encapsulamento polimérico anti-uv de baixo custo.",
      estimatedBudget: "R$ 250.000 a R$ 500.000 para validação de protótipo em escala piloto",
      estimatedTimelineMonths: "6 a 12 meses",
      evidenceLinks: "Estudo publicado em periódico internacional Q1 de Materiais e ensaios de degradação acelerada em câmara climática.",
      ownershipType: "UNIVERSIDADE",
      patentClaimsSummary: "Formulação de aditivo iônico estabilizador de fase perovskita e processo de dopagem por banho químico sequencial.",
      priorFunding: "Finep e CNPq",
      hasExclusiveCommitment: false,
    },
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
    ownerEmail: "beatriz.mendes@embrapa.br",
    ownerAffiliation: "Embrapa / Universidade Federal do Rio Grande do Sul (UFRGS)",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    competences: [
      { competenceId: "comp-agritech", level: 5, name: "Agricultura de Precisão & Bioinsumos" },
      { competenceId: "comp-biotech", level: 5, name: "Biotecnologia & Engenharia Genética" },
    ],
    dossier: {
      industryProblem: "Custo astronômico e volatilidade cambial na importação de adubos químicos nitrogenados, associados a perdas por lixiviação e emissão de óxido nitroso no solo.",
      competitiveAdvantage: "Substituição biológica de até 40% da adubação nitrogenada com ganho médio de 4 sacas/ha em milho safrinha e custo de insumo até 50% menor por hectare.",
      partnershipGoals: [
        "Licenciamento de tecnologia / royalties",
        "Prestação de serviços analíticos especializados",
        "Validação em talhões industriais piloto",
      ],
      operatingConditions: "Fermentação em biorreator de 20 litros com viabilidade celular mínima de 1x10⁹ UFC/mL mantida estável por 180 dias em temperatura ambiente.",
      scalabilityGaps: "Registro oficial no MAPA (Ministério da Agricultura e Pecuária) e escalonamento para tanques fermentadores de 2.000 litros.",
      estimatedBudget: "R$ 120.000 a R$ 220.000 para testes agronômicos oficiais em 3 estados",
      estimatedTimelineMonths: "6 a 12 meses",
      evidenceLinks: "Relatórios agronômicos de 2 safras experimentais e laudo de contagem microbiológica e pureza de cepas.",
      ownershipType: "NIT",
      patentClaimsSummary: "Consórcio simbiótico de cepas bacterianas específicas, veículo protetor biopolimérico e processo de fermentação aeróbica.",
      priorFunding: "Embrapii e Embrapa",
      hasExclusiveCommitment: false,
    },
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
      ownerEmail: currentUser?.email || "pesquisador@universidade.edu.br",
      ownerAffiliation:
        currentUser?.university ||
        currentUser?.department ||
        "ICT / Universidade",
      dossier: payload.dossier,
    };

    const currentList = this.getStoredProjects();
    this.saveStoredProjects([newProject, ...currentList.filter((p) => p.id !== newProject.id)]);
    savedMatchesService.clear();

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

    // 3. Indexar dinamicamente no motor BAAI/bge-m3 (Hugging Face Space)
    scientificMatchingService.indexProjectsInBge([newProject]).catch(() => {});

    return newProject;
  },

  async updateProject(id: string, payload: Partial<CreateProjectPayload>): Promise<Project> {
    const token = authService.getStoredToken();
    const currentUser = authService.getStoredUser();
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
        ownerEmail: existing.ownerEmail || currentUser?.email || "pesquisador@universidade.edu.br",
        ownerAffiliation:
          existing.ownerAffiliation ||
          currentUser?.university ||
          currentUser?.department ||
          "ICT / Universidade",
        competences:
          payload.competences !== undefined
            ? payload.competences.map((c) => ({
                competenceId: c.competenceId,
                level: c.level,
                name: c.name || defaultCompetences.find((dc) => dc.id === c.competenceId)?.name || c.competenceId,
              }))
            : existing.competences,
        dossier: payload.dossier !== undefined ? payload.dossier : existing.dossier,
      };
      currentList[index] = updatedProject;
      this.saveStoredProjects([...currentList]);
      savedMatchesService.clear();
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

    // Re-indexar projeto editado no motor BAAI/bge-m3
    scientificMatchingService.indexProjectsInBge([updatedProject]).catch(() => {});

    return updatedProject;
  },
};
