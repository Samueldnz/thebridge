import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  BarChart3,
  BrainCircuit,
  Building2,
  CheckCircle2,
  Edit3,
  Filter,
  GraduationCap,
  Info,
  Layers,
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

  const isResearcher = user?.profileType === "RESEARCHER";

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

  return (
    <DashboardLayout
      title="Motor de Matching &amp; Resultados"
      subtitle="Inteligência Determinística Calibrada (Competências 60% • TRL 20% • CRL 20%)"
      actions={
        <Button
          onClick={fetchMatches}
          disabled={loading}
          size="sm"
          className="bg-brand-green-dark text-brand-off-white"
        >
          <Icon icon={RefreshCw} size={15} className={loading ? "animate-spin" : ""} />
          {loading ? "Calculando Matches..." : "Recalcular Matching"}
        </Button>
      }
    >
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
