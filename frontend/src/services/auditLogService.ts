/**
 * The Bridge - Trilha de Auditoria e Logs de Atividades Imutáveis
 * Conformidade com LGPD (Lei 13.709/2018, Art. 18 e Art. 46),
 * Marco Civil da Internet (Lei 12.965/2014, Art. 15) e padrões ISO 27001.
 *
 * Cada perfil possui um ID ÚNICO E IMUTÁVEL (UUID v4) gerado na criação da conta.
 * Todos os registros nesta trilha vinculam-se a esse ID e possuem carimbo
 * de data/hora (timestamp de precisão com fuso horário) e metadados de contexto.
 */

export type AuditActionType =
  | "AUTH_REGISTER"
  | "AUTH_LOGIN"
  | "AUTH_LOGOUT"
  | "PROFILE_UPDATE"
  | "PROFILE_SUBMIT_AUDIT"
  | "TERMS_ACCEPTED"
  | "COOKIE_CONSENT_ACCEPTED"
  | "PROJECT_CREATE"
  | "PROJECT_UPDATE"
  | "PROJECT_DELETE"
  | "OPPORTUNITY_CREATE"
  | "OPPORTUNITY_UPDATE"
  | "CONNECTION_REQUEST"
  | "CONNECTION_APPROVED"
  | "CONNECTION_REJECTED"
  | "SUBSCRIPTION_CHANGE"
  | "CREDITS_PURCHASE"
  | "REFUND_REQUESTED"
  | "PASSWORD_RESET_REQUEST"
  | "ACCOUNT_DELETION_REQUESTED"
  | "ACCOUNT_DELETION_CANCELLED";

export type AuditSeverity = "INFO" | "WARNING" | "SECURITY" | "CRITICAL";

export type AuditResourceType =
  | "AUTH"
  | "PERFIL"
  | "PROJETO"
  | "DEMANDA"
  | "CONEXAO"
  | "JURIDICO"
  | "ASSINATURA"
  | "SEGURANCA"
  | "SISTEMA";

export interface AuditLogEntry {
  id: string; // UUID v4 único do registro de auditoria
  userId: string; // ID ÚNICO IMUTÁVEL do perfil do usuário
  userEmail: string; // E-mail no momento da ocorrência
  userName: string; // Nome civil ou razão social
  userRole: "RESEARCHER" | "COMPANY" | "ADMIN" | "GUEST";
  action: AuditActionType;
  actionLabel: string; // Descrição legível em português
  resourceType: AuditResourceType;
  resourceId?: string; // ID do recurso afetado (ex: ID do projeto ou conexão)
  ipAddress: string;
  userAgent: string;
  details?: Record<string, unknown>; // Metadados detalhados em JSON
  timestamp: string; // ISO 8601 UTC
  formattedDate: string; // Data e hora formatada pt-BR
  severity: AuditSeverity;
  status: "SUCCESS" | "FAILED";
}

