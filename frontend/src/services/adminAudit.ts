import { authService, type User } from "./auth";
import { connectionsService } from "./connections";
import { discordWebhookService } from "./discordWebhook";

export interface VerificationRequestItem {
  id: string;
  userId: string;
  profileType: "COMPANY" | "RESEARCHER";
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  cnpj?: string;
  cnpjStatus?: string;
  razaoSocial?: string;
  industrySector?: string;
  university?: string;
  department?: string;
  roleTitle?: string;
  website?: string;
  lattes?: string;
  linkedin?: string;
  bio?: string;
  logoUrl?: string;
  status: "EM_ANALISE" | "VERIFICADO" | "RECUSADO";
  submittedAt: string;
  auditedAt?: string;
  auditedBy?: string;
  auditFeedback?: string;
}

const STORAGE_KEY = "thebridge_verification_queue";

const INITIAL_REQUESTS: VerificationRequestItem[] = [
  {
    id: "req-comp-01",
    userId: "usr-empresa-demo",
    profileType: "COMPANY",
    name: "Dr. Roberto Albuquerque",
    email: "r.albuquerque@braskem.com.br",
    phone: "(11) 3456-7890",
    cnpj: "42.150.391/0001-70",
    cnpjStatus: "ATIVA",
    razaoSocial: "Braskem S.A.",
    industrySector: "Fabricação de produtos químicos e resinas termoplásticas",
    roleTitle: "Gerente de P&D e Novos Negócios",
    website: "https://www.braskem.com.br",
    linkedin: "https://linkedin.com/company/braskem",
    bio: "Buscamos grupos acadêmicos de ponta com soluções em reciclagem química avançada de polímeros, nanocelulose e bioplásticos para projetos conjuntos e co-desenvolvimento.",
    logoUrl: "https://www.google.com/s2/favicons?domain=braskem.com.br&sz=128",
    status: "EM_ANALISE",
    submittedAt: "08/10/2026 03:15",
  },
  {
    id: "req-res-01",
    userId: "usr-pesquisador-demo",
    profileType: "RESEARCHER",
    name: "Profa. Dra. Mariana Dornelles",
    email: "mariana.dornelles@unicamp.br",
    phone: "(19) 98765-4321",
    cpf: "123.456.789-00",
    university: "Universidade Estadual de Campinas (UNICAMP)",
    department: "Instituto de Química - Laboratório de Materiais Avançados",
    roleTitle: "Professora Titular e Pesquisadora CNPq 1A",
    lattes: "http://lattes.cnpq.br/1234567890123456",
    linkedin: "https://linkedin.com/in/mariana-dornelles-quimica",
    bio: "Coordeno o grupo de síntese de nanomateriais para transição energética, com 4 patentes depositadas no INPI e 85 artigos internacionais em catalisadores para hidrogênio verde.",
    status: "EM_ANALISE",
    submittedAt: "08/10/2026 03:40",
  },
];

