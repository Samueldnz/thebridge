import { authService } from "./auth";

export interface ConnectionItem {
  id: string;
  companyName: string;
  researcherName: string;
  articleTitle: string;
  articleEvent: string;
  opportunityTitle?: string;
  matchScore: number;
  status: "PENDENTE" | "ACEITA" | "RECUSADA" | "EM_NEGOCIACAO";
  message: string;
  createdAt: string;
  updatedAt?: string;
  initiatorType: "COMPANY" | "RESEARCHER";
}

export interface NotificationItem {
  id: string;
  title: string;
  sender: string;
  category: "CONEXAO" | "MATCH" | "SISTEMA" | "PROPOSTA";
  preview: string;
  body: string;
  date: string;
  read: boolean;
  actionUrl?: string;
}

const STORAGE_CONNECTIONS_KEY = "thebridge_connections";
const STORAGE_NOTIFICATIONS_KEY = "thebridge_notifications";

/**
 * Contas autorizadas para visualização dos dados simulados de verificação e teste de funcionalidade.
 * Todas as demais contas iniciam com o painel de Conexões e Notificações totalmente zerado.
 */
export const VERIFICATION_DEMO_EMAILS = [
  "pclipe00@gmail.com",
  "felipepc@poli.ufrj.br",
];

export function isVerificationAccount(email?: string): boolean {
  if (!email) return false;
  return VERIFICATION_DEMO_EMAILS.includes(email.toLowerCase().trim());
}

function getConnectionsStorageKey(email?: string): string {
  const norm = (email || "").toLowerCase().trim();
  return norm ? `${STORAGE_CONNECTIONS_KEY}_${norm}` : `${STORAGE_CONNECTIONS_KEY}_guest`;
}

function getNotificationsStorageKey(email?: string): string {
  const norm = (email || "").toLowerCase().trim();
  return norm ? `${STORAGE_NOTIFICATIONS_KEY}_${norm}` : `${STORAGE_NOTIFICATIONS_KEY}_guest`;
}

