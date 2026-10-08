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
  getConnections(): ConnectionItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_CONNECTIONS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    localStorage.setItem(STORAGE_CONNECTIONS_KEY, JSON.stringify(INITIAL_CONNECTIONS));
    return INITIAL_CONNECTIONS;
  },

  requestConnection(data: {
    articleTitle: string;
    articleEvent: string;
    matchScore: number;
    message: string;
    companyName?: string;
    researcherName?: string;
    opportunityTitle?: string;
  }): ConnectionItem {
    const connections = this.getConnections();
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
    localStorage.setItem(STORAGE_CONNECTIONS_KEY, JSON.stringify(connections));

    // Also inject a notification
    this.addNotification({
      title: `Solicitação de conexão enviada: ${data.articleTitle.slice(0, 45)}...`,
      sender: "The Bridge Matchmaking",
      category: "CONEXAO",
      preview: "Sua solicitação de conexão foi registrada com sucesso.",
      body: `Você enviou uma solicitação de conexão para a pesquisa:\n"${data.articleTitle}"\n\nMensagem enviada:\n"${data.message}"\n\nAssim que o pesquisador avaliar a solicitação, você receberá uma notificação aqui.`,
      actionUrl: "/dashboard/conexoes",
    });

    return newConn;
  },

  updateConnectionStatus(id: string, status: ConnectionItem["status"]) {
    const connections = this.getConnections().map((c) =>
      c.id === id ? { ...c, status, updatedAt: "Hoje" } : c
    );
    localStorage.setItem(STORAGE_CONNECTIONS_KEY, JSON.stringify(connections));
  },

  getNotifications(): NotificationItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_NOTIFICATIONS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
    return INITIAL_NOTIFICATIONS;
  },

  addNotification(item: Omit<NotificationItem, "id" | "date" | "read">) {
    const notifications = this.getNotifications();
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      ...item,
      date: "Agora mesmo",
      read: false,
    };
    notifications.unshift(newNotif);
    localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(notifications));
  },

  markNotificationAsRead(id: string) {
    const notifications = this.getNotifications().map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(notifications));
  },

  markAllAsRead() {
    const notifications = this.getNotifications().map((n) => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(notifications));
  },
};