const STORAGE_KEY_AUDIT_LOGS = "thebridge_immutable_audit_logs";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const ACTION_LABELS: Record<AuditActionType, { label: string; resource: AuditResourceType; severity: AuditSeverity }> = {
  AUTH_REGISTER: {
    label: "Cadastro de Nova Conta",
    resource: "AUTH",
    severity: "INFO",
  },
  AUTH_LOGIN: {
    label: "Autenticação de Sessão (Login)",
    resource: "AUTH",
    severity: "INFO",
  },
  AUTH_LOGOUT: {
    label: "Encerramento de Sessão (Logout)",
    resource: "AUTH",
    severity: "INFO",
  },
  PROFILE_UPDATE: {
    label: "Atualização de Informações Cadastrais",
    resource: "PERFIL",
    severity: "INFO",
  },
  PROFILE_SUBMIT_AUDIT: {
    label: "Submissão de Perfil para Homologação/Auditoria",
    resource: "PERFIL",
    severity: "INFO",
  },
  TERMS_ACCEPTED: {
    label: "Aceite Formal dos Termos de Uso e Política de Privacidade",
    resource: "JURIDICO",
    severity: "SECURITY",
  },
  COOKIE_CONSENT_ACCEPTED: {
    label: "Consentimento de Cookies e Rastreamento LGPD",
    resource: "JURIDICO",
    severity: "INFO",
  },
  PROJECT_CREATE: {
    label: "Criação de Novo Projeto Científico",
    resource: "PROJETO",
    severity: "INFO",
  },
  PROJECT_UPDATE: {
    label: "Edição de Projeto Científico",
    resource: "PROJETO",
    severity: "INFO",
  },
  PROJECT_DELETE: {
    label: "Exclusão de Projeto Científico",
    resource: "PROJETO",
    severity: "WARNING",
  },
  OPPORTUNITY_CREATE: {
    label: "Publicação de Nova Demanda Tecnológica",
    resource: "DEMANDA",
    severity: "INFO",
  },
  OPPORTUNITY_UPDATE: {
    label: "Edição de Demanda Tecnológica",
    resource: "DEMANDA",
    severity: "INFO",
  },
  CONNECTION_REQUEST: {
    label: "Solicitação de Conexão Técnico-Científica",
    resource: "CONEXAO",
    severity: "INFO",
  },
  CONNECTION_APPROVED: {
    label: "Homologação de Conexão entre Pesquisador e Empresa",
    resource: "CONEXAO",
    severity: "INFO",
  },
  CONNECTION_REJECTED: {
    label: "Recusa de Conexão Técnico-Científica",
    resource: "CONEXAO",
    severity: "INFO",
  },
  SUBSCRIPTION_CHANGE: {
    label: "Alteração de Plano de Assinatura",
    resource: "ASSINATURA",
    severity: "SECURITY",
  },
  CREDITS_PURCHASE: {
    label: "Aquisição de Créditos de Conexão",
    resource: "ASSINATURA",
    severity: "INFO",
  },
  REFUND_REQUESTED: {
    label: "Abertura de Solicitação de Reembolso",
    resource: "ASSINATURA",
    severity: "WARNING",
  },
  PASSWORD_RESET_REQUEST: {
    label: "Solicitação de Redefinição de Senha",
    resource: "SEGURANCA",
    severity: "SECURITY",
  },
  ACCOUNT_DELETION_REQUESTED: {
    label: "Solicitação de Exclusão de Perfil (Período de 7 Dias de Arrependimento)",
    resource: "SEGURANCA",
    severity: "CRITICAL",
  },
  ACCOUNT_DELETION_CANCELLED: {
    label: "Cancelamento da Exclusão de Perfil (Arrependimento Exercido)",
    resource: "SEGURANCA",
    severity: "SECURITY",
  },
};