export const adminAuditService = {
  getRequests(): VerificationRequestItem[] {
    if (typeof window === "undefined") return INITIAL_REQUESTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REQUESTS));
        return INITIAL_REQUESTS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_REQUESTS;
    }
  },

  saveRequests(requests: VerificationRequestItem[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    } catch (err) {
      console.warn("Erro ao salvar fila de verificação:", err);
    }
  },

  /**
   * Adiciona ou atualiza uma submissão de perfil na fila de auditoria e despacha para o Discord
   */
  async submitProfileForAudit(user: Partial<User>): Promise<VerificationRequestItem> {
    const list = this.getRequests();
    const existingIndex = list.findIndex(
      (r) => r.userId === user.id || (user.email && r.email.toLowerCase() === user.email.toLowerCase())
    );

    const nowStr = new Date().toLocaleString("pt-BR");
    const newItem: VerificationRequestItem = {
      id: existingIndex >= 0 ? list[existingIndex].id : `req-${Date.now()}`,
      userId: user.id || `usr-${Date.now()}`,
      profileType: user.profileType || "COMPANY",
      name: user.name || (user.profileType === "COMPANY" ? user.companyName || "Empresa" : "Pesquisador"),
      email: user.email || "",
      phone: user.phone,
      cpf: user.cpf,
      cnpj: user.cnpj,
      cnpjStatus: user.cnpjValidationData?.situacao || "ATIVA",
      razaoSocial: user.cnpjValidationData?.razaoSocial || user.companyName,
      industrySector: user.industrySector,
      university: user.university,
      department: user.department,
      roleTitle: user.roleTitle,
      website: user.website,
      lattes: user.lattes,
      linkedin: user.linkedin,
      bio: user.bio,
      logoUrl: user.logoUrl,
      status: "EM_ANALISE",
      submittedAt: nowStr,
    };

    if (existingIndex >= 0) {
      list[existingIndex] = newItem;
    } else {
      list.unshift(newItem);
    }

    this.saveRequests(list);

    // Enviar notificação em tempo real para o Discord do TI
    await discordWebhookService.notifyProfileSubmitted({
      profileType: newItem.profileType,
      name: newItem.name,
      email: newItem.email,
      phone: newItem.phone,
      cpf: newItem.cpf,
      cnpj: newItem.cnpj,
      cnpjStatus: newItem.cnpjStatus,
      razaoSocial: newItem.razaoSocial,
      industrySector: newItem.industrySector,
      university: newItem.university,
      department: newItem.department,
      roleTitle: newItem.roleTitle,
      website: newItem.website,
      lattes: newItem.lattes,
      linkedin: newItem.linkedin,
      bio: newItem.bio,
      logoUrl: newItem.logoUrl,
    });

    return newItem;
  },

  /**
   * O TI aprova o perfil: status vira VERIFICADO, ganha Ouro e envia aviso no Discord e na conta do usuário
   */
  async approveProfile(requestId: string, notes: string = "Informações homologadas pela curadoria The Bridge"): Promise<boolean> {
    const list = this.getRequests();
    const item = list.find((r) => r.id === requestId);
    if (!item) return false;

    item.status = "VERIFICADO";
    item.auditedAt = new Date().toLocaleString("pt-BR");
    item.auditedBy = "Equipe de TI & Compliance The Bridge";
    item.auditFeedback = notes;
    this.saveRequests(list);

    // Se o perfil aprovado for o do usuário logado atualmente, atualiza sua sessão
    const currentUser = authService.getStoredUser();
    if (currentUser && (currentUser.id === item.userId || currentUser.email === item.email)) {
      await authService.updateProfile({
        verificationStatus: "VERIFICADO",
        tier: "OURO",
        tierScore: 100,
      });
    }

    // Criar notificação na central do usuário
    connectionsService.addNotification({
      title: "🎉 Perfil Verificado Oficialmente pela The Bridge!",
      sender: "Equipe de Auditoria & Compliance",
      category: "SISTEMA",
      preview: "Sua documentação e credenciais foram homologadas. Seu perfil recebeu o selo de autenticidade Ouro.",
      body: `Prezado(a) ${item.name},\n\nÉ com grande satisfação que informamos que as informações do seu perfil foram verificadas e homologadas com sucesso pela nossa equipe de auditoria!\n\nSeu perfil recebeu o selo oficial de verificação na plataforma The Bridge, garantindo prioridade máxima nas buscas e destaque nos algoritmos de matching cooperativo.\n\nObservação da auditoria: ${notes}`,
      actionUrl: "/dashboard/perfil",
    });

    // Enviar notificação de decisão para o Discord da equipe
    await discordWebhookService.notifyAuditDecision(
      item.razaoSocial || item.name,
      item.profileType,
      "APROVADO",
      notes
    );

    return true;
  },

  /**
   * O TI recusa ou solicita ajustes no perfil: status vira RECUSADO e notifica o usuário com as instruções
   */
  async rejectProfile(requestId: string, feedback: string): Promise<boolean> {
    const list = this.getRequests();
    const item = list.find((r) => r.id === requestId);
    if (!item) return false;

    item.status = "RECUSADO";
    item.auditedAt = new Date().toLocaleString("pt-BR");
    item.auditedBy = "Equipe de TI & Compliance The Bridge";
    item.auditFeedback = feedback;
    this.saveRequests(list);

    // Se for o usuário atual
    const currentUser = authService.getStoredUser();
    if (currentUser && (currentUser.id === item.userId || currentUser.email === item.email)) {
      await authService.updateProfile({
        verificationStatus: "RECUSADO",
      });
    }

    // Notificar usuário sobre as pendências
    connectionsService.addNotification({
      title: "⚠️ Solicitação de Ajustes no Perfil (Auditoria)",
      sender: "Equipe de Auditoria & Compliance",
      category: "SISTEMA",
      preview: "A curadoria analisou suas informações e identificou pontos que precisam de complementação.",
      body: `Prezado(a) ${item.name},\n\nNossa equipe de auditoria analisou sua solicitação de verificação e identificou pontos a serem ajustados antes da homologação final.\n\nMotivo / Ajustes necessários:\n${feedback}\n\nPor favor, acesse seu perfil, atualize os dados solicitados e reenvie para análise.`,
      actionUrl: "/dashboard/perfil",
    });

    // Notificar o Discord
    await discordWebhookService.notifyAuditDecision(
      item.razaoSocial || item.name,
      item.profileType,
      "RECUSADO",
      feedback
    );

    return true;
  },
};
