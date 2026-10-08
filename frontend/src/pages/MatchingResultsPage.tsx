import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Award,
  BarChart3,
  BrainCircuit,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Edit3,
  Filter,
  GraduationCap,
  Info,
  Mail,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { scientificMatchingService, type ScientificArticle } from "../services/scientificMatching";
import { authService } from "../services/auth";
import { projectsService, type Project } from "../services/projects";
import { opportunitiesService, type Opportunity } from "../services/opportunities";

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

function buildQueryFromProject(proj: Project): string {
  const parts: string[] = [proj.title];
  if (proj.keywords) parts.push(proj.keywords);
  if (proj.description) {
    const cleanDesc = proj.description.replace(/\r?\n/g, " ").trim();
    const firstTwo = cleanDesc.split(".").slice(0, 2).join(".").trim();
    if (firstTwo && firstTwo.length > 20) {
      parts.push(firstTwo);
    }
  }
  return parts.join(". ");
}

export function MatchingResultsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user] = useState(authService.getStoredUser());
  const isResearcher = user?.profileType === "RESEARCHER";

  // Submissions State
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>("CUSTOM");
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Search & Matching State
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditingQuery, setIsEditingQuery] = useState(false);
  const [topK, setTopK] = useState(6);
  const [articles, setArticles] = useState<ScientificArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState("");
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // UI Filters & Modals
  const [filterAffinity, setFilterAffinity] = useState<"ALL" | "HIGH" | "MEDIUM">("ALL");
  const [expandedAbstractId, setExpandedAbstractId] = useState<string | null>(null);
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);
  const [selectedArticleForAudit, setSelectedArticleForAudit] = useState<ScientificArticle | null>(null);

  const executeMatching = async (queryText: string, k: number = topK) => {
    const trimmed = (queryText || "").trim();
    if (!trimmed) {
      setError("Por favor, selecione um desejo de projeto ou digite termos para a busca.");
      return;
    }
    setError(null);
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await scientificMatchingService.search(trimmed, k);
      setArticles(res.artigos);
      setAiDiagnosis(res.resposta);
      setExecutionTimeMs(res.estatisticas.tempo_matchmaking_ms);
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

  // Initial load: Fetch submissions and run matching for target or primary submission
  useEffect(() => {
    const oppIdParam = searchParams.get("opportunityId");
    const projIdParam = searchParams.get("projectId");
    const rawQueryParam = searchParams.get("query");

    if (isResearcher) {
      projectsService.getMyProjects(user?.id).then((projs) => {
        setProjects(projs);
        if (projs.length > 0) {
          const target = projIdParam
            ? projs.find((p) => p.id === projIdParam) || projs[0]
            : projs[0];
          setSelectedSubmissionId(target.id);
          setSelectedProject(target);
          const q = buildQueryFromProject(target);
          setSearchQuery(q);
          executeMatching(q, topK);
        } else if (rawQueryParam) {
          setSelectedSubmissionId("CUSTOM");
          setSearchQuery(rawQueryParam);
          executeMatching(rawQueryParam, topK);
        }
      });
    } else {
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
          executeMatching(q, topK);
        } else if (rawQueryParam) {
          setSelectedSubmissionId("CUSTOM");
          setSearchQuery(rawQueryParam);
          executeMatching(rawQueryParam, topK);
        }
      });
    }
  }, [isResearcher, user]);

  // Handle changing submission from dropdown
  const handleSelectSubmission = (id: string) => {
    setSelectedSubmissionId(id);
    if (id === "CUSTOM") {
      setSelectedOpportunity(null);
      setSelectedProject(null);
      setIsEditingQuery(true);
      return;
    }

    if (isResearcher) {
      const proj = projects.find((p) => p.id === id);
      if (proj) {
        setSelectedProject(proj);
        const q = buildQueryFromProject(proj);
        setSearchQuery(q);
        setIsEditingQuery(false);
        setSearchParams({ projectId: proj.id });
        executeMatching(q, topK);
      }
    } else {
      const opp = opportunities.find((o) => o.id === id);
      if (opp) {
        setSelectedOpportunity(opp);
        const q = buildQueryFromOpportunity(opp);
        setSearchQuery(q);
        setIsEditingQuery(false);
        setSearchParams({ opportunityId: opp.id });
        executeMatching(q, topK);
      }
    }
  };

  const handleCopyEmail = (email: string, id: string) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopiedEmailId(id);
    setTimeout(() => {
      setCopiedEmailId(null);
    }, 3000);
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

  return (
    <DashboardLayout
      title="Motor de Matchmaking & Resultados"
      subtitle="IA Vetorial BGE-M3 (ZeroGPU) • 12.531 Pesquisas e Projetos Acadêmicos Indexados (SBPMat, CBPol, ICSM)"
      actions={
        <div className="flex items-center gap-3">
          <Button
            onClick={() => executeMatching(searchQuery, topK)}
            disabled={loading}
            size="sm"
            className="bg-brand-green-dark text-brand-off-white hover:bg-brand-green-moss"
          >
            <Icon icon={RefreshCw} size={15} className={loading ? "animate-spin" : ""} />
            {loading ? "Calculando Matching..." : "Recalcular Matching"}
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Project Desire Selector Section */}
        <div className="rounded-3xl border border-brand-green-moss/20 bg-gradient-to-br from-brand-green-dark via-[#0a3832] to-[#04201c] p-6 md:p-8 text-brand-off-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300 mb-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    {isResearcher
                      ? "Matching de Projetos com o Acervo Científico Nacional"
                      : "Matching de Demandas Corporativas com o Acervo Científico Nacional"}
                  </span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-brand-off-white">
                  {isResearcher ? "Seu Projeto Científico" : "Seu Desejo de Projeto Corporativo"}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="inverse"
                  onClick={() =>
                    navigate(isResearcher ? "/dashboard/projetos/novo" : "/dashboard/demandas/nova")
                  }
                  className="bg-surface-white/10 hover:bg-surface-white/20 text-brand-off-white border border-brand-off-white/20"
                >
                  <Icon icon={Plus} size={14} />
                  {isResearcher ? "Cadastrar Novo Projeto" : "Submeter Novo Desejo"}
                </Button>
              </div>
            </div>

            {/* Dropdown to pick submission */}
            {(isResearcher ? projects.length > 0 : opportunities.length > 0) ? (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <label className="font-heading text-xs font-bold uppercase tracking-wider text-brand-off-white/80 shrink-0">
                    {isResearcher ? "Selecione o Projeto:" : "Selecione a Demanda / Desafio:"}
                  </label>
                  <div className="relative flex-1">
                    <select
                      value={selectedSubmissionId}
                      onChange={(e) => handleSelectSubmission(e.target.value)}
                      className="w-full appearance-none rounded-2xl border border-brand-off-white/20 bg-surface-white/10 px-4 py-3 text-sm font-medium text-brand-off-white focus:border-emerald-400 focus:bg-surface-white/15 focus:outline-none"
                    >
                      {isResearcher
                        ? projects.map((p) => (
                            <option key={p.id} value={p.id} className="text-text-primary bg-surface-white">
                              📁 {p.title} (TRL {p.trl} • Patente: {p.patentStatus})
                            </option>
                          ))
                        : opportunities.map((o) => (
                            <option key={o.id} value={o.id} className="text-text-primary bg-surface-white">
                              🏢 {o.title} {o.industrySector ? `• [${o.industrySector}]` : ""}
                            </option>
                          ))}
                      <option value="CUSTOM" className="text-text-primary bg-surface-white">
                        🔍 Digitação Livre / Consulta Customizada
                      </option>
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brand-off-white/70">
                      <Icon icon={ChevronDown} size={16} />
                    </div>
                  </div>
                </div>

                {/* Details preview of the selected opportunity */}
                {selectedOpportunity && selectedSubmissionId !== "CUSTOM" && (
                  <div className="rounded-2xl border border-brand-off-white/15 bg-surface-white/10 p-5 backdrop-blur-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-off-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <Icon icon={Building2} size={16} className="text-emerald-400" />
                        <h4 className="font-heading text-sm font-bold text-brand-off-white">
                          {selectedOpportunity.title}
                        </h4>
                      </div>
                      <Link
                        to={`/dashboard/demandas/editar/${selectedOpportunity.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 hover:text-emerald-200"
                      >
                        <Icon icon={Edit3} size={12} />
                        Editar no Formulário
                      </Link>
                    </div>

                    <p className="font-body text-xs text-brand-off-white/80 line-clamp-2 leading-relaxed">
                      {selectedOpportunity.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                      {selectedOpportunity.industrySector && (
                        <span className="rounded-md bg-surface-white/15 px-2.5 py-0.5 font-medium text-brand-off-white">
                          Setor: {selectedOpportunity.industrySector}
                        </span>
                      )}
                      <span className="rounded-md bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 font-mono font-semibold">
                        Mín. TRL {selectedOpportunity.minTrl}
                      </span>
                      <span className="rounded-md bg-blue-500/20 text-blue-300 px-2.5 py-0.5 font-mono font-semibold">
                        Alvo CRL {selectedOpportunity.desiredCrl}
                      </span>
                      <span className="rounded-md bg-amber-500/20 text-amber-300 px-2.5 py-0.5 font-medium">
                        Patente: {selectedOpportunity.patentRequirement}
                      </span>
                      {selectedOpportunity.desiredTechnology && (
                        <span className="rounded-md bg-surface-white/10 px-2.5 py-0.5 text-brand-off-white/90">
                          Tecnologia: {selectedOpportunity.desiredTechnology}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Details preview of the selected project */}
                {selectedProject && selectedSubmissionId !== "CUSTOM" && (
                  <div className="rounded-2xl border border-brand-off-white/15 bg-surface-white/10 p-5 backdrop-blur-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-off-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <Icon icon={GraduationCap} size={16} className="text-emerald-400" />
                        <h4 className="font-heading text-sm font-bold text-brand-off-white">
                          {selectedProject.title}
                        </h4>
                      </div>
                      <Link
                        to={`/dashboard/projetos/editar/${selectedProject.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 hover:text-emerald-200"
                      >
                        <Icon icon={Edit3} size={12} />
                        Editar no Formulário
                      </Link>
                    </div>

                    <p className="font-body text-xs text-brand-off-white/80 line-clamp-2 leading-relaxed">
                      {selectedProject.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                      <span className="rounded-md bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 font-mono font-semibold">
                        TRL {selectedProject.trl}
                      </span>
                      <span className="rounded-md bg-blue-500/20 text-blue-300 px-2.5 py-0.5 font-mono font-semibold">
                        CRL {selectedProject.crl}
                      </span>
                      <span className="rounded-md bg-amber-500/20 text-amber-300 px-2.5 py-0.5 font-medium">
                        Patente: {selectedProject.patentStatus}
                      </span>
                    </div>
                  </div>
                )}

                {/* Query fine-tuning toggle */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingQuery(!isEditingQuery)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-emerald-300 hover:text-emerald-200 transition-colors"
                  >
                    <Icon icon={Edit3} size={13} />
                    <span>
                      {isEditingQuery
                        ? "Recolher editor de texto do matching"
                        : "Refinar ou personalizar texto da busca vetorial"}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              /* Empty state if user has not submitted anything yet */
              <div className="rounded-2xl border border-brand-off-white/20 bg-surface-white/10 p-6 text-center space-y-4">
                <p className="font-body text-sm text-brand-off-white/90 max-w-lg mx-auto">
                  Você ainda não cadastrou nenhuma {isResearcher ? "pesquisa" : "demanda corporativa"}. Utilize nosso
                  formulário para cadastrar seus parâmetros ou utilize o campo abaixo para testar o matching em tempo real.
                </p>
                <Button
                  size="md"
                  onClick={() =>
                    navigate(isResearcher ? "/dashboard/projetos/novo" : "/dashboard/demandas/nova")
                  }
                  className="bg-emerald-500 hover:bg-emerald-600 text-brand-green-dark font-bold"
                >
                  <Icon icon={Plus} size={16} />
                  {isResearcher ? "Cadastrar Meu Primeiro Projeto" : "Cadastrar Meu Desejo de Projeto"}
                </Button>
              </div>
            )}

            {/* Editable query textarea (visible if custom query or editing) */}
            {(isEditingQuery || selectedSubmissionId === "CUSTOM" || (!opportunities.length && !projects.length)) && (
              <div className="space-y-3 pt-2 border-t border-brand-off-white/10">
                <label className="block font-heading text-xs font-bold uppercase tracking-wider text-brand-off-white/90">
                  Texto Vetorizado para o Matching (bge-m3):
                </label>
                <textarea
                  rows={3}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Descreva o desafio tecnológico, materiais desejados, propriedades e aplicações de interesse..."
                  className="w-full rounded-2xl border border-brand-off-white/20 bg-surface-white/10 p-4 font-body text-sm text-brand-off-white placeholder:text-brand-off-white/40 focus:border-emerald-400 focus:bg-surface-white/15 focus:outline-none"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => executeMatching(searchQuery, topK)}
                    disabled={loading}
                    className="bg-emerald-500 hover:bg-emerald-400 text-brand-green-dark font-bold"
                  >
                    <Icon icon={Sparkles} size={15} />
                    {loading ? "Processando..." : "Executar Matching com este Texto"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Metric Cards Banner */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-border-subtle bg-surface-white p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="font-heading text-xs font-semibold uppercase text-text-secondary">
                Matches Encontrados
              </p>
              <p className="mt-1 font-display text-3xl font-bold text-text-primary">
                {articles.length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green-moss/10 text-brand-green-moss">
              <Icon icon={Sparkles} size={24} />
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="font-heading text-xs font-semibold uppercase text-emerald-800">
                Alta Relevância (≥ 80%)
              </p>
              <p className="mt-1 font-display text-3xl font-bold text-emerald-950">
                {highCount}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Icon icon={CheckCircle2} size={24} />
            </div>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="font-heading text-xs font-semibold uppercase text-blue-800">
                Média Relevância (50-79%)
              </p>
              <p className="mt-1 font-display text-3xl font-bold text-blue-950">
                {mediumCount}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Icon icon={BarChart3} size={24} />
            </div>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-surface-white p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="font-heading text-xs font-semibold uppercase text-text-secondary">
                Maior Afinidade
              </p>
              <p className="mt-1 font-display text-3xl font-bold text-text-primary">
                {articles.length > 0 ? `${maxAffinity}%` : "--"}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Icon icon={Award} size={24} />
            </div>
          </div>
        </div>

        {/* Filter Controls Row */}
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
              className={[
                "px-3 py-1.5 rounded-xl font-heading text-xs font-semibold transition-all",
                filterAffinity === "ALL"
                  ? "bg-brand-green-dark text-brand-off-white shadow-xs"
                  : "bg-surface-primary text-text-secondary hover:bg-surface-secondary",
              ].join(" ")}
            >
              Todos ({articles.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterAffinity("HIGH")}
              className={[
                "px-3 py-1.5 rounded-xl font-heading text-xs font-semibold transition-all",
                filterAffinity === "HIGH"
                  ? "bg-emerald-600 text-brand-off-white shadow-xs"
                  : "bg-surface-primary text-text-secondary hover:bg-surface-secondary",
              ].join(" ")}
            >
              Alta Afinidade ≥ 80% ({highCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterAffinity("MEDIUM")}
              className={[
                "px-3 py-1.5 rounded-xl font-heading text-xs font-semibold transition-all",
                filterAffinity === "MEDIUM"
                  ? "bg-blue-600 text-brand-off-white shadow-xs"
                  : "bg-surface-primary text-text-secondary hover:bg-surface-secondary",
              ].join(" ")}
            >
              Média Afinidade 50-79% ({mediumCount})
            </button>
          </div>

          {/* Top K Control */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-text-secondary">Quantidade de Matches:</span>
            <div className="flex gap-1.5">
              {[4, 6, 10, 15].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    setTopK(k);
                    executeMatching(searchQuery, k);
                  }}
                  className={[
                    "h-8 w-8 rounded-lg text-xs font-mono font-bold transition-all",
                    topK === k
                      ? "bg-brand-green-dark text-brand-off-white"
                      : "bg-surface-primary text-text-secondary hover:bg-surface-secondary",
                  ].join(" ")}
                >
                  {k}
                </button>
              ))}
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

        {/* AI Diagnosis Summary */}
        {aiDiagnosis && (
          <div className="rounded-2xl border border-emerald-300/60 bg-emerald-50/70 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold font-heading text-emerald-900 uppercase tracking-wide">
                <Icon icon={Sparkles} size={15} className="text-emerald-700" />
                <span>Diagnóstico de Relevância por Inteligência Artificial</span>
              </div>
              <p className="font-body text-xs md:text-sm text-emerald-950 leading-relaxed">
                {aiDiagnosis}
              </p>
            </div>
            {executionTimeMs !== null && (
              <div className="shrink-0 rounded-xl bg-surface-white border border-emerald-200 px-3.5 py-2 text-right">
                <p className="font-mono text-[10px] text-text-muted uppercase">Tempo de IA</p>
                <p className="font-mono text-sm font-bold text-emerald-800">
                  {executionTimeMs} ms
                </p>
              </div>
            )}
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
                        <span className="rounded-full bg-brand-green-dark text-brand-off-white px-2.5 py-0.5 text-xs font-mono font-bold">
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

                  {/* Abstract Section */}
                  {art.resumo && (
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
                        {art.resumo}
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
                      {art.email && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCopyEmail(art.email, art.id)}
                        >
                          <Icon icon={copiedEmailId === art.id ? Check : Copy} size={13} />
                          {copiedEmailId === art.id ? "E-mail Copiado!" : "Copiar E-mail"}
                        </Button>
                      )}

                      {art.email ? (
                        <a
                          href={`mailto:${art.email}?subject=${encodeURIComponent(
                            `Interesse em Parceria via The Bridge: ${art.titulo}`
                          )}&body=${encodeURIComponent(
                            `Olá,\n\nLocalizamos sua pesquisa intitulada "${art.titulo}" apresentada no ${art.evento} através da plataforma The Bridge.\n\nGostaríamos de conversar sobre possibilidades de cooperação tecnológica e projetos conjuntos de P&D para atender ao nosso desafio corporativo.\n\nAtenciosamente,\n${user?.name || "Representante Corporativo"}`
                          )}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-green-dark px-4 py-2 font-heading text-xs font-semibold text-brand-off-white hover:bg-brand-green-moss transition-all shadow-xs"
                        >
                          <Icon icon={Mail} size={14} />
                          Iniciar Contato Direto
                        </a>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-brand-green-dark text-brand-off-white"
                          onClick={() => alert("Solicitação de contato enviada à equipe The Bridge para mediação.")}
                        >
                          <Icon icon={MessageSquare} size={14} />
                          Solicitar Conexão
                        </Button>
                      )}
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
              Tente selecionar outro filtro de relevância ou refinar a descrição da sua demanda.
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
              Selecione sua demanda corporativa ou digite seu desafio tecnológico para calcular o grau de sinergia com os mais de 12.500 projetos científicos do acervo.
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
              Decomposição formal do score de similaridade entre seu desejo de projeto e a pesquisa científica.
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
                  Metadados do Projeto Científico Pareado:
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
                  {selectedArticleForAudit.email && (
                    <p>
                      <strong>E-mail:</strong> {selectedArticleForAudit.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Technical Interpretation */}
              <div className="rounded-2xl border border-border-subtle bg-surface-secondary/40 p-4 text-xs text-text-secondary leading-relaxed space-y-1">
                <p className="font-heading font-semibold text-text-primary">Interpretação Semântica:</p>
                <p>
                  O modelo vetorial de 1024 dimensões identifica correlação conceitual entre a demanda tecnológica e os
                  materiais, métodos e resultados descritos no trabalho acadêmico. Scores próximos de 0.75+ representam
                  aderência quase perfeita no domínio industrial.
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
    </DashboardLayout>
  );
}
