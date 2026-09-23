import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Award,
  Building2,
  Edit3,
  FilePlus2,
  FolderGit2,
  GraduationCap,
  PlusCircle,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { authService, calculateProfileTier } from "../services/auth";
import { projectsService, type Project } from "../services/projects";
import { opportunitiesService, type Opportunity } from "../services/opportunities";
import { matchingService, type MatchItem } from "../services/matching";

export function DashboardPage() {
  const navigate = useNavigate();
  const [user] = useState(authService.getStoredUser());
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [myOpportunities, setMyOpportunities] = useState<Opportunity[]>([]);
  const [myMatches, setMyMatches] = useState<MatchItem[]>([]);

  const isResearcher = user?.profileType === "RESEARCHER";

  useEffect(() => {
    if (isResearcher) {
      projectsService.getMyProjects(user?.id).then((list) => {
        setMyProjects(list);
      });
    } else {
      opportunitiesService.getMyOpportunities(user?.id).then((list) => {
        setMyOpportunities(list);
      });
    }

    matchingService.runMatchingEngine().then((matches) => {
      setMyMatches(matches);
    });
  }, [isResearcher, user]);

  const submissionCount = isResearcher ? myProjects.length : myOpportunities.length;
  const isLimitReached = submissionCount >= 5;
  const tierResult = calculateProfileTier(user);

  return (
    <DashboardLayout
      title={`Olá, ${user?.name || (isResearcher ? "Pesquisador(a)" : "Empresa")}`}
      subtitle={`Painel de Controle • ${isResearcher ? "Perfil Pesquisador / ICT" : "Perfil Empresa / Corporativo"}`}
      actions={
        <div className="flex items-center gap-3">
          {isResearcher ? (
            <Button
              size="sm"
              disabled={isLimitReached}
              onClick={() => navigate("/dashboard/projetos/novo")}
              className={
                isLimitReached
                  ? "bg-border-subtle text-text-secondary cursor-not-allowed"
                  : "bg-brand-green-dark text-brand-off-white"
              }
            >
              <Icon icon={FilePlus2} size={15} />
              {isLimitReached ? "Limite de 5 atingido" : "Submeter Projeto"}
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={isLimitReached}
              onClick={() => navigate("/dashboard/demandas/nova")}
              className={
                isLimitReached
                  ? "bg-border-subtle text-text-secondary cursor-not-allowed"
                  : "bg-brand-green-dark text-brand-off-white"
              }
            >
              <Icon icon={PlusCircle} size={15} />
              {isLimitReached ? "Limite de 5 atingido" : "Cadastrar Demanda"}
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/dashboard/matching")}
          >
            <Icon icon={Sparkles} size={15} />
            Ver Meus Matches
          </Button>
        </div>
      }
    >
      <div className="space-y-10">
        {/* Metric Cards Banner */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-heading text-xs font-semibold uppercase text-text-secondary">
                {isResearcher ? "Meus Projetos Submetidos" : "Minhas Demandas Ativas"}
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green-moss/10 text-brand-green-moss">
                <Icon icon={isResearcher ? GraduationCap : Building2} size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-text-primary">
                {submissionCount}
              </span>
              <span className="font-heading text-xs text-text-secondary font-semibold">
                de 5 permitidos
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-border-subtle rounded-full overflow-hidden">
              <div
                className={[
                  "h-full rounded-full transition-all duration-500",
                  isLimitReached ? "bg-amber-600" : "bg-brand-green-dark",
                ].join(" ")}
                style={{ width: `${(submissionCount / 5) * 100}%` }}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-heading text-xs font-semibold uppercase text-text-secondary">
                Matches das Minhas Submissões
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Icon icon={Sparkles} size={18} />
              </div>
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-emerald-900">
              {myMatches.length}
            </p>
            <span className="mt-1 block text-xs font-body text-text-secondary">
              {isResearcher ? "Demandas de mercado compatíveis" : "Projetos acadêmicos compatíveis"}
            </span>
          </div>

          <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-heading text-xs font-semibold uppercase text-text-secondary">
                Afinidade Máxima
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Icon icon={Award} size={18} />
              </div>
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-blue-900">
              {myMatches.length > 0 ? `${myMatches[0].percentage}%` : "--"}
            </p>
            <span className="mt-1 block text-xs font-body text-text-secondary">
              Maior score ponderado atual
            </span>
          </div>

          <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-heading text-xs font-semibold uppercase text-text-secondary">
                  Nível do Perfil
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Icon icon={ShieldCheck} size={18} />
                </div>
              </div>
              <p className="mt-3 font-display text-lg font-bold text-text-primary flex items-center gap-1.5">
                <span>{tierResult.tier === "OURO" ? "🥇 Ouro" : tierResult.tier === "PRATA" ? "🥈 Prata" : "🥉 Bronze"}</span>
                <span className="text-xs font-mono font-normal text-text-secondary">({tierResult.score}%)</span>
              </p>
              <span className="mt-1 block text-xs font-body text-text-secondary">
                {tierResult.nextTier
                  ? `Faltam ${tierResult.pointsToNextTier} pts p/ ${tierResult.nextTier === "OURO" ? "Ouro 🥇" : "Prata 🥈"}`
                  : "Nível Máximo Verificado ⭐"}
              </span>
            </div>
            <Link
              to="/dashboard/perfil"
              className="mt-3 inline-flex items-center gap-1 text-xs font-heading font-semibold text-brand-green-moss hover:underline"
            >
              <span>Editar dados do perfil</span>
              <Icon icon={ArrowRight} size={13} />
            </Link>
          </div>
        </div>

        {/* Quota Exceeded Alert Banner */}
        {isLimitReached && (
          <div className="rounded-3xl border border-amber-300 bg-amber-50/80 p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Icon icon={ShieldAlert} size={22} className="text-amber-700 shrink-0" />
              <p className="text-xs font-body text-amber-900 leading-relaxed">
                Você atingiu a cota máxima de <strong>5 submissões</strong>. Para alterar informações técnicas, avançar o nível de TRL ou atualizar competências, utilize a ação de <strong>Editar</strong> para recalcular o <strong>Rematch</strong> automaticamente.
              </p>
            </div>
            <Link
              to={isResearcher ? "/dashboard/projetos" : "/dashboard/demandas"}
              className="shrink-0 font-heading text-xs font-bold text-amber-950 underline hover:text-amber-800"
            >
              Gerenciar registros
            </Link>
          </div>
        )}

        {/* Action Prompt Card */}
        <div className="relative overflow-hidden rounded-3xl bg-brand-green-dark p-8 md:p-10 text-brand-off-white shadow-lg">
          <div className="relative z-10 max-w-2xl">
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-brand-off-white/70">
              {isResearcher ? "Gestão de Pesquisa & Patentes" : "Inovação Aberta & Demandas"}
            </p>
            <h2 className="mt-2 font-display text-2xl md:text-3xl font-bold leading-tight text-brand-off-white">
              {isResearcher
                ? "Conecte sua produção científica às demandas do setor produtivo"
                : "Acelere seu P&D conectando-se a grupos de pesquisa de vanguarda"}
            </h2>
            <p className="mt-3 font-body text-sm leading-relaxed text-brand-off-white/80">
              {isResearcher
                ? "Submeta até 5 projetos acadêmicos com calibração de TRL (1 a 9), CRL e patentes para receber recomendações de empresas interessadas na sua tecnologia."
                : "Publique até 5 desafios corporativos com tolerâncias de maturidade e competências com pesos para mapear laboratórios com soluções compatíveis."}
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              {isResearcher ? (
                <Button
                  size="md"
                  disabled={isLimitReached}
                  onClick={() => navigate("/dashboard/projetos/novo")}
                  className={
                    isLimitReached
                      ? "bg-brand-off-white/40 text-brand-green-dark cursor-not-allowed"
                      : "bg-brand-off-white text-brand-green-dark hover:bg-surface-secondary"
                  }
                >
                  <Icon icon={FilePlus2} size={16} />
                  {isLimitReached ? "Limite de 5 Projetos Atingido" : "Submeter Novo Projeto"}
                </Button>
              ) : (
                <Button
                  size="md"
                  disabled={isLimitReached}
                  onClick={() => navigate("/dashboard/demandas/nova")}
                  className={
                    isLimitReached
                      ? "bg-brand-off-white/40 text-brand-green-dark cursor-not-allowed"
                      : "bg-brand-off-white text-brand-green-dark hover:bg-surface-secondary"
                  }
                >
                  <Icon icon={PlusCircle} size={16} />
                  {isLimitReached ? "Limite de 5 Demandas Atingido" : "Cadastrar Nova Demanda"}
                </Button>
              )}

              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate(isResearcher ? "/dashboard/projetos" : "/dashboard/demandas")}
                className="border-brand-off-white/30 text-brand-off-white hover:bg-brand-off-white/10"
              >
                <Icon icon={FolderGit2} size={16} />
                {isResearcher ? "Ver Meus Projetos" : "Ver Minhas Demandas"}
              </Button>
            </div>
          </div>
        </div>

        {/* User's Submissions Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl font-bold text-text-primary">
                {isResearcher ? "Meus Projetos Cadastrados" : "Minhas Demandas Cadastradas"}
              </h3>
              <p className="font-body text-xs text-text-secondary">
                {isResearcher
                  ? "Seus projetos ativos para o motor de matchmaking (até 5)"
                  : "Seus desafios corporativos publicados (até 5)"}
              </p>
            </div>

            <Link
              to={isResearcher ? "/dashboard/projetos" : "/dashboard/demandas"}
              className="inline-flex items-center gap-1 font-heading text-xs font-semibold text-brand-green-moss hover:underline"
            >
              <span>Gerenciar todos ({submissionCount}/5)</span>
              <Icon icon={ArrowRight} size={14} />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {isResearcher
              ? myProjects.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-3xl border border-border-subtle bg-surface-white p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold text-brand-green-dark bg-brand-green-moss/10 px-2.5 py-0.5 rounded-full">
                          TRL {p.trl} • CRL {p.crl}
                        </span>
                        <span className="text-[11px] font-body text-text-secondary">
                          {p.patentStatus === "GRANTED" ? "Patente Concedida" : p.patentStatus === "PENDING" ? "Em Depósito" : "Sem Patente"}
                        </span>
                      </div>
                      <h4 className="font-heading font-bold text-sm text-text-primary line-clamp-1">
                        {p.title}
                      </h4>
                      <p className="mt-1 font-body text-xs text-text-secondary line-clamp-2">
                        {p.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
                      <Link
                        to={`/dashboard/projetos/editar/${p.id}`}
                        className="font-heading text-xs font-semibold text-text-secondary hover:text-brand-green-moss inline-flex items-center gap-1"
                      >
                        <Icon icon={Edit3} size={13} />
                        Editar (Rematch)
                      </Link>

                      <Link
                        to="/dashboard/matching"
                        className="font-heading text-xs font-semibold text-brand-green-moss hover:underline inline-flex items-center gap-1"
                      >
                        Ver Matches
                        <Icon icon={ArrowRight} size={12} />
                      </Link>
                    </div>
                  </div>
                ))
              : myOpportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="rounded-3xl border border-border-subtle bg-surface-white p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold text-brand-green-dark bg-brand-green-moss/10 px-2.5 py-0.5 rounded-full">
                          Mín TRL {opp.minTrl} • Alvo CRL {opp.desiredCrl}
                        </span>
                        <span className="text-[11px] font-body text-text-secondary">
                          {opp.industrySector}
                        </span>
                      </div>
                      <h4 className="font-heading font-bold text-sm text-text-primary line-clamp-1">
                        {opp.title}
                      </h4>
                      <p className="mt-1 font-body text-xs text-text-secondary line-clamp-2">
                        {opp.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
                      <Link
                        to={`/dashboard/demandas/editar/${opp.id}`}
                        className="font-heading text-xs font-semibold text-text-secondary hover:text-brand-green-moss inline-flex items-center gap-1"
                      >
                        <Icon icon={Edit3} size={13} />
                        Editar (Rematch)
                      </Link>

                      <Link
                        to="/dashboard/matching"
                        className="font-heading text-xs font-semibold text-brand-green-moss hover:underline inline-flex items-center gap-1"
                      >
                        Ver Matches
                        <Icon icon={ArrowRight} size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
          </div>
        </div>

        {/* Top Matches Preview strictly for own submissions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl font-bold text-text-primary">
                Matches das Suas Submissões ({myMatches.length})
              </h3>
              <p className="font-body text-xs text-text-secondary">
                Combinações calculadas exclusivamente com base nas suas propostas cadastradas
              </p>
            </div>

            <Link
              to="/dashboard/matching"
              className="inline-flex items-center gap-1 font-heading text-xs font-semibold text-brand-green-moss hover:underline"
            >
              <span>Ver todos os meus matches</span>
              <Icon icon={ArrowRight} size={14} />
            </Link>
          </div>

          {myMatches.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border-subtle bg-surface-white p-8 text-center text-xs text-text-secondary">
              Nenhum match encontrado ainda para as suas submissões. Experimente editar os parâmetros técnicos para recalcular.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {myMatches.slice(0, 3).map((m) => (
                <div
                  key={m.id}
                  className="rounded-3xl border border-border-subtle bg-surface-white p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-sm font-bold text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full">
                        {m.percentage}% Match
                      </span>
                      <span className="text-[11px] font-body text-text-secondary">
                        TRL {m.project.trl} ↔ TRL {m.opportunity.minTrl}
                      </span>
                    </div>

                    <p className="text-[11px] font-heading font-semibold text-text-secondary uppercase">
                      {isResearcher ? `Para seu projeto: "${m.project.title.slice(0, 25)}..."` : `Para sua demanda: "${m.opportunity.title.slice(0, 25)}..."`}
                    </p>

                    <h4 className="mt-1 font-heading font-bold text-sm text-text-primary line-clamp-2">
                      {isResearcher ? m.opportunity.title : m.project.title}
                    </h4>

                    <p className="mt-1 text-[11px] font-heading font-medium text-brand-green-moss">
                      {isResearcher
                        ? `Empresa: ${m.opportunity.organizationName}`
                        : `Pesquisador: ${m.project.ownerName}`}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between">
                    <span className="text-[11px] font-body text-text-secondary">
                      Competências: {m.explanation.components.competence.percentage}%
                    </span>
                    <Link
                      to="/dashboard/matching"
                      className="font-heading text-xs font-semibold text-brand-green-moss hover:underline inline-flex items-center gap-1"
                    >
                      Ver detalhes
                      <Icon icon={ArrowRight} size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