const INITIAL_CONNECTIONS: ConnectionItem[] = [
  {
    id: "conn-1",
    companyName: "Suzano Inovação & Biomateriais S.A.",
    researcherName: "Grupo de Nanomateriais e Polímeros Avançados",
    articleTitle: "GRAPHENE AND OTHER NANOMATERIALS: AN INDUSTRIAL PERSPECTIVE",
    articleEvent: "18º CBPol",
    opportunityTitle: "Desenvolvimento de Biocompostos com Alta Barreira Térmica",
    matchScore: 88,
    status: "PENDENTE",
    message:
      "Olá! Identificamos alto grau de aderência entre sua pesquisa e o nosso desafio corporativo de novos materiais. Gostaríamos de avaliar um projeto piloto de P&D conjunto.",
    createdAt: "08 out 2026, 09:30",
    initiatorType: "COMPANY",
  },
  {
    id: "conn-2",
    companyName: "Eurofarma Laboratórios",
    researcherName: "Laboratório de Biotecnologia Molecular",
    articleTitle: "DEVELOPMENT OF CELLULAR REPROGRAMMING PROTOCOLS FOR ONCOLOGY",
    articleEvent: "SBPMat 2026",
    opportunityTitle: "Formulação de Novos Vetores para Imunoterapia",
    matchScore: 92,
    status: "ACEITA",
    message:
      "Apresentamos interesse em formalizar um protocolo de cooperação técnica e fornecimento de insumos laboratoriais para aprofundar os testes in vitro.",
    createdAt: "07 out 2026, 14:15",
    initiatorType: "COMPANY",
  },
  {
    id: "conn-3",
    companyName: "WEG Motores & Energia",
    researcherName: "Centro de Física de Materiais Condensados",
    articleTitle: "MAGNETIC NANOCOMPOSITES FOR HIGH-EFFICIENCY ELECTRIC MOTORS",
    articleEvent: "Encontro Nacional de Física",
    opportunityTitle: "Novos Ímãs Permanentes Livres de Terras Raras",
    matchScore: 84,
    status: "EM_NEGOCIACAO",
    message:
      "Minuta de Acordo de Confidencialidade (NDA) encaminhada. Próxima reunião técnica de alinhamento com a diretoria de engenharia.",
    createdAt: "05 out 2026, 11:00",
    initiatorType: "COMPANY",
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Nova solicitação de conexão recebida",
    sender: "Suzano Inovação & Biomateriais S.A.",
    category: "CONEXAO",
    preview: "Temos interesse em avaliar um projeto piloto de P&D conjunto...",
    body: "Olá!\n\nA equipe de Pesquisa & Desenvolvimento da Suzano Inovação avaliou a compatibilidade do seu projeto através do motor de inteligência artificial The Bridge e identificou 88% de relevância técnica.\n\nGostaríamos de agendar uma reunião de alinhamento preliminar e avaliar a celebração de um Acordo de Cooperação Técnica (ACT).\n\nPara responder, acesse a aba 'Minhas Conexões'.",
    date: "Hoje às 09:30",
    read: false,
    actionUrl: "/dashboard/conexoes",
  },
  {
    id: "notif-2",
    title: "Matchmaking de alta relevância (92%) disponível",
    sender: "Motor de IA The Bridge",
    category: "MATCH",
    preview: "Identificamos 10 novas pesquisas com altíssima afinidade à sua demanda...",
    body: "Prezado(a) gestor(a),\n\nO motor de busca semântica vetorial processou os requisitos da sua demanda de 'Sistemas Nanométricos e Materiais Poliméricos' e ranqueou 10 trabalhos científicos com índice calibrado superior a 80%.\n\nVocê já pode solicitar conexão diretamente com os pesquisadores responsáveis na página de matches.",
    date: "Ontem às 18:20",
    read: false,
    actionUrl: "/dashboard/matching",
  },
  {
    id: "notif-3",
    title: "Conexão aceita: Laboratório de Biotecnologia",
    sender: "Eurofarma Laboratórios",
    category: "CONEXAO",
    preview: "O pesquisador responsável aceitou o convite para diálogo técnico...",
    body: "A solicitação de conexão enviada para o trabalho 'DEVELOPMENT OF CELLULAR REPROGRAMMING PROTOCOLS' foi aceita com sucesso.\n\nOs canais diretos de comunicação e troca de documentos foram habilitados na sua central de conexões.",
    date: "07 out 2026",
    read: true,
    actionUrl: "/dashboard/conexoes",
  },
  {
    id: "notif-4",
    title: "Selo de Qualificação Atualizado",
    sender: "Comitê The Bridge",
    category: "SISTEMA",
    preview: "Seu perfil acadêmico foi verificado com sucesso pelo sistema...",
    body: "Parabéns! Suas credenciais foram checadas com base nos dados públicos da plataforma Lattes. Seu perfil agora conta com prioridade algorítmica de recomendação no radar das corporações parceiras.",
    date: "04 out 2026",
    read: true,
    actionUrl: "/dashboard/perfil",
  },
];

