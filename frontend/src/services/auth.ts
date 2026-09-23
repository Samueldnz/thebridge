import { env } from "../config/env";

export type ProfileType = "COMPANY" | "RESEARCHER";
export type ProfileTier = "BRONZE" | "PRATA" | "OURO";

export interface UserProfileFields {
  university?: string;
  department?: string;
  companyName?: string;
  industrySector?: string;
  cpf?: string;
  cnpj?: string;
  linkedin?: string;
  lattes?: string;
  website?: string;
  phone?: string;
  bio?: string;
  roleTitle?: string;
  location?: string;
}

export interface User extends UserProfileFields {
  id: string;
  name: string;
  email: string;
  profileType: ProfileType;
  systemRole?: string;
  status?: string;
  profileCompleted?: boolean;
  tier?: ProfileTier;
  tierScore?: number;
}

export interface ProfileChecklistItem {
  id: string;
  label: string;
  points: number;
  completed: boolean;
  hint: string;
}

export interface ProfileTierResult {
  tier: ProfileTier;
  score: number; // 0..100
  nextTier: ProfileTier | null;
  pointsToNextTier: number;
  checklist: ProfileChecklistItem[];
}

export function calculateProfileTier(user: Partial<User> | null | undefined): ProfileTierResult {
  if (!user) {
    return {
      tier: "BRONZE",
      score: 0,
      nextTier: "PRATA",
      pointsToNextTier: 40,
      checklist: [],
    };
  }

  const isResearcher = user.profileType === "RESEARCHER";

  const checklist: ProfileChecklistItem[] = isResearcher
    ? [
        {
          id: "name",
          label: "Nome Completo do Pesquisador",
          points: 10,
          completed: Boolean(user.name && user.name.trim().length >= 3),
          hint: "Identificação civil do autor/pesquisador",
        },
        {
          id: "cpf",
          label: "CPF do Pesquisador",
          points: 10,
          completed: Boolean(user.cpf && user.cpf.trim().length >= 8),
          hint: "Autenticidade fiscal da pessoa física",
        },
        {
          id: "university",
          label: "Universidade / Instituto Vinculado",
          points: 15,
          completed: Boolean(user.university && user.university.trim().length >= 2),
          hint: "Instituição de ensino superior ou centro científico de vínculo",
        },
        {
          id: "department",
          label: "Laboratório / Grupo de Pesquisa",
          points: 10,
          completed: Boolean(user.department && user.department.trim().length >= 2),
          hint: "Unidade de pesquisa ou laboratório específico",
        },
        {
          id: "roleTitle",
          label: "Titulação Acadêmica (ex: Doutor, Pós-Doc)",
          points: 10,
          completed: Boolean(user.roleTitle && user.roleTitle.trim().length >= 2),
          hint: "Nível acadêmico e função no laboratório",
        },
        {
          id: "email",
          label: "E-mail de Contato",
          points: 10,
          completed: Boolean(user.email && user.email.includes("@")),
          hint: "Canal oficial para notificações e matches",
        },
        {
          id: "phone",
          label: "Telefone / Celular",
          points: 10,
          completed: Boolean(user.phone && user.phone.trim().length >= 8),
          hint: "Canal direto para contato e reuniões",
        },
        {
          id: "location",
          label: "Localização (Cidade - UF)",
          points: 10,
          completed: Boolean(user.location && user.location.trim().length >= 3),
          hint: "Região do centro científico",
        },
        {
          id: "lattes",
          label: "Currículo Lattes (CNPq)",
          points: 10,
          completed: Boolean(user.lattes && user.lattes.trim().length >= 4),
          hint: "Comprovação de publicações e histórico acadêmico",
        },
        {
          id: "linkedin",
          label: "LinkedIn Pessoal",
          points: 5,
          completed: Boolean(user.linkedin && user.linkedin.trim().length >= 4),
          hint: "Rede profissional para conexões de mercado",
        },
        {
          id: "bio",
          label: "Linhas de Pesquisa / Resumo Científico",
          points: 5,
          completed: Boolean(user.bio && user.bio.trim().length >= 15),
          hint: "Apresentação técnica das linhas de pesquisa",
        },
      ]
    : [
        {
          id: "companyName",
          label: "Razão Social / Nome da Empresa",
          points: 15,
          completed: Boolean(user.companyName && user.companyName.trim().length >= 2),
          hint: "Nome oficial da organização corporativa",
        },
        {
          id: "cnpj",
          label: "CNPJ da Empresa",
          points: 15,
          completed: Boolean(user.cnpj && user.cnpj.trim().length >= 8),
          hint: "Validação jurídica da pessoa jurídica",
        },
        {
          id: "industrySector",
          label: "Setor Industrial / Segmento",
          points: 10,
          completed: Boolean(user.industrySector && user.industrySector.trim().length >= 2),
          hint: "Área de atuação no mercado (ex: Farmacêutico, Agro, Energia)",
        },
        {
          id: "name",
          label: "Representante / Ponto de Contato",
          points: 10,
          completed: Boolean(user.name && user.name.trim().length >= 3),
          hint: "Gestor responsável pela comunicação com pesquisadores",
        },
        {
          id: "roleTitle",
          label: "Cargo do Representante (ex: Diretor de P&D)",
          points: 10,
          completed: Boolean(user.roleTitle && user.roleTitle.trim().length >= 2),
          hint: "Função executiva de inovação ou P&D",
        },
        {
          id: "email",
          label: "E-mail Corporativo",
          points: 10,
          completed: Boolean(user.email && user.email.includes("@")),
          hint: "E-mail oficial para recebimento de propostas",
        },
        {
          id: "phone",
          label: "Telefone / WhatsApp Comercial",
          points: 10,
          completed: Boolean(user.phone && user.phone.trim().length >= 8),
          hint: "Agendamento de reuniões corporativas",
        },
        {
          id: "location",
          label: "Sede da Empresa (Cidade - UF)",
          points: 10,
          completed: Boolean(user.location && user.location.trim().length >= 3),
          hint: "Localização da matriz ou centro de P&D",
        },
        {
          id: "website",
          label: "Website Corporativo",
          points: 5,
          completed: Boolean(user.website && user.website.trim().length >= 4),
          hint: "Portal oficial da empresa",
        },
        {
          id: "linkedin",
          label: "LinkedIn Corporativo",
          points: 5,
          completed: Boolean(user.linkedin && user.linkedin.trim().length >= 4),
          hint: "Página corporativa da empresa",
        },
      ];

  const score = checklist.reduce((sum, item) => (item.completed ? sum + item.points : sum), 0);

  let tier: ProfileTier = "BRONZE";
  let nextTier: ProfileTier | null = "PRATA";
  let pointsToNextTier = Math.max(0, 40 - score);

  if (score >= 80) {
    tier = "OURO";
    nextTier = null;
    pointsToNextTier = 0;
  } else if (score >= 40) {
    tier = "PRATA";
    nextTier = "OURO";
    pointsToNextTier = Math.max(0, 80 - score);
  }

  return {
    tier,
    score,
    nextTier,
    pointsToNextTier,
    checklist,
  };
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  profileType: ProfileType;
}

