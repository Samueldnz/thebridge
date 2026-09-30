import { env } from "../config/env";
import { authService } from "./auth";
import { defaultCompetences } from "./competences";

export type PatentRequirement = "NOT_REQUIRED" | "REQUIRED" | "PENDING_ACCEPTED";
export type OpportunityStatus = "DRAFT" | "OPEN" | "CLOSED" | "ARCHIVED";

export interface OpportunityCompetenceItem {
  competenceId: string;
  weight: number; // 1-5
  name?: string;
}

export interface Opportunity {
  id: string;
  ownerId?: string;
  title: string;
  description: string;
  keywords?: string;
  industrySector?: string;
  desiredTechnology?: string;
  minTrl: number;
  desiredCrl: number;
  patentRequirement: PatentRequirement;
  budgetMin?: number;
  budgetMax?: number;
  currency?: string;
  timeline?: string;
  status: OpportunityStatus;
  competences: OpportunityCompetenceItem[];
  createdAt: string;
  organizationName?: string;
}

export interface CreateOpportunityPayload {
  title: string;
  description: string;
  keywords?: string;
  industrySector?: string;
  desiredTechnology?: string;
  minTrl: number;
  desiredCrl: number;
  patentRequirement: PatentRequirement;
  budgetMin?: number;
  budgetMax?: number;
  currency?: string;
  timeline?: string;
  status?: OpportunityStatus;
  competences: { competenceId: string; weight: number; name?: string }[];
}

const STORAGE_KEY = "thebridge_demo_opportunities";

const defaultInitialOpportunities: Opportunity[] = [
  {
    id: "opp-pharma-01",
    ownerId: "demo-company-1",
    title: "Sistemas Nanométricos para Aumento de Biodisponibilidade de Princípios Ativos",
    description:
      "Buscamos grupos de pesquisa com tecnologia patenteada em nanocarreadores lipídicos ou poliméricos para co-desenvolvimento de formulações de alta eficácia terapêutica em ensaios pré-clínicos avançados.",
    keywords: "nanotecnologia, farmacotécnica, liberação controlada, ensaios clínicos",
    industrySector: "Saúde & Indústria Farmacêutica",
    desiredTechnology: "Nanocarreadores poliméricos funcionalizados",
    minTrl: 4,
    desiredCrl: 5,
    patentRequirement: "PENDING_ACCEPTED",
    budgetMin: 800000,
    budgetMax: 2500000,
    currency: "BRL",
    timeline: "18 meses",
    status: "OPEN",
    organizationName: "Eurofarma Inovação & P&D",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    competences: [
      { competenceId: "comp-materials", weight: 5, name: "Nanotecnologia & Novos Materiais" },
      { competenceId: "comp-pharma", weight: 5, name: "Farmacologia & Formulação de Medicamentos" },
      { competenceId: "comp-biotech", weight: 3, name: "Biotecnologia & Engenharia Genética" },
    ],
  },
  {
    id: "opp-energy-02",
    ownerId: "demo-company-1",
    title: "Armazenamento Eletroquímico e Conversão Fotovoltaica de Próxima Geração",
    description:
      "Demanda de inovação aberta voltada para materiais semicondutores avançados e células tandem para geração solar distribuída com durabilidade em condições tropicais.",
    keywords: "perovskita, fotovoltaica, transição energética, estabilidade térmica",
    industrySector: "Energia, Óleo & Renováveis",
    desiredTechnology: "Células solares de perovskita de alta estabilidade",
    minTrl: 5,
    desiredCrl: 5,
    patentRequirement: "REQUIRED",
    budgetMin: 1200000,
    budgetMax: 4000000,
    currency: "BRL",
    timeline: "24 meses",
    status: "OPEN",
    organizationName: "Eurofarma Inovação & P&D",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    competences: [
      { competenceId: "comp-energy", weight: 5, name: "Energias Renováveis & Armazenamento" },
      { competenceId: "comp-materials", weight: 4, name: "Nanotecnologia & Novos Materiais" },
    ],
  },
  {
    id: "opp-agro-03",
    ownerId: "other-company-2",
    title: "Substituição Biológica de Fertilizantes Nitrogenados para Grandes Culturas",
    description:
      "Interesse corporativo em licenciar e escalar biofertilizantes e biodefensivos agrícolas formulados a partir de bactérias ou fungos benéficos com eficácia comprovada a campo.",
    keywords: "biofertilizante, fixação biológica de nitrogênio, bioinsumos, agritech",
    industrySector: "Agronegócio & Alimentos",
    desiredTechnology: "Consórcios microbianos de fixação biológica",
    minTrl: 6,
    desiredCrl: 6,
    patentRequirement: "REQUIRED",
    budgetMin: 1500000,
    budgetMax: 5000000,
    currency: "BRL",
    timeline: "12 meses",
    status: "OPEN",
    organizationName: "SLC Agrícola Venture",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
    competences: [
      { competenceId: "comp-agritech", weight: 5, name: "Agricultura de Precisão & Bioinsumos" },
      { competenceId: "comp-biotech", weight: 4, name: "Biotecnologia & Engenharia Genética" },
    ],
  },
];