export const connectionsService = {
  getConnections(userEmail?: string): ConnectionItem[] {
    const email = (userEmail || authService.getStoredUser()?.email || "").toLowerCase().trim();
    const isDemo = isVerificationAccount(email);
    const key = getConnectionsStorageKey(email);

    try {
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }

    if (isDemo) {
      // Para as contas de teste homologadas (pclipe00@gmail.com / felipepc@poli.ufrj.br)
      // Carrega dados simulados de verificação funcional se ainda não houver dados gravados
      try {
        const legacy = localStorage.getItem(STORAGE_CONNECTIONS_KEY);
        if (legacy) {
          const parsed = JSON.parse(legacy);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localStorage.setItem(key, JSON.stringify(parsed));
            return parsed;
          }
        }
      } catch {}

      localStorage.setItem(key, JSON.stringify(INITIAL_CONNECTIONS));
      return INITIAL_CONNECTIONS;
    }

    // Para todas as outras contas: inicia com lista vazia (zerada)
    if (email) {
      localStorage.setItem(key, JSON.stringify([]));
    }
    return [];
  },

  requestConnection(
    data: {
      articleTitle: string;
      articleEvent: string;
      matchScore: number;
      message: string;
      companyName?: string;
      researcherName?: string;
      opportunityTitle?: string;
    },
    userEmail?: string
  ): ConnectionItem {
    const email = (userEmail || authService.getStoredUser()?.email || "").toLowerCase().trim();
    const key = getConnectionsStorageKey(email);
    const connections = this.getConnections(email);

    const newConn: ConnectionItem = {
      id: `conn-${Date.now()}`,
      companyName: data.companyName || "Empresa Parceira Registrada",
      researcherName: data.researcherName || "Grupo de Pesquisa Responsável",
      articleTitle: data.articleTitle,
      articleEvent: data.articleEvent,
      opportunityTitle: data.opportunityTitle || "Demanda Tecnológica Corporativa",
      matchScore: data.matchScore,
      status: "PENDENTE",
      message: data.message,
      createdAt: "Hoje às " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      initiatorType: "COMPANY",
    };

    connections.unshift(newConn);
    try {
      localStorage.setItem(key, JSON.stringify(connections));
    } catch {}

    // Injeta notificação de confirmação para a própria conta
    this.addNotification(
      {
        title: `Solicitação de conexão enviada: ${data.articleTitle.slice(0, 45)}...`,
        sender: "The Bridge Matchmaking",
        category: "CONEXAO",
        preview: "Sua solicitação de conexão foi registrada com sucesso.",
        body: `Você enviou uma solicitação de conexão para a pesquisa:\n"${data.articleTitle}"\n\nMensagem enviada:\n"${data.message}"\n\nAssim que o pesquisador avaliar a solicitação, você receberá uma notificação aqui.`,
        actionUrl: "/dashboard/conexoes",
      },
      email
    );

    return newConn;
  },

  updateConnectionStatus(id: string, status: ConnectionItem["status"], userEmail?: string) {
    const email = (userEmail || authService.getStoredUser()?.email || "").toLowerCase().trim();
    const key = getConnectionsStorageKey(email);
    const connections = this.getConnections(email).map((c) =>
      c.id === id ? { ...c, status, updatedAt: "Hoje" } : c
    );
    try {
      localStorage.setItem(key, JSON.stringify(connections));
    } catch {}
  },

  getNotifications(userEmail?: string): NotificationItem[] {
    const email = (userEmail || authService.getStoredUser()?.email || "").toLowerCase().trim();
    const isDemo = isVerificationAccount(email);
    const key = getNotificationsStorageKey(email);

    try {
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }

    if (isDemo) {
      // Para as contas de teste homologadas (pclipe00@gmail.com / felipepc@poli.ufrj.br)
      try {
        const legacy = localStorage.getItem(STORAGE_NOTIFICATIONS_KEY);
        if (legacy) {
          const parsed = JSON.parse(legacy);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localStorage.setItem(key, JSON.stringify(parsed));
            return parsed;
          }
        }
      } catch {}

      localStorage.setItem(key, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }

    // Para todas as outras contas: inicia com lista vazia (zerada)
    if (email) {
      localStorage.setItem(key, JSON.stringify([]));
    }
    return [];
  },

  addNotification(item: Omit<NotificationItem, "id" | "date" | "read">, userEmail?: string) {
    const email = (userEmail || authService.getStoredUser()?.email || "").toLowerCase().trim();
    const key = getNotificationsStorageKey(email);
    const notifications = this.getNotifications(email);
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      ...item,
      date: "Agora mesmo",
      read: false,
    };
    notifications.unshift(newNotif);
    try {
      localStorage.setItem(key, JSON.stringify(notifications));
    } catch {}
  },

  markNotificationAsRead(id: string, userEmail?: string) {
    const email = (userEmail || authService.getStoredUser()?.email || "").toLowerCase().trim();
    const key = getNotificationsStorageKey(email);
    const notifications = this.getNotifications(email).map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    try {
      localStorage.setItem(key, JSON.stringify(notifications));
    } catch {}
  },

  markAllAsRead(userEmail?: string) {
    const email = (userEmail || authService.getStoredUser()?.email || "").toLowerCase().trim();
    const key = getNotificationsStorageKey(email);
    const notifications = this.getNotifications(email).map((n) => ({ ...n, read: true }));
    try {
      localStorage.setItem(key, JSON.stringify(notifications));
    } catch {}
  },
};
