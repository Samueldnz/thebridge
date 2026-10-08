import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  CheckCircle2,
  Clock,
  GraduationCap,
  MessageSquare,
  Sparkles,
  Users,
  XCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Icon } from "../components/ui/Icon";
import { Button } from "../components/ui/Button";
import { authService } from "../services/auth";
import {
  connectionsService,
  type ConnectionItem,
} from "../services/connections";

export function ConnectionsPage() {
  const [user] = useState(authService.getStoredUser());
  const isResearcher = user?.profileType === "RESEARCHER";

  const [connections, setConnections] = useState<ConnectionItem[]>(() =>
    connectionsService.getConnections(user?.email)
  );
  const [statusFilter, setStatusFilter] = useState<string>("TODAS");

  useEffect(() => {
    setConnections(connectionsService.getConnections(user?.email));
  }, [user?.email]);

  const handleUpdateStatus = (id: string, newStatus: ConnectionItem["status"]) => {
    connectionsService.updateConnectionStatus(id, newStatus, user?.email);
    setConnections(connectionsService.getConnections(user?.email));
  };

  const filtered =
    statusFilter === "TODAS"
      ? connections
      : connections.filter((c) => c.status === statusFilter);

  const getStatusBadge = (status: ConnectionItem["status"]) => {
    switch (status) {
      case "ACEITA":
        return {
          label: "Conexão Aceita",
          badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
          icon: CheckCircle2,
        };
      case "EM_NEGOCIACAO":
        return {
          label: "Em Negociação de P&D",
          badgeClass: "bg-purple-100 text-purple-900 border-purple-300",
          icon: ShieldCheck,
        };
      case "RECUSADA":
        return {
          label: "Recusada",
          badgeClass: "bg-red-100 text-red-900 border-red-300",
          icon: XCircle,
        };
      case "PENDENTE":
      default:
        return {
          label: "Pendente de Avaliação",
          badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
          icon: Clock,
        };
    }
  };

  return (
    <DashboardLayout
      title="Minhas Conexões"
      actions={
        !isResearcher && (
          <Link to="/dashboard/matching">
            <Button size="sm" className="bg-brand-green-dark text-white">
              <Icon icon={Sparkles} size={14} />
              Buscar Novos Matches
            </Button>
          </Link>
        )
      }
    >
      <div className="space-y-6">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border-subtle bg-surface-white p-4 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "TODAS", label: "Todas" },
              { id: "PENDENTE", label: "Pendentes" },
              { id: "ACEITA", label: "Aceitas" },
              { id: "EM_NEGOCIACAO", label: "Em Negociação" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={[
                  "rounded-full px-4 py-1.5 text-xs font-heading font-semibold transition-all",
                  statusFilter === tab.id
                    ? "bg-brand-green-dark text-white shadow-xs"
                    : "bg-surface-primary text-text-secondary hover:text-text-primary border border-border-subtle",
                ].join(" ")}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-text-secondary">
            {filtered.length} {filtered.length === 1 ? "conexão listada" : "conexões listadas"}
          </div>
        </div>

        {/* Connections List */}
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border-subtle bg-surface-white p-12 text-center">
            <Icon icon={Users} size={40} className="mx-auto text-text-muted mb-3" />
            <h3 className="font-heading text-lg font-bold text-text-primary">
              Nenhuma conexão encontrada
            </h3>
            <p className="mt-1 font-body text-xs text-text-secondary max-w-md mx-auto">
              {isResearcher
                ? "Quando empresas solicitarem conexão com suas pesquisas ou projetos, elas aparecerão aqui."
                : "Solicite conexões nos resultados de matching para abrir diálogos com laboratórios e pesquisadores."}
            </p>
            {!isResearcher && (
              <div className="mt-6">
                <Link to="/dashboard/matching">
                  <Button size="sm" className="bg-brand-green-dark text-white">
                    Explorar Matches de Pesquisa
                    <Icon icon={ArrowRight} size={14} />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => {
              const status = getStatusBadge(item.status);

              return (
                <div
                  key={item.id}
                  className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-7 shadow-xs hover:shadow-md transition-all space-y-4"
                >
                  {/* Top Bar: Counterpart & Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-green-moss/10 text-brand-green-moss">
                        <Icon icon={isResearcher ? Building2 : GraduationCap} size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary">
                          {isResearcher ? "Empresa Solicitante" : "Grupo de Pesquisa Conectado"}
                        </span>
                        <h3 className="font-heading text-base font-bold text-text-primary">
                          {isResearcher ? item.companyName : item.researcherName}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 font-mono text-xs font-bold text-emerald-800 border border-emerald-200">
                        {item.matchScore}% Match
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs font-semibold border ${status.badgeClass}`}
                      >
                        <Icon icon={status.icon} size={13} />
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Research & Challenge Context */}
                  <div className="grid gap-4 md:grid-cols-2 text-xs">
                    <div className="rounded-2xl bg-surface-primary p-4 border border-border-subtle">
                      <span className="font-mono text-[10px] font-bold text-text-secondary uppercase">
                        Trabalho Científico Vinculado:
                      </span>
                      <p className="mt-1 font-heading font-semibold text-text-primary">
                        {item.articleTitle}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-text-secondary">
                        Apresentado no {item.articleEvent}
                      </p>
                    </div>

                    {item.opportunityTitle && (
                      <div className="rounded-2xl bg-surface-primary p-4 border border-border-subtle">
                        <span className="font-mono text-[10px] font-bold text-text-secondary uppercase">
                          Desafio Corporativo / Demanda:
                        </span>
                        <p className="mt-1 font-heading font-semibold text-text-primary">
                          {item.opportunityTitle}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-text-secondary">
                          Iniciativa de Inovação Aberta
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="rounded-2xl bg-surface-primary/50 p-4 border border-border-subtle">
                    <span className="font-mono text-[10px] font-bold text-text-secondary uppercase block mb-1">
                      Mensagem de Apresentação:
                    </span>
                    <p className="font-body text-xs text-text-secondary leading-relaxed">
                      "{item.message}"
                    </p>
                    <span className="block mt-2 text-[10px] font-mono text-text-muted">
                      Registrado em: {item.createdAt}
                    </span>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-[11px] font-mono text-text-secondary flex items-center gap-1.5">
                      <Icon icon={ShieldCheck} size={14} className="text-brand-green-moss" />
                      <span>Conexão protegida pela The Bridge • Rastreamento de autoria ativo</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isResearcher && item.status === "PENDENTE" ? (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleUpdateStatus(item.id, "RECUSADA")}
                            className="text-xs text-red-700 hover:bg-red-50"
                          >
                            Recusar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(item.id, "ACEITA")}
                            className="bg-brand-green-dark text-white text-xs"
                          >
                            <Icon icon={CheckCircle2} size={14} />
                            Aceitar Conexão
                          </Button>
                        </>
                      ) : (
                        <Link to="/dashboard/notificacoes">
                          <Button size="sm" variant="secondary" className="text-xs">
                            <Icon icon={MessageSquare} size={14} />
                            Ver Histórico de Comunicação
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
