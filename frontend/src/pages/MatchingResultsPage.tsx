import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Award,
  BrainCircuit,
  Building2,
  Clock,
  DollarSign,
  FileText,
  Filter,
  Info,
  Lock,
  MessageSquare,
  RefreshCw,
  Scale,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { scientificMatchingService, cleanScientificAbstract, type ScientificArticle } from "../services/scientificMatching";
import { savedMatchesService } from "../services/savedMatches";
import { authService } from "../services/auth";
import { opportunitiesService, type Opportunity } from "../services/opportunities";
import { projectsService, type TechnicalDossier } from "../services/projects";
import {
  connectionsService,
  FIXED_CENSOR_AUTHORS,
  FIXED_CENSOR_AFFILIATION,
} from "../services/connections";

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

/**
 * Separa autores e vínculos institucionais a partir do separador ponto e vírgula (;)
 * para envio interno à Central de Admin (mantendo censura visual para a empresa).
 */
function splitAuthorsAndAffiliations(rawAutores?: string): { authors: string; affiliations: string | null } {
  if (!rawAutores) return { authors: "Não informado", affiliations: null };
  const parts = rawAutores.split(";").map((p) => p.trim()).filter(Boolean);
  if (parts.length > 1) {
    return {
      authors: parts[0],
      affiliations: parts.slice(1).join("; "),
    };
  }
  return {
    authors: rawAutores.trim(),
    affiliations: null,
  };
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
  const [selectedArticleForAudit, setSelectedArticleForAudit] = useState<ScientificArticle | null>(null);
  const [selectedArticleForDossier, setSelectedArticleForDossier] = useState<ScientificArticle | null>(null);
  const [selectedArticleForConnection, setSelectedArticleForConnection] = useState<ScientificArticle | null>(null);
  const [connectionMessage, setConnectionMessage] = useState<string>("");
  const [companySectorInput, setCompanySectorInput] = useState<string>("");
  const [investmentAmountInput, setInvestmentAmountInput] = useState<string>("");
  const [executionTimelineInput, setExecutionTimelineInput] = useState<string>("");
  const [connectionSentSuccess, setConnectionSentSuccess] = useState<boolean>(false);

  const getResolvedDossier = (article: ScientificArticle): TechnicalDossier => {
    const allProjects = projectsService.getStoredProjects();
    const proj = allProjects.find(
      (p) =>
        p.id === article.id ||
        p.title.toLowerCase().trim() === article.titulo.toLowerCase().trim()
    );
    if (proj?.dossier) {
      return proj.dossier;
    }
    return {
      industryProblem: `Gargalos industriais de desempenho e rendimento na área de ${article.area}. A tecnologia visa superar limitações de estabilidade e custos em relação aos insumos convencionais de mercado.`,
      competitiveAdvantage: `Demonstrou ganhos superiores aos benchmarks de bancada relatados nos anais da publicação técnica (${article.evento}). Eficiência e viabilidade analítica comprovadas experimentalmente.`,
      partnershipGoals: [
        "Licenciamento de Tecnologia / Patente",
        "Co-desenvolvimento & P&D Conjunto",
        "Prova de Conceito / Piloto Industrial",
      ],
      operatingConditions: `Protocolo experimental validado em ambiente laboratorial conforme documentação apresentada em ${article.evento} (${article.ano}).`,
      scalabilityGaps: "Necessidade de ensaios em escala piloto integrada (TRL 5-6) e adequação com a linha produtiva do parceiro industrial.",
      estimatedBudget: "R$ 180.000 a R$ 450.000 (Fase Piloto / PoC)",
      estimatedTimelineMonths: "8 a 14 meses",
      ownershipType: "UNIVERSIDADE",
      patentClaimsSummary: `Proteção de formulação e método inventivo correspondente ao simpósio ${article.sessao}. Titularidade blindada sob custódia de ICT parceira.`,
      priorFunding: "Fomento público institucional de pesquisa (Capes / CNPq / FAPESP)",
      hasExclusiveCommitment: false,
      evidenceLinks: `Trabalho indexado com código ${article.codigo || "TB-REF"} no acervo ${article.evento}`,
    };
  };

  // Cached / Saved Matches State
  const [lastCalculatedAt, setLastCalculatedAt] = useState<string | null>(null);
  const [recalculating, setRecalculating] = useState(false);

  // Always fetch at most 10 matches
  const topK = 10;

  const loadOpportunityMatches = async (opp: Opportunity, forceRecalculate = false) => {
    const q = buildQueryFromOpportunity(opp);
    setSearchQuery(q);

    // Se não for recalculo forçado, busca no cache local salvo primeiro
    if (!forceRecalculate) {
      const cached = savedMatchesService.get(opp.id);
      if (cached && cached.articles && cached.articles.length > 0) {
        setArticles(cached.articles);
        setLastCalculatedAt(cached.calculatedAt);
        setHasSearched(true);
        setError(null);
        return;
      }
    }

    // Se não há cache ou se o usuário solicitou recalcular, dispara o motor de IA
    await executeMatching(q, opp, forceRecalculate);
  };

  const executeMatching = async (
    queryText: string,
    targetOpp?: Opportunity | null,
    isRecalculate = false
  ) => {
    const trimmed = (queryText || "").trim();
    if (!trimmed) {
      setError("Nenhum parâmetro de busca encontrado para o desejo corporativo.");
      return;
    }
    setError(null);
    setLoading(true);
    if (isRecalculate) setRecalculating(true);
    setHasSearched(true);

    try {
      const res = await scientificMatchingService.search(trimmed, topK);
      const returnedArticles = res.artigos || [];
      setArticles(returnedArticles);
      const nowIso = new Date().toISOString();
      setLastCalculatedAt(nowIso);

      // Salva imediatamente os matches calculados para esta oportunidade
      const oppToSave = targetOpp || selectedOpportunity;
      if (oppToSave) {
        savedMatchesService.save({
          opportunityId: oppToSave.id,
          opportunityTitle: oppToSave.title,
          queryText: trimmed,
          articles: returnedArticles,
          totalBase: res.estatisticas?.total_base,
        });
      } else {
        savedMatchesService.save({
          opportunityTitle: "Busca Direta",
          queryText: trimmed,
          articles: returnedArticles,
          totalBase: res.estatisticas?.total_base,
        });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro ao executar matching com o motor de IA.");
      }
    } finally {
      setLoading(false);
      setRecalculating(false);
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
        loadOpportunityMatches(target, false);
      }
    });
  }, [isResearcher, user]);

  const handleSelectOpportunity = (id: string) => {
    setSelectedSubmissionId(id);
    const opp = opportunities.find((o) => o.id === id);
    if (opp) {
      setSelectedOpportunity(opp);
      setSearchParams({ opportunityId: opp.id });
      loadOpportunityMatches(opp, false);
    }
  };

  const handleOpenConnectionModal = (art: ScientificArticle) => {
    setSelectedArticleForConnection(art);
    setCompanySectorInput(
      selectedOpportunity?.industrySector ||
        user?.industrySector ||
        "Indústria Química, Materiais & Manufatura"
    );
    const defaultBudget =
      selectedOpportunity?.budgetMin && selectedOpportunity?.budgetMax
        ? `R$ ${selectedOpportunity.budgetMin.toLocaleString("pt-BR")} a R$ ${selectedOpportunity.budgetMax.toLocaleString("pt-BR")}`
        : "R$ 200.000,00 a R$ 500.000,00";
    setInvestmentAmountInput(defaultBudget);
    setExecutionTimelineInput(selectedOpportunity?.timeline || "12 a 18 meses");
    setConnectionMessage(
      `Olá! Analisamos o projeto "${art.titulo}" através da plataforma The Bridge e identificamos alto grau de convergência técnica com a nossa demanda corporativa de P&D. Gostaríamos de solicitar uma conexão formal para avaliar a viabilidade técnica e possíveis modelos de cooperação.`
    );
    setConnectionSentSuccess(false);
  };

  const handleSendConnection = () => {
    if (!selectedArticleForConnection) return;
    const parsedAuthors = splitAuthorsAndAffiliations(selectedArticleForConnection.autores);
    connectionsService.requestConnection({
      articleTitle: selectedArticleForConnection.titulo,
      articleAbstract: getCleanAbstract(selectedArticleForConnection.resumo),
      articleArea: selectedArticleForConnection.area,
      articleEvent: selectedArticleForConnection.evento,
      articleCode: selectedArticleForConnection.codigo,
      matchScore: selectedArticleForConnection.relevancia_pct,
      cosineScore: selectedArticleForConnection.score_cosseno,
      message: connectionMessage,
      companyName: user?.companyName || user?.name || "Empresa Parceira Registrada",
      companyCnpj: user?.cnpj || "Não informado",
      companyVerificationStatus: user?.verificationStatus || "EM_ANALISE",
      companyWebsite: user?.website,
      companyLinkedin: user?.linkedin,
      companyRoleTitle: user?.roleTitle || "Representante de P&D",
      companyEmail: user?.email,
      companyPhone: user?.phone,
      companyContactName: user?.name,
      companySector: companySectorInput.trim() || "Indústria de Transformação & Materiais",
      investmentAmount: investmentAmountInput.trim() || "A definir conforme escopo técnico",
      executionTimeline: executionTimelineInput.trim() || "12 meses",
      researcherName: parsedAuthors.authors,
      researcherAffiliation: parsedAuthors.affiliations || "Instituição Científica e Tecnológica (ICT)",
      researcherEmail: selectedArticleForConnection.email || selectedArticleForConnection.emails?.[0],
      opportunityTitle: selectedOpportunity?.title || "Demanda Tecnológica Corporativa",
      opportunityDescription: selectedOpportunity?.description || searchQuery,
      opportunityKeywords: selectedOpportunity?.keywords,
      opportunityMinTrl: selectedOpportunity?.minTrl ? `TRL ${selectedOpportunity.minTrl}` : "TRL 3 a 6",
      opportunityDesiredCrl: selectedOpportunity?.desiredCrl ? `CRL ${selectedOpportunity.desiredCrl}` : "CRL 3+",
      opportunityPatentReq:
        selectedOpportunity?.patentRequirement === "REQUIRED"
          ? "Exige Patente / Pedido Depositado"
          : selectedOpportunity?.patentRequirement === "NOT_REQUIRED"
          ? "Sem exigência prévia de patente"
          : "Desejável (Co-titularidade ou Licenciamento)",
    });
    setConnectionSentSuccess(true);
    setTimeout(() => {
      setSelectedArticleForConnection(null);
      setConnectionSentSuccess(false);
    }, 1500);
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
            onClick={() => {
              if (selectedOpportunity) {
                loadOpportunityMatches(selectedOpportunity, true);
              } else {
                executeMatching(searchQuery, null, true);
              }
            }}
            disabled={loading || recalculating}
            size="sm"
            className="bg-brand-green-dark !text-white hover:bg-brand-green-moss cursor-pointer font-bold shadow-xs"
          >
            <Icon icon={RefreshCw} size={15} className={loading || recalculating ? "animate-spin" : ""} />
            {loading || recalculating ? "Recalculando..." : "Recalcular Matches"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Seletor da Demanda acima da caixa */}
        {opportunities.length > 0 && (
          <div className="rounded-2xl border border-border-subtle bg-surface-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="font-heading text-xs font-bold uppercase tracking-wider text-text-secondary shrink-0">
              Demanda em Análise:
            </label>
            <select
              value={selectedSubmissionId}
              onChange={(e) => handleSelectOpportunity(e.target.value)}
              className="flex-1 min-w-0 rounded-xl border border-border-subtle bg-surface-primary px-3.5 py-2.5 font-body text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green-moss/20 cursor-pointer truncate"
            >
              {opportunities.map((opp) => (
                <option key={opp.id} value={opp.id} className="text-text-primary bg-surface-white">
                  {opp.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Project Desire Clean Card */}
        <div className="rounded-3xl border border-brand-green-moss/20 bg-gradient-to-br from-brand-green-dark via-[#0a3832] to-[#04201c] p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white">
                Seu Desejo de Projeto
              </h2>
              {lastCalculatedAt && (
                <span className="rounded-xl bg-white/10 border border-white/15 px-3 py-1 font-mono text-[13px] text-white/90 w-fit">
                  Calculado em {new Date(lastCalculatedAt).toLocaleDateString("pt-BR")} às{" "}
                  {new Date(lastCalculatedAt).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>

            {selectedOpportunity ? (
              <div className="space-y-3 pt-1">
                <h3 className="font-heading text-lg font-bold text-emerald-300 break-words whitespace-normal leading-snug">
                  {selectedOpportunity.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[13px]">
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
                    Patente:{" "}
                    {selectedOpportunity.patentRequirement === "REQUIRED"
                      ? "Obrigatória"
                      : selectedOpportunity.patentRequirement === "NOT_REQUIRED"
                      ? "Dispensável"
                      : "Aceita em Depósito"}
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
              Calculando Matching...
            </h4>
            <p className="mt-1 font-body text-xs text-text-secondary max-w-md mx-auto">
              Analisando sua demanda e calibrando a relevância percentual pela fórmula matemática.
            </p>
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="space-y-6">
            {filteredArticles.map((art, idx) => {
              const isHigh = art.relevancia_pct >= 80;
              const isMed = art.relevancia_pct >= 50 && art.relevancia_pct < 80;
              const cleanAbstract = getCleanAbstract(art.resumo);

              return (
                <div
                  key={art.id || idx}
                  className={[
                    "rounded-3xl border bg-surface-white p-6 md:p-8 transition-all hover:shadow-lg",
                    isHigh ? "border-emerald-300 ring-1 ring-emerald-100" : "border-border-subtle",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-border-subtle">
                    <div className="space-y-2 flex-1 min-w-0">
                      <span className="rounded-full bg-brand-green-dark !text-white px-2.5 py-0.5 text-xs font-mono font-bold inline-block w-fit">
                        #{idx + 1}
                      </span>
                      <h3 className="font-heading text-lg md:text-xl font-bold text-text-primary leading-snug break-words">
                        {art.titulo}
                      </h3>
                    </div>

                    <div className="shrink-0 pt-0.5 text-right">
                      <span
                        className={[
                          "font-display text-xl md:text-2xl font-bold",
                          isHigh
                            ? "text-emerald-900"
                            : isMed
                            ? "text-blue-900"
                            : "text-amber-900",
                        ].join(" ")}
                        title={`Score Cosseno: ${art.score_cosseno.toFixed(4)} | Fórmula: ((score - 0.35) / 0.40) × 100`}
                      >
                        {art.relevancia_pct}%
                      </span>
                    </div>
                  </div>

                  {/* Authors and Affiliations (Censurados com asteriscos de quantidade fixa) */}
                  <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[13px] font-heading font-bold uppercase text-text-secondary">
                        Autores:
                      </span>
                      <p
                        className="mt-0.5 font-mono text-xs md:text-sm text-text-secondary font-semibold tracking-widest select-none"
                        title="Identidade preservada até a aprovação da conexão e assinatura do Termo de Responsabilidade"
                      >
                        {FIXED_CENSOR_AUTHORS}
                      </p>
                    </div>

                    <div>
                      <span className="text-[13px] font-heading font-bold uppercase text-text-secondary">
                        Vínculos de Pesquisa:
                      </span>
                      <p
                        className="mt-0.5 font-mono text-xs md:text-sm text-text-secondary font-semibold tracking-widest select-none"
                        title="Vínculo preservado até a aprovação da conexão e assinatura do Termo de Responsabilidade"
                      >
                        {FIXED_CENSOR_AFFILIATION}
                      </p>
                    </div>
                  </div>

                  {/* Abstract Section - Full text without ellipsis truncation */}
                  {cleanAbstract && (
                    <div className="pt-2 pb-4">
                      <div className="flex items-center justify-between pb-1.5">
                        <span className="text-[13px] font-heading font-bold uppercase text-text-secondary">
                          Resumo da Pesquisa:
                        </span>
                      </div>
                      <p className="font-body text-xs md:text-sm text-text-secondary leading-relaxed bg-surface-primary/60 p-4 rounded-2xl border border-border-subtle whitespace-pre-line">
                        {cleanAbstract}
                      </p>
                    </div>
                  )}

                  {/* Card Actions Footer */}
                  <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedArticleForAudit(art)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-primary px-3 py-1.5 font-heading text-xs font-semibold text-text-secondary hover:text-brand-green-dark hover:border-brand-green-moss transition-all"
                      >
                        <Icon icon={Info} size={13} />
                        Auditar Cálculo
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedArticleForDossier(art)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50/70 text-emerald-950 px-3 py-1.5 font-heading text-xs font-semibold hover:bg-emerald-100 hover:border-emerald-400 transition-all shadow-xs cursor-pointer"
                      >
                        <Icon icon={ShieldCheck} size={14} className="text-emerald-700" />
                        Ver Dossiê Blindado
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
              Explicabilidade do Matchmaking
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
                <p className="font-bold text-emerald-950 uppercase tracking-wider text-[13px]">
                  Fórmula de Calibração Aplicada:
                </p>
                <div className="p-3 bg-surface-white rounded-xl border border-emerald-200 text-center font-bold text-emerald-900 text-sm shadow-xs">
                  Relevância (%) = ((score - 0.35) / (0.75 - 0.35)) × 100
                </div>

                <div className="space-y-1.5 pt-2 text-emerald-950">
                  <div className="flex justify-between py-1 border-b border-emerald-200/60">
                    <span>Score Bruto de Cosseno:</span>
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

              {/* Technical Interpretation */}
              <div className="rounded-2xl border border-border-subtle bg-surface-secondary/40 p-4 text-xs text-text-secondary leading-relaxed space-y-1">
                <p className="font-heading font-semibold text-text-primary">Interpretação Semântica:</p>
                <p>
                  A análise semântica identifica correlação conceitual entre a demanda corporativa e os
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

      {/* Modal Dossiê Técnico Blindado (Teaser para Indústria) */}
      {selectedArticleForDossier && (() => {
        const dossier = getResolvedDossier(selectedArticleForDossier);
        const ownershipLabels: Record<string, string> = {
          UNIVERSIDADE: "Universidade Pública / ICT Estadual ou Federal (Tier 1)",
          NIT: "Núcleo de Inovação Tecnológica (NIT) Institucional",
          INDEPENDENTE: "Pesquisador Independente / Titularidade Própria",
          LABORATORIO_PRIVADO: "Instituto de Pesquisa / Laboratório Privado de Excelência",
          EMPRESA_SPINOFF: "Empresa Spin-off / Deep Tech Constituída",
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl rounded-3xl bg-surface-white p-6 md:p-8 shadow-2xl border border-border-subtle space-y-6 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
              {/* Close button */}
              <button
                type="button"
                onClick={() => setSelectedArticleForDossier(null)}
                className="absolute right-6 top-6 inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-secondary text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                <Icon icon={X} size={18} />
              </button>

              {/* Header */}
              <div className="pr-8">
                <div className="flex items-center gap-2 font-heading text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  <Icon icon={ShieldCheck} size={18} className="text-emerald-700" />
                  Dossiê Técnico Blindado • Non-Confidential Technology Teaser
                </div>
                <h3 className="mt-1 font-display text-2xl md:text-3xl font-bold text-text-primary">
                  {selectedArticleForDossier.titulo}
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-100 text-emerald-900 px-3 py-0.5 text-xs font-mono font-bold">
                    Relevância: {selectedArticleForDossier.relevancia_pct}%
                  </span>
                  <span className="rounded-full bg-surface-primary text-text-secondary px-3 py-0.5 text-xs font-medium border border-border-subtle">
                    Área: {selectedArticleForDossier.area}
                  </span>
                  <span className="rounded-full bg-surface-primary text-text-secondary px-3 py-0.5 text-xs font-medium border border-border-subtle">
                    Código: {selectedArticleForDossier.codigo || "TB-PROJ"}
                  </span>
                </div>
              </div>

              {/* Protocolo de Blindagem Banner */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4.5 text-xs text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <Icon icon={Lock} size={20} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-heading font-bold text-emerald-950 text-sm">
                      Protocolo de Blindagem & Mediação The Bridge
                    </p>
                    <p className="text-emerald-900 leading-relaxed font-body">
                      Identidades dos inventores, nomes específicos da instituição e número do processo INPI são estritamente preservados para proteger o ativo contra desintermediação.
                      <span className="font-semibold"> Estes dados técnicos são qualitativos e não alteram a nota calculada pelo motor de matching.</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Blocos de Conteúdo */}
              <div className="space-y-6">
                {/* Bloco: Pitch Executivo & Proposta de Valor */}
                <div className="rounded-2xl border border-border-subtle bg-surface-primary/40 p-5 space-y-4">
                  <h4 className="font-heading text-xs font-bold text-text-primary uppercase tracking-wide flex items-center gap-2">
                    <Icon icon={FileText} size={15} className="text-brand-green-moss" />
                    Pitch Executivo e Dores de Mercado
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-surface-white rounded-xl p-4 border border-border-subtle space-y-1.5 shadow-xs">
                      <span className="text-[11px] font-heading font-bold uppercase text-brand-green-moss tracking-wider">
                        Dor da Indústria Resolvida
                      </span>
                      <p className="text-xs md:text-sm text-text-primary font-body leading-relaxed">
                        {dossier.industryProblem || "Problema industrial mapeado e mitigado por meio da formulação/método desenvolvido."}
                      </p>
                    </div>

                    <div className="bg-surface-white rounded-xl p-4 border border-border-subtle space-y-1.5 shadow-xs">
                      <span className="text-[11px] font-heading font-bold uppercase text-emerald-700 tracking-wider">
                        Diferencial Competitivo & Benchmarks Quantitativos
                      </span>
                      <p className="text-xs md:text-sm text-text-primary font-body leading-relaxed">
                        {dossier.competitiveAdvantage || "Ganhos expressivos em relação aos parâmetros de referência do mercado convencional."}
                      </p>
                    </div>
                  </div>

                  {dossier.partnershipGoals && dossier.partnershipGoals.length > 0 && (
                    <div className="pt-1">
                      <span className="block text-[11px] font-heading font-bold uppercase text-text-secondary tracking-wider mb-2">
                        Modalidades de Parceria Almejadas pelo Pesquisador:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {dossier.partnershipGoals.map((goal, gIdx) => (
                          <span
                            key={gIdx}
                            className="rounded-lg bg-brand-green-dark text-white px-2.5 py-1 text-xs font-heading font-semibold shadow-xs"
                          >
                            {goal}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bloco: Escala & Viabilidade Laboratorial */}
                <div className="rounded-2xl border border-border-subtle bg-surface-primary/40 p-5 space-y-4">
                  <h4 className="font-heading text-xs font-bold text-text-primary uppercase tracking-wide flex items-center gap-2">
                    <Icon icon={Building2} size={15} className="text-brand-green-moss" />
                    Validação Experimental e Viabilidade de Escala
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-surface-white rounded-xl p-4 border border-border-subtle space-y-1.5 shadow-xs">
                      <span className="text-[11px] font-heading font-bold uppercase text-text-secondary tracking-wider">
                        Condições Operacionais & Escala de Bancada Comprovada
                      </span>
                      <p className="text-xs text-text-primary font-body leading-relaxed">
                        {dossier.operatingConditions || "Condições reprodutíveis em ambiente laboratorial controlado com caracterização analítica completa."}
                      </p>
                    </div>

                    <div className="bg-surface-white rounded-xl p-4 border border-border-subtle space-y-1.5 shadow-xs">
                      <span className="text-[11px] font-heading font-bold uppercase text-amber-700 tracking-wider">
                        Gaps Conhecidos para Escala Piloto / Industrial
                      </span>
                      <p className="text-xs text-text-primary font-body leading-relaxed">
                        {dossier.scalabilityGaps || "Adaptação de processos de bancada para ambiente operacional simulado e dimensionamento de reatores piloto."}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-surface-white rounded-xl p-3.5 border border-border-subtle shadow-xs">
                      <div className="flex items-center gap-1.5 text-text-secondary mb-1">
                        <Icon icon={DollarSign} size={14} className="text-emerald-700" />
                        <span className="text-[11px] font-heading font-bold uppercase tracking-wider">
                          Orçamento Estimado (PoC)
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-text-primary">
                        {dossier.estimatedBudget || "Sob consulta preliminar"}
                      </p>
                    </div>

                    <div className="bg-surface-white rounded-xl p-3.5 border border-border-subtle shadow-xs">
                      <div className="flex items-center gap-1.5 text-text-secondary mb-1">
                        <Icon icon={Clock} size={14} className="text-blue-700" />
                        <span className="text-[11px] font-heading font-bold uppercase tracking-wider">
                          Prazo Estimado até Piloto
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-text-primary">
                        {dossier.estimatedTimelineMonths || "6 a 12 meses"}
                      </p>
                    </div>

                    <div className="bg-surface-white rounded-xl p-3.5 border border-border-subtle shadow-xs">
                      <div className="flex items-center gap-1.5 text-text-secondary mb-1">
                        <Icon icon={Award} size={14} className="text-amber-600" />
                        <span className="text-[11px] font-heading font-bold uppercase tracking-wider">
                          Fomento Público Prévio
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-text-primary">
                        {dossier.priorFunding || "Apoio Institucional P&D"}
                      </p>
                    </div>
                  </div>

                  {dossier.documents && dossier.documents.length > 0 ? (
                    <div className="bg-surface-white rounded-xl p-3.5 border border-border-subtle text-xs text-text-secondary shadow-xs space-y-2">
                      <span className="font-heading font-bold text-text-primary uppercase text-[11px] block">
                        Artigos e Documentos Vinculados:
                      </span>
                      <div className="space-y-1.5">
                        {dossier.documents.map((doc, dIdx) => (
                          <div key={dIdx} className="p-2 rounded-lg bg-surface-primary border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className="font-heading font-semibold text-text-primary text-xs">
                              {doc.title} {doc.type ? `(${doc.type})` : ""}
                            </span>
                            {doc.linkOrDoi && (
                              <span className="font-mono text-[11px] text-brand-green-dark">
                                {doc.linkOrDoi}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : dossier.evidenceLinks ? (
                    <div className="bg-surface-white rounded-xl p-3.5 border border-border-subtle text-xs text-text-secondary shadow-xs">
                      <span className="font-heading font-bold text-text-primary uppercase text-[11px] block mb-1">
                        Evidências Técnicas e Publicações Referenciadas:
                      </span>
                      <p className="font-mono text-[12px] text-text-primary">
                        {dossier.evidenceLinks}
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* Bloco: Propriedade Intelectual & Governança */}
                <div className="rounded-2xl border border-border-subtle bg-surface-primary/40 p-5 space-y-4">
                  <h4 className="font-heading text-xs font-bold text-text-primary uppercase tracking-wide flex items-center gap-2">
                    <Icon icon={Scale} size={15} className="text-brand-green-moss" />
                    Propriedade Intelectual e Governança
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-surface-white rounded-xl p-4 border border-border-subtle space-y-1.5 shadow-xs">
                      <span className="text-[11px] font-heading font-bold uppercase text-text-secondary tracking-wider">
                        Estrutura de Titularidade (Blindada)
                      </span>
                      <p className="text-xs font-semibold text-text-primary">
                        {ownershipLabels[dossier.ownershipType || "UNIVERSIDADE"] || dossier.ownershipType}
                      </p>
                      <p className="text-[11px] text-text-secondary">
                        Acesso ao NIT e inventores viabilizado via The Bridge após alinhamento de interesse.
                      </p>
                    </div>

                    <div className="bg-surface-white rounded-xl p-4 border border-border-subtle space-y-1.5 shadow-xs">
                      <span className="text-[11px] font-heading font-bold uppercase text-text-secondary tracking-wider">
                        Status de Exclusividade Prévia
                      </span>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className={[
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold",
                          dossier.hasExclusiveCommitment
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-emerald-100 text-emerald-900 border border-emerald-300",
                        ].join(" ")}>
                          {dossier.hasExclusiveCommitment ? "Possui Pré-Acordo" : "Sem Vínculos de Exclusividade"}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-secondary">
                        {dossier.hasExclusiveCommitment
                          ? "Há direitos de preferência em negociação prévia; licenciamento condicionado a consulta de NIT."
                          : "Tecnologia totalmente disponível para transferência ou co-desenvolvimento exclusivo com sua empresa."}
                      </p>
                    </div>
                  </div>

                  {dossier.patentClaimsSummary && (
                    <div className="bg-surface-white rounded-xl p-4 border border-border-subtle space-y-1.5 shadow-xs">
                      <span className="text-[11px] font-heading font-bold uppercase text-text-secondary tracking-wider">
                        Resumo Não-Confidencial das Reivindicações Técnicas Protegidas
                      </span>
                      <p className="text-xs text-text-primary font-body leading-relaxed">
                        {dossier.patentClaimsSummary}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border-subtle">
                <p className="text-xs text-text-secondary">
                  Deseja avançar na negociação? Solicite conexão para acessar a equipe e assinar o NDA mútuo.
                </p>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setSelectedArticleForDossier(null)}
                  >
                    Fechar Dossiê
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      const art = selectedArticleForDossier;
                      setSelectedArticleForDossier(null);
                      if (art) {
                        handleOpenConnectionModal(art);
                      }
                    }}
                    className="bg-brand-green-dark !text-white hover:bg-brand-green-moss shadow-xs"
                  >
                    <Icon icon={MessageSquare} size={15} />
                    Solicitar Conexão & Acesso Completo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Janela Retangular Deitada (Horizontal) de Solicitar Conexão */}
      {selectedArticleForConnection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl rounded-3xl bg-surface-white p-6 md:p-8 shadow-2xl border border-border-subtle space-y-5 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setSelectedArticleForConnection(null)}
              className="absolute right-6 top-6 inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-secondary text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              <Icon icon={X} size={18} />
            </button>

            {/* Header */}
            <div className="pr-8">
              <div className="flex items-center gap-2 font-heading text-xs font-bold text-brand-green-moss uppercase">
                <Icon icon={MessageSquare} size={16} />
                Intermediação Confidencial de Parceria • The Bridge
              </div>
              <h3 className="mt-1 font-display text-2xl font-bold text-text-primary">
                Solicitar Conexão
              </h3>
              <p className="mt-1 font-body text-xs text-text-secondary">
                Sua solicitação passará pela curadoria da nossa Central de Admin antes de notificar o pesquisador responsável.
              </p>
            </div>

            {/* Exibe APENAS o nome do projeto (sem evento, sem ano, sem autores, sem score) */}
            <div className="rounded-2xl border border-border-subtle bg-surface-primary/80 px-5 py-3.5">
              <span className="block font-heading font-bold text-[13px] uppercase tracking-wider text-brand-green-moss">
                Nome do Projeto
              </span>
              <p className="mt-1 font-heading text-sm md:text-base font-bold text-text-primary leading-snug">
                {selectedArticleForConnection.titulo}
              </p>
            </div>

            {/* Corpo Retangular Deitado em 2 Colunas Horizontais */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Coluna Esquerda: Parâmetros Anônimos que o Pesquisador Receberá */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4 rounded-2xl border border-border-subtle bg-surface-primary/40 p-4.5">
                <div className="space-y-3.5">
                  <div>
                    <h4 className="font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                      Parâmetros da Proposta Corporativa
                    </h4>
                    <p className="font-body text-[13px] text-text-secondary mt-0.5 leading-relaxed">
                      O nome da sua empresa será mantido em sigilo. O pesquisador verá apenas os dados abaixo para decidir sobre a conexão:
                    </p>
                  </div>

                  <div>
                    <label className="block font-heading text-[13px] font-semibold text-text-primary mb-1">
                      Área de Atuação da Empresa *
                    </label>
                    <input
                      type="text"
                      value={companySectorInput}
                      onChange={(e) => setCompanySectorInput(e.target.value)}
                      placeholder="Ex: Saneamento Básico, Química, Energia..."
                      className="w-full rounded-xl border border-border-subtle bg-surface-white px-3 py-2 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-heading text-[13px] font-semibold text-text-primary mb-1">
                      Capacidade de Investimento Estimada *
                    </label>
                    <input
                      type="text"
                      value={investmentAmountInput}
                      onChange={(e) => setInvestmentAmountInput(e.target.value)}
                      placeholder="Ex: R$ 200.000,00 a R$ 500.000,00"
                      className="w-full rounded-xl border border-border-subtle bg-surface-white px-3 py-2 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-heading text-[13px] font-semibold text-text-primary mb-1">
                      Tempo Desejável de Execução do Projeto *
                    </label>
                    <input
                      type="text"
                      value={executionTimelineInput}
                      onChange={(e) => setExecutionTimelineInput(e.target.value)}
                      placeholder="Ex: 12 a 18 meses"
                      className="w-full rounded-xl border border-border-subtle bg-surface-white px-3 py-2 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-[13px] text-emerald-950 font-body leading-relaxed flex items-start gap-2">
                  <Icon icon={Info} size={14} className="text-emerald-800 shrink-0 mt-0.5" />
                  <span>
                    As informações de contato de ambas as partes só serão liberadas após aceite mútuo e assinatura do <strong>Termo de Responsabilidade</strong>.
                  </span>
                </div>
              </div>

              {/* Coluna Direita: Caixa de Texto Ampla da Mensagem de Apresentação */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-2">
                <div className="flex-1 flex flex-col">
                  <label className="block font-heading text-xs font-bold text-text-primary mb-1.5">
                    Mensagem de Apresentação e Contexto Técnico (Editável):
                  </label>
                  <textarea
                    rows={9}
                    value={connectionMessage}
                    onChange={(e) => setConnectionMessage(e.target.value)}
                    placeholder="Descreva os objetivos da sua empresa com este projeto, o escopo esperado de P&D e como pretende aplicar a tecnologia..."
                    className="w-full flex-1 rounded-2xl border border-border-subtle bg-surface-primary p-4 text-xs md:text-sm text-text-primary focus:border-brand-green-moss focus:outline-none focus:bg-surface-white transition-all resize-none leading-relaxed"
                  />
                </div>
                <p className="text-[13px] font-body text-text-secondary">
                  Evite inserir dados de contato direto ou razão social no texto acima para preservar o protocolo de confidencialidade da curadoria.
                </p>
              </div>
            </div>

            {/* Feedback alert if sent */}
            {connectionSentSuccess && (
              <div className="rounded-xl border border-emerald-300 bg-emerald-100 p-3 text-xs font-heading font-bold text-emerald-950 text-center animate-in fade-in">
                ✓ Solicitação enviada para a Central de Admin! Acompanhe o andamento em &apos;Minhas Conexões&apos;.
              </div>
            )}

            {/* Actions: CANCELAR & ENVIAR */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border-subtle">
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
                Enviar Solicitação para Curadoria
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