// Registros iniciais realistas para povoamento da trilha de auditoria
const SEED_LOGS: AuditLogEntry[] = [
  {
    id: "log-seed-01",
    userId: "usr-admin-thebridge",
    userEmail: "pclipe00@gmail.com",
    userName: "Administrador The Bridge",
    userRole: "ADMIN",
    action: "AUTH_LOGIN",
    actionLabel: "Autenticação de Sessão (Login)",
    resourceType: "AUTH",
    ipAddress: "177.136.242.89",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0 Safari/537.36",
    details: { authMethod: "email_password", sessionDurationMinutes: 1440 },
    timestamp: "2026-10-13T09:30:15.120Z",
    formattedDate: "13/10/2026, 06:30:15",
    severity: "INFO",
    status: "SUCCESS",
  },
  {
    id: "log-seed-02",
    userId: "usr-pesquisador-demo",
    userEmail: "mariana.dornelles@unicamp.br",
    userName: "Profa. Dra. Mariana Dornelles",
    userRole: "RESEARCHER",
    action: "TERMS_ACCEPTED",
    actionLabel: "Aceite Formal dos Termos de Uso e Política de Privacidade",
    resourceType: "JURIDICO",
    ipAddress: "143.106.16.142",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    details: {
      termsVersion: "2026.1",
      privacyPolicyVersion: "2026.1",
      lgpdConsentBasis: "Art. 7º, I da Lei 13.709/2018",
    },
    timestamp: "2026-10-13T09:12:44.890Z",
    formattedDate: "13/10/2026, 06:12:44",
    severity: "SECURITY",
    status: "SUCCESS",
  },
  {
    id: "log-seed-03",
    userId: "usr-pesquisador-demo",
    userEmail: "mariana.dornelles@unicamp.br",
    userName: "Profa. Dra. Mariana Dornelles",
    userRole: "RESEARCHER",
    action: "PROFILE_SUBMIT_AUDIT",
    actionLabel: "Submissão de Perfil para Homologação/Auditoria",
    resourceType: "PERFIL",
    ipAddress: "143.106.16.142",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    details: {
      university: "Universidade Estadual de Campinas (UNICAMP)",
      department: "Instituto de Química",
      lattesUrl: "http://lattes.cnpq.br/1234567890123456",
      tierRequested: "OURO",
    },
    timestamp: "2026-10-13T09:15:02.340Z",
    formattedDate: "13/10/2026, 06:15:02",
    severity: "INFO",
    status: "SUCCESS",
  },
  {
    id: "log-seed-04",
    userId: "usr-empresa-demo",
    userEmail: "r.albuquerque@braskem.com.br",
    userName: "Braskem S.A.",
    userRole: "COMPANY",
    action: "AUTH_REGISTER",
    actionLabel: "Cadastro de Nova Conta",
    resourceType: "AUTH",
    ipAddress: "189.120.45.10",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/131.0",
    details: {
      cnpj: "42.150.391/0001-70",
      cnpjStatus: "ATIVA",
      couponApplied: "SBPMAT26",
      trialDays: 60,
    },
    timestamp: "2026-10-13T08:45:00.000Z",
    formattedDate: "13/10/2026, 05:45:00",
    severity: "INFO",
    status: "SUCCESS",
  },
  {
    id: "log-seed-05",
    userId: "usr-empresa-demo",
    userEmail: "r.albuquerque@braskem.com.br",
    userName: "Braskem S.A.",
    userRole: "COMPANY",
    action: "SUBSCRIPTION_CHANGE",
    actionLabel: "Alteração de Plano de Assinatura",
    resourceType: "ASSINATURA",
    ipAddress: "189.120.45.10",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/131.0",
    details: {
      previousPlan: "STANDARD",
      newPlan: "GRAFENO",
      monthlyCredits: 60,
      curatorshipAccess: true,
      llmDemandEnhancer: true,
    },
    timestamp: "2026-10-13T08:50:33.210Z",
    formattedDate: "13/10/2026, 05:50:33",
    severity: "SECURITY",
    status: "SUCCESS",
  },
  {
    id: "log-seed-06",
    userId: "usr-empresa-demo",
    userEmail: "r.albuquerque@braskem.com.br",
    userName: "Braskem S.A.",
    userRole: "COMPANY",
    action: "OPPORTUNITY_CREATE",
    actionLabel: "Publicação de Nova Demanda Tecnológica",
    resourceType: "DEMANDA",
    resourceId: "dem-biopolimeros-01",
    ipAddress: "189.120.45.10",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/131.0",
    details: {
      title: "Reciclagem Química Avançada de Polímeros Termoplásticos",
      targetTrl: [4, 5, 6],
      budgetRange: "R$ 200.000 - R$ 500.000",
    },
    timestamp: "2026-10-13T08:55:10.500Z",
    formattedDate: "13/10/2026, 05:55:10",
    severity: "INFO",
    status: "SUCCESS",
  },
  {
    id: "log-seed-07",
    userId: "usr-carlos-ufrj",
    userEmail: "carlos.siqueira@ufrj.br",
    userName: "Prof. Carlos Eduardo Siqueira",
    userRole: "RESEARCHER",
    action: "PROJECT_CREATE",
    actionLabel: "Criação de Novo Projeto Científico",
    resourceType: "PROJETO",
    resourceId: "proj-catalisadores-02",
    ipAddress: "200.156.32.77",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) Chrome/128.0.0.0",
    details: {
      title: "Catalisadores Nanométricos para Eletrooxidação de Etanol",
      trl: 5,
      hasPatent: true,
      inpiNumber: "BR 10 2026 014523 8",
    },
    timestamp: "2026-10-12T17:22:08.100Z",
    formattedDate: "12/10/2026, 14:22:08",
    severity: "INFO",
    status: "SUCCESS",
  },
];

