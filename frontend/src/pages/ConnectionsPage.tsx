import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  CheckCircle2,
  Clock,
  FileSignature,
  GraduationCap,
  Lock,
  Mail,
  MessageSquare,
  Phone,
  ShieldCheck,
  Sparkles,
  Unlock,
  Users,
  X,
  XCircle,
  ArrowRight,
  Briefcase,
  Coins,
  CalendarClock,
} from "lucide-react";

import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Icon } from "../components/ui/Icon";
import { Button } from "../components/ui/Button";
import { authService } from "../services/auth";
import {
  connectionsService,
  FIXED_CENSOR_AUTHORS,
  FIXED_CENSOR_AFFILIATION,
  FIXED_CENSOR_COMPANY,
  type ConnectionItem,
} from "../services/connections";

export function ConnectionsPage() {
  const [user] = useState(authService.getStoredUser());
  const isResearcher = user?.profileType === "RESEARCHER";

  // Permite alternar visualização Empresa / Pesquisador para facilitar homologação do fluxo completo
  const [viewRole, setViewRole] = useState<"COMPANY" | "RESEARCHER">(
    isResearcher ? "RESEARCHER" : "COMPANY"
  );

  const [connections, setConnections] = useState<ConnectionItem[]>(() =>
    connectionsService.getConnections(user?.email, isResearcher ? "RESEARCHER" : "COMPANY")
  );
  const [statusFilter, setStatusFilter] = useState<string>("TODAS");

  // Modal do Termo de Responsabilidade (Success Fee)
  const [termModalConn, setTermModalConn] = useState<ConnectionItem | null>(null);
  const [termSignerRole, setTermSignerRole] = useState<"COMPANY" | "RESEARCHER">("COMPANY");
  const [termAcceptedCheckbox, setTermAcceptedCheckbox] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refreshConnections = (role = viewRole) => {
    setConnections(connectionsService.getConnections(user?.email, role));
  };

  useEffect(() => {
    refreshConnections(viewRole);
  }, [user?.email, viewRole]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleResearcherDecision = (id: string, accept: boolean) => {
    connectionsService.respondConnectionByResearcher(id, accept);
    refreshConnections();
    if (accept) {
      showToast(
        "✅ Conexão aceita! Ambas as partes foram notificadas para assinar o Termo de Responsabilidade (Success Fee)."
      );
    } else {
      showToast("Solicitação de conexão recusada.");
    }
  };

  const handleOpenTermModal = (conn: ConnectionItem, role: "COMPANY" | "RESEARCHER") => {
    setTermModalConn(conn);
    setTermSignerRole(role);
    setTermAcceptedCheckbox(false);
  };

  const handleConfirmSignTerm = () => {
    if (!termModalConn || !termAcceptedCheckbox) return;
    const updated = connectionsService.signResponsibilityTerm(termModalConn.id, termSignerRole);
    setTermModalConn(null);
    refreshConnections();

    if (updated?.status === "CONECTADO") {
      showToast(
        "🎉 Termo de Responsabilidade assinado por ambas as partes! Conexão concluída e dados de contato desbloqueados."
      );
    } else {
      showToast(
        "✍️ Sua assinatura foi registrada no Termo de Responsabilidade! Aguardando assinatura da outra parte."
      );
    }
  };

  const filtered =
    statusFilter === "TODAS"
      ? connections
      : connections.filter((c) => {
          if (statusFilter === "PENDENTES") {
            return (
              c.status === "EM_ANALISE_ADMIN" ||
              c.status === "AGUARDANDO_PESQUISADOR" ||
              c.status === "PENDENTE"
            );
          }
          if (statusFilter === "TERMO") {
            return c.status === "AGUARDANDO_TERMO";
          }
          if (statusFilter === "CONECTADAS") {
            return c.status === "CONECTADO" || c.status === "ACEITA";
          }
          return c.status === statusFilter;
        });

  const getStatusBadge = (status: ConnectionItem["status"]) => {
    switch (status) {
      case "EM_ANALISE_ADMIN":
        return {
          label: "Em Análise na Central de Admin",
          badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
          icon: Clock,
        };
      case "AGUARDANDO_PESQUISADOR":
      case "PENDENTE":
        return {
          label:
            viewRole === "RESEARCHER"
              ? "Aguardando Sua Resposta"
              : "Aprovada pelo Admin • Aguardando Pesquisador",
          badgeClass: "bg-blue-100 text-blue-900 border-blue-300",
          icon: Clock,
        };
      case "AGUARDANDO_TERMO":
        return {
          label: "Aguardando Assinatura do Termo (Success Fee)",
          badgeClass: "bg-purple-100 text-purple-900 border-purple-300",
          icon: FileSignature,
        };
      case "CONECTADO":
      case "ACEITA":
        return {
          label: "Conexão Efetivada • Contatos Liberados",
          badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
          icon: CheckCircle2,
        };
      case "RECUSADA":
        return {
          label: "Conexão Recusada",
          badgeClass: "bg-red-100 text-red-900 border-red-300",
          icon: XCircle,
        };
      default:
        return {
          label: "Em Andamento",
          badgeClass: "bg-slate-100 text-slate-800 border-slate-300",
          icon: ShieldCheck,
        };
    }
  };

  const activeIsResearcher = viewRole === "RESEARCHER";

  return (
    <DashboardLayout
      title="Minhas Conexões"
      actions={
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Seletor de Perspectiva (Empresa vs Pesquisador) para testar o fluxo ponta a ponta */}
          <div className="inline-flex items-center rounded-xl border border-border-subtle bg-surface-white p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewRole("COMPANY")}
              className={`px-3 py-1 rounded-lg text-xs font-heading font-semibold transition-all cursor-pointer ${
                viewRole === "COMPANY"
                  ? "bg-brand-green-dark text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Visão Empresa
            </button>
            <button
              type="button"
              onClick={() => setViewRole("RESEARCHER")}
              className={`px-3 py-1 rounded-lg text-xs font-heading font-semibold transition-all cursor-pointer ${
                viewRole === "RESEARCHER"
                  ? "bg-brand-green-dark text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Visão Pesquisador
            </button>
          </div>

          {!activeIsResearcher && (
            <Link to="/dashboard/matching">
              <Button size="sm" className="bg-brand-green-dark text-white">
                <Icon icon={Sparkles} size={14} />
                Buscar Novos Matches
              </Button>
            </Link>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Toast de confirmação */}
        {toastMessage && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-950 flex items-center justify-between shadow-xs animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5">
              <Icon icon={CheckCircle2} size={18} className="text-emerald-700 shrink-0" />
              <p className="font-heading text-xs font-bold">{toastMessage}</p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-emerald-800 hover:text-emerald-950 p-1 cursor-pointer"
            >
              <Icon icon={X} size={14} />
            </button>
          </div>
        )}

        {/* Barra de Filtros */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border-subtle bg-surface-white p-4 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "TODAS", label: "Todas" },
              { id: "PENDENTES", label: "Em Análise / Aguardando Resposta" },
              { id: "TERMO", label: "Assinatura do Termo (Success Fee)" },
              { id: "CONECTADAS", label: "Conectadas (Contatos Liberados)" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={[
                  "rounded-full px-4 py-1.5 text-xs font-heading font-semibold transition-all cursor-pointer",
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

        {/* Lista de Conexões */}
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border-subtle bg-surface-white p-12 text-center">
            <Icon icon={Users} size={40} className="mx-auto text-text-muted mb-3" />
            <h3 className="font-heading text-lg font-bold text-text-primary">
              Nenhuma conexão encontrada neste filtro
            </h3>
            <p className="mt-1 font-body text-xs text-text-secondary max-w-md mx-auto">
              {activeIsResearcher
                ? "Quando a Central de Admin aprovar solicitações de empresas interessadas no seu projeto, você será notificado e elas aparecerão aqui."
                : "Solicite conexões nos resultados de matching para iniciar o processo de intermediação pela The Bridge."}
            </p>
            {!activeIsResearcher && (
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
          <div className="space-y-5">
            {filtered.map((item) => {
              const status = getStatusBadge(item.status);
              const isFullyConnected = item.status === "CONECTADO" || item.status === "ACEITA";

              return (
                <div
                  key={item.id}
                  className={[
                    "rounded-3xl border bg-surface-white p-6 md:p-7 shadow-xs hover:shadow-md transition-all space-y-5",
                    isFullyConnected
                      ? "border-emerald-300 ring-1 ring-emerald-100"
                      : item.status === "AGUARDANDO_TERMO"
                      ? "border-purple-300 ring-1 ring-purple-100"
                      : "border-border-subtle",
                  ].join(" ")}
                >
                  {/* Barra Superior: Identificação (Censurada até CONECTADO) e Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-green-moss/10 text-brand-green-moss">
                        <Icon icon={activeIsResearcher ? Building2 : GraduationCap} size={22} />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1">
                          {activeIsResearcher ? "Empresa Interessada" : "Autores / Grupo de Pesquisa"}
                          {!isFullyConnected && (
                            <span className="inline-flex items-center gap-0.5 text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded text-[9px]">
                              <Icon icon={Lock} size={10} /> Sigilo Ativo
                            </span>
                          )}
                        </span>
                        {isFullyConnected ? (
                          <h3 className="font-heading text-base font-bold text-text-primary">
                            {activeIsResearcher ? item.companyName : item.researcherName}
                          </h3>
                        ) : (
                          <h3
                            className="font-mono text-sm md:text-base font-bold text-text-secondary tracking-widest select-none"
                            title="Identidade protegida até a assinatura mútua do Termo de Responsabilidade"
                          >
                            {activeIsResearcher ? FIXED_CENSOR_COMPANY : FIXED_CENSOR_AUTHORS}
                          </h3>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs font-semibold border ${status.badgeClass}`}
                      >
                        <Icon icon={status.icon} size={13} />
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Projeto Vinculado & Vínculos (para Empresa) ou Parâmetros da Empresa (para Pesquisador) */}
                  <div className="grid gap-4 md:grid-cols-2 text-xs">
                    {/* Bloco do Projeto */}
                    <div className="rounded-2xl bg-surface-primary p-4 border border-border-subtle space-y-2">
                      <span className="font-mono text-[10px] font-bold text-brand-green-moss uppercase">
                        Nome do Projeto Científico:
                      </span>
                      <p className="font-heading text-sm font-bold text-text-primary leading-snug">
                        {item.articleTitle}
                      </p>

                      {!activeIsResearcher && (
                        <div className="pt-2 border-t border-border-subtle/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-heading font-bold uppercase text-text-secondary block">
                              Autores:
                            </span>
                            <span className="font-mono text-xs text-text-secondary font-semibold tracking-widest">
                              {isFullyConnected ? item.researcherName : FIXED_CENSOR_AUTHORS}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-heading font-bold uppercase text-text-secondary block">
                              Vínculos de Pesquisa:
                            </span>
                            <span className="font-mono text-xs text-text-secondary font-semibold tracking-widest">
                              {isFullyConnected
                                ? item.researcherAffiliation || "ICT / Universidade"
                                : FIXED_CENSOR_AFFILIATION}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bloco dos Parâmetros da Empresa (Área de Atuação, Investimento e Tempo de Execução) */}
                    <div className="rounded-2xl bg-surface-primary p-4 border border-border-subtle space-y-2.5">
                      <span className="font-mono text-[10px] font-bold text-text-secondary uppercase block">
                        {activeIsResearcher
                          ? "Informações da Empresa Interessada (Sem Identificação):"
                          : "Parâmetros Corporativos Enviados na Solicitação:"}
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-0.5">
                        <div className="rounded-xl bg-surface-white p-2.5 border border-border-subtle">
                          <span className="text-[10px] text-text-secondary font-heading font-semibold flex items-center gap-1">
                            <Icon icon={Briefcase} size={11} className="text-brand-green-moss" />
                            Área de Atuação
                          </span>
                          <p className="mt-1 font-heading font-bold text-text-primary text-xs">
                            {item.companySector}
                          </p>
                        </div>

                        <div className="rounded-xl bg-surface-white p-2.5 border border-border-subtle">
                          <span className="text-[10px] text-text-secondary font-heading font-semibold flex items-center gap-1">
                            <Icon icon={Coins} size={11} className="text-emerald-700" />
                            Investimento Disponível
                          </span>
                          <p className="mt-1 font-heading font-bold text-emerald-900 text-xs">
                            {item.investmentAmount}
                          </p>
                        </div>

                        <div className="rounded-xl bg-surface-white p-2.5 border border-border-subtle">
                          <span className="text-[10px] text-text-secondary font-heading font-semibold flex items-center gap-1">
                            <Icon icon={CalendarClock} size={11} className="text-blue-700" />
                            Tempo de Execução
                          </span>
                          <p className="mt-1 font-heading font-bold text-text-primary text-xs">
                            {item.executionTimeline}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mensagem de Apresentação */}
                  <div className="rounded-2xl bg-surface-primary/50 p-4 border border-border-subtle">
                    <span className="font-mono text-[10px] font-bold text-text-secondary uppercase block mb-1">
                      Mensagem de Apresentação:
                    </span>
                    <p className="font-body text-xs text-text-secondary leading-relaxed">
                      &ldquo;{item.message}&rdquo;
                    </p>
                    <span className="block mt-2 text-[10px] font-mono text-text-muted">
                      Solicitação registrada em: {item.createdAt}
                      {item.adminApprovedAt ? ` • Aprovada pela Central de Admin em: ${item.adminApprovedAt}` : ""}
                    </span>
                  </div>

                  {/* ===================================================================== */}
                  {/* ETAPA 3: PAINEL DE ASSINATURA DO TERMO DE RESPONSABILIDADE (SUCCESS FEE) */}
                  {/* ===================================================================== */}
                  {item.status === "AGUARDANDO_TERMO" && (
                    <div className="rounded-2xl border border-purple-300 bg-purple-50/70 p-5 space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-purple-950 font-heading text-xs font-bold uppercase">
                            <Icon icon={FileSignature} size={16} className="text-purple-700" />
                            Termo de Responsabilidade &amp; Success Fee Obrigatório
                          </div>
                          <p className="font-body text-xs text-purple-900 leading-relaxed">
                            O perfil pesquisador aceitou a conexão! Para que a conexão seja efetivada e ambos os perfis recebam as respectivas informações de contato, <strong>ambas as partes precisam assinar o Termo de Responsabilidade</strong>.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {activeIsResearcher ? (
                            !item.researcherSignedTerm ? (
                              <Button
                                size="sm"
                                onClick={() => handleOpenTermModal(item, "RESEARCHER")}
                                className="bg-purple-800 hover:bg-purple-900 !text-white text-xs font-bold shadow-xs"
                              >
                                <Icon icon={FileSignature} size={14} />
                                Assinar Termo (Pesquisador)
                              </Button>
                            ) : (
                              <span className="rounded-xl bg-emerald-100 border border-emerald-300 px-3 py-1.5 text-xs font-heading font-bold text-emerald-900">
                                ✓ Você já assinou como Pesquisador
                              </span>
                            )
                          ) : !item.companySignedTerm ? (
                            <Button
                              size="sm"
                              onClick={() => handleOpenTermModal(item, "COMPANY")}
                              className="bg-purple-800 hover:bg-purple-900 !text-white text-xs font-bold shadow-xs"
                            >
                              <Icon icon={FileSignature} size={14} />
                              Assinar Termo (Empresa)
                            </Button>
                          ) : (
                            <span className="rounded-xl bg-emerald-100 border border-emerald-300 px-3 py-1.5 text-xs font-heading font-bold text-emerald-900">
                              ✓ Você já assinou como Empresa
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status das 2 assinaturas */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-purple-200 text-xs">
                        <div className="flex items-center justify-between rounded-xl bg-surface-white px-3.5 py-2.5 border border-purple-200">
                          <span className="font-heading font-semibold text-text-primary">
                            1. Assinatura do Perfil Empresa:
                          </span>
                          {item.companySignedTerm ? (
                            <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                              ✓ Assinado ({item.companySignedAt})
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenTermModal(item, "COMPANY")}
                              className="font-mono text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2.5 py-0.5 rounded-md transition-colors cursor-pointer"
                            >
                              ⏳ Pendente (Clique para assinar)
                            </button>
                          )}
                        </div>

                        <div className="flex items-center justify-between rounded-xl bg-surface-white px-3.5 py-2.5 border border-purple-200">
                          <span className="font-heading font-semibold text-text-primary">
                            2. Assinatura do Perfil Pesquisador:
                          </span>
                          {item.researcherSignedTerm ? (
                            <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                              ✓ Assinado ({item.researcherSignedAt})
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenTermModal(item, "RESEARCHER")}
                              className="font-mono text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2.5 py-0.5 rounded-md transition-colors cursor-pointer"
                            >
                              ⏳ Pendente (Clique para assinar)
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ===================================================================== */}
                  {/* ETAPA 4: CONEXÃO EFETIVADA — INFORMAÇÕES DE CONTATO LIBERADAS         */}
                  {/* ===================================================================== */}
                  {isFullyConnected && (
                    <div className="rounded-2xl border border-emerald-300 bg-emerald-50/70 p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-950 font-heading text-xs font-bold uppercase">
                          <Icon icon={Unlock} size={16} className="text-emerald-700" />
                          Conexão Efetivada • Termo Assinado por Ambos • Contatos Liberados
                        </div>
                        <span className="text-[11px] font-mono font-semibold text-emerald-800">
                          Success Fee Ativo
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {/* Contato da Empresa */}
                        <div className="rounded-xl bg-surface-white p-4 border border-emerald-200 space-y-1.5">
                          <span className="font-mono text-[10px] font-bold uppercase text-emerald-800">
                            Dados de Contato do Perfil Empresa
                          </span>
                          <p className="font-heading text-sm font-bold text-text-primary">
                            {item.companyName}
                          </p>
                          <p className="text-text-secondary">
                            Representante: <strong>{item.companyContactName || "Gestor de Inovação"}</strong>
                          </p>
                          <p className="flex items-center gap-1.5 text-text-primary font-mono">
                            <Icon icon={Mail} size={13} className="text-emerald-700" />
                            <a href={`mailto:${item.companyEmail}`} className="underline hover:text-emerald-700">
                              {item.companyEmail || "contato@empresa.com.br"}
                            </a>
                          </p>
                          <p className="flex items-center gap-1.5 text-text-primary font-mono">
                            <Icon icon={Phone} size={13} className="text-emerald-700" />
                            <span>{item.companyPhone || "(11) 3000-0000"}</span>
                          </p>
                        </div>

                        {/* Contato do Pesquisador */}
                        <div className="rounded-xl bg-surface-white p-4 border border-emerald-200 space-y-1.5">
                          <span className="font-mono text-[10px] font-bold uppercase text-emerald-800">
                            Dados de Contato do Perfil Pesquisador
                          </span>
                          <p className="font-heading text-sm font-bold text-text-primary">
                            {item.researcherName}
                          </p>
                          <p className="text-text-secondary">
                            Vínculo: <strong>{item.researcherAffiliation || "ICT / Universidade"}</strong>
                          </p>
                          <p className="flex items-center gap-1.5 text-text-primary font-mono">
                            <Icon icon={Mail} size={13} className="text-emerald-700" />
                            <a href={`mailto:${item.researcherEmail}`} className="underline hover:text-emerald-700">
                              {item.researcherEmail || "pesquisador@universidade.edu.br"}
                            </a>
                          </p>
                          <p className="flex items-center gap-1.5 text-text-primary font-mono">
                            <Icon icon={Phone} size={13} className="text-emerald-700" />
                            <span>{item.researcherPhone || "(11) 98000-0000"}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rodapé de Ações */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-[11px] font-mono text-text-secondary flex items-center gap-1.5">
                      <Icon icon={ShieldCheck} size={14} className="text-brand-green-moss" />
                      <span>
                        {isFullyConnected
                          ? "Termo de Responsabilidade assinado por ambas as partes"
                          : "Identidades e contatos protegidos até assinatura mútua do Termo de Responsabilidade"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Se for Pesquisador e a conexão foi aprovada pelo Admin, exibe botões Aceitar / Recusar */}
                      {activeIsResearcher &&
                      (item.status === "AGUARDANDO_PESQUISADOR" || item.status === "PENDENTE") ? (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleResearcherDecision(item.id, false)}
                            className="text-xs text-red-700 hover:bg-red-50 cursor-pointer"
                          >
                            <Icon icon={XCircle} size={14} />
                            Recusar Conexão
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleResearcherDecision(item.id, true)}
                            className="bg-brand-green-dark !text-white text-xs cursor-pointer"
                          >
                            <Icon icon={CheckCircle2} size={14} />
                            Aceitar Conexão
                          </Button>
                        </>
                      ) : (
                        <Link to="/dashboard/notificacoes">
                          <Button size="sm" variant="secondary" className="text-xs">
                            <Icon icon={MessageSquare} size={14} />
                            Ver Notificações
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

      {/* ===================================================================== */}
      {/* MODAL DE ASSINATURA DO TERMO DE RESPONSABILIDADE (SUCCESS FEE)        */}
      {/* ===================================================================== */}
      {termModalConn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl rounded-3xl bg-surface-white p-6 md:p-8 shadow-2xl border border-border-subtle space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setTermModalConn(null)}
              className="absolute right-6 top-6 inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-secondary text-text-secondary hover:text-text-primary cursor-pointer"
            >
              <Icon icon={X} size={18} />
            </button>

            <div className="space-y-1 pr-8">
              <div className="flex items-center gap-2 font-heading text-xs font-bold text-purple-800 uppercase">
                <Icon icon={FileSignature} size={16} />
                Formalização Jurídica • The Bridge
              </div>
              <h3 className="font-display text-2xl font-bold text-text-primary">
                Termo de Responsabilidade, Confidencialidade e Success Fee
              </h3>
              <p className="font-body text-xs text-text-secondary">
                Assinatura digital como:{" "}
                <strong className="text-text-primary">
                  {termSignerRole === "COMPANY" ? "Perfil Empresa" : "Perfil Pesquisador"}
                </strong>
              </p>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-surface-primary p-4 text-xs space-y-1">
              <span className="font-mono text-[10px] font-bold uppercase text-brand-green-moss">
                Projeto Objeto da Conexão:
              </span>
              <p className="font-heading font-bold text-text-primary text-sm">
                {termModalConn.articleTitle}
              </p>
            </div>

            {/* Minuta Provisória do Termo (Documento em fase de elaboração jurídica definitiva) */}
            <div className="rounded-2xl border border-border-subtle bg-surface-white p-5 max-h-64 overflow-y-auto font-body text-xs text-text-secondary space-y-3 leading-relaxed shadow-inner">
              <p className="font-heading font-bold text-text-primary uppercase text-[11px]">
                MINUTA PRELIMINAR DO TERMO DE RESPONSABILIDADE E INTERMEDIAÇÃO (SUCCESS FEE)
              </p>
              <p>
                <strong>1. OBJETO DA CONEXÃO:</strong> O presente instrumento regula a disponibilização recíproca das informações de identificação e contato entre o PERFIL EMPRESA e o PERFIL PESQUISADOR, intermediada após curadoria técnica pela plataforma <strong>THE BRIDGE</strong>.
              </p>
              <p>
                <strong>2. CONFIDENCIALIDADE E PROPRIEDADE INTELECTUAL:</strong> As partes comprometem-se a manter absoluto sigilo sobre dados técnicos não públicos compartilhados a partir desta aproximação, respeitando a titularidade intelectual pré-existente dos autores e de suas respectivas Instituições Científicas e Tecnológicas (ICTs).
              </p>
              <p>
                <strong>3. COMPROMISSO DE REMUNERAÇÃO DE ÊXITO (SUCCESS FEE):</strong> As partes reconhecem que a prospecção, indexação semântica e aproximação qualificada foram realizadas pela plataforma <strong>THE BRIDGE</strong>. Na hipótese de celebração futura de contrato de pesquisa e desenvolvimento (P&amp;D), licenciamento, transferência de tecnologia, prestação de serviços técnicos ou parceria financeira decorrente desta conexão, aplica-se a cláusula de <em>Success Fee</em> nos termos contratuais da The Bridge.
              </p>
              <p>
                <strong>4. LIBERAÇÃO DE CONTATOS:</strong> As informações completas de contato de ambas as partes serão desbloqueadas automaticamente no painel assim que tanto o Perfil Empresa quanto o Perfil Pesquisador registrarem o aceite deste Termo.
              </p>
              <p className="italic text-[11px] text-text-muted">
                * Nota: Este documento é o modelo estrutural do sistema para validação de fluxo; a redação jurídica definitiva do contrato de Success Fee será inserida oportunamente.
              </p>
            </div>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-purple-200 bg-purple-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={termAcceptedCheckbox}
                onChange={(e) => setTermAcceptedCheckbox(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-purple-800 rounded cursor-pointer"
              />
              <span className="font-body text-xs text-text-primary leading-relaxed">
                Declaro que li e concordo integralmente com o <strong>Termo de Responsabilidade e Success Fee</strong>, comprometendo-me a conduzir as tratativas em conformidade com as diretrizes da The Bridge.
              </span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border-subtle">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setTermModalConn(null)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={!termAcceptedCheckbox}
                onClick={handleConfirmSignTerm}
                className="bg-brand-green-dark !text-white hover:bg-brand-green-moss"
              >
                <Icon icon={FileSignature} size={15} />
                Assinar Digitalmente o Termo
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
