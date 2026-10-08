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

export type UserRequestType = "ALTERACAO_EMAIL" | "MUDANCA_PERFIL" | "OUTRO";
export type UserRequestStatus = "PENDENTE" | "ACEITA" | "RECUSADA";

export interface UserRequestItem {
  id: string;
  userId: string;
  userName: string;
  currentEmail: string;
  requestedEmail?: string;
  currentProfileType: "COMPANY" | "RESEARCHER";
  requestedProfileType?: "COMPANY" | "RESEARCHER";
  type: UserRequestType;
  title: string;
  justification: string;
  status: UserRequestStatus;
  submittedAt: string;
  auditedAt?: string;
  auditedBy?: string;
  auditFeedback?: string;
}

const STORAGE_KEY_VERIFICATIONS = "thebridge_verification_queue";
const STORAGE_KEY_USER_REQUESTS = "thebridge_user_requests";
const STORAGE_KEY_ADMIN_EMAILS = "thebridge_admin_emails";

const DEFAULT_ADMIN_EMAILS: string[] = ["pclipe00@gmail.com"];

const INITIAL_VERIFICATIONS: VerificationRequestItem[] = [
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

const INITIAL_USER_REQUESTS: UserRequestItem[] = [
  {
    id: "ureq-01",
    userId: "usr-juliana-usp",
    userName: "Dra. Juliana Mendes",
    currentEmail: "juliana.mendes@usp.br",
    requestedEmail: "j.mendes.pesquisa@gmail.com",
    currentProfileType: "RESEARCHER",
    type: "ALTERACAO_EMAIL",
    title: "Solicitação de Alteração de E-mail de Contato",
    justification: "Concluí meu pós-doutorado na USP e meu vínculo institucional pelo e-mail institucional @usp.br será desativado neste mês. Gostaria de atualizar meu e-mail permanente de contato da conta para j.mendes.pesquisa@gmail.com para continuar recebendo propostas e notificações de matching de projetos na plataforma.",
    status: "PENDENTE",
    submittedAt: "08/10/2026 04:10",
  },
  {
    id: "ureq-02",
    userId: "usr-lucas-startup",
    userName: "Lucas Vasconcelos",
    currentEmail: "lucas.v@nanobio.com.br",
    currentProfileType: "RESEARCHER",
    requestedProfileType: "COMPANY",
    type: "MUDANCA_PERFIL",
    title: "Solicitação de Migração de Perfil: Pesquisador ➔ Empresa",
    justification: "Iniciei na plataforma como pesquisador independente durante a fase laboratorial de bancada. Recentemente fundamos a startup Nanobio Biotecnologia S.A. (CNPJ: 51.982.334/0001-19) com investimento anjo e agora precisamos cadastrar demandas corporativas e buscar cooperação com outras universidades titulares de patentes.",
    status: "PENDENTE",
    submittedAt: "08/10/2026 04:35",
  },
  {
    id: "ureq-03",
    userId: "usr-carlos-ufrj",
    userName: "Prof. Carlos Eduardo Siqueira",
    currentEmail: "carlos.siqueira@ufrj.br",
    requestedEmail: "carlos.siqueira@metalurgia.ufrj.br",
    currentProfileType: "RESEARCHER",
    type: "ALTERACAO_EMAIL",
    title: "Atualização de E-mail do Departamento",
    justification: "A reitoria da UFRJ migrou as contas institucionais do departamento de metalurgia para o subdomínio @metalurgia.ufrj.br. Solicito a atualização do login.",
    status: "ACEITA",
    submittedAt: "07/10/2026 18:20",
    auditedAt: "07/10/2026 19:10",
    auditedBy: "Equipe de TI The Bridge",
    auditFeedback: "E-mail institucional confirmado e atualizado no cadastro da plataforma.",
  },
];

export const adminAuditService = {
  // ==========================================
  // GESTÃO DE ADMINISTRADORES
  // ==========================================

  getAdminEmails(): string[] {
    if (typeof window === "undefined") return DEFAULT_ADMIN_EMAILS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ADMIN_EMAILS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_ADMIN_EMAILS, JSON.stringify(DEFAULT_ADMIN_EMAILS));
        return DEFAULT_ADMIN_EMAILS;
      }
      const list: string[] = JSON.parse(stored);
      // Garantir que pclipe00@gmail.com sempre faça parte da lista
      if (!list.map((e) => e.toLowerCase()).includes("pclipe00@gmail.com")) {
        list.unshift("pclipe00@gmail.com");
        localStorage.setItem(STORAGE_KEY_ADMIN_EMAILS, JSON.stringify(list));
      }
      return list;
    } catch {
      return DEFAULT_ADMIN_EMAILS;
    }
  },

  isAdmin(email?: string): boolean {
    if (!email) return false;
    const clean = email.trim().toLowerCase();
    const adminEmails = this.getAdminEmails().map((e) => e.trim().toLowerCase());
    return adminEmails.includes(clean);
  },

  addAdminEmail(email: string): boolean {
    const clean = email.trim().toLowerCase();
    if (!clean || !clean.includes("@")) return false;
    const list = this.getAdminEmails();
    if (list.map((e) => e.toLowerCase()).includes(clean)) return true;
    list.push(clean);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_ADMIN_EMAILS, JSON.stringify(list));
    }
    return true;
  },

  removeAdminEmail(email: string): boolean {
    const clean = email.trim().toLowerCase();
    if (clean === "pclipe00@gmail.com") return false; // Impede remover o admin principal
    let list = this.getAdminEmails();
    list = list.filter((e) => e.trim().toLowerCase() !== clean);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_ADMIN_EMAILS, JSON.stringify(list));
    }
    return true;
  },

  // ==========================================
  // FILA DE AUDITORIA DE VERACIDADE DE PERFIS
  // ==========================================

  getRequests(): VerificationRequestItem[] {
    if (typeof window === "undefined") return INITIAL_VERIFICATIONS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_VERIFICATIONS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_VERIFICATIONS, JSON.stringify(INITIAL_VERIFICATIONS));
        return INITIAL_VERIFICATIONS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_VERIFICATIONS;
    }
  },

  saveRequests(requests: VerificationRequestItem[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY_VERIFICATIONS, JSON.stringify(requests));
    } catch (err) {
      console.warn("Erro ao salvar fila de verificação:", err);
    }
  },

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

  async approveProfile(requestId: string, notes: string = "Informações homologadas pela curadoria The Bridge"): Promise<boolean> {
    const list = this.getRequests();
    const item = list.find((r) => r.id === requestId);
    if (!item) return false;

    item.status = "VERIFICADO";
    item.auditedAt = new Date().toLocaleString("pt-BR");
    item.auditedBy = "Equipe de TI & Compliance The Bridge";
    item.auditFeedback = notes;
    this.saveRequests(list);

    const currentUser = authService.getStoredUser();
    if (currentUser && (currentUser.id === item.userId || currentUser.email === item.email)) {
      await authService.updateProfile({
        verificationStatus: "VERIFICADO",
        tier: "OURO",
        tierScore: 100,
      });
    }

    connectionsService.addNotification({
      title: "🎉 Perfil Verificado Oficialmente pela The Bridge!",
      sender: "Equipe de Auditoria & Compliance",
      category: "SISTEMA",
      preview: "Sua documentação e credenciais foram homologadas. Seu perfil recebeu o selo de autenticidade Ouro.",
      body: `Prezado(a) ${item.name},\n\nÉ com grande satisfação que informamos que as informações do seu perfil foram verificadas e homologadas com sucesso pela nossa equipe de auditoria!\n\nSeu perfil recebeu o selo oficial de verificação na plataforma The Bridge, garantindo prioridade máxima nas buscas e destaque nos algoritmos de matching cooperativo.\n\nObservação da auditoria: ${notes}`,
      actionUrl: "/dashboard/perfil",
    });

    await discordWebhookService.notifyAuditDecision(
      item.razaoSocial || item.name,
      item.profileType,
      "APROVADO",
      notes
    );

    return true;
  },

  async rejectProfile(requestId: string, feedback: string): Promise<boolean> {
    const list = this.getRequests();
    const item = list.find((r) => r.id === requestId);
    if (!item) return false;

    item.status = "RECUSADO";
    item.auditedAt = new Date().toLocaleString("pt-BR");
    item.auditedBy = "Equipe de TI & Compliance The Bridge";
    item.auditFeedback = feedback;
    this.saveRequests(list);

    const currentUser = authService.getStoredUser();
    if (currentUser && (currentUser.id === item.userId || currentUser.email === item.email)) {
      await authService.updateProfile({
        verificationStatus: "RECUSADO",
      });
    }

    connectionsService.addNotification({
      title: "⚠️ Solicitação de Ajustes no Perfil (Auditoria)",
      sender: "Equipe de Auditoria & Compliance",
      category: "SISTEMA",
      preview: "A curadoria analisou suas informações e identificou pontos que precisam de complementação.",
      body: `Prezado(a) ${item.name},\n\nNossa equipe de auditoria analisou sua solicitação de verificação e identificou pontos a serem ajustados antes da homologação final.\n\nMotivo / Ajustes necessários:\n${feedback}\n\nPor favor, acesse seu perfil, atualize os dados solicitados e reenvie para análise.`,
      actionUrl: "/dashboard/perfil",
    });

    await discordWebhookService.notifyAuditDecision(
      item.razaoSocial || item.name,
      item.profileType,
      "RECUSADO",
      feedback
    );

    return true;
  },

  // ==========================================
  // GESTÃO DE SOLICITAÇÕES DE USUÁRIOS
  // (Troca de Email ou Migração de Tipo de Perfil)
  // ==========================================

  getUserRequests(): UserRequestItem[] {
    if (typeof window === "undefined") return INITIAL_USER_REQUESTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER_REQUESTS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_USER_REQUESTS, JSON.stringify(INITIAL_USER_REQUESTS));
        return INITIAL_USER_REQUESTS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_USER_REQUESTS;
    }
  },

  saveUserRequests(items: UserRequestItem[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY_USER_REQUESTS, JSON.stringify(items));
    } catch (err) {
      console.warn("Erro ao salvar solicitações de usuários:", err);
    }
  },

  async acceptUserRequest(requestId: string, notes: string = "Solicitação aprovada pela equipe de administração The Bridge."): Promise<boolean> {
    const list = this.getUserRequests();
    const item = list.find((r) => r.id === requestId);
    if (!item) return false;

    item.status = "ACEITA";
    item.auditedAt = new Date().toLocaleString("pt-BR");
    item.auditedBy = "Equipe de TI The Bridge";
    item.auditFeedback = notes;
    this.saveUserRequests(list);

    // Se a solicitação pertence ao usuário logado ou conta conhecida
    const currentUser = authService.getStoredUser();
    if (currentUser && (currentUser.id === item.userId || currentUser.email === item.currentEmail)) {
      if (item.type === "ALTERACAO_EMAIL" && item.requestedEmail) {
        await authService.updateProfile({
          email: item.requestedEmail.trim().toLowerCase(),
        });
      } else if (item.type === "MUDANCA_PERFIL" && item.requestedProfileType) {
        await authService.updateProfile({
          profileType: item.requestedProfileType,
        });
      }
    }

    const typeDesc =
      item.type === "ALTERACAO_EMAIL"
        ? `Alteração de E-mail para "${item.requestedEmail}"`
        : `Mudança de Perfil para "${item.requestedProfileType === "COMPANY" ? "Empresa" : "Pesquisador"}"`;

    // Notificar usuário
    connectionsService.addNotification({
      title: "✅ Solicitação de Conta Aprovada!",
      sender: "Administração The Bridge",
      category: "SISTEMA",
      preview: `Sua solicitação de ${typeDesc} foi aprovada com sucesso.`,
      body: `Prezado(a) ${item.userName},\n\nSua solicitação de ${typeDesc} foi atendida com sucesso pela equipe de administração da The Bridge.\n\nObservação: ${notes}`,
      actionUrl: "/dashboard/perfil",
    });

    // Notificar Discord
    await discordWebhookService.notifyUserRequestDecision(
      item.userName,
      typeDesc,
      "ACEITA",
      notes
    );

    return true;
  },

  async rejectUserRequest(requestId: string, feedback: string): Promise<boolean> {
    const list = this.getUserRequests();
    const item = list.find((r) => r.id === requestId);
    if (!item) return false;

    item.status = "RECUSADA";
    item.auditedAt = new Date().toLocaleString("pt-BR");
    item.auditedBy = "Equipe de TI The Bridge";
    item.auditFeedback = feedback;
    this.saveUserRequests(list);

    const typeDesc =
      item.type === "ALTERACAO_EMAIL"
        ? "Alteração de E-mail"
        : "Mudança de Tipo de Perfil";

    connectionsService.addNotification({
      title: "❌ Solicitação de Conta Recusada",
      sender: "Administração The Bridge",
      category: "SISTEMA",
      preview: `Sua solicitação de ${typeDesc} não pôde ser atendida neste momento.`,
      body: `Prezado(a) ${item.userName},\n\nNossa equipe analisou sua solicitação de ${typeDesc} e ela não pôde ser homologada.\n\nMotivo da recusa:\n${feedback}\n\nCaso tenha dúvidas ou queira enviar documentação complementar, entre em contato conosco.`,
      actionUrl: "/dashboard/perfil",
    });

    await discordWebhookService.notifyUserRequestDecision(
      item.userName,
      typeDesc,
      "RECUSADA",
      feedback
    );

    return true;
  },

  // ==========================================
  // CONTADORES PARA BADGE NO ÍCONE DE ESCUDO
  // ==========================================

  getPendingVerificationsCount(): number {
    return this.getRequests().filter((r) => r.status === "EM_ANALISE").length;
  },

  getPendingUserRequestsCount(): number {
    return this.getUserRequests().filter((r) => r.status === "PENDENTE").length;
  },

  getPendingTotalCount(): number {
    return this.getPendingVerificationsCount() + this.getPendingUserRequestsCount();
  },
};