export interface LoginPayload {
  email: string;
  password: string;
}

const TOKEN_KEY = "thebridge_auth_token";
const USER_KEY = "thebridge_auth_user";
const ACCOUNTS_KEY = "thebridge_known_accounts";

export const authService = {
  getStoredToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  getStoredUser(): User | null {
    try {
      const data = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
      if (!data) return null;
      const user: User = JSON.parse(data);
      const { tier, score } = calculateProfileTier(user);
      user.tier = tier;
      user.tierScore = score;
      return user;
    } catch {
      return null;
    }
  },

  getKnownAccounts(): Record<string, User> {
    try {
      const raw = localStorage.getItem(ACCOUNTS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  saveKnownAccount(user: User) {
    try {
      const accounts = this.getKnownAccounts();
      accounts[user.email.toLowerCase()] = user;
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch {
      // storage unavailable
    }
  },

  setSession(token: string, user: User, remember: boolean = true) {
    try {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem(TOKEN_KEY, token);
      storage.setItem(USER_KEY, JSON.stringify(user));
      this.saveKnownAccount(user);
    } catch {
      // Storage unavailable fallback
    }
  },

  clearSession() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    } catch {
      // Storage unavailable fallback
    }
  },

  isAuthenticated(): boolean {
    return Boolean(this.getStoredToken());
  },

  async login(payload: LoginPayload, remember: boolean = true): Promise<AuthResponse> {
    const cleanEmail = payload.email.trim().toLowerCase();

    try {
      const response = await fetch(`${env.apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: payload.password,
        }),
      });

      const isJson = response.headers.get("content-type")?.includes("application/json");
      if (!isJson) {
        throw new TypeError("Backend returned non-JSON response (offline/proxy fallback)");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage =
          errorData?.message ||
          (response.status === 401
            ? "Credenciais inválidas. Verifique seu e-mail e senha."
            : "Ocorreu um erro ao entrar. Tente novamente.");
        throw new Error(Array.isArray(errorMessage) ? errorMessage.join(", ") : errorMessage);
      }

      const data: AuthResponse = await response.json();
      let user = data.user;
      if (!user && data.accessToken) {
        try {
          const meRes = await fetch(`${env.apiUrl}/auth/me`, {
            headers: { Authorization: `Bearer ${data.accessToken}` },
          });
          if (meRes.ok) {
            user = await meRes.json();
          }
        } catch {
          // ignore
        }
      }
      this.setSession(data.accessToken, user, remember);
      return { accessToken: data.accessToken, user };
    } catch (err: unknown) {
      if (err instanceof Error && (err.name === "TypeError" || err.message.includes("fetch") || err.message.includes("offline"))) {
        // Backend offline demonstration fallback: check known accounts
        const known = this.getKnownAccounts()[cleanEmail];
        const isCompanyEmail = cleanEmail.includes("empresa") || cleanEmail.includes("company") || cleanEmail.includes("eurofarma");

        const mockUser: User = known || {
          id: isCompanyEmail ? "demo-company-1" : "demo-researcher-1",
          name: isCompanyEmail ? "Eurofarma Inovação & P&D" : "Dra. Carolina Fontes",
          email: cleanEmail,
          profileType: isCompanyEmail ? "COMPANY" : "RESEARCHER",
          status: "ACTIVE",
          profileCompleted: true,
        };

        const mockResponse: AuthResponse = {
          accessToken: "mock-jwt-token-preview",
          user: mockUser,
        };
        this.setSession(mockResponse.accessToken, mockUser, remember);
        return mockResponse;
      }
      throw err;
    }
  },

  async register(payload: RegisterPayload, remember: boolean = true): Promise<AuthResponse> {
    const cleanEmail = payload.email.trim().toLowerCase();

    try {
      const response = await fetch(`${env.apiUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: payload.name.trim(),
          email: cleanEmail,
          password: payload.password,
          profileType: payload.profileType,
        }),
      });

      const isJson = response.headers.get("content-type")?.includes("application/json");
      if (!isJson) {
        throw new TypeError("Backend returned non-JSON response (offline/proxy fallback)");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage =
          errorData?.message ||
          (response.status === 409
            ? "Este e-mail já está cadastrado na plataforma."
            : "Ocorreu um erro ao criar a conta. Tente novamente.");
        throw new Error(Array.isArray(errorMessage) ? errorMessage.join(", ") : errorMessage);
      }

      const data: AuthResponse = await response.json();
      let user = data.user;
      if (!user && data.accessToken) {
        try {
          const meRes = await fetch(`${env.apiUrl}/auth/me`, {
            headers: { Authorization: `Bearer ${data.accessToken}` },
          });
          if (meRes.ok) {
            user = await meRes.json();
          }
        } catch {
          // ignore
        }
      }
      this.setSession(data.accessToken, user, remember);
      return { accessToken: data.accessToken, user };
    } catch (err: unknown) {
      if (err instanceof Error && (err.name === "TypeError" || err.message.includes("fetch") || err.message.includes("offline"))) {
        // Backend offline demonstration fallback
        const mockUser: User = {
          id: `user-${Date.now()}`,
          name: payload.name.trim(),
          email: cleanEmail,
          profileType: payload.profileType,
          status: "ACTIVE",
          profileCompleted: true,
        };
        const mockResponse: AuthResponse = {
          accessToken: "mock-jwt-token-preview",
          user: mockUser,
        };
        this.setSession(mockResponse.accessToken, mockUser, remember);
        return mockResponse;
      }
      throw err;
    }
  },

  async updateProfile(fields: Partial<User>): Promise<User> {
    const current = this.getStoredUser();
    if (!current) {
      throw new Error("Usuário não autenticado");
    }

    const updatedUser: User = {
      ...current,
      ...fields,
      id: current.id,
      email: current.email,
      profileType: current.profileType,
    };

    const tierResult = calculateProfileTier(updatedUser);
    updatedUser.tier = tierResult.tier;
    updatedUser.tierScore = tierResult.score;

    const token = this.getStoredToken() || "mock-jwt-token-preview";
    this.setSession(token, updatedUser, true);

    try {
      await fetch(`${env.apiUrl}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUser),
      });
    } catch {
      // Offline fallback
    }

    return updatedUser;
  },
};
