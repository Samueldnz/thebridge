import { authService } from "./auth";

export type ConnectionStatus =
  | "EM_ANALISE_ADMIN"        // 1. Solicitação enviada pela empresa -> aguardando aprovação na Central de Admin
  | "AGUARDANDO_PESQUISADOR"  // 2. Aprovada pelo Admin -> enviada ao pesquisador (sem nome da empresa)
  | "AGUARDANDO_TERMO"        // 3. Aceita pelo pesquisador -> aguardando assinatura do Termo de Responsabilidade (Success Fee) por ambos
  | "CONECTADO"               // 4. Ambos assinaram o Termo -> conexão efetivada e contatos liberados
  | "RECUSADA"                // Recusada pelo Admin ou pelo Pesquisador
  | "PENDENTE"                // Legado
  | "ACEITA"                  // Legado
  | "EM_NEGOCIACAO";          // Legado

export const FIXED_CENSOR_AUTHORS = "****************";
export const FIXED_CENSOR_AFFILIATION = "********************";
export const FIXED_CENSOR_COMPANY = "****************";

export interface ConnectionItem {
  id: string;
  // Dados da Empresa (identidade oculta para o pesquisador até status === "CONECTADO")
  companyName: string;
  companyEmail?: string;
  companyPhone?: string;
  companyContactName?: string;
  companySector: string;        // Visível ao pesquisador após aprovação do Admin
  investmentAmount: string;     // Visível ao pesquisador após aprovação do Admin
  executionTimeline: string;    // Visível ao pesquisador após aprovação do Admin
  opportunityTitle?: string;

  // Dados do Pesquisador e Projeto (autores e vínculos ocultos para a empresa até status === "CONECTADO")
  researcherName: string;
  researcherAffiliation?: string;
  researcherEmail?: string;
  researcherPhone?: string;
  articleTitle: string;
  articleEvent?: string;

  matchScore: number;
  status: ConnectionStatus;
  message: string;
  createdAt: string;
  updatedAt?: string;
  initiatorType: "COMPANY" | "RESEARCHER";

  // Assinaturas do Termo de Responsabilidade (Success Fee)
  companySignedTerm?: boolean;
  companySignedAt?: string;
  researcherSignedTerm?: boolean;
  researcherSignedAt?: string;

  // Auditoria Admin
  adminApprovedAt?: string;
  adminFeedback?: string;
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
  connectionId?: string;
  targetRole?: "COMPANY" | "RESEARCHER" | "ADMIN" | "ALL";
}

const STORAGE_CONNECTIONS_GLOBAL_KEY = "thebridge_connections_v2_global";
const STORAGE_NOTIFICATIONS_KEY = "thebridge_notifications_v2";

/**
 * Contas autorizadas para visualização dos dados simulados de verificação e teste de funcionalidade.
 */
export const VERIFICATION_DEMO_EMAILS = [
  "pclipe00@gmail.com",
  "felipepc@poli.ufrj.br",
];

export function isVerificationAccount(email?: string): boolean {
  if (!email) return false;
  return VERIFICATION_DEMO_EMAILS.includes(email.toLowerCase().trim());
}

function getNotificationsStorageKey(email?: string): string {
  const norm = (email || "").toLowerCase().trim();
  return norm ? `${STORAGE_NOTIFICATIONS_KEY}_${norm}` : `${STORAGE_NOTIFICATIONS_KEY}_guest`;
}

