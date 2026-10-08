import type { ScientificArticle } from "./scientificMatching";

export interface SavedMatchRecord {
  id: string; // key: opportunityId ou query hash
  opportunityId?: string;
  opportunityTitle: string;
  queryText: string;
  articles: ScientificArticle[];
  calculatedAt: string; // ISO date string
  totalBase: number;
}

const STORAGE_KEY = "thebridge_saved_matches";

export const savedMatchesService = {
  getAll(): Record<string, SavedMatchRecord> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  get(opportunityId?: string): SavedMatchRecord | null {
    if (!opportunityId) return null;
    const all = this.getAll();
    return all[opportunityId] || null;
  },

  save(record: {
    opportunityId?: string;
    opportunityTitle: string;
    queryText: string;
    articles: ScientificArticle[];
    totalBase?: number;
  }): SavedMatchRecord {
    const key = record.opportunityId || `query_${record.queryText.trim().toLowerCase().slice(0, 50)}`;
    const all = this.getAll();
    const entry: SavedMatchRecord = {
      id: key,
      opportunityId: record.opportunityId,
      opportunityTitle: record.opportunityTitle,
      queryText: record.queryText,
      articles: record.articles,
      calculatedAt: new Date().toISOString(),
      totalBase: record.totalBase || 12531,
    };
    all[key] = entry;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch (err) {
      console.warn("[SavedMatches] Falha ao persistir matches no localStorage:", err);
    }
    return entry;
  },

  remove(opportunityId: string): void {
    if (!opportunityId) return;
    const all = this.getAll();
    delete all[opportunityId];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {}
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  },
};