export const opportunitiesService = {
  getStoredOpportunities(): Opportunity[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // fallback
    }
    this.saveStoredOpportunities(defaultInitialOpportunities);
    return defaultInitialOpportunities;
  },

  saveStoredOpportunities(opportunities: Opportunity[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(opportunities));
    } catch {
      // fallback
    }
  },

  async getOpportunities(): Promise<Opportunity[]> {
    const token = authService.getStoredToken();
    const stored = this.getStoredOpportunities();

    try {
      const res = await fetch(`${env.apiUrl}/opportunities`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const data = await res.json();
        const apiList = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);

        const oppMap = new Map<string, Opportunity>();

        // 1. Manter catalogo inicial padrao
        defaultInitialOpportunities.forEach((o) => oppMap.set(o.id, o));

        // 2. Manter demandas locais ja gravadas pelo usuario
        stored.forEach((o) => oppMap.set(o.id, o));

        // 3. Adicionar demandas vindas do backend
        apiList.forEach((o: any) => {
          oppMap.set(o.id, {
            ...o,
            organizationName: o.owner?.name || o.organizationName || "Empresa",
            competences: o.competences || [],
            status: o.status || "OPEN",
          });
        });

        const merged = Array.from(oppMap.values());
        this.saveStoredOpportunities(merged);
        return merged;
      }
    } catch {
      // Offline fallback
    }

    return stored;
  },

  async getMyOpportunities(userId?: string): Promise<Opportunity[]> {
    const all = await this.getOpportunities();
    const currentUser = authService.getStoredUser();
    const targetOwnerId = userId || currentUser?.id;
    if (!targetOwnerId) return [];
    return all.filter((o) => o.ownerId === targetOwnerId || (o as any).owner?.id === targetOwnerId);
  },

  async getOpportunity(id: string): Promise<Opportunity | null> {
    const all = await this.getOpportunities();
    return all.find((o) => o.id === id) || null;
  },

  async createOpportunity(payload: CreateOpportunityPayload): Promise<Opportunity> {
    const token = authService.getStoredToken();
    const currentUser = authService.getStoredUser();
    const ownerId = currentUser?.id;
    if (!ownerId) {
      throw new Error("Usuário não autenticado. Faça login para cadastrar demandas.");
    }

    // Enforce 5 opportunities maximum quota
    const myOpps = await this.getMyOpportunities(ownerId);
    if (myOpps.length >= 5) {
      throw new Error("Limite máximo de 5 demandas atingido para este perfil. Edite uma demanda existente.");
    }

    // 1. Criar e persistir localmente DE IMEDIATO para que a demanda nunca seja perdida
    let newOpportunity: Opportunity = {
      id: `opp-${Date.now()}`,
      ownerId,
      title: payload.title,
      description: payload.description,
      keywords: payload.keywords,
      industrySector: payload.industrySector,
      desiredTechnology: payload.desiredTechnology,
      minTrl: payload.minTrl,
      desiredCrl: payload.desiredCrl,
      patentRequirement: payload.patentRequirement,
      budgetMin: payload.budgetMin,
      budgetMax: payload.budgetMax,
      currency: payload.currency || "BRL",
      timeline: payload.timeline,
      status: payload.status || "OPEN",
      competences: payload.competences.map((c) => ({
        competenceId: c.competenceId,
        weight: c.weight,
        name: c.name || defaultCompetences.find((dc) => dc.id === c.competenceId)?.name || c.competenceId,
      })),
      createdAt: new Date().toISOString(),
      organizationName: currentUser?.companyName || currentUser?.name || "Empresa",
    };

    const currentList = this.getStoredOpportunities();
    this.saveStoredOpportunities([newOpportunity, ...currentList.filter((o) => o.id !== newOpportunity.id)]);

    // 2. Sincronizar com a API no backend
    try {
      const res = await fetch(`${env.apiUrl}/opportunities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: payload.title,
          description: payload.description,
          keywords: payload.keywords,
          industrySector: payload.industrySector,
          desiredTechnology: payload.desiredTechnology,
          minTrl: payload.minTrl,
          desiredCrl: payload.desiredCrl,
          patentRequirement: payload.patentRequirement,
          budgetMin: payload.budgetMin,
          budgetMax: payload.budgetMax,
          currency: payload.currency || "BRL",
          timeline: payload.timeline,
        }),
      });

      if (res.ok) {
        const createdOpp = await res.json();
        if (createdOpp && createdOpp.id) {
          newOpportunity = {
            ...newOpportunity,
            id: createdOpp.id,
            status: "OPEN",
          };

          const syncedList = [newOpportunity, ...currentList.filter((o) => o.id !== newOpportunity.id && o.id !== createdOpp.id)];
          this.saveStoredOpportunities(syncedList);

          // Associar competências no backend
          for (const comp of payload.competences) {
            try {
              await fetch(`${env.apiUrl}/opportunities/${createdOpp.id}/competences/${comp.competenceId}`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ weight: comp.weight }),
              });
            } catch {
              // Ignore single competence error
            }
          }
        }
      }
    } catch {
      // Backend indisponível, demanda já garantida localmente
    }

    return newOpportunity;
  },

  async updateOpportunity(id: string, payload: Partial<CreateOpportunityPayload>): Promise<Opportunity> {
    const token = authService.getStoredToken();
    const currentList = this.getStoredOpportunities();
    const index = currentList.findIndex((o) => o.id === id);

    let updatedOpp: Opportunity;
    if (index !== -1) {
      const existing = currentList[index];
      updatedOpp = {
        ...existing,
        title: payload.title !== undefined ? payload.title : existing.title,
        description: payload.description !== undefined ? payload.description : existing.description,
        keywords: payload.keywords !== undefined ? payload.keywords : existing.keywords,
        industrySector: payload.industrySector !== undefined ? payload.industrySector : existing.industrySector,
        desiredTechnology: payload.desiredTechnology !== undefined ? payload.desiredTechnology : existing.desiredTechnology,
        minTrl: payload.minTrl !== undefined ? payload.minTrl : existing.minTrl,
        desiredCrl: payload.desiredCrl !== undefined ? payload.desiredCrl : existing.desiredCrl,
        patentRequirement: payload.patentRequirement !== undefined ? payload.patentRequirement : existing.patentRequirement,
        budgetMin: payload.budgetMin !== undefined ? payload.budgetMin : existing.budgetMin,
        budgetMax: payload.budgetMax !== undefined ? payload.budgetMax : existing.budgetMax,
        currency: payload.currency !== undefined ? payload.currency : existing.currency,
        timeline: payload.timeline !== undefined ? payload.timeline : existing.timeline,
        competences:
          payload.competences !== undefined
            ? payload.competences.map((c) => ({
                competenceId: c.competenceId,
                weight: c.weight,
                name: c.name || defaultCompetences.find((dc) => dc.id === c.competenceId)?.name || c.competenceId,
              }))
            : existing.competences,
      };
      currentList[index] = updatedOpp;
      this.saveStoredOpportunities([...currentList]);
    } else {
      throw new Error("Demanda corporativa não encontrada para edição.");
    }

    // Tentar atualizar no backend
    try {
      await fetch(`${env.apiUrl}/opportunities/${id}`, {
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

    return updatedOpp;
  },
};
