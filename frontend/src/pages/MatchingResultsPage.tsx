import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Award,
  BrainCircuit,
  Building2,
  ChevronDown,
  ChevronUp,
  Filter,
  Info,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { scientificMatchingService, cleanScientificAbstract, type ScientificArticle } from "../services/scientificMatching";
import { authService } from "../services/auth";
import { opportunitiesService, type Opportunity } from "../services/opportunities";
import { connectionsService } from "../services/connections";

function buildQueryFromOpportunity(opp: Opportunity): string {
  const parts: string[] = [];
  if (opp.title) parts.push(opp.title);
  if (opp.desiredTechnology && !opp.title.toLowerCase().includes(opp.desiredTechnology.toLowerCase())) {
    parts.push(opp.desiredTechnology);
  }
  if (opp.keywords) {
    parts.push(opp.keywords);
  }
  if (opp.description) {
    const cleanDesc = opp.description.replace(/\r?\n/g, " ").trim();
    const firstTwo = cleanDesc.split(".").slice(0, 2).join(".").trim();
    if (firstTwo && firstTwo.length > 20) {
      parts.push(firstTwo);
    }
  }
  return parts.join(". ");
}

/**
 * Extrai o texto limpo do resumo acadêmico sem duplicar metadados do cabeçalho
 */
function getCleanAbstract(rawText: string): string {
  return cleanScientificAbstract(rawText);
}

