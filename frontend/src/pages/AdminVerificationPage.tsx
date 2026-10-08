import { useState } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
  XCircle,
} from "lucide-react";

import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import {
  adminAuditService,
  type VerificationRequestItem,
} from "../services/adminAudit";
import { discordWebhookService } from "../services/discordWebhook";

export function AdminVerificationPage() {
  const [requests, setRequests] = useState<VerificationRequestItem[]>(() =>
    adminAuditService.getRequests()
  );
  const [statusFilter, setStatusFilter] = useState<string>("TODOS");
  const [typeFilter, setTypeFilter] = useState<string>("TODOS");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modal de rejeição / solicitação de ajustes
  const [rejectModalItem, setRejectModalItem] = useState<VerificationRequestItem | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState<string>("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Status feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [testingDiscord, setTestingDiscord] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleRefresh = () => {
    setRequests(adminAuditService.getRequests());
    showToast("Fila de auditoria sincronizada com sucesso.");
  };

  const handleTestDiscord = async () => {
    setTestingDiscord(true);
    const ok = await discordWebhookService.sendTestMessage();
    setTestingDiscord(false);
    if (ok) {
      showToast("🔔 Mensagem de teste enviada com sucesso para o canal do Discord da equipe!");
    } else {
      showToast("❌ Não foi possível conectar ao Webhook do Discord. Verifique a URL.");
    }
  };

  const handleApprove = async (item: VerificationRequestItem) => {
    setProcessingId(item.id);
    try {
      const ok = await adminAuditService.approveProfile(
        item.id,
        "Documentação e identificação validadas com sucesso pela auditoria The Bridge."
      );
      if (ok) {
        setRequests(adminAuditService.getRequests());
        showToast(`✅ Perfil de "${item.razaoSocial || item.name}" aprovado e homologado com Selo Ouro!`);
      }
    } catch (err) {
      console.error("Erro ao aprovar:", err);
      showToast("Ocorreu um erro ao aprovar o perfil.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenRejectModal = (item: VerificationRequestItem) => {
    setRejectModalItem(item);
    setRejectFeedback(
      item.profileType === "COMPANY"
        ? "Favor confirmar os dados cadastrais da empresa junto ao site corporativo ou atualizar o CNPJ."
        : "Favor atualizar o link do Currículo Lattes ou comprovar vínculo ativo com a universidade informada."
    );
  };

  const handleConfirmReject = async () => {
    if (!rejectModalItem || !rejectFeedback.trim()) return;
    setProcessingId(rejectModalItem.id);
    try {
      const ok = await adminAuditService.rejectProfile(
        rejectModalItem.id,
        rejectFeedback.trim()
      );
      if (ok) {
        setRequests(adminAuditService.getRequests());
        showToast(`⚠️ Solicitação de ajustes enviada para "${rejectModalItem.name}".`);
        setRejectModalItem(null);
        setRejectFeedback("");
      }
    } catch (err) {
      console.error("Erro ao solicitar ajustes:", err);
      showToast("Ocorreu um erro ao enviar a solicitação.");
    } finally {
      setProcessingId(null);
    }
  };

  // Filtragem
  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== "TODOS" && r.status !== statusFilter) return false;
    if (typeFilter !== "TODOS" && r.profileType !== typeFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = (r.razaoSocial || r.name || "").toLowerCase().includes(term);
      const matchEmail = (r.email || "").toLowerCase().includes(term);
      const matchDoc = (r.cnpj || r.cpf || "").replace(/\D/g, "").includes(term);
      const matchOrg = (r.university || r.industrySector || "").toLowerCase().includes(term);
      return matchName || matchEmail || matchDoc || matchOrg;
    }
    return true;
  });

  const countPending = requests.filter((r) => r.status === "EM_ANALISE").length;
  const countApproved = requests.filter((r) => r.status === "VERIFICADO").length;
  const countRejected = requests.filter((r) => r.status === "RECUSADO").length;

  return (
    <DashboardLayout
      title="Painel de Auditoria & Validação de Perfis (TI / Curadoria)"
      actions={
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleTestDiscord}
            disabled={testingDiscord}
            className="border-[#5865F2] text-[#5865F2] hover:bg-[#5865F2]/10 text-xs font-bold shadow-xs cursor-pointer"
          >
            <Icon icon={Sparkles} size={14} className="text-[#5865F2]" />
            {testingDiscord ? "Enviando..." : "Testar Webhook Discord 🔔"}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            className="text-text-primary text-xs font-semibold cursor-pointer"
          >
            <Icon icon={RefreshCw} size={14} />
            Atualizar Fila
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Toast Feedback */}
        {toastMessage && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-950 flex items-center justify-between shadow-xs animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5">
              <Icon icon={CheckCircle2} size={18} className="text-emerald-700 shrink-0" />
              <p className="font-heading text-xs font-bold">{toastMessage}</p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-emerald-800 hover:text-emerald-950 p-1"
            >
              <Icon icon={X} size={14} />
            </button>
          </div>
        )}

        {/* Overview KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border-subtle bg-surface-white p-4 shadow-xs">
            <span className="text-xs text-text-secondary font-medium block">Total de Submissões</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-heading text-text-primary">{requests.length}</span>
              <span className="text-xs text-text-secondary">cadastros</span>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-900 font-medium">Aguardando Auditoria</span>
              <Icon icon={Clock} size={16} className="text-amber-700" />
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-heading text-amber-950">{countPending}</span>
              <span className="text-xs text-amber-800 font-semibold">pendentes</span>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-900 font-medium">Perfis Homologados</span>
              <Icon icon={ShieldCheck} size={16} className="text-emerald-700" />
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-heading text-emerald-950">{countApproved}</span>
              <span className="text-xs text-emerald-800 font-semibold">Selo Ouro</span>
            </div>
          </div>

          <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-rose-900 font-medium">Ajustes Solicitados</span>
              <Icon icon={AlertCircle} size={16} className="text-rose-700" />
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-heading text-rose-950">{countRejected}</span>
              <span className="text-xs text-rose-800 font-semibold">em revisão</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="rounded-2xl border border-border-subtle bg-surface-white p-4 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-text-secondary mr-1">Status:</span>
            {[
              { id: "TODOS", label: "Todos" },
              { id: "EM_ANALISE", label: `Pendentes (${countPending})` },
              { id: "VERIFICADO", label: `Verificados (${countApproved})` },
              { id: "RECUSADO", label: `Com Ajustes (${countRejected})` },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === st.id
                    ? "bg-brand-green-dark text-brand-off-white shadow-xs"
                    : "bg-surface-primary text-text-secondary hover:text-text-primary"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-border-subtle bg-surface-primary px-3 py-2 text-xs text-text-primary focus:outline-none"
            >
              <option value="TODOS">Todos os Tipos</option>
              <option value="COMPANY">Apenas Empresas</option>
              <option value="RESEARCHER">Apenas Pesquisadores</option>
            </select>

            <div className="relative flex-1 md:w-64">
              <Icon icon={Search} size={14} className="absolute left-3 top-2.5 text-text-secondary" />
              <input
                type="text"
                placeholder="Buscar por nome, CNPJ, CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-border-subtle bg-surface-primary pl-8 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-secondary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Queue Cards */}
        {filteredRequests.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border-subtle bg-surface-white p-12 text-center">
            <Icon icon={UserCheck} size={36} className="mx-auto text-text-secondary mb-3" />
            <h3 className="font-heading text-base font-bold text-text-primary">
              Nenhuma submissão encontrada
            </h3>
            <p className="font-body text-xs text-text-secondary mt-1">
              Não há perfis correspondentes aos filtros selecionados no momento.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((item) => {
              const isCompany = item.profileType === "COMPANY";
              const isPending = item.status === "EM_ANALISE";
              const isApproved = item.status === "VERIFICADO";
              const isRejected = item.status === "RECUSADO";

              return (
                <div
                  key={item.id}
                  className={`rounded-3xl border bg-surface-white p-6 shadow-xs transition-all ${
                    isPending
                      ? "border-amber-300 ring-1 ring-amber-200"
                      : isApproved
                      ? "border-emerald-200"
                      : "border-rose-200"
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-primary border border-border-subtle overflow-hidden shrink-0">
                        {item.logoUrl ? (
                          <img
                            src={item.logoUrl}
                            alt="Logo"
                            className="h-full w-full object-contain p-1"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <Icon
                            icon={isCompany ? Building2 : GraduationCap}
                            size={22}
                            className="text-brand-green-moss"
                          />
                        )}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-heading text-base font-bold text-text-primary">
                            {item.razaoSocial || item.name}
                          </h4>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              isCompany
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {isCompany ? "EMPRESA" : "PESQUISADOR"}
                          </span>
                        </div>
                        <p className="font-body text-xs text-text-secondary mt-0.5">
                          Submetido em: {item.submittedAt}
                          {item.roleTitle && ` • ${item.roleTitle}`}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 border border-amber-300">
                          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                          Aguardando Auditoria
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900 border border-emerald-300">
                          <Icon icon={ShieldCheck} size={14} className="text-emerald-700" />
                          Homologado (Selo Ouro)
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-900 border border-rose-300">
                          <Icon icon={AlertCircle} size={14} className="text-rose-700" />
                          Ajustes Solicitados
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 text-xs">
                    {/* Column 1: Fiscal & Institution */}
                    <div className="space-y-2 bg-surface-primary/50 p-3.5 rounded-2xl border border-border-subtle">
                      <span className="font-heading font-bold text-text-primary block text-[11px] uppercase tracking-wider text-text-secondary">
                        Identificação Oficial
                      </span>
                      {isCompany ? (
                        <>
                          <div>
                            <span className="text-text-secondary block">CNPJ:</span>
                            <span className="font-mono font-bold text-text-primary">
                              {item.cnpj || "Não informado"}
                            </span>
                            {item.cnpjStatus && (
                              <span className="ml-2 inline-block rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800">
                                {item.cnpjStatus}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="text-text-secondary block">Setor de Atuação:</span>
                            <span className="font-medium text-text-primary">{item.industrySector || "Geral"}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <span className="text-text-secondary block">CPF do Pesquisador:</span>
                            <span className="font-mono font-bold text-text-primary">
                              {item.cpf || "Não informado"}
                            </span>
                          </div>
                          <div>
                            <span className="text-text-secondary block">Instituição / Universidade:</span>
                            <span className="font-medium text-text-primary">{item.university || "Não informada"}</span>
                            {item.department && (
                              <span className="text-[11px] text-text-secondary block">{item.department}</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Column 2: Contact & Responsible */}
                    <div className="space-y-2 bg-surface-primary/50 p-3.5 rounded-2xl border border-border-subtle">
                      <span className="font-heading font-bold text-text-primary block text-[11px] uppercase tracking-wider text-text-secondary">
                        Contato &amp; Responsável
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Icon icon={Mail} size={13} className="text-text-secondary shrink-0" />
                        <span className="text-text-primary break-all">{item.email}</span>
                      </div>
                      {item.phone && (
                        <div className="flex items-center gap-1.5">
                          <Icon icon={Phone} size={13} className="text-text-secondary shrink-0" />
                          <span className="text-text-primary">{item.phone}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-text-secondary block">Nome de Contato:</span>
                        <span className="font-medium text-text-primary">{item.name}</span>
                      </div>
                    </div>

                    {/* Column 3: Links & Scientific Profile */}
                    <div className="space-y-2 bg-surface-primary/50 p-3.5 rounded-2xl border border-border-subtle">
                      <span className="font-heading font-bold text-text-primary block text-[11px] uppercase tracking-wider text-text-secondary">
                        Links Institucionais
                      </span>
                      {item.website && (
                        <div>
                          <a
                            href={item.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-brand-green-moss hover:underline font-bold"
                          >
                            <span>Site Oficial da Empresa</span>
                            <Icon icon={ExternalLink} size={12} />
                          </a>
                        </div>
                      )}
                      {item.lattes && (
                        <div>
                          <a
                            href={item.lattes}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-700 hover:underline font-bold"
                          >
                            <span>Currículo Lattes CNPq</span>
                            <Icon icon={ExternalLink} size={12} />
                          </a>
                        </div>
                      )}
                      {item.linkedin && (
                        <div>
                          <a
                            href={item.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-text-secondary hover:text-text-primary"
                          >
                            <span>Perfil LinkedIn</span>
                            <Icon icon={ExternalLink} size={12} />
                          </a>
                        </div>
                      )}
                      {!item.website && !item.lattes && !item.linkedin && (
                        <span className="text-text-secondary italic">Nenhum link externo informado.</span>
                      )}
                    </div>
                  </div>

                  {/* Bio / Competences preview */}
                  {item.bio && (
                    <div className="mt-2 rounded-2xl bg-[#FAFAFA] p-3 text-xs border border-border-subtle">
                      <span className="font-heading font-bold text-text-secondary block mb-1">
                        {isCompany ? "Diretrizes de P&D / Demanda:" : "Competências e Linhas de Pesquisa:"}
                      </span>
                      <p className="text-text-primary whitespace-pre-line">{item.bio}</p>
                    </div>
                  )}

                  {/* Audit Feedback History */}
                  {item.auditFeedback && (
                    <div className="mt-3 rounded-2xl bg-amber-50 p-3 text-xs border border-amber-200 text-amber-950">
                      <span className="font-heading font-bold block mb-0.5">
                        Parecer da Auditoria ({item.auditedAt}):
                      </span>
                      <p>{item.auditFeedback}</p>
                    </div>
                  )}

                  {/* Card Actions Footer */}
                  <div className="flex flex-wrap items-center justify-end gap-3 pt-4 mt-2 border-t border-border-subtle">
                    {isPending ? (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenRejectModal(item)}
                          disabled={processingId === item.id}
                          className="border-rose-400 text-rose-800 hover:bg-rose-50 text-xs font-bold cursor-pointer"
                        >
                          <Icon icon={XCircle} size={14} className="text-rose-700" />
                          Solicitar Ajustes / Recusar
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => handleApprove(item)}
                          disabled={processingId === item.id}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer"
                        >
                          <Icon icon={ShieldCheck} size={15} />
                          {processingId === item.id ? "Aprovando..." : "Homologar & Aprovar Perfil"}
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenRejectModal(item)}
                        className="text-text-secondary text-xs font-medium cursor-pointer"
                      >
                        <Icon icon={RefreshCw} size={13} />
                        Revisar Parecer
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Solicitar Ajustes / Recusar */}
        {rejectModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-3xl bg-surface-white p-6 md:p-8 shadow-xl border border-border-subtle space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                    <Icon icon={ShieldAlert} size={18} />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-text-primary">
                      Solicitar Ajustes no Perfil
                    </h3>
                    <p className="font-body text-xs text-text-secondary">
                      {rejectModalItem.razaoSocial || rejectModalItem.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setRejectModalItem(null)}
                  className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-secondary cursor-pointer"
                >
                  <Icon icon={X} size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-text-primary">
                  Descreva o motivo da pendência. Esta mensagem será enviada na central de notificações da conta do usuário e no canal de auditoria:
                </p>

                <textarea
                  rows={4}
                  value={rejectFeedback}
                  onChange={(e) => setRejectFeedback(e.target.value)}
                  placeholder="Ex: Não identificamos o vínculo institucional ativo com a universidade informada no Currículo Lattes. Favor atualizar..."
                  className="w-full rounded-2xl border border-border-subtle bg-surface-primary p-3.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setRejectModalItem(null)}
                  className="cursor-pointer"
                >
                  Cancelar
                </Button>

                <Button
                  size="sm"
                  onClick={handleConfirmReject}
                  disabled={!rejectFeedback.trim() || processingId === rejectModalItem.id}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
                >
                  <Icon icon={Send} size={14} />
                  {processingId === rejectModalItem.id ? "Enviando..." : "Enviar Solicitação de Ajustes"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
