import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Inbox,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  Users,
  X,
  XCircle,
  ArrowRight,
  UserX,
} from "lucide-react";

import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { authService } from "../services/auth";
import {
  adminAuditService,
  type VerificationRequestItem,
  type UserRequestItem,
} from "../services/adminAudit";
import {
  connectionsService,
  type ConnectionItem,
} from "../services/connections";
import { discordWebhookService } from "../services/discordWebhook";

export function AdminVerificationPage() {
  const currentUser = authService.getStoredUser();
  const isAuthorized = adminAuditService.isAdmin(currentUser?.email);

  // ========================================================
  // ESTADOS - CENTRAL DE INTERMEDIAÇÃO DE CONEXÕES (MATCHES)
  // ========================================================
  const [adminConnections, setAdminConnections] = useState<ConnectionItem[]>(() =>
    connectionsService.getAllConnections()
  );
  const [selectedConnId, setSelectedConnId] = useState<string>(() => {
    const list = connectionsService.getAllConnections();
    return list.length > 0 ? list[0].id : "";
  });
  const [connStatusFilter, setConnStatusFilter] = useState<string>("TODOS");

  // ========================================================
  // ESTADOS - AUDITORIA DE PERFIS
  // ========================================================
  const [verifications, setVerifications] = useState<VerificationRequestItem[]>(() =>
    adminAuditService.getRequests()
  );
  const [selectedVerifId, setSelectedVerifId] = useState<string>(() => {
    const list = adminAuditService.getRequests();
    return list.length > 0 ? list[0].id : "";
  });
  const [verifStatusFilter, setVerifStatusFilter] = useState<string>("TODOS");
  const [verifTypeFilter, setVerifTypeFilter] = useState<string>("TODOS");
  const [verifSearch, setVerifSearch] = useState<string>("");

  // Modal de rejeição de auditoria
  const [rejectVerifModalItem, setRejectVerifModalItem] = useState<VerificationRequestItem | null>(null);
  const [rejectVerifFeedback, setRejectVerifFeedback] = useState<string>("");

  // ========================================================
  // ESTADOS - SOLICITAÇÕES DE USUÁRIOS (EMAIL & PERFIL)
  // ========================================================
  const [userRequests, setUserRequests] = useState<UserRequestItem[]>(() =>
    adminAuditService.getUserRequests()
  );
  const [selectedUserReqId, setSelectedUserReqId] = useState<string>(() => {
    const list = adminAuditService.getUserRequests();
    return list.length > 0 ? list[0].id : "";
  });
  const [userReqStatusFilter, setUserReqStatusFilter] = useState<string>("TODOS");
  const [userReqTypeFilter, setUserReqTypeFilter] = useState<string>("TODOS");
  const [userReqSearch, setUserReqSearch] = useState<string>("");

  // Modal de recusa de solicitação de usuário
  const [rejectUserReqModalItem, setRejectUserReqModalItem] = useState<UserRequestItem | null>(null);
  const [rejectUserReqFeedback, setRejectUserReqFeedback] = useState<string>("");

  // ========================================================
  // ESTADOS - GESTÃO DE ADMINISTRADORES
  // ========================================================
  const [adminsModalOpen, setAdminsModalOpen] = useState(false);
  const [adminEmailsList, setAdminEmailsList] = useState<string[]>(() =>
    adminAuditService.getAdminEmails()
  );
  const [newAdminEmailInput, setNewAdminEmailInput] = useState("");

  // Processamento geral e Toasts
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [testingDiscord, setTestingDiscord] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleRefreshAll = () => {
    setAdminConnections(connectionsService.getAllConnections());
    setVerifications(adminAuditService.getRequests());
    setUserRequests(adminAuditService.getUserRequests());
    setAdminEmailsList(adminAuditService.getAdminEmails());
    showToast("Dados do painel sincronizados com sucesso.");
  };

  const handleApproveConnectionPotential = (conn: ConnectionItem) => {
    connectionsService.approveConnectionByAdmin(
      conn.id,
      "Potencial de conexão validado pela Central de Admin The Bridge."
    );
    setAdminConnections(connectionsService.getAllConnections());
    showToast(
      `✅ Potencial aprovado! O pesquisador foi notificado (sem o nome da empresa, exibindo área de atuação, investimento e prazo).`
    );
  };

  const handleRejectConnectionPotential = (conn: ConnectionItem) => {
    connectionsService.rejectConnectionByAdmin(
      conn.id,
      "Após análise de potencial na Central de Admin, a solicitação não atendeu aos requisitos mínimos de alinhamento."
    );
    setAdminConnections(connectionsService.getAllConnections());
    showToast(`Solicitação de conexão recusada pela Central de Admin.`);
  };

  const handleTestDiscord = async () => {
    setTestingDiscord(true);
    const ok = await discordWebhookService.sendTestMessage();
    setTestingDiscord(false);
    if (ok) {
      showToast("🔔 Mensagem de teste enviada com sucesso para o canal do Discord!");
    } else {
      showToast("❌ Não foi possível conectar ao Webhook do Discord. Verifique a URL.");
    }
  };

  // ========================================================
  // AÇÕES - AUDITORIA DE PERFIS
  // ========================================================
  const handleApproveVerif = async (item: VerificationRequestItem) => {
    setProcessingId(item.id);
    try {
      const ok = await adminAuditService.approveProfile(
        item.id,
        "Documentação e identificação validadas com sucesso pela auditoria The Bridge."
      );
      if (ok) {
        setVerifications(adminAuditService.getRequests());
        showToast(`✅ Perfil de "${item.razaoSocial || item.name}" homologado com Selo Ouro!`);
      }
    } catch {
      showToast("Ocorreu um erro ao aprovar o perfil.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenRejectVerifModal = (item: VerificationRequestItem) => {
    setRejectVerifModalItem(item);
    setRejectVerifFeedback(
      item.profileType === "COMPANY"
        ? "Favor confirmar os dados cadastrais da empresa junto ao site corporativo ou atualizar o CNPJ."
        : "Favor atualizar o link do Currículo Lattes ou comprovar vínculo ativo com a universidade informada."
    );
  };

  const handleConfirmRejectVerif = async () => {
    if (!rejectVerifModalItem || !rejectVerifFeedback.trim()) return;
    setProcessingId(rejectVerifModalItem.id);
    try {
      const ok = await adminAuditService.rejectProfile(
        rejectVerifModalItem.id,
        rejectVerifFeedback.trim()
      );
      if (ok) {
        setVerifications(adminAuditService.getRequests());
        showToast(`⚠️ Solicitação de ajustes enviada para "${rejectVerifModalItem.name}".`);
        setRejectVerifModalItem(null);
        setRejectVerifFeedback("");
      }
    } catch {
      showToast("Ocorreu um erro ao enviar a solicitação.");
    } finally {
      setProcessingId(null);
    }
  };

  // ========================================================
  // AÇÕES - SOLICITAÇÕES DE USUÁRIOS
  // ========================================================
  const handleAcceptUserReq = async (item: UserRequestItem) => {
    setProcessingId(item.id);
    try {
      const ok = await adminAuditService.acceptUserRequest(
        item.id,
        "Solicitação validada e executada pela equipe de administração The Bridge."
      );
      if (ok) {
        setUserRequests(adminAuditService.getUserRequests());
        showToast(`✅ Solicitação de "${item.userName}" atendida com sucesso!`);
      }
    } catch {
      showToast("Erro ao processar solicitação do usuário.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenRejectUserReqModal = (item: UserRequestItem) => {
    setRejectUserReqModalItem(item);
    setRejectUserReqFeedback(
      item.type === "ALTERACAO_EMAIL"
        ? "Não foi possível confirmar a titularidade do novo e-mail informado. Por favor, envie comprovação formal."
        : "Para alteração de tipo de perfil, solicitamos o envio do contrato social da empresa ou comprovação acadêmica adicional."
    );
  };

  const handleConfirmRejectUserReq = async () => {
    if (!rejectUserReqModalItem || !rejectUserReqFeedback.trim()) return;
    setProcessingId(rejectUserReqModalItem.id);
    try {
      const ok = await adminAuditService.rejectUserRequest(
        rejectUserReqModalItem.id,
        rejectUserReqFeedback.trim()
      );
      if (ok) {
        setUserRequests(adminAuditService.getUserRequests());
        showToast(`❌ Solicitação de "${rejectUserReqModalItem.userName}" recusada com justificativa.`);
        setRejectUserReqModalItem(null);
        setRejectUserReqFeedback("");
      }
    } catch {
      showToast("Erro ao recusar solicitação.");
    } finally {
      setProcessingId(null);
    }
  };

  // ========================================================
  // AÇÕES - GESTÃO DE ADMINISTRADORES
  // ========================================================
  const handleAddAdminEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newAdminEmailInput.trim().toLowerCase();
    if (!clean || !clean.includes("@")) {
      showToast("Digite um e-mail válido.");
      return;
    }
    const ok = adminAuditService.addAdminEmail(clean);
    if (ok) {
      setAdminEmailsList(adminAuditService.getAdminEmails());
      setNewAdminEmailInput("");
      showToast(`✅ ${clean} agora possui privilégios de Admin.`);
    }
  };

  const handleRemoveAdminEmail = (email: string) => {
    if (email.toLowerCase() === "pclipe00@gmail.com") {
      showToast("O e-mail principal pclipe00@gmail.com não pode ser removido.");
      return;
    }
    adminAuditService.removeAdminEmail(email);
    setAdminEmailsList(adminAuditService.getAdminEmails());
    showToast(`Admin ${email} removido com sucesso.`);
  };

  // ========================================================
  // FILTRAGEM - AUDITORIA DE PERFIS
  // ========================================================
  const filteredVerifications = verifications.filter((r) => {
    if (verifStatusFilter !== "TODOS" && r.status !== verifStatusFilter) return false;
    if (verifTypeFilter !== "TODOS" && r.profileType !== verifTypeFilter) return false;
    if (verifSearch.trim()) {
      const term = verifSearch.toLowerCase();
      const matchName = (r.razaoSocial || r.name || "").toLowerCase().includes(term);
      const matchEmail = (r.email || "").toLowerCase().includes(term);
      const matchDoc = (r.cnpj || r.cpf || "").replace(/\D/g, "").includes(term);
      const matchOrg = (r.university || r.industrySector || "").toLowerCase().includes(term);
      return matchName || matchEmail || matchDoc || matchOrg;
    }
    return true;
  });

  const selectedVerif =
    filteredVerifications.find((r) => r.id === selectedVerifId) ||
    filteredVerifications[0] ||
    null;

  // ========================================================
  // FILTRAGEM - SOLICITAÇÕES DE USUÁRIOS
  // ========================================================
  const filteredUserRequests = userRequests.filter((r) => {
    if (userReqStatusFilter !== "TODOS" && r.status !== userReqStatusFilter) return false;
    if (userReqTypeFilter !== "TODOS" && r.type !== userReqTypeFilter) return false;
    if (userReqSearch.trim()) {
      const term = userReqSearch.toLowerCase();
      const matchName = r.userName.toLowerCase().includes(term);
      const matchEmail = r.currentEmail.toLowerCase().includes(term);
      const matchReqEmail = (r.requestedEmail || "").toLowerCase().includes(term);
      const matchJust = r.justification.toLowerCase().includes(term);
      return matchName || matchEmail || matchReqEmail || matchJust;
    }
    return true;
  });

  const selectedUserReq =
    filteredUserRequests.find((r) => r.id === selectedUserReqId) ||
    filteredUserRequests[0] ||
    null;

  const countPendingVerif = verifications.filter((r) => r.status === "EM_ANALISE").length;
  const countApprovedVerif = verifications.filter((r) => r.status === "VERIFICADO").length;
  const countRejectedVerif = verifications.filter((r) => r.status === "RECUSADO").length;

  const countPendingUserReq = userRequests.filter((r) => r.status === "PENDENTE").length;
  const countAcceptedUserReq = userRequests.filter((r) => r.status === "ACEITA").length;
  const countRejectedUserReq = userRequests.filter((r) => r.status === "RECUSADA").length;

  // Filtragem de Conexões na Central de Admin
  const filteredAdminConns = adminConnections.filter((c) => {
    if (connStatusFilter === "TODOS") return true;
    return c.status === connStatusFilter;
  });
  const selectedAdminConn =
    filteredAdminConns.find((c) => c.id === selectedConnId) ||
    filteredAdminConns[0] ||
    null;
  const countPendingAdminConns = adminConnections.filter((c) => c.status === "EM_ANALISE_ADMIN").length;
  const countInProgressConns = adminConnections.filter(
    (c) => c.status === "AGUARDANDO_PESQUISADOR" || c.status === "AGUARDANDO_TERMO"
  ).length;
  const countCompletedConns = adminConnections.filter((c) => c.status === "CONECTADO").length;

  // Caso o usuário não seja admin, exibe tela de bloqueio
  if (!isAuthorized) {
    return (
      <DashboardLayout title="Acesso Restrito">
        <div className="rounded-3xl border border-red-200 bg-surface-white p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-700 mx-auto mb-4">
            <Icon icon={UserX} size={28} />
          </div>
          <h2 className="font-heading text-lg font-bold text-text-primary">
            Acesso Restrito ao Painel de Admin
          </h2>
          <p className="font-body text-xs text-text-secondary mt-2 mb-6">
            Apenas e-mails autorizados (como <span className="font-mono font-bold text-text-primary">pclipe00@gmail.com</span>) possuem acesso administrativo à moderação da plataforma The Bridge.
          </p>
          <Button onClick={() => window.location.assign("/dashboard")} size="sm">
            Voltar ao Painel Geral
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Painel de Admin"
      actions={
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setAdminsModalOpen(true)}
            className="border-border-subtle text-text-primary hover:border-brand-green-moss text-xs font-bold shadow-xs cursor-pointer"
          >
            <Icon icon={Users} size={14} className="text-brand-green-moss" />
            Gerenciar Admins ({adminEmailsList.length})
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleTestDiscord}
            disabled={testingDiscord}
            className="border-[#5865F2] text-[#5865F2] hover:bg-[#5865F2]/10 text-xs font-bold shadow-xs cursor-pointer"
          >
            <Icon icon={Sparkles} size={14} className="text-[#5865F2]" />
            {testingDiscord ? "Enviando..." : "Testar Discord 🔔"}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefreshAll}
            className="text-text-primary text-xs font-semibold cursor-pointer"
          >
            <Icon icon={RefreshCw} size={14} />
            Atualizar
          </Button>
        </div>
      }
    >
      <div className="space-y-10">
        {/* Toast Feedback */}
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

        {/* ======================================================================== */}
        {/* CENTRAL DE ANÁLISE DE POTENCIAL DE CONEXÕES (EMPRESA ↔ PESQUISADOR)      */}
        {/* ======================================================================== */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-heading text-lg font-bold text-text-primary flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-green-dark text-white text-xs font-bold">
                  ★
                </span>
                Central de Análise de Potencial de Conexões (Matches Empresa ↔ Pesquisador)
              </h2>
              <p className="font-body text-xs text-text-secondary mt-0.5">
                Avalie o potencial estratégico das solicitações de conexão enviadas pelas empresas antes de notificar os pesquisadores.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 border border-amber-300">
                {countPendingAdminConns} Aguardando Análise Admin
              </span>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-900 border border-blue-300">
                {countInProgressConns} Em Aceite / Termo
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-900 border border-emerald-300">
                {countCompletedConns} Conectadas (Termo Assinado)
              </span>
            </div>
          </div>

          <div className="bg-surface-white rounded-3xl border border-border-subtle shadow-xs overflow-hidden min-h-[500px] flex flex-col">
            {/* Barra de Filtros de Status da Conexão */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-5 py-3 bg-surface-primary">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-heading font-semibold text-text-secondary mr-1">Etapa:</span>
                {[
                  { id: "TODOS", label: `Todas (${adminConnections.length})` },
                  { id: "EM_ANALISE_ADMIN", label: `Para Aprovar Potencial (${countPendingAdminConns})` },
                  { id: "AGUARDANDO_PESQUISADOR", label: "Com o Pesquisador" },
                  { id: "AGUARDANDO_TERMO", label: "Aguardando Termo (Success Fee)" },
                  { id: "CONECTADO", label: "Conectadas" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setConnStatusFilter(tab.id)}
                    className={`rounded-full px-2.5 py-1 text-xs font-heading font-medium transition-all cursor-pointer ${
                      connStatusFilter === tab.id
                        ? "bg-brand-green-dark text-white font-bold"
                        : "bg-surface-white border border-border-subtle text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Master-Detail das Conexões */}
            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1">
              {/* Lista lateral esquerda */}
              <div className="lg:col-span-4 border-r border-border-subtle overflow-y-auto max-h-[560px] divide-y divide-border-subtle bg-surface-primary/25">
                {filteredAdminConns.length === 0 ? (
                  <div className="p-10 text-center text-text-secondary">
                    <Icon icon={Inbox} size={28} className="mx-auto text-text-muted mb-2" />
                    <p className="text-xs font-heading font-semibold">Nenhuma solicitação nesta etapa</p>
                  </div>
                ) : (
                  filteredAdminConns.map((conn) => {
                    const isSelected = selectedAdminConn?.id === conn.id;
                    return (
                      <button
                        key={conn.id}
                        type="button"
                        onClick={() => setSelectedConnId(conn.id)}
                        className={`w-full text-left p-4 transition-all flex flex-col gap-1.5 cursor-pointer ${
                          isSelected
                            ? "bg-emerald-50/80 border-l-4 border-l-brand-green-dark"
                            : "hover:bg-surface-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-heading text-xs font-bold text-text-primary truncate">
                            {conn.companyName}
                          </span>
                          <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                            {conn.matchScore}% Match
                          </span>
                        </div>

                        <p className="font-body text-[11px] text-text-secondary line-clamp-2 font-medium">
                          Projeto: {conn.articleTitle}
                        </p>

                        <div className="flex items-center justify-between pt-1 text-[10px] font-mono">
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              conn.status === "EM_ANALISE_ADMIN"
                                ? "bg-amber-100 text-amber-900"
                                : conn.status === "AGUARDANDO_PESQUISADOR"
                                ? "bg-blue-100 text-blue-900"
                                : conn.status === "AGUARDANDO_TERMO"
                                ? "bg-purple-100 text-purple-900"
                                : conn.status === "CONECTADO"
                                ? "bg-emerald-100 text-emerald-900"
                                : "bg-rose-100 text-rose-900"
                            }`}
                          >
                            {conn.status === "EM_ANALISE_ADMIN"
                              ? "Aguardando Admin"
                              : conn.status === "AGUARDANDO_PESQUISADOR"
                              ? "Com Pesquisador"
                              : conn.status === "AGUARDANDO_TERMO"
                              ? "Aguardando Termo"
                              : conn.status === "CONECTADO"
                              ? "Conectado"
                              : "Recusada"}
                          </span>
                          <span className="text-text-muted">{conn.createdAt}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Detalhe completo à direita (Visão aberta para o Admin) */}
              <div className="lg:col-span-8 p-6 flex flex-col justify-between bg-surface-white">
                {selectedAdminConn ? (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border-subtle pb-4">
                      <div>
                        <span className="font-mono text-[10px] font-bold uppercase text-brand-green-moss">
                          Dossiê Completo de Matchmaking (Visão Exclusiva Admin)
                        </span>
                        <h3 className="font-heading text-base md:text-lg font-bold text-text-primary mt-0.5">
                          {selectedAdminConn.articleTitle}
                        </h3>
                      </div>
                      <span className="rounded-xl bg-emerald-100 text-emerald-900 font-mono text-xs font-bold px-3 py-1">
                        {selectedAdminConn.matchScore}% Afinidade
                      </span>
                    </div>

                    {/* Grid Lado a Lado: Perfil Empresa vs Perfil Pesquisador */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Dados Completos da Empresa */}
                      <div className="rounded-2xl border border-border-subtle bg-surface-primary p-4 space-y-2">
                        <div className="flex items-center gap-2 font-heading font-bold text-text-primary uppercase text-[11px] text-blue-900">
                          <Icon icon={Building2} size={14} />
                          Perfil Empresa Solicitante (Dados Abertos ao Admin)
                        </div>
                        <p className="font-heading font-bold text-sm text-text-primary">
                          {selectedAdminConn.companyName}
                        </p>
                        <div className="space-y-1 text-text-secondary">
                          <p><strong>Área de Atuação:</strong> {selectedAdminConn.companySector}</p>
                          <p><strong>Capacidade de Investimento:</strong> <span className="text-emerald-800 font-bold">{selectedAdminConn.investmentAmount}</span></p>
                          <p><strong>Tempo Desejável de Execução:</strong> {selectedAdminConn.executionTimeline}</p>
                          <p><strong>E-mail Corporativo:</strong> {selectedAdminConn.companyEmail || "contato@empresa.com.br"}</p>
                          <p><strong>Telefone:</strong> {selectedAdminConn.companyPhone || "(11) 3000-0000"}</p>
                        </div>
                      </div>

                      {/* Dados Completos do Pesquisador */}
                      <div className="rounded-2xl border border-border-subtle bg-surface-primary p-4 space-y-2">
                        <div className="flex items-center gap-2 font-heading font-bold text-text-primary uppercase text-[11px] text-emerald-900">
                          <Icon icon={GraduationCap} size={14} />
                          Perfil Pesquisador &amp; Projeto (Dados Abertos ao Admin)
                        </div>
                        <p className="font-heading font-bold text-sm text-text-primary">
                          {selectedAdminConn.researcherName}
                        </p>
                        <div className="space-y-1 text-text-secondary">
                          <p><strong>Vínculos Institucionais:</strong> {selectedAdminConn.researcherAffiliation || "ICT / Universidade"}</p>
                          <p><strong>E-mail do Pesquisador:</strong> {selectedAdminConn.researcherEmail || "pesquisador@universidade.edu.br"}</p>
                          <p><strong>Evento / Base:</strong> {selectedAdminConn.articleEvent || "Acervo The Bridge"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Mensagem da Empresa */}
                    <div className="rounded-2xl border border-border-subtle bg-surface-primary/50 p-4 text-xs space-y-1">
                      <span className="font-mono text-[10px] font-bold uppercase text-text-secondary">
                        Mensagem de Apresentação da Empresa:
                      </span>
                      <p className="font-body text-text-primary leading-relaxed">
                        &ldquo;{selectedAdminConn.message}&rdquo;
                      </p>
                    </div>

                    {/* Status das Assinaturas do Termo se em AGUARDANDO_TERMO ou CONECTADO */}
                    {(selectedAdminConn.status === "AGUARDANDO_TERMO" ||
                      selectedAdminConn.status === "CONECTADO") && (
                      <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-3.5 text-xs flex flex-wrap items-center justify-between gap-2">
                        <span className="font-heading font-bold text-purple-950">
                          Status do Termo de Responsabilidade (Success Fee):
                        </span>
                        <div className="flex items-center gap-3 font-mono text-[11px]">
                          <span className={selectedAdminConn.companySignedTerm ? "text-emerald-800 font-bold" : "text-amber-800"}>
                            Empresa: {selectedAdminConn.companySignedTerm ? "✓ Assinado" : "⏳ Pendente"}
                          </span>
                          <span>|</span>
                          <span className={selectedAdminConn.researcherSignedTerm ? "text-emerald-800 font-bold" : "text-amber-800"}>
                            Pesquisador: {selectedAdminConn.researcherSignedTerm ? "✓ Assinado" : "⏳ Pendente"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Botões de Ação do Admin */}
                    <div className="pt-3 border-t border-border-subtle flex flex-wrap items-center justify-between gap-3">
                      <span className="text-[11px] font-body text-text-secondary">
                        Ao aprovar, o pesquisador será notificado com a Área de Atuação, Investimento e Prazo (sem o nome da empresa).
                      </span>

                      {selectedAdminConn.status === "EM_ANALISE_ADMIN" ? (
                        <div className="flex items-center gap-2.5">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleRejectConnectionPotential(selectedAdminConn)}
                            className="text-xs text-rose-700 hover:bg-rose-50 cursor-pointer"
                          >
                            <Icon icon={XCircle} size={14} />
                            Recusar Potencial
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApproveConnectionPotential(selectedAdminConn)}
                            className="bg-brand-green-dark !text-white hover:bg-brand-green-moss text-xs font-bold cursor-pointer"
                          >
                            <Icon icon={CheckCircle2} size={14} />
                            Aprovar Potencial e Notificar Pesquisador
                          </Button>
                        </div>
                      ) : (
                        <span className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-heading font-bold text-emerald-900">
                          ✓ Potencial já analisado ({selectedAdminConn.status})
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-text-secondary">
                    Selecione uma solicitação de conexão à esquerda para avaliar o potencial.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SEÇÃO 1: AUDITORIA DE VERACIDADE DE PERFIS (ESTILO EMAIL) */}
        {/* ======================================================== */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-heading text-lg font-bold text-text-primary flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                  1
                </span>
                Auditoria de Veracidade de Perfis
              </h2>
              <p className="font-body text-xs text-text-secondary mt-0.5">
                Avaliação cadastral de empresas e pesquisadores que solicitaram o Selo Verificado (Ouro).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 border border-amber-300">
                {countPendingVerif} Pendentes
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-900 border border-emerald-300">
                {countApprovedVerif} Ouro
              </span>
              {countRejectedVerif > 0 && (
                <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-900 border border-rose-300">
                  {countRejectedVerif} Ajustes
                </span>
              )}
            </div>
          </div>

          {/* Email-like Master-Detail Card */}
          <div className="bg-surface-white rounded-3xl border border-border-subtle shadow-xs overflow-hidden min-h-[560px] flex flex-col">
            {/* Subheader Filters Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-5 py-3 bg-surface-primary">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-heading font-semibold text-text-secondary mr-1">Status:</span>
                {[
                  { id: "TODOS", label: "Todas" },
                  { id: "EM_ANALISE", label: `Pendentes (${countPendingVerif})` },
                  { id: "VERIFICADO", label: `Verificadas (${countApprovedVerif})` },
                  { id: "RECUSADO", label: `Com Ajustes (${countRejectedVerif})` },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setVerifStatusFilter(st.id)}
                    className={`rounded-full px-2.5 py-1 text-xs font-heading font-medium transition-all cursor-pointer ${
                      verifStatusFilter === st.id
                        ? "bg-brand-green-dark text-white font-bold"
                        : "bg-surface-white border border-border-subtle text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={verifTypeFilter}
                  onChange={(e) => setVerifTypeFilter(e.target.value)}
                  className="rounded-xl border border-border-subtle bg-surface-white px-2.5 py-1 text-xs text-text-primary focus:outline-none"
                >
                  <option value="TODOS">Todos os Tipos</option>
                  <option value="COMPANY">Empresas</option>
                  <option value="RESEARCHER">Pesquisadores</option>
                </select>

                <div className="relative flex-1 sm:w-56">
                  <Icon icon={Search} size={13} className="absolute left-2.5 top-2 text-text-secondary" />
                  <input
                    type="text"
                    placeholder="Buscar nome, CNPJ, CPF..."
                    value={verifSearch}
                    onChange={(e) => setVerifSearch(e.target.value)}
                    className="w-full rounded-xl border border-border-subtle bg-surface-white pl-7 pr-2.5 py-1 text-xs text-text-primary placeholder:text-text-secondary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1">
              {/* Left Column: List */}
              <div className="lg:col-span-5 border-r border-border-subtle overflow-y-auto max-h-[640px] divide-y divide-border-subtle bg-surface-primary/20">
                {filteredVerifications.length === 0 ? (
                  <div className="p-10 text-center text-text-secondary">
                    <Icon icon={Inbox} size={32} className="mx-auto text-text-secondary mb-2" />
                    <p className="text-xs font-heading font-semibold">Nenhuma submissão encontrada</p>
                  </div>
                ) : (
                  filteredVerifications.map((item) => {
                    const isSelected = selectedVerif?.id === item.id;
                    const isCompany = item.profileType === "COMPANY";
                    const isPending = item.status === "EM_ANALISE";
                    const isApproved = item.status === "VERIFICADO";

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedVerifId(item.id)}
                        className={`w-full text-left p-4 transition-all cursor-pointer block ${
                          isSelected
                            ? "bg-white border-l-4 border-l-brand-green-moss shadow-xs"
                            : "hover:bg-surface-secondary/60"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-white border border-border-subtle overflow-hidden shrink-0 mt-0.5">
                            {item.logoUrl ? (
                              <img
                                src={item.logoUrl}
                                alt="Logo"
                                className="h-full w-full object-contain p-0.5"
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <Icon
                                icon={isCompany ? Building2 : GraduationCap}
                                size={18}
                                className="text-brand-green-moss"
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="font-heading text-xs font-bold text-text-primary truncate">
                                {item.razaoSocial || item.name}
                              </h4>
                              <span className="text-[10px] font-mono text-text-secondary shrink-0">
                                {item.submittedAt.split(" ")[0]}
                              </span>
                            </div>

                            <p className="text-[11px] font-mono text-text-secondary truncate mt-0.5">
                              {isCompany ? item.cnpj || "Sem CNPJ" : item.cpf || "Sem CPF"}
                              {item.university && ` • ${item.university}`}
                            </p>

                            <div className="flex items-center gap-1.5 mt-2">
                              <span
                                className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                  isCompany ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {isCompany ? "EMPRESA" : "PESQUISADOR"}
                              </span>

                              {isPending && (
                                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-900 border border-amber-300">
                                  ⏳ Pendente
                                </span>
                              )}
                              {isApproved && (
                                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-900 border border-emerald-300">
                                  ✓ Ouro
                                </span>
                              )}
                              {item.status === "RECUSADO" && (
                                <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-900 border border-rose-300">
                                  ✕ Ajustes
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Right Column: Detailed Reading Pane */}
              <div className="lg:col-span-7 p-6 flex flex-col justify-between overflow-y-auto max-h-[640px] bg-white">
                {selectedVerif ? (
                  <div className="space-y-5">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-primary border border-border-subtle overflow-hidden shrink-0">
                          {selectedVerif.logoUrl ? (
                            <img
                              src={selectedVerif.logoUrl}
                              alt="Logo"
                              className="h-full w-full object-contain p-1"
                            />
                          ) : (
                            <Icon
                              icon={selectedVerif.profileType === "COMPANY" ? Building2 : GraduationCap}
                              size={22}
                              className="text-brand-green-moss"
                            />
                          )}
                        </div>
                        <div>
                          <h3 className="font-heading text-base font-bold text-text-primary">
                            {selectedVerif.razaoSocial || selectedVerif.name}
                          </h3>
                          <p className="font-body text-xs text-text-secondary">
                            Submetido em: {selectedVerif.submittedAt}
                            {selectedVerif.roleTitle && ` • ${selectedVerif.roleTitle}`}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 self-start sm:self-center rounded-full px-3 py-1 text-xs font-bold ${
                          selectedVerif.status === "EM_ANALISE"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : selectedVerif.status === "VERIFICADO"
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : "bg-rose-100 text-rose-900 border border-rose-300"
                        }`}
                      >
                        {selectedVerif.status === "EM_ANALISE" && "Aguardando Auditoria ⏳"}
                        {selectedVerif.status === "VERIFICADO" && "Homologado (Selo Ouro) ✓"}
                        {selectedVerif.status === "RECUSADO" && "Ajustes Solicitados ⚠️"}
                      </span>
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Box 1: Fiscal */}
                      <div className="rounded-2xl border border-border-subtle bg-surface-primary/40 p-3.5 space-y-1.5">
                        <span className="font-heading font-bold text-[10px] uppercase tracking-wider text-text-secondary block">
                          Identificação Fiscal &amp; Oficial
                        </span>
                        {selectedVerif.profileType === "COMPANY" ? (
                          <>
                            <div>
                              <span className="text-text-secondary">CNPJ: </span>
                              <span className="font-mono font-bold text-text-primary">{selectedVerif.cnpj}</span>
                              {selectedVerif.cnpjStatus && (
                                <span className="ml-2 rounded bg-emerald-100 px-1 text-[10px] font-bold text-emerald-800">
                                  {selectedVerif.cnpjStatus}
                                </span>
                              )}
                            </div>
                            <div>
                              <span className="text-text-secondary">Setor: </span>
                              <span className="text-text-primary font-medium">{selectedVerif.industrySector || "Geral"}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <span className="text-text-secondary">CPF: </span>
                              <span className="font-mono font-bold text-text-primary">{selectedVerif.cpf}</span>
                            </div>
                            <div>
                              <span className="text-text-secondary">Instituição: </span>
                              <span className="text-text-primary font-medium">{selectedVerif.university}</span>
                            </div>
                            {selectedVerif.department && (
                              <p className="text-[11px] text-text-secondary">{selectedVerif.department}</p>
                            )}
                          </>
                        )}
                      </div>

                      {/* Box 2: Contato */}
                      <div className="rounded-2xl border border-border-subtle bg-surface-primary/40 p-3.5 space-y-1.5">
                        <span className="font-heading font-bold text-[10px] uppercase tracking-wider text-text-secondary block">
                          Contato &amp; Responsável
                        </span>
                        <div>
                          <span className="text-text-secondary">Nome: </span>
                          <span className="text-text-primary font-medium">{selectedVerif.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-text-primary">
                          <Icon icon={Mail} size={12} className="text-text-secondary" />
                          <span className="break-all">{selectedVerif.email}</span>
                        </div>
                        {selectedVerif.phone && (
                          <div className="flex items-center gap-1.5 text-text-primary">
                            <Icon icon={Phone} size={12} className="text-text-secondary" />
                            <span>{selectedVerif.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Institutional Links */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {selectedVerif.website && (
                        <a
                          href={selectedVerif.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-white px-3 py-1.5 font-bold text-brand-green-moss hover:bg-emerald-50 transition-colors"
                        >
                          <span>Site da Empresa</span>
                          <Icon icon={ExternalLink} size={12} />
                        </a>
                      )}
                      {selectedVerif.lattes && (
                        <a
                          href={selectedVerif.lattes}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-white px-3 py-1.5 font-bold text-blue-700 hover:bg-blue-50 transition-colors"
                        >
                          <span>Currículo Lattes CNPq</span>
                          <Icon icon={ExternalLink} size={12} />
                        </a>
                      )}
                      {selectedVerif.linkedin && (
                        <a
                          href={selectedVerif.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-white px-3 py-1.5 font-medium text-text-secondary hover:text-text-primary transition-colors"
                        >
                          <span>LinkedIn</span>
                          <Icon icon={ExternalLink} size={12} />
                        </a>
                      )}
                    </div>

                    {/* Bio / Apresentação */}
                    {selectedVerif.bio && (
                      <div className="rounded-2xl border border-border-subtle bg-surface-primary/30 p-3.5 text-xs">
                        <span className="font-heading font-bold text-text-secondary block mb-1">
                          {selectedVerif.profileType === "COMPANY" ? "Diretrizes de P&D / Inovação:" : "Competências e Linhas de Pesquisa:"}
                        </span>
                        <p className="text-text-primary whitespace-pre-line leading-relaxed">{selectedVerif.bio}</p>
                      </div>
                    )}

                    {/* Histórico de Parecer */}
                    {selectedVerif.auditFeedback && (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-950">
                        <span className="font-heading font-bold block mb-1">
                          Parecer da Auditoria ({selectedVerif.auditedAt}):
                        </span>
                        <p>{selectedVerif.auditFeedback}</p>
                      </div>
                    )}

                    {/* Actions Bar */}
                    <div className="pt-4 border-t border-border-subtle flex flex-wrap items-center justify-end gap-3">
                      {selectedVerif.status === "EM_ANALISE" ? (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenRejectVerifModal(selectedVerif)}
                            disabled={processingId === selectedVerif.id}
                            className="border-rose-400 text-rose-800 hover:bg-rose-50 text-xs font-bold cursor-pointer"
                          >
                            <Icon icon={XCircle} size={14} className="text-rose-700" />
                            Solicitar Ajustes / Recusar
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => handleApproveVerif(selectedVerif)}
                            disabled={processingId === selectedVerif.id}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer"
                          >
                            <Icon icon={ShieldCheck} size={15} />
                            {processingId === selectedVerif.id ? "Aprovando..." : "Homologar & Aprovar (Selo Ouro)"}
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenRejectVerifModal(selectedVerif)}
                          className="text-text-secondary text-xs font-medium cursor-pointer"
                        >
                          <Icon icon={RefreshCw} size={13} />
                          Revisar Parecer
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-text-secondary">
                    <p className="text-xs">Selecione uma submissão à esquerda para visualizar os detalhes.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SEÇÃO 2: SOLICITAÇÕES DE USUÁRIOS (EMAIL & PERFIL)       */}
        {/* ======================================================== */}
        <div className="space-y-4 pt-6 border-t border-border-subtle">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-heading text-lg font-bold text-text-primary flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-800 text-xs font-bold">
                  2
                </span>
                Solicitações de Usuários (E-mail &amp; Perfil)
              </h2>
              <p className="font-body text-xs text-text-secondary mt-0.5">
                Pedidos de alteração de e-mail de acesso e migração de tipo de conta (Pesquisador ➔ Empresa ou vice-versa).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 border border-amber-300">
                {countPendingUserReq} Pendentes
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-900 border border-emerald-300">
                {countAcceptedUserReq} Atendidas
              </span>
              {countRejectedUserReq > 0 && (
                <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-900 border border-rose-300">
                  {countRejectedUserReq} Recusadas
                </span>
              )}
            </div>
          </div>

          {/* Email-like Master-Detail Card */}
          <div className="bg-surface-white rounded-3xl border border-border-subtle shadow-xs overflow-hidden min-h-[500px] flex flex-col">
            {/* Subheader Filters Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-5 py-3 bg-surface-primary">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-heading font-semibold text-text-secondary mr-1">Status:</span>
                {[
                  { id: "TODOS", label: "Todas" },
                  { id: "PENDENTE", label: `Pendentes (${countPendingUserReq})` },
                  { id: "ACEITA", label: `Atendidas (${countAcceptedUserReq})` },
                  { id: "RECUSADA", label: `Recusadas (${countRejectedUserReq})` },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setUserReqStatusFilter(st.id)}
                    className={`rounded-full px-2.5 py-1 text-xs font-heading font-medium transition-all cursor-pointer ${
                      userReqStatusFilter === st.id
                        ? "bg-brand-green-dark text-white font-bold"
                        : "bg-surface-white border border-border-subtle text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={userReqTypeFilter}
                  onChange={(e) => setUserReqTypeFilter(e.target.value)}
                  className="rounded-xl border border-border-subtle bg-surface-white px-2.5 py-1 text-xs text-text-primary focus:outline-none"
                >
                  <option value="TODOS">Todos os Tipos</option>
                  <option value="ALTERACAO_EMAIL">Troca de E-mail</option>
                  <option value="MUDANCA_PERFIL">Mudança de Perfil</option>
                </select>

                <div className="relative flex-1 sm:w-56">
                  <Icon icon={Search} size={13} className="absolute left-2.5 top-2 text-text-secondary" />
                  <input
                    type="text"
                    placeholder="Buscar usuário, e-mail..."
                    value={userReqSearch}
                    onChange={(e) => setUserReqSearch(e.target.value)}
                    className="w-full rounded-xl border border-border-subtle bg-surface-white pl-7 pr-2.5 py-1 text-xs text-text-primary placeholder:text-text-secondary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1">
              {/* Left Column: List */}
              <div className="lg:col-span-5 border-r border-border-subtle overflow-y-auto max-h-[580px] divide-y divide-border-subtle bg-surface-primary/20">
                {filteredUserRequests.length === 0 ? (
                  <div className="p-10 text-center text-text-secondary">
                    <Icon icon={Inbox} size={32} className="mx-auto text-text-secondary mb-2" />
                    <p className="text-xs font-heading font-semibold">Nenhuma solicitação encontrada</p>
                  </div>
                ) : (
                  filteredUserRequests.map((item) => {
                    const isSelected = selectedUserReq?.id === item.id;
                    const isEmailChange = item.type === "ALTERACAO_EMAIL";
                    const isPending = item.status === "PENDENTE";
                    const isAccepted = item.status === "ACEITA";

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedUserReqId(item.id)}
                        className={`w-full text-left p-4 transition-all cursor-pointer block ${
                          isSelected
                            ? "bg-white border-l-4 border-l-brand-green-moss shadow-xs"
                            : "hover:bg-surface-secondary/60"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl border border-border-subtle shrink-0 mt-0.5 ${
                              isEmailChange ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                            }`}
                          >
                            <Icon icon={isEmailChange ? Mail : UserCheck} size={18} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="font-heading text-xs font-bold text-text-primary truncate">
                                {item.userName}
                              </h4>
                              <span className="text-[10px] font-mono text-text-secondary shrink-0">
                                {item.submittedAt.split(" ")[0]}
                              </span>
                            </div>

                            <p className="text-[11px] text-text-secondary truncate mt-0.5">
                              {isEmailChange ? `Novo: ${item.requestedEmail}` : `Novo: ${item.requestedProfileType === "COMPANY" ? "Empresa" : "Pesquisador"}`}
                            </p>

                            <div className="flex items-center gap-1.5 mt-2">
                              <span
                                className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                  isEmailChange ? "bg-blue-100 text-blue-900" : "bg-purple-100 text-purple-900"
                                }`}
                              >
                                {isEmailChange ? "TROCA DE E-MAIL" : "MUDANÇA DE PERFIL"}
                              </span>

                              {isPending && (
                                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-900 border border-amber-300">
                                  ⏳ Pendente
                                </span>
                              )}
                              {isAccepted && (
                                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-900 border border-emerald-300">
                                  ✓ Atendida
                                </span>
                              )}
                              {item.status === "RECUSADA" && (
                                <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-900 border border-rose-300">
                                  ✕ Recusada
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Right Column: Detailed Reading Pane */}
              <div className="lg:col-span-7 p-6 flex flex-col justify-between overflow-y-auto max-h-[580px] bg-white">
                {selectedUserReq ? (
                  <div className="space-y-5">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-border-subtle shrink-0 ${
                            selectedUserReq.type === "ALTERACAO_EMAIL" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                          }`}
                        >
                          <Icon icon={selectedUserReq.type === "ALTERACAO_EMAIL" ? Mail : UserCheck} size={20} />
                        </div>
                        <div>
                          <h3 className="font-heading text-base font-bold text-text-primary">
                            {selectedUserReq.title}
                          </h3>
                          <p className="font-body text-xs text-text-secondary">
                            Solicitante: <span className="font-semibold text-text-primary">{selectedUserReq.userName}</span> • {selectedUserReq.submittedAt}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 self-start sm:self-center rounded-full px-3 py-1 text-xs font-bold ${
                          selectedUserReq.status === "PENDENTE"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : selectedUserReq.status === "ACEITA"
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : "bg-rose-100 text-rose-900 border border-rose-300"
                        }`}
                      >
                        {selectedUserReq.status === "PENDENTE" && "Aguardando Análise ⏳"}
                        {selectedUserReq.status === "ACEITA" && "Solicitação Aceita ✓"}
                        {selectedUserReq.status === "RECUSADA" && "Solicitação Recusada ✕"}
                      </span>
                    </div>

                    {/* Comparativo de Alteração */}
                    <div className="rounded-2xl border border-border-subtle bg-surface-primary/40 p-4 space-y-3">
                      <span className="font-heading font-bold text-[10px] uppercase tracking-wider text-text-secondary block">
                        Comparativo do Ajuste Solicitado
                      </span>

                      {selectedUserReq.type === "ALTERACAO_EMAIL" ? (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs">
                          <div className="rounded-xl border border-border-subtle bg-white p-3 flex-1">
                            <span className="text-text-secondary block text-[11px] mb-0.5">E-mail Atual Cadastrado:</span>
                            <span className="font-mono font-medium text-text-primary break-all">{selectedUserReq.currentEmail}</span>
                          </div>
                          <Icon icon={ArrowRight} size={18} className="text-text-secondary hidden sm:block shrink-0" />
                          <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3 flex-1">
                            <span className="text-blue-900 block text-[11px] font-bold mb-0.5">Novo E-mail Solicitado:</span>
                            <span className="font-mono font-bold text-blue-950 break-all">{selectedUserReq.requestedEmail}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs">
                          <div className="rounded-xl border border-border-subtle bg-white p-3 flex-1">
                            <span className="text-text-secondary block text-[11px] mb-0.5">Perfil Atual:</span>
                            <span className="font-bold text-text-primary">
                              {selectedUserReq.currentProfileType === "COMPANY" ? "Empresa (PJ)" : "Pesquisador (PF)"}
                            </span>
                          </div>
                          <Icon icon={ArrowRight} size={18} className="text-text-secondary hidden sm:block shrink-0" />
                          <div className="rounded-xl border border-purple-200 bg-purple-50/80 p-3 flex-1">
                            <span className="text-purple-900 block text-[11px] font-bold mb-0.5">Novo Perfil Pretendido:</span>
                            <span className="font-bold text-purple-950">
                              {selectedUserReq.requestedProfileType === "COMPANY" ? "Empresa (PJ)" : "Pesquisador (PF)"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Justificativa do Usuário */}
                    <div className="rounded-2xl border border-border-subtle bg-surface-primary/30 p-4 text-xs space-y-1.5">
                      <span className="font-heading font-bold text-text-secondary block">
                        Justificativa Enviada pelo Usuário:
                      </span>
                      <p className="text-text-primary leading-relaxed whitespace-pre-line bg-white p-3 rounded-xl border border-border-subtle">
                        "{selectedUserReq.justification}"
                      </p>
                    </div>

                    {/* Parecer do TI */}
                    {selectedUserReq.auditFeedback && (
                      <div className="rounded-2xl border border-border-subtle bg-surface-primary p-3.5 text-xs text-text-primary">
                        <span className="font-heading font-bold block mb-1">
                          Parecer da Administração ({selectedUserReq.auditedAt}):
                        </span>
                        <p>{selectedUserReq.auditFeedback}</p>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="pt-4 border-t border-border-subtle flex flex-wrap items-center justify-end gap-3">
                      {selectedUserReq.status === "PENDENTE" ? (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenRejectUserReqModal(selectedUserReq)}
                            disabled={processingId === selectedUserReq.id}
                            className="border-rose-400 text-rose-800 hover:bg-rose-50 text-xs font-bold cursor-pointer"
                          >
                            <Icon icon={XCircle} size={14} className="text-rose-700" />
                            Recusar com Justificativa
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => handleAcceptUserReq(selectedUserReq)}
                            disabled={processingId === selectedUserReq.id}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer"
                          >
                            <Icon icon={CheckCircle2} size={15} />
                            {processingId === selectedUserReq.id ? "Processando..." : "Aceitar Solicitação"}
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-text-secondary font-medium italic">
                          Solicitação finalizada em {selectedUserReq.auditedAt}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-text-secondary">
                    <p className="text-xs">Selecione uma solicitação à esquerda para visualizar os detalhes.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MODAL 1: RECUSAR / SOLICITAR AJUSTES EM AUDITORIA       */}
        {/* ======================================================== */}
        {rejectVerifModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-3xl bg-surface-white p-6 md:p-8 shadow-xl border border-border-subtle space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                    <Icon icon={ShieldAlert} size={18} />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-text-primary">
                      Solicitar Ajustes na Auditoria
                    </h3>
                    <p className="font-body text-xs text-text-secondary">
                      {rejectVerifModalItem.razaoSocial || rejectVerifModalItem.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setRejectVerifModalItem(null)}
                  className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-secondary cursor-pointer"
                >
                  <Icon icon={X} size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-text-primary">
                  Descreva o motivo da pendência. Esta mensagem será enviada na central de notificações da conta do usuário e no canal do Discord:
                </p>

                <textarea
                  rows={4}
                  value={rejectVerifFeedback}
                  onChange={(e) => setRejectVerifFeedback(e.target.value)}
                  placeholder="Ex: Não identificamos o vínculo institucional ativo com a universidade..."
                  className="w-full rounded-2xl border border-border-subtle bg-surface-primary p-3.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setRejectVerifModalItem(null)}
                  className="cursor-pointer"
                >
                  Cancelar
                </Button>

                <Button
                  size="sm"
                  onClick={handleConfirmRejectVerif}
                  disabled={!rejectVerifFeedback.trim() || processingId === rejectVerifModalItem.id}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
                >
                  <Icon icon={Send} size={14} />
                  {processingId === rejectVerifModalItem.id ? "Enviando..." : "Enviar Solicitação de Ajustes"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 2: RECUSAR SOLICITAÇÃO DE USUÁRIO                  */}
        {/* ======================================================== */}
        {rejectUserReqModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-3xl bg-surface-white p-6 md:p-8 shadow-xl border border-border-subtle space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-800">
                    <Icon icon={XCircle} size={18} />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-text-primary">
                      Recusar Solicitação com Justificativa
                    </h3>
                    <p className="font-body text-xs text-text-secondary">
                      {rejectUserReqModalItem.userName} ({rejectUserReqModalItem.title})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setRejectUserReqModalItem(null)}
                  className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-secondary cursor-pointer"
                >
                  <Icon icon={X} size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-text-primary">
                  Informe a justificativa formal para a recusa. O usuário receberá esta explicação em suas notificações:
                </p>

                <textarea
                  rows={4}
                  value={rejectUserReqFeedback}
                  onChange={(e) => setRejectUserReqFeedback(e.target.value)}
                  placeholder="Ex: Não foi possível comprovar a titularidade do novo e-mail..."
                  className="w-full rounded-2xl border border-border-subtle bg-surface-primary p-3.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setRejectUserReqModalItem(null)}
                  className="cursor-pointer"
                >
                  Cancelar
                </Button>

                <Button
                  size="sm"
                  onClick={handleConfirmRejectUserReq}
                  disabled={!rejectUserReqFeedback.trim() || processingId === rejectUserReqModalItem.id}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                >
                  <Icon icon={Send} size={14} />
                  {processingId === rejectUserReqModalItem.id ? "Processando..." : "Confirmar Recusa"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 3: GERENCIAR ADMINISTRADORES DA PLATAFORMA         */}
        {/* ======================================================== */}
        {adminsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-3xl bg-surface-white p-6 md:p-8 shadow-xl border border-border-subtle space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green-moss/10 text-brand-green-moss">
                    <Icon icon={Users} size={18} />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-text-primary">
                      Administradores da Plataforma
                    </h3>
                    <p className="font-body text-xs text-text-secondary">
                      Contas com acesso total ao Painel de Admin e auditoria.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAdminsModalOpen(false)}
                  className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-secondary cursor-pointer"
                >
                  <Icon icon={X} size={18} />
                </button>
              </div>

              {/* Form de Adicionar Novo Admin */}
              <form onSubmit={handleAddAdminEmail} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="novo-admin@exemplo.com"
                  value={newAdminEmailInput}
                  onChange={(e) => setNewAdminEmailInput(e.target.value)}
                  className="flex-1 rounded-xl border border-border-subtle bg-surface-primary px-3.5 py-2 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none"
                />
                <Button type="submit" size="sm" className="bg-brand-green-dark text-white font-bold cursor-pointer">
                  <Icon icon={Plus} size={14} />
                  Adicionar
                </Button>
              </form>

              {/* Lista de Administradores */}
              <div className="space-y-2 max-h-60 overflow-y-auto divide-y divide-border-subtle border rounded-2xl p-2 bg-surface-primary/20">
                {adminEmailsList.map((email) => {
                  const isPrimary = email.toLowerCase() === "pclipe00@gmail.com";

                  return (
                    <div
                      key={email}
                      className="flex items-center justify-between py-2 px-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Icon icon={Mail} size={14} className="text-text-secondary" />
                        <span className="font-mono font-medium text-text-primary">{email}</span>
                        {isPrimary && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-300">
                            Principal
                          </span>
                        )}
                      </div>

                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAdminEmail(email)}
                          title="Remover acesso admin"
                          className="rounded p-1 text-text-secondary hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Icon icon={Trash2} size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2 border-t border-border-subtle">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setAdminsModalOpen(false)}
                  className="cursor-pointer"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