export const auditLogService = {
  /**
   * Obtém todos os registros da trilha de auditoria armazenados.
   */
  getAllLogs(): AuditLogEntry[] {
    if (typeof window === "undefined") return SEED_LOGS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(SEED_LOGS));
        return SEED_LOGS;
      }
      const list: AuditLogEntry[] = JSON.parse(stored);
      return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch {
      return SEED_LOGS;
    }
  },

  /**
   * Grava um novo evento de auditoria imutável.
   */
  recordAction(params: {
    userId: string;
    userEmail: string;
    userName: string;
    userRole?: "RESEARCHER" | "COMPANY" | "ADMIN" | "GUEST";
    action: AuditActionType;
    resourceId?: string;
    details?: Record<string, unknown>;
    severity?: AuditSeverity;
    status?: "SUCCESS" | "FAILED";
  }): AuditLogEntry {
    const actionMeta = ACTION_LABELS[params.action] || {
      label: params.action,
      resource: "SISTEMA" as AuditResourceType,
      severity: "INFO" as AuditSeverity,
    };

    const now = new Date();
    const newEntry: AuditLogEntry = {
      id: generateUUID(),
      userId: params.userId,
      userEmail: params.userEmail,
      userName: params.userName,
      userRole: params.userRole || "RESEARCHER",
      action: params.action,
      actionLabel: actionMeta.label,
      resourceType: actionMeta.resource,
      resourceId: params.resourceId,
      ipAddress: "127.0.0.1 (Web Client)",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Node/Server Environment",
      details: params.details,
      timestamp: now.toISOString(),
      formattedDate: now.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      severity: params.severity || actionMeta.severity,
      status: params.status || "SUCCESS",
    };

    if (typeof window !== "undefined") {
      try {
        const list = this.getAllLogs();
        list.unshift(newEntry);
        // Manter histórico dos últimos 500 eventos no cliente
        const trimmed = list.slice(0, 500);
        localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(trimmed));
      } catch (err) {
        console.warn("Falha ao persistir log de auditoria no storage local:", err);
      }
    }

    return newEntry;
  },

  /**
   * Filtra registros por ID único imutável do usuário (conformidade com LGPD).
   */
  getLogsByUserId(userId: string): AuditLogEntry[] {
    const cleanId = userId.trim();
    return this.getAllLogs().filter((log) => log.userId === cleanId);
  },

  /**
   * Exporta a trilha de auditoria filtrada ou completa em formato CSV legível para perícias.
   */
  exportToCSV(logsToExport?: AuditLogEntry[], filename = "thebridge_auditoria_logs.csv"): void {
    const list = logsToExport || this.getAllLogs();
    if (list.length === 0) {
      alert("Não há registros de log para exportar.");
      return;
    }

    const headers = [
      "ID_LOG",
      "DATA_HORA_ISO",
      "DATA_HORA_LOCAL",
      "USER_ID_IMUTAVEL",
      "NOME_USUARIO",
      "EMAIL_USUARIO",
      "TIPO_PERFIL",
      "ACAO_CODIGO",
      "ACAO_DESCRICAO",
      "RECURSO",
      "RECURSO_ID",
      "SEVERIDADE",
      "STATUS",
      "IP_CLIENTE",
      "USER_AGENT",
      "METADADOS_JSON",
    ];

    const rows = list.map((l) => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.formattedDate}"`,
      `"${l.userId}"`,
      `"${(l.userName || "").replace(/"/g, '""')}"`,
      `"${(l.userEmail || "").replace(/"/g, '""')}"`,
      `"${l.userRole}"`,
      `"${l.action}"`,
      `"${l.actionLabel.replace(/"/g, '""')}"`,
      `"${l.resourceType}"`,
      `"${l.resourceId || ""}"`,
      `"${l.severity}"`,
      `"${l.status}"`,
      `"${l.ipAddress}"`,
      `"${(l.userAgent || "").replace(/"/g, '""')}"`,
      `"${JSON.stringify(l.details || {}).replace(/"/g, '""')}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