const INITIAL_CONNECTIONS: ConnectionItem[] = [
  {
    id: "conn-stage-1",
    companyName: "Braskem Inovação & Polímeros S.A.",
    companyEmail: "inovacao.aberta@braskem.com.br",
    companyPhone: "(11) 3576-8900",
    companyContactName: "Dr. Roberto Albuquerque",
    companySector: "Indústria Química, Petroquímica e Novos Materiais",
    investmentAmount: "R$ 350.000,00 a R$ 600.000,00",
    executionTimeline: "18 meses",
    researcherName: "Profa. Dra. Helena Vasconcelos; Dr. Marcos Paulo Ribeiro",
    researcherAffiliation: "Universidade Estadual de Campinas (UNICAMP) - Instituto de Química",
    researcherEmail: "helena.vasconcelos@iqm.unicamp.br",
    researcherPhone: "(19) 98812-3456",
    articleTitle: "Manufacturing of polymer matrix membranes reinforced with nanocellulosic materials for use in wastewater filtration",
    articleEvent: "SBPMat 2025",
    opportunityTitle: "Membranas Poliméricas Sustentáveis para Filtração Industrial",
    matchScore: 91,
    status: "EM_ANALISE_ADMIN",
    message:
      "Olá! Analisamos o projeto através da plataforma The Bridge e identificamos alto grau de convergência técnica com a nossa demanda corporativa de P&D. Gostaríamos de solicitar uma conexão formal para avaliar a viabilidade técnica e possíveis modelos de cooperação.",
    createdAt: "Hoje às 10:15",
    initiatorType: "COMPANY",
    companySignedTerm: false,
    researcherSignedTerm: false,
  },
  {
    id: "conn-stage-2",
    companyName: "Aegea Saneamento & Efluentes S.A.",
    companyEmail: "pd.engenharia@aegea.com.br",
    companyPhone: "(11) 3890-1122",
    companyContactName: "Eng. Beatriz Fontes",
    companySector: "Saneamento Básico, Tratamento de Águas e Efluentes",
    investmentAmount: "R$ 250.000,00 a R$ 450.000,00",
    executionTimeline: "12 meses",
    researcherName: "Prof. Dr. Carlos Eduardo Siqueira; Eng. Lucas Prado",
    researcherAffiliation: "Universidade Federal do Rio de Janeiro (UFRJ) - COPPE / Engenharia de Materiais",
    researcherEmail: "carlos.siqueira@metalurgia.ufrj.br",
    researcherPhone: "(21) 99741-8520",
    articleTitle: "Evaluation of the potential use of recycled materials for adsorption in treatment",
    articleEvent: "CBPol",
    opportunityTitle: "Material Filtrante de Baixo Custo para Estações de Tratamento de Esgoto",
    matchScore: 89,
    status: "AGUARDANDO_PESQUISADOR",
    message:
      "Temos grande interesse no desenvolvimento conjunto de filtros adsorventes baseados em materiais reciclados para aplicação em escala piloto em nossas estações de tratamento.",
    createdAt: "Ontem às 16:40",
    adminApprovedAt: "Hoje às 09:00",
    adminFeedback: "Alto potencial de transferência tecnológica validado pela curadoria The Bridge.",
    initiatorType: "COMPANY",
    companySignedTerm: false,
    researcherSignedTerm: false,
  },
  {
    id: "conn-stage-3",
    companyName: "Eurofarma Laboratórios S.A.",
    companyEmail: "parcerias.cientificas@eurofarma.com.br",
    companyPhone: "(11) 5090-8600",
    companyContactName: "Dra. Camila Medeiros",
    companySector: "Saúde, Biotecnologia & Indústria Farmacêutica",
    investmentAmount: "R$ 500.000,00 a R$ 1.200.000,00",
    executionTimeline: "24 meses",
    researcherName: "Profa. Dra. Mariana Dornelles; Dr. Tiago Mendes",
    researcherAffiliation: "Universidade de São Paulo (USP) - Faculdade de Ciências Farmacêuticas",
    researcherEmail: "mariana.dornelles@usp.br",
    researcherPhone: "(11) 99123-4567",
    articleTitle: "Development of polymeric nanocarriers for controlled release of bioactive compounds",
    articleEvent: "SBPMat",
    opportunityTitle: "Sistemas Nanométricos para Aumento de Biodisponibilidade de Princípios Ativos",
    matchScore: 94,
    status: "AGUARDANDO_TERMO",
    message:
      "Apresentamos interesse em formalizar cooperação técnica para escalonamento de nanocarreadores poliméricos e validação em ensaios pré-clínicos.",
    createdAt: "08 out 2026, 14:15",
    adminApprovedAt: "08 out 2026, 17:00",
    initiatorType: "COMPANY",
    companySignedTerm: false,
    researcherSignedTerm: false,
  },
  {
    id: "conn-stage-4",
    companyName: "WEG Equipamentos Elétricos S.A.",
    companyEmail: "pd.materiais@weg.net",
    companyPhone: "(47) 3276-4000",
    companyContactName: "Dr. Henrique Zimmermann",
    companySector: "Energia, Motores Elétricos e Automação Industrial",
    investmentAmount: "R$ 800.000,00 a R$ 1.500.000,00",
    executionTimeline: "18 a 24 meses",
    researcherName: "Prof. Dr. Fernando Álvares; Dra. Patrícia Lemos",
    researcherAffiliation: "Universidade Federal de Santa Catarina (UFSC) - LabMat",
    researcherEmail: "fernando.alvares@ufsc.br",
    researcherPhone: "(48) 99654-3210",
    articleTitle: "Magnetic nanocomposites for high-efficiency electric motors and thermal dissipation",
    articleEvent: "SBPMat",
    opportunityTitle: "Novos Compósitos Magnéticos para Motores de Alta Eficiência",
    matchScore: 87,
    status: "CONECTADO",
    message:
      "Interesse em parceria de co-desenvolvimento para aplicação de nanocompósitos magnéticos em motores industriais de próxima geração.",
    createdAt: "05 out 2026, 11:00",
    adminApprovedAt: "05 out 2026, 14:30",
    companySignedTerm: true,
    companySignedAt: "06 out 2026, 10:12",
    researcherSignedTerm: true,
    researcherSignedAt: "06 out 2026, 15:45",
    initiatorType: "COMPANY",
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-init-1",
    title: "Empresa interessada no seu projeto (Análise Aprovada)",
    sender: "Curadoria The Bridge",
    category: "CONEXAO",
    preview: "Uma empresa do setor de Saneamento Básico manifestou interesse no seu projeto com orçamento de R$ 250 mil a R$ 450 mil...",
    body: `Olá, Pesquisador(a)!\n\nA curadoria da The Bridge aprovou o potencial de uma solicitação de conexão para o seu projeto:\n"Evaluation of the potential use of recycled materials for adsorption in treatment"\n\nDados preliminares da empresa interessada (identidade preservada sob sigilo até assinatura do Termo de Responsabilidade):\n• Área de Atuação da Empresa: Saneamento Básico, Tratamento de Águas e Efluentes\n• Capacidade de Investimento: R$ 250.000,00 a R$ 450.000,00\n• Tempo Desejável de Execução do Projeto: 12 meses\n\nAcesse a aba 'Minhas Conexões' para aceitar ou recusar a aproximação.`,
    date: "Hoje às 09:00",
    read: false,
    actionUrl: "/dashboard/conexoes",
    connectionId: "conn-stage-2",
    targetRole: "RESEARCHER",
  },
  {
    id: "notif-init-2",
    title: "Conexão Aceita! Assine o Termo de Responsabilidade (Success Fee)",
    sender: "Compliance Jurídico The Bridge",
    category: "PROPOSTA",
    preview: "Ambas as partes demonstraram interesse! Assine o Termo de Responsabilidade para liberar os contatos...",
    body: `Excelente notícia!\n\nO interesse de conexão referente ao projeto "Development of polymeric nanocarriers for controlled release of bioactive compounds" foi aceito!\n\nPróximo passo obrigatório:\nPara que a conexão seja formalizada e as informações diretas de contato (nomes, vínculos, e-mails e telefones) sejam liberadas para ambos os perfis, solicitamos que ambas as partes assinem digitalmente o Termo de Responsabilidade e Success Fee na página 'Minhas Conexões'.`,
    date: "Ontem às 18:20",
    read: false,
    actionUrl: "/dashboard/conexoes",
    connectionId: "conn-stage-3",
    targetRole: "ALL",
  },
  {
    id: "notif-init-3",
    title: "🎉 Termo Assinado por Ambos! Contatos Desbloqueados",
    sender: "The Bridge Matchmaking",
    category: "CONEXAO",
    preview: "A conexão para o projeto 'Magnetic nanocomposites for high-efficiency electric motors' foi concluída...",
    body: `Parabéns! Ambas as partes assinaram o Termo de Responsabilidade e Success Fee referente ao projeto:\n"Magnetic nanocomposites for high-efficiency electric motors and thermal dissipation"\n\nOs dados completos de contato (Empresa: WEG Equipamentos Elétricos S.A. | Pesquisador: Prof. Dr. Fernando Álvares - UFSC) já estão integralmente desbloqueados em 'Minhas Conexões'.`,
    date: "06 out 2026",
    read: true,
    actionUrl: "/dashboard/conexoes",
    connectionId: "conn-stage-4",
    targetRole: "ALL",
  },
];

