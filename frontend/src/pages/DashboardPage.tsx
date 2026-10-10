import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Edit3,
  FilePlus2,
  PlusCircle,
  ShieldAlert,
  Sparkles,
  Ticket,
} from "lucide-react";

import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { authService } from "../services/auth";
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
  const daysRemaining = user?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 60;

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

          {isResearcher ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/dashboard/conexoes")}
            >
              <Icon icon={Sparkles} size={15} />
              Minhas Conexões
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/dashboard/matching")}
            >
              <Icon icon={Sparkles} size={15} />
              Ver Meus Matches
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-10">
        {/* Active Free Trial Coupon Banner */}
        {(user?.couponCode || user?.subscriptionStatus === "FREE_TRIAL") && (
          <div className="rounded-3xl border border-purple-200 bg-gradient-to-r from-purple-50 via-white to-purple-50/40 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 shadow-2xs">
                <Icon icon={Ticket} size={24} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-purple-100 px-2.5 py-0.5 font-mono text-[11px] font-bold text-purple-900 border border-purple-200">
                    ACESSO PROMOCIONAL ATIVO
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                    {daysRemaining} dias restantes de cortesia
                  </span>
                </div>
                <h3 className="font-heading font-bold text-base text-text-primary mt-1">
                  Acesso Gratuito por 2 Meses Liberado
                </h3>
                <p className="font-body text-xs text-text-secondary mt-0.5 max-w-2xl">
                  Sua conta conta com todos os recursos e isenção de taxas do The Bridge durante o período promocional de 60 dias.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate(isResearcher ? "/dashboard/projetos/novo" : "/dashboard/demandas/nova")}
              className="border-purple-200 text-purple-900 hover:bg-purple-100 shrink-0 self-start md:self-center"
            >
              <Icon icon={Sparkles} size={14} className="text-purple-600" />
              Aproveitar Benefício
            </Button>
          </div>
        )}



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
                  variant="inverse"
                  disabled={isLimitReached}
                  onClick={() => navigate("/dashboard/projetos/novo")}
                  style={{ color: "#002025" }}
                  className={
                    isLimitReached
                      ? "bg-brand-off-white/40 !text-[#002025] cursor-not-allowed font-bold"
                      : "bg-brand-off-white !text-[#002025] font-bold hover:bg-surface-secondary shadow-xs"
                  }
                >
                  <Icon icon={FilePlus2} size={16} className="!text-[#002025]" />
                  <span>{isLimitReached ? "Limite de 5 Projetos Atingido" : "Submeter Novo Projeto"}</span>
                </Button>
              ) : (
                <Button
                  size="md"
                  variant="inverse"
                  disabled={isLimitReached}
                  onClick={() => navigate("/dashboard/demandas/nova")}
                  style={{ color: "#002025" }}
                  className={
                    isLimitReached
                      ? "bg-brand-off-white/40 !text-[#002025] cursor-not-allowed font-bold"
                      : "bg-brand-off-white !text-[#002025] font-bold hover:bg-surface-secondary shadow-xs"
                  }
                >
                  <Icon icon={PlusCircle} size={16} className="!text-[#002025]" />
                  <span>{isLimitReached ? "Limite de 5 Demandas Atingido" : "Cadastrar Nova Demanda"}</span>
                </Button>
              )}
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

                    <p className="mt-1 text-[11px] font-mono font-medium text-text-secondary tracking-wider">
                      {isResearcher
                        ? "Empresa: ****************"
                        : "Autores: ****************"}
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