export function MatchingResultsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user] = useState(authService.getStoredUser());
  const isResearcher = user?.profileType === "RESEARCHER";

  // Submissions State (Corporate Demands only)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>("");
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  // Search & Matching State
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<ScientificArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // UI Filters & Modals
  const [filterAffinity, setFilterAffinity] = useState<"ALL" | "HIGH" | "MEDIUM">("ALL");
  const [expandedAbstractId, setExpandedAbstractId] = useState<string | null>(null);
  const [selectedArticleForAudit, setSelectedArticleForAudit] = useState<ScientificArticle | null>(null);
  const [selectedArticleForConnection, setSelectedArticleForConnection] = useState<ScientificArticle | null>(null);
  const [connectionMessage, setConnectionMessage] = useState<string>("");
  const [connectionSentSuccess, setConnectionSentSuccess] = useState<boolean>(false);

  // Always fetch at most 10 matches
  const topK = 10;

  const executeMatching = async (queryText: string) => {
    const trimmed = (queryText || "").trim();
    if (!trimmed) {
      setError("Nenhum parâmetro de busca encontrado para o desejo corporativo.");
      return;
    }
    setError(null);
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await scientificMatchingService.search(trimmed, topK);
      setArticles(res.artigos || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro ao executar matching com o motor de IA.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If researcher, do not execute company matching
    if (isResearcher) return;

    const oppIdParam = searchParams.get("opportunityId");
    opportunitiesService.getMyOpportunities(user?.id).then((opps) => {
      setOpportunities(opps);
      if (opps.length > 0) {
        const target = oppIdParam
          ? opps.find((o) => o.id === oppIdParam) || opps[0]
          : opps[0];
        setSelectedSubmissionId(target.id);
        setSelectedOpportunity(target);
        const q = buildQueryFromOpportunity(target);
        setSearchQuery(q);
        executeMatching(q);
      }
    });
  }, [isResearcher, user]);

  const handleSelectOpportunity = (id: string) => {
    setSelectedSubmissionId(id);
    const opp = opportunities.find((o) => o.id === id);
    if (opp) {
      setSelectedOpportunity(opp);
      const q = buildQueryFromOpportunity(opp);
      setSearchQuery(q);
      setSearchParams({ opportunityId: opp.id });
      executeMatching(q);
    }
  };

  const handleOpenConnectionModal = (art: ScientificArticle) => {
    setSelectedArticleForConnection(art);
    setConnectionMessage(
      `Olá! Analisamos a pesquisa "${art.titulo}" (${art.evento}) através da plataforma The Bridge e identificamos alto grau de convergência técnica com a nossa demanda corporativa de P&D. Gostaríamos de solicitar uma conexão formal para avaliar a viabilidade técnica e possíveis modelos de cooperação.`
    );
    setConnectionSentSuccess(false);
  };

  const handleSendConnection = () => {
    if (!selectedArticleForConnection) return;
    connectionsService.requestConnection({
      articleTitle: selectedArticleForConnection.titulo,
      articleEvent: selectedArticleForConnection.evento,
      matchScore: selectedArticleForConnection.relevancia_pct,
      message: connectionMessage,
      companyName: user?.companyName || user?.name || "Empresa Parceira Registrada",
      researcherName: selectedArticleForConnection.autores
        ? selectedArticleForConnection.autores.split(",")[0]
        : "Grupo de Pesquisa",
      opportunityTitle: selectedOpportunity?.title || "Demanda Tecnológica Corporativa",
    });
    setConnectionSentSuccess(true);
    setTimeout(() => {
      setSelectedArticleForConnection(null);
      setConnectionSentSuccess(false);
    }, 1400);
  };

  // Filtered by affinity
  const filteredArticles = articles.filter((art) => {
    if (filterAffinity === "HIGH") return art.relevancia_pct >= 80;
    if (filterAffinity === "MEDIUM") return art.relevancia_pct >= 50 && art.relevancia_pct < 80;
    return true;
  });

  const highCount = articles.filter((a) => a.relevancia_pct >= 80).length;
  const mediumCount = articles.filter((a) => a.relevancia_pct >= 50 && a.relevancia_pct < 80).length;
  const maxAffinity = articles.length > 0 ? Math.max(...articles.map((a) => a.relevancia_pct)) : 0;

  // If user is a Researcher, explain that matching with projects is exclusive to Companies
  if (isResearcher) {
    return (
      <DashboardLayout title="Meus Matches">
        <div className="mx-auto max-w-2xl rounded-3xl border border-dashed border-border-subtle bg-surface-white p-10 md:p-14 text-center my-10 shadow-xs">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-green-moss/10 text-brand-green-moss mb-5">
            <Icon icon={Building2} size={32} />
          </div>
          <h3 className="font-display text-2xl font-bold text-text-primary">
            Matchmaking Exclusivo para Perfis Corporativos
          </h3>
          <p className="mt-3 font-body text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
            O motor de Matchmaking com o acervo de pesquisas científicas foi concebido para que <strong>empresas</strong> conectem seus desafios de P&amp;D e desejos de projeto aos pesquisadores e projetos de materiais.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button
              onClick={() => navigate("/dashboard/projetos")}
              className="bg-brand-green-dark text-white shadow-xs"
            >
              Ir para Meus Projetos
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate("/dashboard")}
            >
              Voltar ao Painel Geral
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Meus Matches"
      actions={
        <div className="flex items-center gap-3">
          <Button
            onClick={() => executeMatching(searchQuery)}
            disabled={loading}
            size="sm"
            className="bg-brand-green-dark !text-white hover:bg-brand-green-moss"
          >
            <Icon icon={RefreshCw} size={15} className={loading ? "animate-spin" : ""} />
            {loading ? "Calculando Matching..." : "Recalcular Matching"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Project Desire Clean Card */}
        <div className="rounded-3xl border border-brand-green-moss/20 bg-gradient-to-br from-brand-green-dark via-[#0a3832] to-[#04201c] p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white">
                Seu Desejo de Projeto
              </h2>

              {/* Minimal Opportunity Selector if multiple demands exist */}
              {opportunities.length > 1 && (
                <div className="relative inline-block">
                  <select
                    value={selectedSubmissionId}
                    onChange={(e) => handleSelectOpportunity(e.target.value)}
                    className="appearance-none rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 pr-8 text-xs font-semibold text-white focus:outline-none focus:border-emerald-400"
                  >
                    {opportunities.map((opp) => (
                      <option key={opp.id} value={opp.id} className="text-text-primary bg-surface-white">
                        {opp.title}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/70">
                    <Icon icon={ChevronDown} size={14} />
                  </div>
                </div>
              )}
            </div>

            {selectedOpportunity ? (
              <div className="space-y-3 pt-1">
                <h3 className="font-heading text-lg font-bold text-emerald-300">
                  {selectedOpportunity.title}
                </h3>
                <p className="font-body text-xs md:text-sm text-white/85 leading-relaxed">
                  {selectedOpportunity.description}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                  {selectedOpportunity.industrySector && (
                    <span className="rounded-md bg-white/15 px-2.5 py-0.5 font-medium text-white">
                      Setor: {selectedOpportunity.industrySector}
                    </span>
                  )}
                  <span className="rounded-md bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 font-mono font-semibold">
                    TRL {selectedOpportunity.minTrl}
                  </span>
                  <span className="rounded-md bg-blue-500/20 text-blue-300 px-2.5 py-0.5 font-mono font-semibold">
                    CRL {selectedOpportunity.desiredCrl}
                  </span>
                  <span className="rounded-md bg-amber-500/20 text-amber-300 px-2.5 py-0.5 font-medium">
                    Patente: {selectedOpportunity.patentRequirement}
                  </span>
                  {selectedOpportunity.desiredTechnology && (
                    <span className="rounded-md bg-white/10 px-2.5 py-0.5 text-white/90">
                      Tecnologia: {selectedOpportunity.desiredTechnology}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center space-y-3">
                <p className="font-body text-sm text-white/80 max-w-md mx-auto">
                  Você ainda não cadastrou um desejo de projeto corporativo. Cadastre sua demanda para visualizar o matching com o acervo científico.
                </p>
                <Button
                  onClick={() => navigate("/dashboard/demandas/nova")}
                  className="bg-emerald-500 hover:bg-emerald-600 !text-brand-green-dark font-bold"
                >
                  Submeter Meu Desejo de Projeto
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* UNIFIED Matches & Filters Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-border-subtle bg-surface-white shadow-xs">
          {/* Affinity Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-text-secondary mr-1 flex items-center gap-1.5">
              <Icon icon={Filter} size={14} />
              Filtrar por Relevância:
            </span>
            <button
              type="button"
              onClick={() => setFilterAffinity("ALL")}
              style={filterAffinity === "ALL" ? { color: "#ffffff", backgroundColor: "#002025" } : undefined}
              className={[
                "px-3.5 py-1.5 rounded-xl font-heading text-xs font-semibold transition-all",
                filterAffinity === "ALL"
                  ? "bg-brand-green-dark !text-white shadow-xs font-bold"
                  : "bg-surface-primary text-text-secondary hover:bg-surface-secondary",
              ].join(" ")}
            >
              Todos ({articles.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterAffinity("HIGH")}
              style={filterAffinity === "HIGH" ? { color: "#ffffff", backgroundColor: "#059669" } : undefined}
              className={[
                "px-3.5 py-1.5 rounded-xl font-heading text-xs font-semibold transition-all",
                filterAffinity === "HIGH"
                  ? "bg-emerald-600 !text-white shadow-xs font-bold"
                  : "bg-surface-primary text-text-secondary hover:bg-surface-secondary",
              ].join(" ")}
            >
              Alta Afinidade ≥ 80% ({highCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterAffinity("MEDIUM")}
              style={filterAffinity === "MEDIUM" ? { color: "#ffffff", backgroundColor: "#2563eb" } : undefined}
              className={[
                "px-3.5 py-1.5 rounded-xl font-heading text-xs font-semibold transition-all",
                filterAffinity === "MEDIUM"
                  ? "bg-blue-600 !text-white shadow-xs font-bold"
                  : "bg-surface-primary text-text-secondary hover:bg-surface-secondary",
              ].join(" ")}
            >
              Média Afinidade 50-79% ({mediumCount})
            </button>
          </div>

          {/* Unified Summary Stats on the right */}
          <div className="flex items-center gap-4 text-xs font-heading font-semibold text-text-secondary">
            <div className="flex items-center gap-1.5">
              <Icon icon={Sparkles} size={14} className="text-brand-green-moss" />
              <span>Matches: <strong className="text-text-primary">{articles.length}</strong></span>
            </div>
            <span className="text-border-subtle">|</span>
            <div className="flex items-center gap-1.5">
              <Icon icon={Award} size={14} className="text-amber-500" />
              <span>Maior Afinidade: <strong className="text-emerald-700">{articles.length > 0 ? `${maxAffinity}%` : "--"}</strong></span>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-xs font-semibold text-red-800 flex items-center gap-2">
            <Icon icon={Info} size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Results Section */}
        {loading ? (
          <div className="py-20 text-center rounded-3xl border border-dashed border-border-subtle bg-surface-white">
            <Icon icon={RefreshCw} size={36} className="animate-spin text-brand-green-moss mx-auto mb-4" />
            <h4 className="font-heading text-base font-bold text-text-primary">
              Calculando Matching nos 12.531 Vetores de Pesquisa...
            </h4>
            <p className="mt-1 font-body text-xs text-text-secondary max-w-md mx-auto">
              Projetando sua demanda com o modelo BGE-M3 e calibrando a relevância percentual pela fórmula matemática.
            </p>
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="space-y-6">
            {filteredArticles.map((art, idx) => {
              const isHigh = art.relevancia_pct >= 80;
              const isMed = art.relevancia_pct >= 50 && art.relevancia_pct < 80;
              const isExpanded = expandedAbstractId === art.id;
              const cleanAbstract = getCleanAbstract(art.resumo);

              return (
                <div
                  key={art.id || idx}
                  className={[
                    "rounded-3xl border bg-surface-white p-6 md:p-8 transition-all hover:shadow-lg",
                    isHigh ? "border-emerald-300 ring-1 ring-emerald-100" : "border-border-subtle",
                  ].join(" ")}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-border-subtle">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-brand-green-dark !text-white px-2.5 py-0.5 text-xs font-mono font-bold">
                          #{idx + 1}
                        </span>
                        <span className="rounded-full bg-surface-secondary text-text-primary px-3 py-0.5 text-xs font-heading font-semibold border border-border-subtle">
                          🏛️ {art.evento} ({art.ano}) • {art.edicao}
                        </span>
                        {art.codigo && (
                          <span className="rounded-full bg-blue-50 text-blue-800 px-2.5 py-0.5 text-[11px] font-mono font-medium">
                            Cod: {art.codigo}
                          </span>
                        )}
                      </div>
                      <h3 className="font-heading text-lg md:text-xl font-bold text-text-primary leading-snug">
                        {art.titulo}
                      </h3>
                    </div>

                    {/* Calculated Relevance Badge with Formula Tooltip */}
                    <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between gap-1">
                      <div
                        className={[
                          "inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 font-display text-xl font-bold shadow-xs",
                          isHigh
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : isMed
                            ? "bg-blue-100 text-blue-900 border border-blue-300"
                            : "bg-amber-100 text-amber-900 border border-amber-300",
                        ].join(" ")}
                        title={`Score Cosseno: ${art.score_cosseno.toFixed(4)} | Fórmula: ((score - 0.35) / 0.40) × 100`}
                      >
                        <Icon icon={Sparkles} size={17} />
                        <span>{art.relevancia_pct}%</span>
                      </div>
                      <span className="text-[10px] font-mono text-text-secondary uppercase">
                        {isHigh ? "Alta Afinidade" : isMed ? "Boa Compatibilidade" : "Afinidade Moderada"}
                      </span>
                    </div>
                  </div>

                  {/* Authors and Session */}
                  <div className="py-4 space-y-2">
                    <div>
                      <span className="text-[11px] font-heading font-bold uppercase text-text-secondary">
                        Autores e Vínculos de Pesquisa:
                      </span>
                      <p className="mt-0.5 font-body text-xs md:text-sm text-text-primary font-medium">
                        {art.autores}
                      </p>
                    </div>

                    {(art.area || art.sessao) && (
                      <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-text-secondary">
                        <span className="bg-surface-primary px-2.5 py-1 rounded-md border border-border-subtle">
                          <strong>Área:</strong> {art.area || art.sessao}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Abstract Section - Starts right after "Resumo :" */}
                  {cleanAbstract && (
                    <div className="pt-2 pb-4">
                      <div className="flex items-center justify-between pb-1.5">
                        <span className="text-[11px] font-heading font-bold uppercase text-text-secondary">
                          Resumo da Pesquisa:
                        </span>
                        <button
                          type="button"
                          onClick={() => setExpandedAbstractId(isExpanded ? null : art.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-green-moss hover:underline"
                        >
                          <Icon icon={isExpanded ? ChevronUp : ChevronDown} size={14} />
                          {isExpanded ? "Recolher resumo" : "Ver resumo completo"}
                        </button>
                      </div>
                      <p
                        className={[
                          "font-body text-xs md:text-sm text-text-secondary leading-relaxed bg-surface-primary/60 p-4 rounded-2xl border border-border-subtle transition-all",
                          isExpanded ? "" : "line-clamp-3",
                        ].join(" ")}
                      >
                        {cleanAbstract}
                      </p>
                    </div>
                  )}

                  {/* Card Actions Footer */}
                  <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedArticleForAudit(art)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-primary px-3 py-1.5 font-heading text-xs font-semibold text-text-secondary hover:text-brand-green-dark hover:border-brand-green-moss transition-all"
                      >
                        <Icon icon={Info} size={13} />
                        Auditar Cálculo
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleOpenConnectionModal(art)}
                        className="bg-brand-green-dark !text-white hover:bg-brand-green-moss transition-all shadow-xs"
                      >
                        <Icon icon={MessageSquare} size={14} />
                        Solicitar Conexão
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : hasSearched ? (
          <div className="py-16 text-center rounded-3xl border border-dashed border-border-subtle bg-surface-white p-8">
            <Icon icon={Search} size={36} className="text-text-muted mx-auto mb-3" />
            <h4 className="font-heading text-base font-bold text-text-primary">
              Nenhuma pesquisa encontrada para os termos ou filtros aplicados
            </h4>
            <p className="mt-1 font-body text-xs text-text-secondary max-w-sm mx-auto">
              Tente selecionar outro filtro de relevância ou refinar a descrição da sua demanda corporativa.
            </p>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border-subtle bg-surface-white p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-green-moss/10 text-brand-green-moss mb-4">
              <Icon icon={BrainCircuit} size={32} />
            </div>
            <h4 className="font-display text-xl font-bold text-text-primary">
              Pronto para Calcular o Matchmaking
            </h4>
            <p className="mt-2 font-body text-xs md:text-sm text-text-secondary max-w-lg mx-auto leading-relaxed">
              O sistema calcula o grau de sinergia entre o seu desejo corporativo e as pesquisas acadêmicas indexadas.
            </p>
          </div>
        )}
      </div>

      {/* Audit / Explainability Modal with User Formula */}
      {selectedArticleForAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-surface-white p-6 md:p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedArticleForAudit(null)}
              className="absolute right-5 top-5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-secondary text-text-secondary hover:text-text-primary"
            >
              <Icon icon={X} size={18} />
            </button>

            <div className="flex items-center gap-2 font-heading text-xs font-bold text-brand-green-moss uppercase">
              <Icon icon={BrainCircuit} size={16} />
              Explicabilidade do Matchmaking Vetorial
            </div>

            <h3 className="mt-1 font-display text-2xl font-bold text-text-primary">
              Auditoria de Cálculo de Relevância (%)
            </h3>

            <p className="mt-2 font-body text-xs text-text-secondary">
              Decomposição formal do score de similaridade entre seu desejo corporativo e a pesquisa científica.
            </p>

            <div className="mt-6 space-y-6">
              {/* Formula Demonstration */}
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50/50 p-5 font-mono text-xs space-y-3">
                <p className="font-bold text-emerald-950 uppercase tracking-wider text-[11px]">
                  Fórmula de Calibração Aplicada:
                </p>
                <div className="p-3 bg-surface-white rounded-xl border border-emerald-200 text-center font-bold text-emerald-900 text-sm shadow-xs">
                  Relevância (%) = ((score - 0.35) / (0.75 - 0.35)) × 100
                </div>

                <div className="space-y-1.5 pt-2 text-emerald-950">
                  <div className="flex justify-between py-1 border-b border-emerald-200/60">
                    <span>Score Bruto de Cosseno (bge-m3):</span>
                    <strong className="font-bold">{selectedArticleForAudit.score_cosseno.toFixed(4)}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-200/60">
                    <span>Substituição:</span>
                    <span>
                      (({selectedArticleForAudit.score_cosseno.toFixed(4)} - 0.35) / 0.40) × 100
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-200/60">
                    <span>Resultado Exato:</span>
                    <strong className="font-bold">
                      {(((selectedArticleForAudit.score_cosseno - 0.35) / 0.40) * 100).toFixed(2)}%
                    </strong>
                  </div>
                  <div className="flex justify-between py-2 text-sm text-emerald-900 font-bold">
                    <span>Relevância Final Exibida:</span>
                    <span className="rounded-lg bg-emerald-200/60 px-2.5 py-0.5">
                      {selectedArticleForAudit.relevancia_pct}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Research Metadata */}
              <div className="space-y-3">
                <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-text-primary">
                  Metadados do Trabalho Científico:
                </h4>
                <div className="rounded-2xl border border-border-subtle bg-surface-primary p-4 text-xs space-y-2">
                  <p>
                    <strong>Título:</strong> {selectedArticleForAudit.titulo}
                  </p>
                  <p>
                    <strong>Evento:</strong> {selectedArticleForAudit.evento} ({selectedArticleForAudit.ano}) •{" "}
                    {selectedArticleForAudit.edicao}
                  </p>
                  <p>
                    <strong>Autores:</strong> {selectedArticleForAudit.autores}
                  </p>
                  {selectedArticleForAudit.area && (
                    <p>
                      <strong>Área:</strong> {selectedArticleForAudit.area}
                    </p>
                  )}
                  <p>
                    <strong>Canal de Contato:</strong>{" "}
                    <span className="text-text-secondary">
                      Protegido pela plataforma (intermediação via Solicitar Conexão)
                    </span>
                  </p>
                </div>
              </div>

              {/* Technical Interpretation */}
              <div className="rounded-2xl border border-border-subtle bg-surface-secondary/40 p-4 text-xs text-text-secondary leading-relaxed space-y-1">
                <p className="font-heading font-semibold text-text-primary">Interpretação Semântica:</p>
                <p>
                  O modelo vetorial de 1024 dimensões identifica correlação conceitual entre a demanda corporativa e os
                  materiais, métodos e resultados descritos no trabalho acadêmico. Scores próximos de 0.75+ representam
                  aderência de alto impacto industrial.
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button onClick={() => setSelectedArticleForAudit(null)}>
                Fechar Auditoria
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Request Modal with soft fog background (efeito fog leve) */}
      {selectedArticleForConnection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-surface-white p-6 md:p-8 shadow-2xl border border-border-subtle space-y-5 animate-in zoom-in-95 duration-150">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setSelectedArticleForConnection(null)}
              className="absolute right-5 top-5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-secondary text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              <Icon icon={X} size={18} />
            </button>

            <div className="flex items-center gap-2 font-heading text-xs font-bold text-brand-green-moss uppercase">
              <Icon icon={MessageSquare} size={16} />
              Intermediação de Parceria • The Bridge
            </div>

            <div>
              <h3 className="font-display text-2xl font-bold text-text-primary">
                Solicitar Conexão
              </h3>
              <p className="mt-1 font-body text-xs text-text-secondary">
                Envie uma proposta de aproximação técnica intermediada com segurança pela plataforma.
              </p>
            </div>

            {/* Target Research Card */}
            <div className="rounded-2xl border border-border-subtle bg-surface-primary/70 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-heading font-bold text-text-primary text-[11px] uppercase text-brand-green-moss">
                  Pesquisa Alvo
                </span>
                <span className="rounded-full bg-emerald-100 text-emerald-900 font-mono font-bold px-2 py-0.5 text-[10px]">
                  {selectedArticleForConnection.relevancia_pct}% afinidade
                </span>
              </div>
              <p className="font-heading text-xs font-semibold text-text-primary line-clamp-2">
                {selectedArticleForConnection.titulo}
              </p>
              <p className="font-body text-[11px] text-text-secondary">
                {selectedArticleForConnection.evento} ({selectedArticleForConnection.ano})
              </p>
            </div>

            {/* IP Security Notice */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3 text-[11px] text-emerald-950 font-body leading-relaxed flex items-start gap-2">
              <Icon icon={Info} size={15} className="text-emerald-800 shrink-0 mt-0.5" />
              <span>
                As informações diretas de contato são preservadas pela The Bridge para garantir confidencialidade jurídica, salvaguarda de propriedade intelectual e celebração de acordos mútuos.
              </span>
            </div>

            {/* Editable Message Box */}
            <div className="space-y-1.5">
              <label className="block font-heading text-xs font-semibold text-text-primary">
                Mensagem de Apresentação (Editável):
              </label>
              <textarea
                rows={4}
                value={connectionMessage}
                onChange={(e) => setConnectionMessage(e.target.value)}
                placeholder="Descreva o interesse da sua empresa e contexto do desafio..."
                className="w-full rounded-2xl border border-border-subtle bg-surface-primary p-3.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none focus:bg-surface-white transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Feedback alert if sent */}
            {connectionSentSuccess && (
              <div className="rounded-xl border border-emerald-300 bg-emerald-100 p-3 text-xs font-heading font-bold text-emerald-950 text-center animate-in fade-in">
                ✓ Solicitação de conexão enviada com sucesso! Acompanhe em &apos;Minhas Conexões&apos;.
              </div>
            )}

            {/* Actions: CANCELAR & ENVIAR */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setSelectedArticleForConnection(null)}
                disabled={connectionSentSuccess}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSendConnection}
                disabled={connectionSentSuccess || !connectionMessage.trim()}
                className="bg-brand-green-dark !text-white hover:bg-brand-green-moss shadow-xs"
              >
                <Icon icon={Send} size={14} />
                Enviar
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
