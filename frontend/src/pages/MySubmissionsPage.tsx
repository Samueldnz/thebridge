import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Edit3,
  FilePlus2,
  GraduationCap,
  PlusCircle,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { authService } from "../services/auth";
import { projectsService, type Project } from "../services/projects";
import { opportunitiesService, type Opportunity } from "../services/opportunities";

export function MySubmissionsPage() {
  const navigate = useNavigate();
  const [user] = useState(authService.getStoredUser());
  const [projects, setProjects] = useState<Project[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  const isResearcher = user?.profileType === "RESEARCHER";

  useEffect(() => {
    if (isResearcher) {
      projectsService.getMyProjects(user?.id).then((list) => {
        setProjects(list);
        setLoading(false);
      });
    } else {
      opportunitiesService.getMyOpportunities(user?.id).then((list) => {
        setOpportunities(list);
        setLoading(false);
      });
    }
  }, [isResearcher, user]);

  const count = isResearcher ? projects.length : opportunities.length;
  const maxLimit = 5;
  const isLimitReached = count >= maxLimit;

  return (
    <DashboardLayout
      title={isResearcher ? "Meus Projetos Científicos" : "Minhas Demandas Tecnológicas"}
      subtitle={isResearcher ? "Gestão de Tecnologias & Patentes (Pesquisador)" : "Gestão de Desafios Corporativos (Empresa)"}
      actions={
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            disabled={isLimitReached}
            onClick={() =>
              navigate(isResearcher ? "/dashboard/projetos/novo" : "/dashboard/demandas/nova")
            }
            className={
              isLimitReached
                ? "bg-border-subtle text-text-secondary cursor-not-allowed"
                : "bg-brand-green-dark text-brand-off-white"
            }
          >
            <Icon icon={isResearcher ? FilePlus2 : PlusCircle} size={15} />
            {isLimitReached
              ? "Limite de 5 atingido"
              : isResearcher
              ? "Submeter Novo Projeto"
              : "Cadastrar Nova Demanda"}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/dashboard/matching")}
          >
            <Icon icon={Sparkles} size={15} />
            Ver Matches
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Quota Banner */}
        <div
          className={[
            "rounded-3xl border p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs",
            isLimitReached
              ? "border-amber-300 bg-amber-50/60 text-amber-900"
              : "border-border-subtle bg-surface-white text-text-primary",
          ].join(" ")}
        >
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={[
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                isLimitReached ? "bg-amber-200 text-amber-800" : "bg-brand-green-moss/10 text-brand-green-moss",
              ].join(" ")}
            >
              <Icon icon={isLimitReached ? ShieldAlert : ShieldCheck} size={20} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm">
                Cota de Submissões: {count} de {maxLimit} utilizadas
              </h3>
              <p className="font-body text-xs text-text-secondary mt-0.5">
                {isLimitReached
                  ? "Você atingiu o limite de 5 cadastros. Para ajustar parâmetros ou tentar novos matches, edite um dos seus registros abaixo para disparar o rematch."
                  : `Você ainda pode cadastrar mais ${maxLimit - count} ${isResearcher ? "projeto(s)" : "demanda(s)"} neste perfil.`}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full sm:w-48 shrink-0">
            <div className="flex justify-between text-[11px] font-mono mb-1 text-text-secondary">
              <span>Uso: {Math.round((count / maxLimit) * 100)}%</span>
              <span>{count}/{maxLimit}</span>
            </div>
            <div className="h-2 w-full bg-border-subtle rounded-full overflow-hidden">
              <div
                className={[
                  "h-full rounded-full transition-all duration-500",
                  isLimitReached ? "bg-amber-600" : "bg-brand-green-dark",
                ].join(" ")}
                style={{ width: `${(count / maxLimit) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* List of Submissions */}
        {loading ? (
          <div className="py-16 text-center text-xs font-body text-text-secondary">
            Carregando seus registros...
          </div>
        ) : count === 0 ? (
          <div className="rounded-3xl border border-dashed border-border-subtle bg-surface-white p-12 text-center">
            <Icon
              icon={isResearcher ? GraduationCap : Building2}
              size={36}
              className="text-text-secondary mx-auto mb-3 opacity-50"
            />
            <h3 className="font-heading font-bold text-base text-text-primary">
              Nenhuma submissão ativa no momento
            </h3>
            <p className="mt-1 font-body text-xs text-text-secondary max-w-sm mx-auto">
              {isResearcher
                ? "Cadastre o primeiro projeto de pesquisa do seu laboratório para começar a receber conexões industriais."
                : "Cadastre a primeira demanda tecnológica da sua empresa para encontrar grupos científicos de excelência."}
            </p>
            <div className="mt-6">
              <Button
                onClick={() =>
                  navigate(isResearcher ? "/dashboard/projetos/novo" : "/dashboard/demandas/nova")
                }
                className="bg-brand-green-dark text-brand-off-white"
              >
                {isResearcher ? "Submeter Primeiro Projeto" : "Cadastrar Primeira Demanda"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {isResearcher
              ? projects.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-3xl border border-border-subtle bg-surface-white p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center md:justify-between gap-6"
                  >
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-brand-green-moss/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-brand-green-dark">
                          TRL {p.trl}
                        </span>
                        <span className="rounded-full bg-brand-earth/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-brand-earth">
                          CRL {p.crl}
                        </span>
                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 font-mono text-[11px] font-bold text-blue-800">
                          {p.patentStatus === "GRANTED"
                            ? "Patente Concedida"
                            : p.patentStatus === "PENDING"
                            ? "Em Depósito"
                            : "Sem Patente"}
                        </span>
                        <span className="text-[11px] font-body text-text-secondary">
                          {p.researchField}
                        </span>
                      </div>

                      <h3 className="font-heading font-bold text-lg text-text-primary">
                        {p.title}
                      </h3>

                      <p className="font-body text-xs text-text-secondary line-clamp-2">
                        {p.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {p.competences.map((c, i) => (
                          <span
                            key={i}
                            className="rounded-lg bg-surface-primary border border-border-subtle px-2 py-0.5 text-[10px] font-medium text-text-primary"
                          >
                            {c.name || c.competenceId} (Nível {c.level})
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap md:flex-col shrink-0 gap-2.5">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/dashboard/projetos/editar/${p.id}`)}
                        className="justify-center"
                      >
                        <Icon icon={Edit3} size={14} />
                        Editar (Rematch)
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => navigate("/dashboard/matching")}
                        className="justify-center bg-brand-green-dark text-brand-off-white"
                      >
                        <Icon icon={Sparkles} size={14} />
                        Ver Matches
                      </Button>
                    </div>
                  </div>
                ))
              : opportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="rounded-3xl border border-border-subtle bg-surface-white p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center md:justify-between gap-6"
                  >
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-brand-green-moss/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-brand-green-dark">
                          Mín TRL {opp.minTrl}
                        </span>
                        <span className="rounded-full bg-brand-earth/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-brand-earth">
                          Alvo CRL {opp.desiredCrl}
                        </span>
                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 font-mono text-[11px] font-bold text-amber-800">
                          {opp.patentRequirement === "REQUIRED"
                            ? "Patente Obrigatória"
                            : opp.patentRequirement === "PENDING_ACCEPTED"
                            ? "Aceita Depósito"
                            : "Patente Dispensável"}
                        </span>
                        <span className="text-[11px] font-body text-text-secondary">
                          {opp.industrySector}
                        </span>
                      </div>

                      <h3 className="font-heading font-bold text-lg text-text-primary">
                        {opp.title}
                      </h3>

                      <p className="font-body text-xs text-text-secondary line-clamp-2">
                        {opp.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {opp.competences.map((c, i) => (
                          <span
                            key={i}
                            className="rounded-lg bg-surface-primary border border-border-subtle px-2 py-0.5 text-[10px] font-medium text-text-primary"
                          >
                            {c.name || c.competenceId} (Peso {c.weight})
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap md:flex-col shrink-0 gap-2.5">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/dashboard/demandas/editar/${opp.id}`)}
                        className="justify-center"
                      >
                        <Icon icon={Edit3} size={14} />
                        Editar (Rematch)
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => navigate("/dashboard/matching")}
                        className="justify-center bg-brand-green-dark text-brand-off-white"
                      >
                        <Icon icon={Sparkles} size={14} />
                        Ver Matches
                      </Button>
                    </div>
                  </div>
                ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
