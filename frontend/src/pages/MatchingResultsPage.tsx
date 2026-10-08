import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  Layers,
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
import { matchingService, type MatchItem } from "../services/matching";
import { scientificMatchingService, type ScientificArticle } from "../services/scientificMatching";
import { authService } from "../services/auth";
import { projectsService } from "../services/projects";
import { opportunitiesService } from "../services/opportunities";

export function MatchingResultsPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterAffinity, setFilterAffinity] = useState<"ALL" | "HIGH" | "MEDIUM">("ALL");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>("ALL");
  const [userSubmissions, setUserSubmissions] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedMatchForAudit, setSelectedMatchForAudit] = useState<MatchItem | null>(null);
  const [contactSuccessMatchId, setContactSuccessMatchId] = useState<string | null>(null);
  const [user] = useState(authService.getStoredUser());

  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "internal" ? "INTERNAL" : "SCIENTIFIC";
  const [activeTab, setActiveTab] = useState<"SCIENTIFIC" | "INTERNAL">(initialTab);

  // Scientific Congress Matching State (12,531 embeddings via HF ZeroGPU)
  const initialQuery = searchParams.get("query") || "";
  const [scientificQuery, setScientificQuery] = useState(initialQuery);
  const [scientificTopK, setScientificTopK] = useState(6);
  const [scientificArticles, setScientificArticles] = useState<ScientificArticle[]>([]);
  const [scientificLoading, setScientificLoading] = useState(false);
  const [scientificResponseText, setScientificResponseText] = useState("");
  const [scientificExecutionMs, setScientificExecutionMs] = useState<number | null>(null);
  const [scientificError, setScientificError] = useState<string | null>(null);
  const [hasSearchedScientific, setHasSearchedScientific] = useState(false);
  const [expandedAbstractId, setExpandedAbstractId] = useState<string | null>(null);
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);

  const isResearcher = user?.profileType === "RESEARCHER";

  const handleSearchScientific = async (queryToSearch?: string) => {
    const q = (queryToSearch !== undefined ? queryToSearch : scientificQuery).trim();
    if (!q) {
      setScientificError("Por favor, digite uma demanda tecnológica ou selecione uma submissão.");
      return;
    }
    setScientificError(null);
    setScientificLoading(true);
    setHasSearchedScientific(true);
    try {
      const res = await scientificMatchingService.search(q, scientificTopK);
      setScientificArticles(res.artigos);
      setScientificResponseText(res.resposta);
      setScientificExecutionMs(res.estatisticas.tempo_matchmaking_ms);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setScientificError(err.message);
      } else {
        setScientificError("Erro ao consultar o motor de IA no Hugging Face.");
      }
    } finally {
      setScientificLoading(false);
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

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const results = await matchingService.runMatchingEngine();
      setMatches(results);
    } catch {
      // Fallback handled inside matchingService
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();

    if (isResearcher) {
      projectsService.getMyProjects(user?.id).then((projs) => {
        setUserSubmissions(projs.map((p) => ({ id: p.id, title: p.title })));
      });
    } else {
      opportunitiesService.getMyOpportunities(user?.id).then((opps) => {
        setUserSubmissions(opps.map((o) => ({ id: o.id, title: o.title })));
      });
    }

    if (initialQuery) {
      handleSearchScientific(initialQuery);
    }
  }, [isResearcher, user]);

  const filteredMatches = matches.filter((item) => {
    if (selectedSubmissionId !== "ALL") {
      if (isResearcher && item.projectId !== selectedSubmissionId) return false;
      if (!isResearcher && item.opportunityId !== selectedSubmissionId) return false;
    }
    if (filterAffinity === "HIGH") return item.percentage >= 80;
    if (filterAffinity === "MEDIUM") return item.percentage >= 50 && item.percentage < 80;
    return true;
  });

  const highCount = matches.filter((m) => m.percentage >= 80).length;
  const mediumCount = matches.filter((m) => m.percentage >= 50 && m.percentage < 80).length;

  const handleContact = (matchId: string) => {
    setContactSuccessMatchId(matchId);
    setTimeout(() => {
      setContactSuccessMatchId(null);
    }, 4000);
  };

  const QUICK_TOPICS = [
    { label: "Superligas de Níquel & Turbinas", query: "superligas de niquel para alta temperatura e turbinas aeronauticas" },
    { label: "Biopolímeros & Embalagens", query: "biopolimeros e blendas polimericas biodegradaveis para embalagens sustentaveis" },
    { label: "Nanomateriais & Baterias", query: "nanomateriais de carbono grafeno e oxidos para anodos de baterias de ion-litio" },
    { label: "Filmes Finos & Solar", query: "filmes finos semicondutores e celulas solares fotovoltaicas" },
    { label: "Biomateriais & Implantes", query: "biomateriais de titanio e revestimentos de hidroxiapatita para implantes osseos" },
    { label: "Óxidos & Fotocatálise", query: "nanoparticulas de dioxido de titanio TiO2 para fotocatalise e purificacao de efluentes" },
  ];

  return (
    <DashboardLayout
      title={activeTab === "SCIENTIFIC" ? "Matchmaking Científico com Congressos" : "Motor de Matching & Resultados"}
      subtitle={
        activeTab === "SCIENTIFIC"
          ? "IA Vetorial em ZeroGPU • 12.531 Pesquisas (SBPMat 2022-2026, CBPol 2025, ICSM 2026)"
          : "Inteligência Determinística Calibrada (Competências 60% • TRL 20% • CRL 20%)"
      }
      actions={
        activeTab === "SCIENTIFIC" ? (
          <Button
            onClick={() => handleSearchScientific()}
            disabled={scientificLoading}
            size="sm"
            className="bg-brand-green-dark text-brand-off-white"
          >
            <Icon icon={Sparkles} size={15} className={scientificLoading ? "animate-spin" : ""} />
            {scientificLoading ? "Consultando ZeroGPU..." : "Executar Busca IA"}
          </Button>
        ) : (
          <Button
            onClick={fetchMatches}
            disabled={loading}
            size="sm"
            className="bg-brand-green-dark text-brand-off-white"
          >
            <Icon icon={RefreshCw} size={15} className={loading ? "animate-spin" : ""} />
            {loading ? "Calculando Matches..." : "Recalcular Matching"}
          </Button>
        )
      }
    >
      <div className="space-y-8">
        {/* Top View Selector Tabs */}
        <div className="flex flex-wrap border-b border-border-subtle gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("SCIENTIFIC")}
            className={[
              "flex items-center gap-2.5 px-6 py-3.5 font-heading text-sm font-bold border-b-2 transition-all",
              activeTab === "SCIENTIFIC"
                ? "border-brand-green-moss text-brand-green-dark bg-brand-green-moss/5"
                : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50",
            ].join(" ")}
          >
            <Icon icon={Sparkles} size={18} className="text-amber-500" />
            <span>Pesquisas em Congressos (12.500+ Trabalhos)</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-800">
              ZeroGPU Ativo
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("INTERNAL")}
            className={[
              "flex items-center gap-2.5 px-6 py-3.5 font-heading text-sm font-bold border-b-2 transition-all",
              activeTab === "INTERNAL"
                ? "border-brand-green-moss text-brand-green-dark bg-brand-green-moss/5"
                : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50",
            ].join(" ")}
          >
            <Icon icon={Layers} size={18} />
            <span>Demandas &amp; Projetos Internos</span>
            <span className="rounded-full bg-surface-secondary px-2 py-0.5 text-[10px] font-mono font-bold text-text-secondary">
              TRL • CRL
            </span>
          </button>
        </div>

        {activeTab === "SCIENTIFIC" ? (
          <div className="space-y-8">
            {/* Congress Header Card */}
            <div className="rounded-3xl border border-brand-green-moss/20 bg-gradient-to-br from-brand-green-dark via-[#0a3832] to-[#04201c] p-6 md:p-8 text-brand-off-white shadow-xl relative overflow-hidden">
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-1 text-xs font-semibold text-emerald-300 mb-4 backdrop-blur-xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Motor Vetorial ZeroGPU Ativo • 12.531 Pesquisas Indexadas</span>
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-brand-off-white">
                  Matchmaking com Acervos Científicos Oficiais
                </h3>
                <p className="mt-2 font-body text-xs md:text-sm text-brand-off-white/80 leading-relaxed">
                  Conecte a necessidade tecnológica da sua empresa diretamente aos pesquisadores de ponta da <strong>SBPMat</strong> (2022 a 2026), <strong>CBPol</strong> (2025) e <strong>ICSM</strong> (2026). Nosso motor calcula a proximidade semântica em alta dimensão (1024d) e traz contatos e resumos instantaneamente.
                </p>

                {/* Submissions fast picker */}
                {userSubmissions.length > 0 && (
                  <div className="mt-5 flex flex-wrap items-center gap-2 pt-4 border-t border-brand-off-white/10">
                    <span className="text-xs text-brand-off-white/70 font-medium">Preencher com minha demanda:</span>
                    {userSubmissions.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          setScientificQuery(sub.title);
                          handleSearchScientific(sub.title);
                        }}
                        className="rounded-lg bg-surface-white/10 px-3 py-1 text-xs font-medium text-brand-off-white hover:bg-surface-white/20 transition-all border border-brand-off-white/15"
                      >
                        📌 {sub.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Search Box & Controls */}
            <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs space-y-5">
              <div className="space-y-2">
                <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-primary">
                  Descreva o Desafio Tecnológico ou Demanda de P&amp;D
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={scientificQuery}
                    onChange={(e) => setScientificQuery(e.target.value)}
                    placeholder="Ex: Desenvolvimento de filmes finos poliméricos com alta condutividade para células solares, superligas para turbinas ou formulação de biopolímeros biodegradáveis..."
                    className="w-full rounded-2xl border border-border-subtle bg-surface-primary p-4 font-body text-sm text-text-primary placeholder:text-text-muted focus:border-brand-green-moss focus:bg-surface-white focus:outline-none focus:ring-2 focus:ring-brand-green-moss/20"
                  />
                </div>
              </div>

              {/* Quick Topics Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-heading font-semibold uppercase text-text-secondary">
                  Tópicos Rápidos em Alta nos Congressos:
                </span>
                <div className="flex flex-wrap gap-2">
                  {QUICK_TOPICS.map((topic) => (
                    <button
                      key={topic.label}
                      type="button"
                      onClick={() => {
                        setScientificQuery(topic.query);
                        handleSearchScientific(topic.query);
                      }}
                      className="rounded-full border border-border-subtle bg-surface-primary px-3 py-1 text-xs font-medium text-text-secondary hover:border-brand-green-moss hover:bg-brand-green-moss/5 hover:text-brand-green-dark transition-all"
                    >
                      {topic.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Row: Top K + Button */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border-subtle">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-text-secondary">Resultados:</span>
                  <div className="flex gap-1.5">
                    {[3, 6, 10, 15].map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setScientificTopK(k)}
                        className={[
                          "h-8 w-8 rounded-lg text-xs font-mono font-bold transition-all",
                          scientificTopK === k
                            ? "bg-brand-green-dark text-brand-off-white"
                            : "bg-surface-primary text-text-secondary hover:bg-surface-secondary",
                        ].join(" ")}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => handleSearchScientific()}
                  disabled={scientificLoading}
                  size="lg"
                  className="bg-brand-green-dark text-brand-off-white justify-center shadow-md hover:bg-brand-green-moss transition-all"
                >
                  <Icon icon={Sparkles} size={16} className={scientificLoading ? "animate-spin" : ""} />
                  {scientificLoading ? "Consultando IA no ZeroGPU..." : "Calcular Matchmaking Semântico"}
                </Button>
              </div>

              {scientificError && (
                <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-xs font-semibold text-red-800 flex items-center gap-2">
                  <Icon icon={Info} size={16} className="shrink-0" />
                  <span>{scientificError}</span>
                </div>
              )}
            </div>

            {/* Results Section */}
            {scientificLoading ? (
              <div className="py-20 text-center rounded-3xl border border-dashed border-border-subtle bg-surface-white">
                <Icon icon={RefreshCw} size={36} className="animate-spin text-brand-green-moss mx-auto mb-4" />
                <h4 className="font-heading text-base font-bold text-text-primary">
                  Executando Produto Escalar nos 12.531 Vetores...
                </h4>
                <p className="mt-1 font-body text-xs text-text-secondary max-w-md mx-auto">
                  A GPU de ponta no Hugging Face está projetando sua demanda no espaço vetorial bge-m3 e ordenando os pesquisadores mais aderentes.
                </p>
              </div>
            ) : scientificArticles.length > 0 ? (
              <div className="space-y-6">
                {/* AI Executive Summary Banner */}
                <div className="rounded-2xl border border-emerald-300/60 bg-emerald-50/70 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold font-heading text-emerald-900 uppercase tracking-wide">
                      <Icon icon={Sparkles} size={15} className="text-emerald-700" />
                      <span>Diagnóstico de Relevância</span>
                    </div>
                    <p className="font-body text-xs md:text-sm text-emerald-950 leading-relaxed">
                      {scientificResponseText}
                    </p>
                  </div>
                  {scientificExecutionMs !== null && (
                    <div className="shrink-0 rounded-xl bg-surface-white border border-emerald-200 px-3.5 py-2 text-right">
                      <p className="font-mono text-[10px] text-text-muted uppercase">Tempo de IA</p>
                      <p className="font-mono text-sm font-bold text-emerald-800">
                        {scientificExecutionMs} ms
                      </p>
                    </div>
                  )}
                </div>

                {/* List of Matched Congress Papers */}
                <div className="grid gap-6">
                  {scientificArticles.map((art, idx) => {
                    const isHigh = art.relevancia_pct >= 70;
                    const isMed = art.relevancia_pct >= 50 && art.relevancia_pct < 70;
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
                            <h4 className="font-heading text-lg md:text-xl font-bold text-text-primary leading-snug">
                              {art.titulo}
                            </h4>
                          </div>

                          {/* Score Pill */}
                          <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between gap-1">
                            <span
                              className={[
                                "inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-1.5 font-display text-lg font-bold shadow-xs",
                                isHigh
                                  ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                  : isMed
                                  ? "bg-blue-100 text-blue-900 border border-blue-300"
                                  : "bg-amber-100 text-amber-900 border border-amber-300",
                              ].join(" ")}
                            >
                              <Icon icon={Sparkles} size={15} />
                              {art.relevancia_pct}%
                            </span>
                            <span className="text-[10px] font-mono text-text-secondary uppercase">
                              Similaridade Cosseno
                            </span>
                          </div>
                        </div>

                        {/* Authors & Institutions */}
                        <div className="py-4 space-y-2">
                          <div>
                            <span className="text-[11px] font-heading font-bold uppercase text-text-secondary">
                              Autores e Vínculos Acadêmicos:
                            </span>
                            <p className="mt-0.5 font-body text-xs md:text-sm text-text-primary font-medium">
                              {art.autores}
                            </p>
                          </div>

                          {(art.area || art.sessao) && (
                            <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-text-secondary">
                              <span className="bg-surface-primary px-2.5 py-1 rounded-md border border-border-subtle">
                                <strong>Área:</strong> {art.area}
                              </span>
                              {art.sessao && (
                                <span className="bg-surface-primary px-2.5 py-1 rounded-md border border-border-subtle">
                                  <strong>Sessão:</strong> {art.sessao}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Abstract Preview / Accordion */}
                          <div className="pt-2">
                            <p className="font-body text-xs text-text-secondary leading-relaxed">
                              {isExpanded ? art.resumo : `${art.resumo?.slice(0, 260)}...`}
                            </p>
                            {art.resumo && art.resumo.length > 260 && (
                              <button
                                type="button"
                                onClick={() => setExpandedAbstractId(isExpanded ? null : art.id)}
                                className="mt-1.5 inline-flex items-center gap-1 text-xs font-heading font-semibold text-brand-green-moss hover:underline"
                              >
                                {isExpanded ? (
                                  <>
                                    <span>Recolher resumo</span>
                                    <Icon icon={ChevronUp} size={14} />
                                  </>
                                ) : (
                                  <>
                                    <span>Ler resumo completo da pesquisa</span>
                                    <Icon icon={ChevronDown} size={14} />
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Card Actions Footer */}
                        <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="text-xs text-text-secondary">
                            {art.email ? (
                              <span className="flex items-center gap-1.5 text-text-primary font-mono text-[11px]">
                                <Icon icon={Mail} size={13} className="text-brand-green-moss" />
                                {art.email}
                              </span>
                            ) : (
                              <span className="text-text-muted italic text-[11px]">
                                E-mail institucional disponível sob demanda
                              </span>
                            )}
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
                                  `Olá,\n\nLocalizamos sua pesquisa intitulada "${art.titulo}" apresentada no ${art.evento} através da plataforma The Bridge.\n\nGostaríamos de conversar sobre possibilidades de cooperação tecnológica e projetos conjuntos de P&D.\n\nAtenciosamente,\n${user?.name || "Representante Corporativo"}`
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
              </div>
            ) : hasSearchedScientific ? (
              <div className="py-16 text-center rounded-3xl border border-dashed border-border-subtle bg-surface-white p-8">
                <Icon icon={Search} size={36} className="text-text-muted mx-auto mb-3" />
                <h4 className="font-heading text-base font-bold text-text-primary">
                  Nenhuma pesquisa encontrada para os termos digitados
                </h4>
                <p className="mt-1 font-body text-xs text-text-secondary max-w-sm mx-auto">
                  Tente utilizar termos mais abrangentes ou selecione um dos tópicos rápidos recomendados acima.
                </p>
              </div>
            ) : (
              /* Initial Empty State */
              <div className="rounded-3xl border border-dashed border-border-subtle bg-surface-white p-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-green-moss/10 text-brand-green-moss mb-4">
                  <Icon icon={BrainCircuit} size={32} />
                </div>
                <h4 className="font-display text-xl font-bold text-text-primary">
                  Pronto para Realizar o Matchmaking Científico
                </h4>
                <p className="mt-2 font-body text-xs md:text-sm text-text-secondary max-w-lg mx-auto leading-relaxed">
                  Digite seu desafio tecnológico no campo acima ou selecione um dos tópicos rápidos em Ciência dos Materiais e Polímeros para explorar mais de 12.500 projetos acadêmicos em tempo real.
                </p>
                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={() => {
                      setScientificQuery("superligas de niquel para alta temperatura e turbinas aeronauticas");
                      handleSearchScientific("superligas de niquel para alta temperatura e turbinas aeronauticas");
                    }}
                    className="bg-brand-green-dark text-brand-off-white"
                  >
                    <Icon icon={Sparkles} size={15} />
                    Fazer Busca Demonstrativa
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Metric Cards Banner */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border-subtle bg-surface-white p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="font-heading text-xs font-semibold uppercase text-text-secondary">
                Total de Matches Ativos
              </p>
              <p className="mt-1 font-display text-3xl font-bold text-text-primary">
                {matches.length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green-moss/10 text-brand-green-moss">
              <Icon icon={Sparkles} size={24} />
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="font-heading text-xs font-semibold uppercase text-emerald-800">
                Alta Afinidade (≥ 80%)
              </p>
              <p className="mt-1 font-display text-3xl font-bold text-emerald-900">
                {highCount}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Icon icon={Award} size={24} />
            </div>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="font-heading text-xs font-semibold uppercase text-blue-800">
                Compatibilidade Média (50-79%)
              </p>
              <p className="mt-1 font-display text-3xl font-bold text-blue-900">
                {mediumCount}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Icon icon={Layers} size={24} />
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-border-subtle pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-heading text-xs font-bold text-text-secondary uppercase tracking-wide flex items-center gap-1.5 mr-1">
                <Icon icon={Filter} size={14} />
                Filtrar por:
              </span>
              <button
                type="button"
                onClick={() => setFilterAffinity("ALL")}
                className={[
                  "rounded-full px-3 py-1 font-heading text-xs font-semibold transition-all",
                  filterAffinity === "ALL"
                    ? "bg-brand-green-dark text-brand-off-white"
                    : "bg-surface-white text-text-secondary border border-border-subtle hover:bg-surface-secondary",
                ].join(" ")}
              >
                Todos ({matches.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterAffinity("HIGH")}
                className={[
                  "rounded-full px-3 py-1 font-heading text-xs font-semibold transition-all",
                  filterAffinity === "HIGH"
                    ? "bg-emerald-700 text-white"
                    : "bg-surface-white text-text-secondary border border-border-subtle hover:bg-surface-secondary",
                ].join(" ")}
              >
                Alta Afinidade ({highCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterAffinity("MEDIUM")}
                className={[
                  "rounded-full px-3 py-1 font-heading text-xs font-semibold transition-all",
                  filterAffinity === "MEDIUM"
                    ? "bg-blue-700 text-white"
                    : "bg-surface-white text-text-secondary border border-border-subtle hover:bg-surface-secondary",
                ].join(" ")}
              >
                Média ({mediumCount})
              </button>
            </div>

            {/* Submissão específica dropdown */}
            {userSubmissions.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-secondary font-medium">| Minha Submissão:</span>
                <select
                  value={selectedSubmissionId}
                  onChange={(e) => setSelectedSubmissionId(e.target.value)}
                  className="rounded-xl border border-border-subtle bg-surface-white px-3 py-1 text-xs font-medium text-text-primary focus:border-brand-green-moss focus:outline-none"
                >
                  <option value="ALL">
                    {isResearcher ? "Todos os meus projetos" : "Todas as minhas demandas"}
                  </option>
                  {userSubmissions.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={isResearcher ? "/dashboard/projetos/novo" : "/dashboard/demandas/nova"}
              className="inline-flex items-center gap-1.5 font-heading text-xs font-bold text-brand-green-moss hover:underline"
            >
              <Icon icon={Plus} size={14} />
              {isResearcher ? "Cadastrar mais projetos" : "Cadastrar nova demanda"}
            </Link>
          </div>
        </div>

        {/* Matches List */}
        {loading ? (
          <div className="py-20 text-center">
            <Icon icon={RefreshCw} size={32} className="animate-spin text-brand-green-moss mx-auto mb-4" />
            <p className="font-heading text-sm font-semibold text-text-primary">
              Executando cálculo ponderado de compatibilidade...
            </p>
            <p className="font-body text-xs text-text-secondary mt-1">
              Analisando sobreposição de competências (60%), TRL (20%) e CRL (20%).
            </p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border-subtle bg-surface-white p-12 text-center">
            <Icon icon={Search} size={36} className="text-text-secondary mx-auto mb-4 opacity-50" />
            <h3 className="font-heading text-base font-bold text-text-primary">
              Nenhum match com os filtros selecionados
            </h3>
            <p className="mt-1 font-body text-xs text-text-secondary max-w-md mx-auto">
              Tente cadastrar novos projetos acadêmicos ou demandas tecnológicas com competências complementares.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredMatches.map((match) => {
              const compExp = match.explanation.components.competence;
              const trlExp = match.explanation.components.trl;
              const crlExp = match.explanation.components.crl;

              const isHigh = match.percentage >= 80;

              return (
                <div
                  key={match.id}
                  className={[
                    "rounded-3xl border bg-surface-white p-6 md:p-8 transition-all hover:shadow-lg",
                    isHigh
                      ? "border-emerald-300 ring-1 ring-emerald-100"
                      : "border-border-subtle",
                  ].join(" ")}
                >
                  <div className="grid gap-8 lg:grid-cols-12 items-start">
                    {/* Left Column: Match Score Indicator */}
                    <div className="lg:col-span-3 flex flex-col items-center justify-center p-6 rounded-2xl bg-surface-primary border border-border-subtle text-center">
                      <div className="relative flex items-center justify-center">
                        <div
                          className={[
                            "flex h-24 w-24 items-center justify-center rounded-full border-4 font-display text-3xl font-bold shadow-xs",
                            isHigh
                              ? "border-emerald-600 bg-emerald-50 text-emerald-950"
                              : "border-blue-600 bg-blue-50 text-blue-950",
                          ].join(" ")}
                        >
                          {match.percentage}%
                        </div>
                      </div>

                      <span
                        className={[
                          "mt-3 inline-block rounded-full px-3 py-0.5 text-xs font-heading font-bold uppercase tracking-wider",
                          isHigh
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800",
                        ].join(" ")}
                      >
                        {isHigh ? "Alta Afinidade" : "Boa Compatibilidade"}
                      </span>

                      <p className="mt-2 text-[11px] font-body text-text-secondary">
                        Índice Geral de Sinergia
                      </p>

                      <button
                        type="button"
                        onClick={() => setSelectedMatchForAudit(match)}
                        className="mt-4 inline-flex items-center gap-1 font-heading text-xs font-semibold text-brand-green-moss hover:underline"
                      >
                        <Icon icon={Info} size={13} />
                        Auditoria do cálculo
                      </button>
                    </div>

                    {/* Middle Column: Details of Project & Opportunity */}
                    <div className="lg:col-span-6 space-y-4">
                      {isResearcher ? (
                        <>
                          {/* 1. Sua Submissão de Pesquisa */}
                          <div className="rounded-xl border border-emerald-300 bg-emerald-50/40 p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs font-heading font-bold text-emerald-900">
                                <Icon icon={GraduationCap} size={15} />
                                <span>Seu Projeto Vinculado:</span>
                              </div>
                              <Link
                                to={`/dashboard/projetos/editar/${match.project.id}`}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-green-dark hover:underline"
                              >
                                <Icon icon={Edit3} size={12} />
                                Editar p/ Rematch
                              </Link>
                            </div>
                            <h4 className="mt-1 font-heading text-base font-bold text-text-primary">
                              {match.project.title}
                            </h4>
                            <p className="mt-1 font-body text-xs text-text-secondary line-clamp-2">
                              {match.project.description}
                            </p>
                          </div>

                          {/* 2. Demanda Corporativa Encontrada */}
                          <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-4">
                            <div className="flex items-center gap-2 text-xs font-heading font-bold text-blue-900">
                              <Icon icon={Building2} size={15} />
                              <span>Oportunidade Corporativa Encontrada:</span>
                              <span className="font-normal text-text-secondary">
                                {match.opportunity.organizationName}
                              </span>
                            </div>
                            <h4 className="mt-1 font-heading text-base font-bold text-text-primary">
                              {match.opportunity.title}
                            </h4>
                            <p className="mt-1 font-body text-xs text-text-secondary line-clamp-2">
                              {match.opportunity.description}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* 1. Sua Demanda de Empresa */}
                          <div className="rounded-xl border border-blue-300 bg-blue-50/40 p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs font-heading font-bold text-blue-900">
                                <Icon icon={Building2} size={15} />
                                <span>Sua Demanda Vinculada:</span>
                              </div>
                              <Link
                                to={`/dashboard/demandas/editar/${match.opportunity.id}`}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 hover:underline"
                              >
                                <Icon icon={Edit3} size={12} />
                                Editar p/ Rematch
                              </Link>
                            </div>
                            <h4 className="mt-1 font-heading text-base font-bold text-text-primary">
                              {match.opportunity.title}
                            </h4>
                            <p className="mt-1 font-body text-xs text-text-secondary line-clamp-2">
                              {match.opportunity.description}
                            </p>
                          </div>

                          {/* 2. Projeto Científico Encontrado */}
                          <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
                            <div className="flex items-center gap-2 text-xs font-heading font-bold text-emerald-900">
                              <Icon icon={GraduationCap} size={15} />
                              <span>Projeto Científico Encontrado:</span>
                              <span className="font-normal text-text-secondary">
                                {match.project.ownerName}
                              </span>
                            </div>
                            <h4 className="mt-1 font-heading text-base font-bold text-text-primary">
                              {match.project.title}
                            </h4>
                            <p className="mt-1 font-body text-xs text-text-secondary line-clamp-2">
                              {match.project.description}
                            </p>
                          </div>
                        </>
                      )}

                      {/* Component Breakdown Bars */}
                      <div className="pt-2 space-y-3">
                        {/* Competências (60%) */}
                        <div>
                          <div className="flex justify-between text-xs font-body mb-1">
                            <span className="font-heading font-semibold text-text-primary flex items-center gap-1">
                              <Icon icon={BrainCircuit} size={13} className="text-brand-green-moss" />
                              Competências Científicas (Peso 60%)
                            </span>
                            <span className="font-mono font-bold text-brand-green-dark">
                              {compExp.percentage}% atendido
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-border-subtle">
                            <div
                              className="h-full bg-brand-green-dark transition-all duration-500 rounded-full"
                              style={{ width: `${compExp.percentage}%` }}
                            />
                          </div>
                        </div>

                        {/* TRL (20%) */}
                        <div>
                          <div className="flex justify-between text-xs font-body mb-1">
                            <span className="font-heading font-semibold text-text-primary flex items-center gap-1">
                              <Icon icon={Layers} size={13} className="text-brand-green-moss" />
                              Prontidão Tecnológica TRL (Peso 20%)
                            </span>
                            <span className="font-mono font-bold text-brand-green-dark">
                              Projeto: TRL {trlExp.projectTrl} vs Exigido: TRL {trlExp.desiredTrl} ({trlExp.percentage}%)
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-border-subtle">
                            <div
                              className="h-full bg-brand-green-moss transition-all duration-500 rounded-full"
                              style={{ width: `${trlExp.percentage}%` }}
                            />
                          </div>
                        </div>

                        {/* CRL (20%) */}
                        <div>
                          <div className="flex justify-between text-xs font-body mb-1">
                            <span className="font-heading font-semibold text-text-primary flex items-center gap-1">
                              <Icon icon={BarChart3} size={13} className="text-brand-earth" />
                              Maturidade Comercial CRL (Peso 20%)
                            </span>
                            <span className="font-mono font-bold text-brand-earth">
                              Projeto: CRL {crlExp.projectCrl} vs Alvo: CRL {crlExp.desiredCrl} ({crlExp.percentage}%)
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-border-subtle">
                            <div
                              className="h-full bg-brand-earth transition-all duration-500 rounded-full"
                              style={{ width: `${crlExp.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Key Attributes & Action */}
                    <div className="lg:col-span-3 flex flex-col justify-between h-full space-y-6">
                      <div className="space-y-3 rounded-2xl bg-surface-primary p-4 border border-border-subtle text-xs">
                        <div className="flex justify-between py-1 border-b border-border-subtle">
                          <span className="text-text-secondary">Patente do Projeto:</span>
                          <span className="font-heading font-bold text-text-primary">
                            {match.project.patentStatus === "GRANTED"
                              ? "Concedida"
                              : match.project.patentStatus === "PENDING"
                              ? "Em Depósito"
                              : "Sem Patente"}
                          </span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-border-subtle">
                          <span className="text-text-secondary">Requisito da Empresa:</span>
                          <span className="font-heading font-bold text-text-primary">
                            {match.opportunity.patentRequirement === "REQUIRED"
                              ? "Obrigatória"
                              : match.opportunity.patentRequirement === "PENDING_ACCEPTED"
                              ? "Depósito Aceito"
                              : "Dispensável"}
                          </span>
                        </div>

                        {match.opportunity.budgetMax && (
                          <div className="flex justify-between py-1">
                            <span className="text-text-secondary">Orçamento:</span>
                            <span className="font-mono font-bold text-emerald-800">
                              Até R$ {(match.opportunity.budgetMax / 1000000).toFixed(1)}M
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Connection Action */}
                      <div>
                        {contactSuccessMatchId === match.id ? (
                          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-center text-xs font-semibold text-emerald-900 flex items-center justify-center gap-1.5">
                            <Icon icon={CheckCircle2} size={16} />
                            <span>Solicitação de reunião enviada!</span>
                          </div>
                        ) : (
                          <Button
                            size="md"
                            className="w-full justify-center bg-brand-green-dark text-brand-off-white"
                            onClick={() => handleContact(match.id)}
                          >
                            <Icon icon={MessageSquare} size={15} />
                            Iniciar Diálogo / Reunião
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
          </div>
        )}
      </div>

      {/* Audit / Explainability Modal */}
      {selectedMatchForAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-surface-white p-6 md:p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedMatchForAudit(null)}
              className="absolute right-5 top-5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-secondary text-text-secondary hover:text-text-primary"
            >
              <Icon icon={X} size={18} />
            </button>

            <div className="flex items-center gap-2 font-heading text-xs font-bold text-brand-green-moss uppercase">
              <Icon icon={BrainCircuit} size={16} />
              Explicabilidade Algorítmica v1
            </div>

            <h3 className="mt-1 font-display text-2xl font-bold text-text-primary">
              Auditoria de Cálculo de Compatibilidade
            </h3>

            <p className="mt-2 font-body text-xs text-text-secondary">
              Decomposição formal do score de <strong>{selectedMatchForAudit.percentage}%</strong> entre a oportunidade <em>"{selectedMatchForAudit.opportunity.title}"</em> e o projeto <em>"{selectedMatchForAudit.project.title}"</em>.
            </p>

            <div className="mt-6 space-y-6">
              {/* Formula Formula */}
              <div className="rounded-2xl border border-border-subtle bg-surface-primary p-4 font-mono text-xs">
                <p className="font-bold text-text-primary mb-2">Fórmula Contratual Aplicada:</p>
                <p className="text-brand-green-dark">
                  FinalScore = (CompetenceScore × 0.60) + (TRLScore × 0.20) + (CRLScore × 0.20)
                </p>
                <p className="text-text-secondary mt-1">
                  FinalScore = ({selectedMatchForAudit.explanation.components.competence.score.toFixed(4)} × 0.60) + ({selectedMatchForAudit.explanation.components.trl.score.toFixed(4)} × 0.20) + ({selectedMatchForAudit.explanation.components.crl.score.toFixed(4)} × 0.20)
                </p>
                <p className="text-emerald-700 font-bold mt-1">
                  = {(selectedMatchForAudit.score * 100).toFixed(2)}% de Match
                </p>
              </div>

              {/* Competences Detailed Breakdown */}
              <div>
                <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-text-primary mb-3">
                  Detalhamento de Competências Ponderadas (60%):
                </h4>
                <div className="divide-y divide-border-subtle rounded-2xl border border-border-subtle bg-surface-primary p-3">
                  {selectedMatchForAudit.explanation.components.competence.details.map((c, i) => (
                    <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-heading font-semibold text-text-primary">{c.name}</p>
                        <p className="text-text-secondary text-[11px]">
                          Peso exigido pela empresa: {c.weight} | Nível no projeto: {c.level}/5
                        </p>
                      </div>
                      <span className="font-mono font-bold text-brand-green-dark">
                        {Math.round(c.attained * 100)}% atendido
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* TRL & CRL Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border-subtle bg-surface-primary p-4 text-xs space-y-1.5">
                  <p className="font-heading font-bold text-text-primary">Prontidão Tecnológica (TRL):</p>
                  <p className="text-text-secondary">Projeto: TRL {selectedMatchForAudit.explanation.components.trl.projectTrl}</p>
                  <p className="text-text-secondary">Oportunidade: TRL {selectedMatchForAudit.explanation.components.trl.desiredTrl}</p>
                  <p className="font-mono font-bold text-brand-green-moss">
                    Score TRL: {selectedMatchForAudit.explanation.components.trl.percentage}%
                  </p>
                </div>

                <div className="rounded-2xl border border-border-subtle bg-surface-primary p-4 text-xs space-y-1.5">
                  <p className="font-heading font-bold text-text-primary">Maturidade Comercial (CRL):</p>
                  <p className="text-text-secondary">Projeto: CRL {selectedMatchForAudit.explanation.components.crl.projectCrl}</p>
                  <p className="text-text-secondary">Oportunidade: CRL {selectedMatchForAudit.explanation.components.crl.desiredCrl}</p>
                  <p className="font-mono font-bold text-brand-earth">
                    Score CRL: {selectedMatchForAudit.explanation.components.crl.percentage}%
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button onClick={() => setSelectedMatchForAudit(null)}>
                Fechar Auditoria
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