export const connectionsService = {
  /**
   * Retorna todas as conexões armazenadas no sistema (usado pelo Admin e filtrado para os perfis).
   */
  getAllConnections(): ConnectionItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_CONNECTIONS_GLOBAL_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }

    localStorage.setItem(STORAGE_CONNECTIONS_GLOBAL_KEY, JSON.stringify(INITIAL_CONNECTIONS));
    return INITIAL_CONNECTIONS;
  },

  saveAllConnections(list: ConnectionItem[]) {
    try {
      localStorage.setItem(STORAGE_CONNECTIONS_GLOBAL_KEY, JSON.stringify(list));
    } catch {
      // ignore storage errors
    }
  },

  /**
   * Retorna conexões visíveis para o perfil logado.
   * - Perfil Pesquisador: vê conexões que já foram aprovadas pelo Admin (AGUARDANDO_PESQUISADOR, AGUARDANDO_TERMO, CONECTADO, RECUSADA)
   * - Perfil Empresa: vê todas as conexões solicitadas (incluindo EM_ANALISE_ADMIN)
   */
  getConnections(_userEmail?: string, roleOverride?: "COMPANY" | "RESEARCHER"): ConnectionItem[] {
    const currentUser = authService.getStoredUser();
    const role = roleOverride || currentUser?.profileType || "COMPANY";
    const all = this.getAllConnections();

    if (role === "RESEARCHER") {
      // O pesquisador só recebe a solicitação depois que o Admin analisa o potencial e aprova!
      return all.filter((c) => c.status !== "EM_ANALISE_ADMIN");
    }

    return all;
  },

  /**
   * Etapa 1: Perfil Empresa solicita conexão no resultado do match.
   * Vai diretamente para a Central de Admin com status 'EM_ANALISE_ADMIN'.
   */
  requestConnection(
    data: {
      articleTitle: string;
      articleEvent?: string;
      matchScore: number;
      message: string;
      companyName?: string;
      companyEmail?: string;
      companyPhone?: string;
      companyContactName?: string;
      companySector?: string;
      investmentAmount?: string;
      executionTimeline?: string;
      researcherName?: string;
      researcherAffiliation?: string;
      researcherEmail?: string;
      opportunityTitle?: string;
    },
    userEmail?: string
  ): ConnectionItem {
    const currentUser = authService.getStoredUser();
    const email = (userEmail || currentUser?.email || "").toLowerCase().trim();
    const connections = this.getAllConnections();

    // Separa autores e vínculo caso venham concatenados com ';'
    let rawAuthors = data.researcherName || "Grupo de Pesquisa Científica";
    let rawAffiliation = data.researcherAffiliation || "Instituição Científica e Tecnológica (ICT)";
    if (rawAuthors.includes(";")) {
      const parts = rawAuthors.split(";").map((s) => s.trim()).filter(Boolean);
      rawAuthors = parts[0] || rawAuthors;
      if (parts.length > 1 && !data.researcherAffiliation) {
        rawAffiliation = parts.slice(1).join("; ");
      }
    }

    const newConn: ConnectionItem = {
      id: `conn-${Date.now()}`,
      companyName: data.companyName || currentUser?.companyName || currentUser?.name || "Empresa Parceira Registrada",
      companyEmail: data.companyEmail || currentUser?.email || "contato@empresa.com.br",
      companyPhone: data.companyPhone || currentUser?.phone || "(11) 99999-0000",
      companyContactName: data.companyContactName || currentUser?.name || "Gestor de P&D",
      companySector: data.companySector || currentUser?.industrySector || "Indústria de Transformação & Materiais",
      investmentAmount: data.investmentAmount || "R$ 150.000,00 a R$ 400.000,00",
      executionTimeline: data.executionTimeline || "12 a 18 meses",
      researcherName: rawAuthors,
      researcherAffiliation: rawAffiliation,
      researcherEmail: data.researcherEmail || "pesquisador.lider@universidade.edu.br",
      researcherPhone: "(11) 98765-4321",
      articleTitle: data.articleTitle,
      articleEvent: data.articleEvent || "Acervo Científico The Bridge",
      opportunityTitle: data.opportunityTitle || "Demanda Tecnológica Corporativa",
      matchScore: data.matchScore,
      status: "EM_ANALISE_ADMIN",
      message: data.message,
      createdAt: "Hoje às " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      initiatorType: "COMPANY",
      companySignedTerm: false,
      researcherSignedTerm: false,
    };

    connections.unshift(newConn);
    this.saveAllConnections(connections);

    // Notifica a empresa de que a solicitação foi encaminhada para a Central de Admin
    this.addNotification(
      {
        title: `Solicitação enviada para curadoria: "${data.articleTitle.slice(0, 42)}..."`,
        sender: "Central de Intermediação The Bridge",
        category: "CONEXAO",
        preview: "Sua solicitação foi enviada para nossa Central de Admin, que analisará o potencial da conexão.",
        body: `Sua solicitação de conexão para o projeto:\n"${data.articleTitle}"\nfoi registrada com sucesso!\n\nEtapa atual: Análise de Potencial pela Central de Admin The Bridge.\nNossa equipe avaliará a sinergia entre o perfil da sua empresa e o projeto científico. Assim que aprovada, o pesquisador será notificado sobre o seu interesse (preservando o sigilo da sua razão social até a assinatura do Termo de Responsabilidade).`,
        actionUrl: "/dashboard/conexoes",
        connectionId: newConn.id,
        targetRole: "COMPANY",
      },
      email
    );

    return newConn;
  },

  /**
   * Etapa 2: Admin aprova o potencial da conexão na Central de Admin.
   * O pesquisador recebe notificação SEM o nome da empresa, apenas Área de Atuação, Investimento e Tempo de Execução.
   */
  approveConnectionByAdmin(id: string, adminFeedback?: string): ConnectionItem | null {
    const connections = this.getAllConnections();
    const target = connections.find((c) => c.id === id);
    if (!target) return null;

    target.status = "AGUARDANDO_PESQUISADOR";
    target.adminApprovedAt = "Hoje às " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    target.adminFeedback = adminFeedback || "Potencial estratégico de conexão validado pela administração The Bridge.";
    target.updatedAt = "Hoje";

    this.saveAllConnections(connections);

    // Notificação enviada ao Perfil Pesquisador (SEM mencionar o nome da empresa!)
    this.broadcastNotification({
      title: `Uma empresa tem interesse no seu projeto: "${target.articleTitle.slice(0, 40)}..."`,
      sender: "Curadoria The Bridge",
      category: "CONEXAO",
      preview: `Empresa da área de ${target.companySector} com orçamento de ${target.investmentAmount} e prazo de ${target.executionTimeline}.`,
      body: `Olá, Pesquisador(a)!\n\nA curadoria da The Bridge analisou e aprovou o potencial de uma solicitação de conexão para o seu projeto:\n"${target.articleTitle}"\n\nPor razões de confidencialidade e proteção intelectual, o nome da empresa permanece sob sigilo (${FIXED_CENSOR_COMPANY}) até a assinatura mútua do Termo de Responsabilidade.\n\nInformações da Empresa Interessada:\n• Área de Atuação da Empresa: ${target.companySector}\n• Capacidade de Investimento Disponível: ${target.investmentAmount}\n• Tempo Desejável de Execução do Projeto: ${target.executionTimeline}\n\nMensagem encaminhada:\n"${target.message}"\n\nAcesse 'Minhas Conexões' para ACEITAR ou RECUSAR esta conexão.`,
      actionUrl: "/dashboard/conexoes",
      connectionId: target.id,
      targetRole: "RESEARCHER",
    });

    return target;
  },

  /**
   * Admin recusa a conexão na Central de Admin.
   */
  rejectConnectionByAdmin(id: string, reason: string): ConnectionItem | null {
    const connections = this.getAllConnections();
    const target = connections.find((c) => c.id === id);
    if (!target) return null;

    target.status = "RECUSADA";
    target.adminFeedback = reason;
    target.updatedAt = "Hoje";
    this.saveAllConnections(connections);

    this.broadcastNotification({
      title: `Atualização sobre solicitação de conexão: "${target.articleTitle.slice(0, 40)}..."`,
      sender: "Central de Admin The Bridge",
      category: "SISTEMA",
      preview: "Após análise técnica preliminar, a conexão não pôde ter prosseguimento neste momento.",
      body: `Informamos que a solicitação referente ao projeto "${target.articleTitle}" foi analisada pela curadoria The Bridge.\n\nParecer da análise:\n${reason}`,
      actionUrl: "/dashboard/conexoes",
      connectionId: target.id,
      targetRole: "COMPANY",
    });

    return target;
  },

  /**
   * Etapa 3: O Perfil Pesquisador aceita ou recusa a conexão com o Perfil Empresa.
   * Caso aceite: ambos são notificados que a conexão será feita e são solicitados a assinar o Termo de Responsabilidade (Success Fee).
   */
  respondConnectionByResearcher(id: string, accept: boolean): ConnectionItem | null {
    const connections = this.getAllConnections();
    const target = connections.find((c) => c.id === id);
    if (!target) return null;

    if (!accept) {
      target.status = "RECUSADA";
      target.updatedAt = "Hoje";
      this.saveAllConnections(connections);

      this.broadcastNotification({
        title: `Solicitação de conexão recusada pelo pesquisador`,
        sender: "The Bridge Matchmaking",
        category: "CONEXAO",
        preview: `O responsável pelo projeto "${target.articleTitle.slice(0, 40)}..." não pôde avançar com a conexão neste momento.`,
        body: `Informamos que o perfil pesquisador responsável pelo projeto "${target.articleTitle}" avaliou a proposta e optou por não prosseguir com a conexão neste momento (por indisponibilidade de agenda laboratorial ou exclusividade prévia).`,
        actionUrl: "/dashboard/conexoes",
        connectionId: target.id,
        targetRole: "COMPANY",
      });

      return target;
    }

    // Pesquisador ACEITOU a conexão!
    target.status = "AGUARDANDO_TERMO";
    target.updatedAt = "Hoje";
    this.saveAllConnections(connections);

    // Ambos os perfis são notificados que a conexão será feita e solicitados a assinar o Termo de Responsabilidade (Success Fee)
    this.broadcastNotification({
      title: `Conexão Aprovada! Assine o Termo de Responsabilidade (Success Fee)`,
      sender: "Compliance & Jurídico The Bridge",
      category: "PROPOSTA",
      preview: `A conexão para o projeto "${target.articleTitle.slice(0, 40)}..." foi aceita! Assine o Termo para liberar os contatos.`,
      body: `Excelente notícia!\n\nO perfil pesquisador aceitou a conexão referente ao projeto:\n"${target.articleTitle}"\n\nA conexão entre o Perfil Empresa e o Perfil Pesquisador será efetivada! Para concluirmos a aproximação e liberarmos as respectivas informações de contato (nomes, instituições, e-mails e telefones), solicitamos que AMBAS as partes assinem digitalmente o Termo de Responsabilidade e Success Fee na aba 'Minhas Conexões'.`,
      actionUrl: "/dashboard/conexoes",
      connectionId: target.id,
      targetRole: "ALL",
    });

    return target;
  },

  /**
   * Etapa 4: Assinatura do Termo de Responsabilidade (Success Fee) pela Empresa ou pelo Pesquisador.
   * Quando AMBOS assinarem o termo, a conexão é efetivada ('CONECTADO') e ambos recebem as informações de contato!
   */
  signResponsibilityTerm(id: string, signerRole: "COMPANY" | "RESEARCHER"): ConnectionItem | null {
    const connections = this.getAllConnections();
    const target = connections.find((c) => c.id === id);
    if (!target) return null;

    const nowStr = new Date().toLocaleDateString("pt-BR") + " às " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    if (signerRole === "COMPANY") {
      target.companySignedTerm = true;
      target.companySignedAt = nowStr;
    } else {
      target.researcherSignedTerm = true;
      target.researcherSignedAt = nowStr;
    }

    // Verifica se AMBOS já assinaram o Termo de Responsabilidade
    if (target.companySignedTerm && target.researcherSignedTerm) {
      target.status = "CONECTADO";
      target.updatedAt = "Hoje";
      this.saveAllConnections(connections);

      // Notifica ambos os perfis com as respectivas informações de contato desbloqueadas!
      this.broadcastNotification({
        title: `🎉 Conexão Efetivada! Termo Assinado por Ambos — Contatos Liberados`,
        sender: "The Bridge Matchmaking",
        category: "CONEXAO",
        preview: `Termo de Responsabilidade concluído! Confira os dados de contato liberados para "${target.articleTitle.slice(0, 35)}...".`,
        body: `Parabéns! Tanto o Perfil Empresa quanto o Perfil Pesquisador assinaram o Termo de Responsabilidade e Success Fee The Bridge.\n\nA conexão para o projeto "${target.articleTitle}" está oficialmente efetivada!\n\n🔓 DADOS DE CONTATO DESBLOQUEADOS:\n\n🏢 Dados da Empresa:\n• Razão Social / Nome: ${target.companyName}\n• Representante: ${target.companyContactName || "Gestor de Inovação"}\n• Área de Atuação: ${target.companySector}\n• E-mail Corporativo: ${target.companyEmail || "contato@empresa.com.br"}\n• Telefone: ${target.companyPhone || "(11) 3000-0000"}\n\n🎓 Dados do Pesquisador / Grupo de Pesquisa:\n• Autores / Responsável: ${target.researcherName}\n• Vínculo Institucional: ${target.researcherAffiliation || "ICT / Universidade"}\n• E-mail Acadêmico: ${target.researcherEmail || "pesquisador@universidade.edu.br"}\n• Telefone: ${target.researcherPhone || "(11) 98000-0000"}\n\nTodas essas informações também já estão visíveis sem censura na sua aba 'Minhas Conexões'.`,
        actionUrl: "/dashboard/conexoes",
        connectionId: target.id,
        targetRole: "ALL",
      });
    } else {
      this.saveAllConnections(connections);

      const signedLabel = signerRole === "COMPANY" ? "Perfil Empresa" : "Perfil Pesquisador";
      const pendingLabel = signerRole === "COMPANY" ? "Perfil Pesquisador" : "Perfil Empresa";

      this.broadcastNotification({
        title: `Termo de Responsabilidade assinado pelo ${signedLabel}`,
        sender: "Compliance & Jurídico The Bridge",
        category: "PROPOSTA",
        preview: `Sua assinatura foi registrada. Aguardando assinatura do ${pendingLabel} para liberar os contatos.`,
        body: `Registramos com sucesso a assinatura digital do ${signedLabel} no Termo de Responsabilidade (Success Fee) referente ao projeto:\n"${target.articleTitle}"\n\nAssim que o ${pendingLabel} também concluir a assinatura, a conexão será efetivada e os dados de contato de ambas as partes serão liberados imediatamente.`,
        actionUrl: "/dashboard/conexoes",
        connectionId: target.id,
        targetRole: "ALL",
      });
    }

    return target;
  },

  updateConnectionStatus(id: string, status: ConnectionItem["status"]) {
    if (status === "ACEITA") {
      return this.respondConnectionByResearcher(id, true);
    }
    if (status === "RECUSADA") {
      return this.respondConnectionByResearcher(id, false);
    }
    const connections = this.getAllConnections().map((c) =>
      c.id === id ? { ...c, status, updatedAt: "Hoje" } : c
    );
    this.saveAllConnections(connections);
  },

  getNotifications(userEmail?: string): NotificationItem[] {
    const email = (userEmail || authService.getStoredUser()?.email || "").toLowerCase().trim();
    const key = getNotificationsStorageKey(email);

    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }

    localStorage.setItem(key, JSON.stringify(INITIAL_NOTIFICATIONS));
    return INITIAL_NOTIFICATIONS;
  },

  addNotification(item: Omit<NotificationItem, "id" | "date" | "read">, userEmail?: string) {
    const email = (userEmail || authService.getStoredUser()?.email || "").toLowerCase().trim();
    const key = getNotificationsStorageKey(email);
    const notifications = this.getNotifications(email);
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...item,
      date: "Agora mesmo",
      read: false,
    };
    notifications.unshift(newNotif);
    try {
      localStorage.setItem(key, JSON.stringify(notifications));
    } catch {}
  },

  /**
   * Dispara notificação para a conta ativa e para as contas de homologação para facilitar testes entre perfis
   */
  broadcastNotification(item: Omit<NotificationItem, "id" | "date" | "read">) {
    const currentEmail = (authService.getStoredUser()?.email || "").toLowerCase().trim();
    const targets = new Set<string>([
      currentEmail,
      ...VERIFICATION_DEMO_EMAILS.map((e) => e.toLowerCase().trim()),
      "",
    ]);
    targets.forEach((email) => {
      const key = getNotificationsStorageKey(email || undefined);
      try {
        const existingRaw = localStorage.getItem(key);
        const list: NotificationItem[] = existingRaw ? JSON.parse(existingRaw) : [...INITIAL_NOTIFICATIONS];
        const newNotif: NotificationItem = {
          id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          ...item,
          date: "Agora mesmo",
          read: false,
        };
        list.unshift(newNotif);
        localStorage.setItem(key, JSON.stringify(list));
      } catch {}
    });
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
