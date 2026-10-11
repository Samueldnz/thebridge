import { type ReactNode, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRightLeft,
  Bell,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  Cookie,
  CreditCard,
  ExternalLink,
  FileText,
  KeyRound,
  Mail,
  PlusCircle,
  Receipt,
  RefreshCw,
  RotateCcw,
  Scale,
  ShieldCheck,
  Sparkles,
  Ticket,
  Trash2,
  XCircle,
} from "lucide-react";

import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { calculateProfileTier, type User } from "../../services/auth";

export type ProfileSettingsTabId =
  | "perfil"
  | "verificacao"
  | "pagamentos"
  | "seguranca"
  | "notificacoes"
  | "juridico";

const VALID_TABS: ProfileSettingsTabId[] = [
  "perfil",
  "verificacao",
  "pagamentos",
  "seguranca",
  "notificacoes",
  "juridico",
];

interface CreditTransaction {
  id: string;
  date: string;
  description: string;
  creditsDelta: number;
  amountBrl: string;
  status: "APROVADO" | "CORTESIA" | "UTILIZADO" | "REEMBOLSO_SOLICITADO";
  method: string;
}

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  priceBrl: string;
  unitPrice: string;
  badge?: string;
  description: string;
}

const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "pkg-1",
    name: "Desbloqueio Avulso",
    credits: 1,
    priceBrl: "R$ 190,00",
    unitPrice: "R$ 190 / conexão",
    description:
      "Ideal para desbloquear o contato completo e iniciar negociação direta em 1 match específico.",
  },
  {
    id: "pkg-5",
    name: "Pacote Prospecção P&D",
    credits: 5,
    priceBrl: "R$ 790,00",
    unitPrice: "R$ 158 / conexão (17% OFF)",
    badge: "Mais Escolhido",
    description:
      "Recomendado para empresas e ICTs avaliando múltiplas rotas tecnológicas em paralelo.",
  },
  {
    id: "pkg-15",
    name: "Pacote Inovação Aberta",
    credits: 15,
    priceBrl: "R$ 1.950,00",
    unitPrice: "R$ 130 / conexão (31% OFF)",
    badge: "Melhor Custo-Benefício",
    description:
      "Pacote corporativo para estruturação contínua de portfólio e parcerias com laboratórios.",
  },
];

const BRAZIL_LEGAL_COMPLIANCE_ITEMS = [
  {
    law: "Lei Geral de Proteção de Dados Pessoais — LGPD (Lei nº 13.709/2018)",
    status: "Em Conformidade",
    details:
      "Minimização de coleta de dados, anonimização de identidade antes do consentimento bilateral (duplo opt-in no match), registro de finalidade legítima e garantia dos direitos do titular (Art. 18: confirmação, acesso, retificação, portabilidade e eliminação de dados com janela de arrependimento).",
  },
  {
    law: "Marco Civil da Internet (Lei nº 12.965/2014 e Decreto nº 8.771/2016)",
    status: "Em Conformidade",
    details:
      "Guarda segura de registros de conexão e acesso à aplicação sob sigilo, transparência nos termos de uso, neutralidade no tratamento das informações e proteção à privacidade das comunicações entre pesquisadores e empresas.",
  },
  {
    law: "Código de Defesa do Consumidor e Comércio Eletrônico (Lei nº 8.078/1990 e Decreto nº 7.962/2013)",
    status: "Em Conformidade",
    details:
      "Direito de arrependimento assegurado (Art. 49 do CDC) para solicitação de reembolso em até 7 dias corridos após aquisição de planos ou créditos não utilizados, transparência nos preços de pacotes, renovação automática configurável e cancelamento imediato de assinatura.",
  },
  {
    law: "Marco Legal da Ciência, Tecnologia e Inovação (Lei nº 10.973/2004 e Lei nº 13.243/2016)",
    status: "Em Conformidade",
    details:
      "Estruturação das conexões e termos de responsabilidade alinhada às diretrizes de cooperação ICT-Empresa, estímulo à transferência de tecnologia, licenciamento de patentes e projetos de PD&I cooperativos com Núcleos de Inovação Tecnológica (NITs).",
  },
  {
    law: "Lei da Propriedade Industrial (Lei nº 9.279/1996) e Sigilo Industrial",
    status: "Em Conformidade",
    details:
      "Proteção de informações sensíveis e segredos de negócio por meio de censura preventiva de autoria/titularidade antes da assinatura mútua do Termo de Responsabilidade e Confidencialidade, preservando a novidade para fins de depósito de patentes junto ao INPI.",
  },
];

interface ProfileSettingsViewProps {
  user: User | null;
  isResearcher: boolean;
  profileTabContent: ReactNode;
  verificationStatus: string;
  submittingVerification?: boolean;
  onSubmitForVerification?: () => void;
  onOpenEmailModal: () => void;
  onOpenProfileTypeModal: () => void;
  onSaveProfile: () => void;
  savingProfile: boolean;
}

export function ProfileSettingsView({
  user,
  isResearcher,
  profileTabContent,
  verificationStatus,
  onOpenEmailModal,
  onOpenProfileTypeModal,
  onSaveProfile,
  savingProfile,
}: ProfileSettingsViewProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as ProfileSettingsTabId) || "perfil";
  const [activeTab, setActiveTab] = useState<ProfileSettingsTabId>(
    VALID_TABS.includes(initialTab) ? initialTab : "perfil"
  );

  useEffect(() => {
    const t = searchParams.get("tab") as ProfileSettingsTabId;
    if (t && VALID_TABS.includes(t)) {
      setActiveTab(t);
    }
  }, [searchParams]);

  const handleSelectTab = (tab: ProfileSettingsTabId) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  // Persistence keys per user
  const storagePrefix = `thebridge_billing_${(user?.email || "guest").toLowerCase().trim()}`;

  const [creditsBalance, setCreditsBalance] = useState<number>(() => {
    const saved = localStorage.getItem(`${storagePrefix}_credits`);
    return saved !== null ? parseInt(saved, 10) : 3;
  });

  const [currentPlan, setCurrentPlan] = useState<string>(() => {
    return (
      localStorage.getItem(`${storagePrefix}_plan`) ||
      user?.subscriptionPlan ||
      (user?.couponCode || user?.subscriptionStatus === "FREE_TRIAL"
        ? "Acesso Promocional Cortesia"
        : isResearcher
        ? "Plano Pesquisador & ICT"
        : "Plano Corporativo Standard")
    );
  });

  const [subscriptionActive, setSubscriptionActive] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${storagePrefix}_sub_active`);
    return saved !== null ? saved === "true" : true;
  });

  const [autoRenew, setAutoRenew] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${storagePrefix}_auto_renew`);
    return saved !== null ? saved === "true" : true;
  });

  const [transactions, setTransactions] = useState<CreditTransaction[]>(() => {
    const saved = localStorage.getItem(`${storagePrefix}_txs`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [
      {
        id: "TX-1001",
        date: "Ativação da Conta",
        description: "Bônus inicial de boas-vindas para desbloqueio de conexões",
        creditsDelta: 3,
        amountBrl: "Cortesia",
        status: "CORTESIA",
        method: "Crédito Institucional The Bridge",
      },
    ];
  });

  const [selectedPkg, setSelectedPkg] = useState<CreditPackage | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CARTAO" | "BOLETO">("PIX");
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseToast, setPurchaseToast] = useState<string | null>(null);

  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  // Refund & Cancel Subscription states
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundTxId, setRefundTxId] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [cancelSubModalOpen, setCancelSubModalOpen] = useState(false);
  const [cancelSubReason, setCancelSubReason] = useState("");

  // Security & Account Deletion states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordToast, setPasswordToast] = useState<string | null>(null);

  const [deleteProfileModalOpen, setDeleteProfileModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [deletionScheduledUntil, setDeletionScheduledUntil] = useState<string | null>(() =>
    localStorage.getItem(`${storagePrefix}_deletion_scheduled_until`)
  );

  // Notifications preferences
  const [notifPrefs, setNotifPrefs] = useState(() => {
    const saved = localStorage.getItem(`${storagePrefix}_notif_prefs`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      newMatches: true,
      connectionRequests: true,
      termUpdates: true,
      auditStatus: true,
      innovationDigest: false,
    };
  });
  const [notifSavedToast, setNotifSavedToast] = useState(false);

  // Legal / Cookies preferences
  const [cookiePrefs, setCookiePrefs] = useState(() => {
    const saved = localStorage.getItem(`${storagePrefix}_cookie_prefs`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      essential: true,
      functional: true,
      analytics: true,
    };
  });
  const [legalDocModal, setLegalDocModal] = useState<
    null | "TERMOS" | "PRIVACIDADE" | "COOKIES"
  >(null);
  const [cookieSavedToast, setCookieSavedToast] = useState(false);

  const handleConfirmPurchase = () => {
    if (!selectedPkg) return;
    setPurchasing(true);
    setTimeout(() => {
      const nextBalance = creditsBalance + selectedPkg.credits;
      setCreditsBalance(nextBalance);
      localStorage.setItem(`${storagePrefix}_credits`, String(nextBalance));

      const newTx: CreditTransaction = {
        id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toLocaleDateString("pt-BR"),
        description: `Compra: ${selectedPkg.name} (+${selectedPkg.credits} ${
          selectedPkg.credits === 1 ? "crédito" : "créditos"
        })`,
        creditsDelta: selectedPkg.credits,
        amountBrl: selectedPkg.priceBrl,
        status: "APROVADO",
        method:
          paymentMethod === "PIX"
            ? "PIX Corporativo"
            : paymentMethod === "CARTAO"
            ? "Cartão de Crédito"
            : "Boleto Faturado",
      };

      const nextTxs = [newTx, ...transactions];
      setTransactions(nextTxs);
      localStorage.setItem(`${storagePrefix}_txs`, JSON.stringify(nextTxs));

      setPurchasing(false);
      setPurchaseToast(
        `+${selectedPkg.credits} ${
          selectedPkg.credits === 1 ? "crédito adicionado" : "créditos adicionados"
        } ao seu saldo com sucesso!`
      );
      setSelectedPkg(null);
      setTimeout(() => setPurchaseToast(null), 5000);
    }, 600);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    const nextBalance = creditsBalance + 2;
    setCreditsBalance(nextBalance);
    localStorage.setItem(`${storagePrefix}_credits`, String(nextBalance));
    setCurrentPlan(`Plano Promocional (${code})`);
    localStorage.setItem(`${storagePrefix}_plan`, `Plano Promocional (${code})`);
    setSubscriptionActive(true);
    localStorage.setItem(`${storagePrefix}_sub_active`, "true");

    const newTx: CreditTransaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString("pt-BR"),
      description: `Cupom promocional aplicado (${code})`,
      creditsDelta: 2,
      amountBrl: "Cortesia",
      status: "CORTESIA",
      method: `Cupom ${code}`,
    };
    const nextTxs = [newTx, ...transactions];
    setTransactions(nextTxs);
    localStorage.setItem(`${storagePrefix}_txs`, JSON.stringify(nextTxs));

    setCouponInput("");
    setCouponMessage(`Cupom ${code} ativado! +2 créditos de conexão adicionados à sua conta.`);
    setTimeout(() => setCouponMessage(null), 5000);
  };

  const handleToggleAutoRenew = () => {
    const next = !autoRenew;
    setAutoRenew(next);
    localStorage.setItem(`${storagePrefix}_auto_renew`, String(next));
    setPurchaseToast(
      next
        ? "Renovação automática da assinatura ativada com sucesso."
        : "Renovação automática desativada. Sua assinatura não será cobrada automaticamente no próximo ciclo."
    );
    setTimeout(() => setPurchaseToast(null), 4500);
  };

  const handleRequestRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundReason.trim()) return;
    const protocol = `RMB-${Math.floor(100000 + Math.random() * 900000)}`;
    const newTx: CreditTransaction = {
      id: protocol,
      date: new Date().toLocaleDateString("pt-BR"),
      description: `Solicitação de reembolso (${
        refundTxId || "Assinatura / Créditos"
      }): ${refundReason.trim().slice(0, 60)}`,
      creditsDelta: 0,
      amountBrl: "Em análise",
      status: "REEMBOLSO_SOLICITADO",
      method: "Estorno / CDC Art. 49",
    };
    const nextTxs = [newTx, ...transactions];
    setTransactions(nextTxs);
    localStorage.setItem(`${storagePrefix}_txs`, JSON.stringify(nextTxs));

    setRefundModalOpen(false);
    setRefundTxId("");
    setRefundReason("");
    setPurchaseToast(
      `Solicitação de reembolso registrada sob protocolo ${protocol}. O estorno será processado em até 5 dias úteis.`
    );
    setTimeout(() => setPurchaseToast(null), 6000);
  };

  const handleConfirmCancelSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscriptionActive(false);
    setAutoRenew(false);
    localStorage.setItem(`${storagePrefix}_sub_active`, "false");
    localStorage.setItem(`${storagePrefix}_auto_renew`, "false");
    setCancelSubModalOpen(false);
    setCancelSubReason("");
    setPurchaseToast(
      "Assinatura cancelada. Seus recursos atuais permanecem ativos até o fim do ciclo vigente e seus créditos avulsos foram preservados."
    );
    setTimeout(() => setPurchaseToast(null), 6000);
  };

  const handleReactivateSubscription = () => {
    setSubscriptionActive(true);
    setAutoRenew(true);
    localStorage.setItem(`${storagePrefix}_sub_active`, "true");
    localStorage.setItem(`${storagePrefix}_auto_renew`, "true");
    setPurchaseToast("Assinatura reativada com sucesso!");
    setTimeout(() => setPurchaseToast(null), 4500);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) return;
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordToast("A confirmação da nova senha não confere.");
      setTimeout(() => setPasswordToast(null), 4000);
      return;
    }
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordToast("Senha de acesso atualizada com sucesso!");
    setTimeout(() => setPasswordToast(null), 4000);
  };

  const handleScheduleAccountDeletion = (e: React.FormEvent) => {
    e.preventDefault();
    const deadlineDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(
      "pt-BR"
    );
    setDeletionScheduledUntil(deadlineDate);
    localStorage.setItem(`${storagePrefix}_deletion_scheduled_until`, deadlineDate);
    setDeleteProfileModalOpen(false);
    setDeleteConfirmText("");
    setDeleteReason("");
    setPasswordToast(
      `Exclusão de perfil agendada. Você possui 7 dias de prazo de arrependimento (até ${deadlineDate}) para reverter a exclusão.`
    );
    setTimeout(() => setPasswordToast(null), 6000);
  };

  const handleCancelAccountDeletion = () => {
    setDeletionScheduledUntil(null);
    localStorage.removeItem(`${storagePrefix}_deletion_scheduled_until`);
    setPasswordToast(
      "Agendamento de exclusão cancelado dentro do prazo de arrependimento! Seu perfil permanece ativo."
    );
    setTimeout(() => setPasswordToast(null), 5000);
  };

  const handleToggleNotif = (key: keyof typeof notifPrefs) => {
    const next = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(next);
    localStorage.setItem(`${storagePrefix}_notif_prefs`, JSON.stringify(next));
    setNotifSavedToast(true);
    setTimeout(() => setNotifSavedToast(false), 2500);
  };

  const handleToggleCookie = (key: "functional" | "analytics") => {
    const next = { ...cookiePrefs, [key]: !cookiePrefs[key] };
    setCookiePrefs(next);
    localStorage.setItem(`${storagePrefix}_cookie_prefs`, JSON.stringify(next));
    setCookieSavedToast(true);
    setTimeout(() => setCookieSavedToast(false), 2500);
  };

  const tierInfo = calculateProfileTier(user);

  // Menu lateral sem ícones e sem badges de Bronze ou contagem de créditos
  const menuGroups = [
    {
      groupLabel: "Conta & Cadastro",
      items: [
        {
          id: "perfil" as ProfileSettingsTabId,
          label: "Perfil",
        },
        {
          id: "verificacao" as ProfileSettingsTabId,
          label: "Verificação",
        },
      ],
    },
    {
      groupLabel: "Assinatura & Conexões",
      items: [
        {
          id: "pagamentos" as ProfileSettingsTabId,
          label: "Pagamentos",
        },
      ],
    },
    {
      groupLabel: "Acesso, Alertas & Conformidade",
      items: [
        {
          id: "seguranca" as ProfileSettingsTabId,
          label: "Segurança",
        },
        {
          id: "notificacoes" as ProfileSettingsTabId,
          label: "Notificações",
        },
        {
          id: "juridico" as ProfileSettingsTabId,
          label: "Jurídico",
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row items-start gap-8">
      {/* Left Navigation Sidebar (No icons, no badges, GitHub Settings structure in The Bridge style) */}
      <aside className="w-full lg:w-[240px] shrink-0 lg:sticky lg:top-24">
        <nav
          aria-label="Menu de configurações do perfil"
          className="rounded-2xl border border-border-subtle bg-surface-white p-3 shadow-xs space-y-4"
        >
          {menuGroups.map((group, gIdx) => (
            <div
              key={group.groupLabel}
              className={gIdx > 0 ? "pt-3 border-t border-border-subtle" : ""}
            >
              <p className="px-3 pb-1.5 font-heading text-[13px] font-semibold text-text-secondary">
                {group.groupLabel}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectTab(item.id)}
                      className={[
                        "relative w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left font-heading text-xs transition-all cursor-pointer",
                        isActive
                          ? "bg-brand-green-moss/12 font-bold text-brand-green-dark"
                          : "font-medium text-text-secondary hover:bg-surface-primary hover:text-text-primary",
                      ].join(" ")}
                    >
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-brand-green-moss"
                        />
                      )}
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Right Content Area */}
      <div className="flex-1 min-w-0 w-full space-y-6">
        {/* TAB 1: PERFIL */}
        {activeTab === "perfil" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border-subtle">
              <div>
                <h2 className="font-heading text-xl font-bold text-text-primary">
                  Perfil {isResearcher ? "Acadêmico & Científico" : "Corporativo"}
                </h2>
                <p className="font-body text-xs text-text-secondary mt-0.5">
                  {isResearcher
                    ? "Gerencie seus dados civis, vínculo com universidade/ICT, currículo Lattes e linhas de pesquisa."
                    : "Gerencie os dados cadastrais da organização, CNPJ, ponto de contato executivo e diretrizes de P&D."}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                disabled={savingProfile}
                onClick={onSaveProfile}
                className="bg-brand-green-dark text-brand-off-white font-bold"
              >
                {savingProfile ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>

            {profileTabContent}
          </div>
        )}

        {/* TAB 2: VERIFICAÇÃO (Sem botão de submeter perfil e sem menção a Bronze/Prata/Ouro) */}
        {activeTab === "verificacao" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="pb-4 border-b border-border-subtle">
              <h2 className="font-heading text-xl font-bold text-text-primary">
                Verificação Cadastral &amp; Completude do Perfil
              </h2>
              <p className="font-body text-xs text-text-secondary mt-0.5">
                Acompanhe o status da homologação cadastral da sua conta e os itens preenchidos do seu perfil na plataforma.
              </p>
            </div>

            {/* Selo de Verificação Card (Sem botão de submeter) */}
            <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                  <Icon icon={ShieldCheck} size={22} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-base font-bold text-text-primary">
                      Selo de Veracidade Institucional The Bridge
                    </h3>
                    <span
                      className={[
                        "rounded-full px-2.5 py-0.5 font-heading text-[13px] font-bold",
                        verificationStatus === "VERIFICADO"
                          ? "bg-emerald-100 text-emerald-900"
                          : verificationStatus === "EM_ANALISE"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-surface-primary text-text-secondary border border-border-subtle",
                      ].join(" ")}
                    >
                      {verificationStatus === "VERIFICADO"
                        ? "Perfil Verificado ✓"
                        : verificationStatus === "EM_ANALISE"
                        ? "Em Análise pela Curadoria ⏳"
                        : "Aguardando Submissão na Aba Perfil"}
                    </span>
                  </div>
                  <p className="font-body text-xs text-text-secondary mt-1.5 max-w-3xl leading-relaxed">
                    {isResearcher
                      ? "A verificação institucional autentica seu vínculo acadêmico junto à universidade/ICT e confirma a titularidade do Currículo Lattes, elevando a confiabilidade perante parceiros industriais."
                      : "A verificação institucional autentica a regularidade do CNPJ junto à Receita Federal e valida a representação corporativa da empresa perante universidades e Núcleos de Inovação Tecnológica (NITs)."}
                  </p>
                </div>
              </div>
            </div>

            {/* Índice de Completude Cadastral (Sem Bronze/Prata/Ouro) */}
            <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border-subtle">
                <div>
                  <h3 className="font-heading text-base font-bold text-text-primary">
                    Índice de Preenchimento Cadastral ({tierInfo.score}%)
                  </h3>
                  <p className="font-body text-xs text-text-secondary mt-0.5">
                    {tierInfo.score >= 100
                      ? "Todos os campos recomendados do seu perfil estão completos."
                      : "Preencha os itens abaixo na aba Perfil para enriquecer a apresentação institucional da sua conta."}
                  </p>
                </div>
                <span className="rounded-full bg-surface-primary border border-border-subtle px-3 py-1 font-mono text-xs font-bold text-brand-green-dark">
                  {tierInfo.score} / 100%
                </span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-surface-primary overflow-hidden border border-border-subtle">
                <div
                  className="h-full bg-brand-green-moss transition-all duration-300"
                  style={{ width: `${Math.min(100, tierInfo.score)}%` }}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {tierInfo.checklist.map((item) => (
                  <div
                    key={item.id}
                    className={[
                      "rounded-2xl border p-3.5 flex items-start justify-between gap-3 text-xs",
                      item.completed
                        ? "border-emerald-200 bg-emerald-50/40 text-text-primary"
                        : "border-border-subtle bg-surface-primary/60 text-text-secondary",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-2.5">
                      <Icon
                        icon={item.completed ? CheckCircle2 : Clock}
                        size={16}
                        className={
                          item.completed
                            ? "text-emerald-700 shrink-0 mt-0.5"
                            : "text-text-secondary shrink-0 mt-0.5"
                        }
                      />
                      <div>
                        <p className="font-heading font-semibold text-text-primary">
                          {item.label}
                        </p>
                        <p className="font-body text-[13px] text-text-secondary">{item.hint}</p>
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-[13px] font-bold text-brand-green-moss">
                      +{item.points}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PAGAMENTOS */}
        {activeTab === "pagamentos" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="pb-4 border-b border-border-subtle">
              <h2 className="font-heading text-xl font-bold text-text-primary">
                Pagamentos, Assinatura &amp; Créditos de Conexão
              </h2>
              <p className="font-body text-xs text-text-secondary mt-0.5">
                Gerencie o plano de assinatura da conta, renovação automática, créditos para desbloqueio de conexões, reembolsos e cancelamento.
              </p>
            </div>

            {purchaseToast && (
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-950 flex items-center gap-3 shadow-xs animate-in fade-in">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                  <Icon icon={CheckCircle2} size={20} />
                </div>
                <p className="font-heading text-xs font-bold">{purchaseToast}</p>
              </div>
            )}

            {couponMessage && (
              <div className="rounded-2xl border border-purple-300 bg-purple-50 p-4 text-purple-950 flex items-center gap-3 shadow-xs animate-in fade-in">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-800 shrink-0">
                  <Icon icon={Ticket} size={20} />
                </div>
                <p className="font-heading text-xs font-bold">{couponMessage}</p>
              </div>
            )}

            {/* Top Summary Cards: Subscription Plan + Connection Credits Balance */}
            <div className="grid gap-5 md:grid-cols-2">
              {/* Card 1: Plano de Assinatura */}
              <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 shadow-xs flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={[
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-heading text-[13px] font-bold",
                        subscriptionActive
                          ? "bg-emerald-100 text-emerald-900"
                          : "bg-amber-100 text-amber-900",
                      ].join(" ")}
                    >
                      <Icon icon={subscriptionActive ? CheckCircle2 : Clock} size={14} />
                      {subscriptionActive ? "ASSINATURA ATIVA" : "CANCELAMENTO AGENDADO"}
                    </span>
                    <span className="font-mono text-xs text-text-secondary">
                      Cota: até 5 {isResearcher ? "projetos" : "demandas"} ativos
                    </span>
                  </div>

                  <div>
                    <p className="font-heading text-xs font-semibold text-text-secondary">
                      Plano Atual da Conta
                    </p>
                    <h3 className="font-heading text-lg font-bold text-text-primary mt-0.5">
                      {currentPlan}
                    </h3>
                  </div>

                  <ul className="space-y-2 pt-1 text-xs font-body text-text-secondary">
                    <li className="flex items-center gap-2">
                      <Icon icon={Check} size={14} className="text-brand-green-moss shrink-0" />
                      <span>Busca e recomendações de matches com inteligência semântica</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon icon={Check} size={14} className="text-brand-green-moss shrink-0" />
                      <span>Curadoria administrativa e validação de Termo de Confidencialidade</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon icon={Check} size={14} className="text-brand-green-moss shrink-0" />
                      <span>Suporte a submissão e recálculo dinâmico de compatibilidade</span>
                    </li>
                  </ul>
                </div>

                {/* Coupon form inside subscription card */}
                <form
                  onSubmit={handleApplyCoupon}
                  className="pt-4 border-t border-border-subtle flex items-center gap-2"
                >
                  <div className="relative flex-1">
                    <Icon
                      icon={Ticket}
                      size={14}
                      className="absolute left-3 top-2.5 text-text-secondary"
                    />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Possui código promocional?"
                      className="w-full rounded-xl border border-border-subtle bg-surface-primary pl-8 pr-3 py-2 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none uppercase"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    variant="secondary"
                    className="shrink-0 text-xs font-bold"
                  >
                    Aplicar Cupom
                  </Button>
                </form>
              </div>

              {/* Card 2: Saldo de Créditos para Desbloquear Conexões */}
              <div className="rounded-3xl border border-brand-green-moss/30 bg-gradient-to-br from-surface-white via-surface-white to-emerald-50/50 p-6 shadow-xs flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-green-moss/15 px-3 py-1 font-heading text-[13px] font-bold text-brand-green-dark">
                      <Icon icon={Coins} size={14} />
                      CRÉDITOS DE CONEXÃO
                    </span>
                    <span className="text-xs font-body text-text-secondary">
                      1 crédito = 1 conexão desbloqueada
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3 pt-1">
                    <span className="font-display text-4xl font-bold text-brand-green-dark">
                      {creditsBalance}
                    </span>
                    <span className="font-heading text-sm font-semibold text-text-secondary">
                      {creditsBalance === 1 ? "crédito disponível" : "créditos disponíveis"}
                    </span>
                  </div>

                  <p className="font-body text-xs text-text-secondary leading-relaxed">
                    Os créditos são utilizados exclusivamente quando ambas as partes aprovam o match e assinam o Termo de Responsabilidade para liberar os dados de contato diretos (e-mail, telefone, pesquisadores e razão social).
                  </p>
                </div>

                <div className="pt-4 border-t border-border-subtle flex items-center justify-between gap-3">
                  <span className="text-xs font-body text-text-secondary">
                    Créditos não expiram enquanto a conta estiver ativa.
                  </span>
                  <a
                    href="#pacotes-creditos"
                    className="font-heading text-xs font-bold text-brand-green-moss hover:underline shrink-0"
                  >
                    Comprar mais créditos ↓
                  </a>
                </div>
              </div>
            </div>

            {/* Section: Gestão da Assinatura (Renovação Automática, Solicitar Reembolso e Cancelamento) */}
            <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-border-subtle">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green-moss/10 text-brand-green-moss">
                  <Icon icon={RefreshCw} size={18} />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-text-primary">
                    Gestão de Assinatura, Renovação Automática &amp; Reembolsos
                  </h3>
                  <p className="font-body text-xs text-text-secondary">
                    Controle a renovação recorrente do seu plano, solicite estornos ou encerre a assinatura a qualquer momento.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {/* 1. Renovação Automática */}
                <div className="rounded-2xl border border-border-subtle bg-surface-primary/60 p-4 flex flex-col justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-heading text-xs font-bold text-text-primary">
                        Renovação Automática
                      </span>
                      <span
                        className={[
                          "rounded-full px-2 py-0.5 font-heading text-[13px] font-bold",
                          autoRenew
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-surface-white text-text-secondary border border-border-subtle",
                        ].join(" ")}
                      >
                        {autoRenew ? "Ativada" : "Desativada"}
                      </span>
                    </div>
                    <p className="font-body text-xs text-text-secondary leading-relaxed">
                      {autoRenew
                        ? "Sua assinatura será renovada automaticamente ao final do ciclo vigente para evitar interrupção dos matches."
                        : "A renovação automática está pausada. Nenhuma cobrança recorrente será lançada no próximo ciclo."}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={handleToggleAutoRenew}
                    className="w-full justify-center text-xs font-bold cursor-pointer"
                  >
                    <Icon icon={RefreshCw} size={14} />
                    {autoRenew ? "Desativar Renovação Automática" : "Ativar Renovação Automática"}
                  </Button>
                </div>

                {/* 2. Solicitar Reembolso */}
                <div className="rounded-2xl border border-border-subtle bg-surface-primary/60 p-4 flex flex-col justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="font-heading text-xs font-bold text-text-primary block">
                      Solicitação de Reembolso
                    </span>
                    <p className="font-body text-xs text-text-secondary leading-relaxed">
                      Conforme o Art. 49 do CDC, você pode solicitar o reembolso integral em até 7 dias após a compra ou o estorno de créditos não utilizados.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setRefundModalOpen(true)}
                    className="w-full justify-center text-xs font-bold cursor-pointer"
                  >
                    <Icon icon={RotateCcw} size={14} />
                    Solicitar Reembolso
                  </Button>
                </div>

                {/* 3. Cancelamento de Assinatura */}
                <div className="rounded-2xl border border-border-subtle bg-surface-primary/60 p-4 flex flex-col justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="font-heading text-xs font-bold text-text-primary block">
                      Cancelamento de Assinatura
                    </span>
                    <p className="font-body text-xs text-text-secondary leading-relaxed">
                      {subscriptionActive
                        ? "Cancele a recorrência do seu plano sem multa. Seus créditos avulsos adquiridos continuam salvos na conta."
                        : "Sua assinatura já se encontra com cancelamento programado para o fim do ciclo atual."}
                    </p>
                  </div>
                  {subscriptionActive ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setCancelSubModalOpen(true)}
                      className="w-full justify-center border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold cursor-pointer"
                    >
                      <Icon icon={XCircle} size={14} />
                      Cancelar Assinatura
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleReactivateSubscription}
                      className="w-full justify-center bg-brand-green-dark text-brand-off-white text-xs font-bold cursor-pointer"
                    >
                      <Icon icon={CheckCircle2} size={14} />
                      Reativar Assinatura
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Section: Comprar Créditos */}
            <div
              id="pacotes-creditos"
              className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green-moss/10 text-brand-green-moss">
                    <Icon icon={PlusCircle} size={18} />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-text-primary">
                      Adquirir Créditos para Desbloqueio de Conexões
                    </h3>
                    <p className="font-body text-xs text-text-secondary">
                      Escolha um pacote de créditos para liberar contatos diretos e salas de negociação tecnológica.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {CREDIT_PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={[
                      "relative rounded-2xl border p-5 flex flex-col justify-between transition-all",
                      pkg.badge === "Mais Escolhido"
                        ? "border-brand-green-moss bg-surface-primary/60 shadow-sm"
                        : "border-border-subtle bg-surface-white hover:border-brand-green-moss/50",
                    ].join(" ")}
                  >
                    {pkg.badge && (
                      <span className="self-start mb-3 inline-flex items-center gap-1 rounded-full bg-brand-green-dark px-2.5 py-0.5 font-heading text-[13px] font-bold text-brand-off-white">
                        <Icon icon={Sparkles} size={12} />
                        {pkg.badge}
                      </span>
                    )}

                    <div className="space-y-2">
                      <h4 className="font-heading text-sm font-bold text-text-primary">
                        {pkg.name}
                      </h4>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-2xl font-bold text-text-primary">
                          {pkg.credits} {pkg.credits === 1 ? "Crédito" : "Créditos"}
                        </span>
                      </div>
                      <p className="font-heading text-base font-bold text-brand-green-moss">
                        {pkg.priceBrl}
                      </p>
                      <p className="font-mono text-[13px] text-text-secondary">
                        {pkg.unitPrice}
                      </p>
                      <p className="font-body text-xs text-text-secondary leading-relaxed pt-1">
                        {pkg.description}
                      </p>
                    </div>

                    <div className="pt-5 mt-4 border-t border-border-subtle">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setSelectedPkg(pkg)}
                        className="w-full justify-center bg-brand-green-dark text-brand-off-white font-bold text-xs cursor-pointer"
                      >
                        <Icon icon={CreditCard} size={14} />
                        Comprar {pkg.credits} {pkg.credits === 1 ? "Crédito" : "Créditos"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Histórico de Transações e Uso de Créditos */}
            <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-border-subtle">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                  <Icon icon={Receipt} size={18} />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-text-primary">
                    Extrato de Créditos &amp; Histórico de Pagamentos
                  </h3>
                  <p className="font-body text-xs text-text-secondary">
                    Registro de aquisições de pacotes, bônus promocionais, reembolsos e desbloqueios realizados.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border-subtle text-text-secondary font-heading">
                      <th className="py-2.5 pr-4">Código</th>
                      <th className="py-2.5 pr-4">Data</th>
                      <th className="py-2.5 pr-4">Descrição</th>
                      <th className="py-2.5 pr-4">Método</th>
                      <th className="py-2.5 pr-4">Créditos</th>
                      <th className="py-2.5 pr-4">Valor</th>
                      <th className="py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle font-body">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-surface-primary/50">
                        <td className="py-3 pr-4 font-mono text-text-secondary">{tx.id}</td>
                        <td className="py-3 pr-4 text-text-secondary">{tx.date}</td>
                        <td className="py-3 pr-4 font-medium text-text-primary">
                          {tx.description}
                        </td>
                        <td className="py-3 pr-4 text-text-secondary">{tx.method}</td>
                        <td className="py-3 pr-4 font-heading font-bold text-emerald-800">
                          {tx.creditsDelta > 0 ? `+${tx.creditsDelta}` : tx.creditsDelta}
                        </td>
                        <td className="py-3 pr-4 font-semibold text-text-primary">
                          {tx.amountBrl}
                        </td>
                        <td className="py-3">
                          <span
                            className={[
                              "inline-flex items-center rounded-full px-2.5 py-0.5 font-heading text-[13px] font-bold",
                              tx.status === "REEMBOLSO_SOLICITADO"
                                ? "bg-amber-100 text-amber-900"
                                : "bg-emerald-100 text-emerald-900",
                            ].join(" ")}
                          >
                            {tx.status === "REEMBOLSO_SOLICITADO"
                              ? "REEMBOLSO EM ANÁLISE"
                              : tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal de Checkout de Créditos */}
            {selectedPkg && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                <div className="w-full max-w-lg rounded-3xl bg-surface-white p-6 md:p-8 shadow-xl border border-border-subtle space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                    <div>
                      <h3 className="font-heading text-base font-bold text-text-primary">
                        Finalizar Compra de Créditos
                      </h3>
                      <p className="font-body text-xs text-text-secondary">
                        {selectedPkg.name} • +{selectedPkg.credits}{" "}
                        {selectedPkg.credits === 1 ? "crédito" : "créditos"} de conexão
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedPkg(null)}
                      className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-secondary cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="rounded-2xl border border-border-subtle bg-surface-primary p-4 flex items-center justify-between">
                    <div>
                      <span className="font-heading text-xs font-semibold text-text-secondary block">
                        Total a pagar
                      </span>
                      <span className="font-display text-2xl font-bold text-text-primary">
                        {selectedPkg.priceBrl}
                      </span>
                    </div>
                    <span className="rounded-xl bg-brand-green-moss/15 px-3 py-1.5 font-heading text-xs font-bold text-brand-green-dark">
                      +{selectedPkg.credits}{" "}
                      {selectedPkg.credits === 1 ? "Crédito" : "Créditos"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="block font-heading text-xs font-semibold text-text-primary">
                      Forma de Pagamento
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {(
                        [
                          { id: "PIX", label: "PIX Instantâneo" },
                          { id: "CARTAO", label: "Cartão Corporativo" },
                          { id: "BOLETO", label: "Boleto / Fatura" },
                        ] as const
                      ).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMethod(m.id)}
                          className={[
                            "rounded-xl border px-3 py-2.5 font-heading text-xs font-semibold transition-all cursor-pointer",
                            paymentMethod === m.id
                              ? "border-brand-green-moss bg-brand-green-moss/10 text-brand-green-dark font-bold"
                              : "border-border-subtle bg-surface-white text-text-secondary hover:bg-surface-primary",
                          ].join(" ")}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedPkg(null)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={purchasing}
                      onClick={handleConfirmPurchase}
                      className="bg-brand-green-dark text-brand-off-white font-bold"
                    >
                      <Icon icon={CheckCircle2} size={15} />
                      {purchasing ? "Processando..." : "Confirmar e Creditar Agora"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Solicitar Reembolso */}
            {refundModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                <div className="w-full max-w-lg rounded-3xl bg-surface-white p-6 md:p-8 shadow-xl border border-border-subtle space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                    <div>
                      <h3 className="font-heading text-base font-bold text-text-primary">
                        Solicitar Reembolso / Estorno
                      </h3>
                      <p className="font-body text-xs text-text-secondary">
                        Garantia legal de arrependimento em até 7 dias (Art. 49 do CDC) ou créditos não utilizados.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRefundModalOpen(false)}
                      className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-secondary cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleRequestRefund} className="space-y-4">
                    <div>
                      <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                        Transação ou Pacote Referente (Opcional)
                      </label>
                      <select
                        value={refundTxId}
                        onChange={(e) => setRefundTxId(e.target.value)}
                        className="w-full rounded-xl border border-border-subtle bg-surface-primary px-3.5 py-2.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none"
                      >
                        <option value="">Assinatura vigente / Última compra de créditos</option>
                        {transactions.map((tx) => (
                          <option key={tx.id} value={tx.id}>
                            {tx.id} — {tx.description} ({tx.amountBrl})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                        Motivo da Solicitação de Reembolso *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        placeholder="Informe o motivo do reembolso (ex: direito de arrependimento em 7 dias, compra em duplicidade, créditos não utilizados)..."
                        className="w-full rounded-2xl border border-border-subtle bg-surface-primary p-3.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-border-subtle">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setRefundModalOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        className="bg-brand-green-dark text-brand-off-white font-bold"
                      >
                        Enviar Pedido de Reembolso
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal: Cancelamento de Assinatura */}
            {cancelSubModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                <div className="w-full max-w-lg rounded-3xl bg-surface-white p-6 md:p-8 shadow-xl border border-border-subtle space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                    <div>
                      <h3 className="font-heading text-base font-bold text-text-primary">
                        Confirmar Cancelamento de Assinatura
                      </h3>
                      <p className="font-body text-xs text-text-secondary">
                        Plano atual: {currentPlan}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCancelSubModalOpen(false)}
                      className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-secondary cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleConfirmCancelSubscription} className="space-y-4">
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-950 space-y-1">
                      <p className="font-heading font-bold">O que acontece ao cancelar:</p>
                      <p className="font-body">
                        • A renovação automática é interrompida imediatamente sem cobrança de multa.
                      </p>
                      <p className="font-body">
                        • Seus <strong>{creditsBalance} créditos de conexão</strong> permanecem preservados na conta.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                        Motivo do cancelamento (opcional)
                      </label>
                      <textarea
                        rows={3}
                        value={cancelSubReason}
                        onChange={(e) => setCancelSubReason(e.target.value)}
                        placeholder="Conte-nos como podemos melhorar sua experiência na The Bridge..."
                        className="w-full rounded-2xl border border-border-subtle bg-surface-primary p-3.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-border-subtle">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setCancelSubModalOpen(false)}
                      >
                        Manter Assinatura
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        className="bg-red-700 hover:bg-red-800 text-white font-bold"
                      >
                        Confirmar Cancelamento
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SEGURANÇA (Separada de Notificações + Opção de Excluir Perfil com 7 dias de arrependimento) */}
        {activeTab === "seguranca" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="pb-4 border-b border-border-subtle">
              <h2 className="font-heading text-xl font-bold text-text-primary">
                Segurança &amp; Privacidade da Conta
              </h2>
              <p className="font-body text-xs text-text-secondary mt-0.5">
                Gerencie suas credenciais de login, senha de acesso, tipo de perfil e encerramento da conta.
              </p>
            </div>

            {passwordToast && (
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-950 flex items-center gap-2.5 shadow-xs">
                <Icon icon={CheckCircle2} size={18} className="text-emerald-700 shrink-0" />
                <p className="font-heading text-xs font-bold">{passwordToast}</p>
              </div>
            )}

            {/* Banner caso a conta esteja agendada para exclusão nos próximos 7 dias */}
            {deletionScheduledUntil && (
              <div className="rounded-3xl border border-red-300 bg-red-50 p-5 text-red-950 flex flex-wrap items-center justify-between gap-4 shadow-xs">
                <div className="flex items-start gap-3">
                  <Icon icon={AlertTriangle} size={20} className="text-red-700 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <p className="font-heading font-bold text-sm">
                      Exclusão de Perfil Agendada — Período de Arrependimento de 7 Dias Ativo
                    </p>
                    <p className="font-body text-red-900">
                      Sua conta está programada para eliminação definitiva em{" "}
                      <strong>{deletionScheduledUntil}</strong>. Durante este prazo legal de 7 dias de arrependimento, você pode cancelar a exclusão abaixo a qualquer momento sem perda de dados.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCancelAccountDeletion}
                  className="bg-red-800 hover:bg-red-900 text-white font-bold shrink-0 cursor-pointer"
                >
                  Reverter Exclusão do Perfil
                </Button>
              </div>
            )}

            {/* Credenciais & Alteração de E-mail / Tipo de Perfil */}
            <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-border-subtle">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                  <Icon icon={Mail} size={18} />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-text-primary">
                    Credenciais Institucionais &amp; Tipo de Conta
                  </h3>
                  <p className="font-body text-xs text-text-secondary">
                    Alterações sensíveis de titularidade passam por validação da administração The Bridge.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border-subtle bg-surface-primary p-4 flex flex-col justify-between gap-3">
                  <div>
                    <span className="font-heading text-[13px] font-semibold text-text-secondary block">
                      E-mail de Login Atual
                    </span>
                    <span className="font-heading text-sm font-bold text-text-primary mt-0.5 block break-all">
                      {user?.email || "Não informado"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenEmailModal}
                    className="self-start rounded-xl border border-border-subtle bg-surface-white px-3 py-1.5 font-heading text-xs font-bold text-brand-green-moss hover:bg-emerald-50 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Icon icon={Mail} size={13} />
                    Solicitar troca de e-mail ↗
                  </button>
                </div>

                <div className="rounded-2xl border border-border-subtle bg-surface-primary p-4 flex flex-col justify-between gap-3">
                  <div>
                    <span className="font-heading text-[13px] font-semibold text-text-secondary block">
                      Modalidade de Perfil
                    </span>
                    <span className="font-heading text-sm font-bold text-text-primary mt-0.5 block">
                      {isResearcher
                        ? "Pesquisador / ICT (Pessoa Física)"
                        : "Empresa / Corporativo (Pessoa Jurídica)"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenProfileTypeModal}
                    className="self-start rounded-xl border border-border-subtle bg-surface-white px-3 py-1.5 font-heading text-xs font-bold text-brand-green-moss hover:bg-emerald-50 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Icon icon={ArrowRightLeft} size={13} />
                    Solicitar mudança de perfil ↗
                  </button>
                </div>
              </div>
            </div>

            {/* Alteração de Senha */}
            <form
              onSubmit={handleSavePassword}
              className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs space-y-5"
            >
              <div className="flex items-center gap-2.5 pb-4 border-b border-border-subtle">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green-moss/10 text-brand-green-moss">
                  <Icon icon={KeyRound} size={18} />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-text-primary">
                    Alterar Senha de Acesso
                  </h3>
                  <p className="font-body text-xs text-text-secondary">
                    Recomendamos o uso de senhas fortes com pelo menos 8 caracteres.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))
                    }
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-border-subtle bg-surface-primary px-3.5 py-2.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
                    }
                    placeholder="Mínimo 8 caracteres"
                    className="w-full rounded-xl border border-border-subtle bg-surface-primary px-3.5 py-2.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))
                    }
                    placeholder="Repita a nova senha"
                    className="w-full rounded-xl border border-border-subtle bg-surface-primary px-3.5 py-2.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  className="bg-brand-green-dark text-brand-off-white font-bold"
                >
                  Atualizar Senha
                </Button>
              </div>
            </form>

            {/* Zona de Exclusão de Perfil (com aviso de 7 dias de arrependimento) */}
            <div className="rounded-3xl border border-red-200 bg-surface-white p-6 md:p-8 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700">
                    <Icon icon={Trash2} size={18} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-heading text-base font-bold text-text-primary">
                      Excluir Perfil e Encerrar Conta
                    </h3>
                    <p className="font-body text-xs text-text-secondary max-w-2xl leading-relaxed">
                      Você pode solicitar a exclusão do seu perfil e dos seus dados pessoais a qualquer momento (Art. 18, VI da LGPD). Ao confirmar, sua conta entrará em um <strong>período de 7 dias de arrependimento de exclusão</strong>, no qual poderá ser restaurada integralmente caso mude de ideia.
                    </p>
                  </div>
                </div>

                {!deletionScheduledUntil ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setDeleteProfileModalOpen(true)}
                    className="border-red-300 text-red-700 hover:bg-red-50 font-bold shrink-0 cursor-pointer"
                  >
                    <Icon icon={Trash2} size={14} />
                    Excluir Meu Perfil
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCancelAccountDeletion}
                    className="bg-brand-green-dark text-brand-off-white font-bold shrink-0 cursor-pointer"
                  >
                    Cancelar Exclusão Agendada
                  </Button>
                )}
              </div>
            </div>

            {/* Modal de Confirmação de Exclusão de Perfil com Aviso de 7 Dias de Arrependimento */}
            {deleteProfileModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                <div className="w-full max-w-lg rounded-3xl bg-surface-white p-6 md:p-8 shadow-xl border border-border-subtle space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-800">
                        <Icon icon={AlertTriangle} size={18} />
                      </div>
                      <div>
                        <h3 className="font-heading text-base font-bold text-text-primary">
                          Confirmar Exclusão do Perfil
                        </h3>
                        <p className="font-body text-xs text-text-secondary">
                          Ação protegida por período de arrependimento de 7 dias
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleteProfileModalOpen(false)}
                      className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-secondary cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleScheduleAccountDeletion} className="space-y-4">
                    <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-4 text-xs text-amber-950 space-y-1.5">
                      <p className="font-heading font-bold">
                        Importante — Período de 7 Dias de Arrependimento de Exclusão:
                      </p>
                      <p className="font-body leading-relaxed">
                        Ao confirmar, seu perfil será desativado e agendado para exclusão definitiva em <strong>7 dias corridos</strong>. Durante esses 7 dias, basta acessar sua conta e clicar em <strong>&ldquo;Reverter Exclusão do Perfil&rdquo;</strong> para restaurar todos os seus projetos, demandas, conexões e créditos sem qualquer perda.
                      </p>
                      <p className="font-body leading-relaxed">
                        Após o término dos 7 dias, seus dados cadastrais serão permanentemente eliminados ou anonimizados em conformidade com a LGPD (Lei nº 13.709/2018).
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                        Motivo do encerramento (opcional)
                      </label>
                      <textarea
                        rows={2}
                        value={deleteReason}
                        onChange={(e) => setDeleteReason(e.target.value)}
                        placeholder="Se desejar, informe o motivo da saída..."
                        className="w-full rounded-xl border border-border-subtle bg-surface-primary p-3 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                        Para confirmar, digite <strong>EXCLUIR</strong> no campo abaixo *
                      </label>
                      <input
                        type="text"
                        required
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="EXCLUIR"
                        className="w-full rounded-xl border border-border-subtle bg-surface-primary px-3.5 py-2.5 text-xs text-text-primary focus:border-red-600 focus:outline-none font-mono uppercase"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-border-subtle">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setDeleteProfileModalOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={deleteConfirmText.trim().toUpperCase() !== "EXCLUIR"}
                        className="bg-red-700 hover:bg-red-800 text-white font-bold disabled:opacity-50"
                      >
                        Agendar Exclusão (7 Dias de Arrependimento)
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: NOTIFICAÇÕES (Aba exclusiva separada de Segurança) */}
        {activeTab === "notificacoes" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="pb-4 border-b border-border-subtle">
              <h2 className="font-heading text-xl font-bold text-text-primary">
                Preferências de Notificações &amp; Alertas
              </h2>
              <p className="font-body text-xs text-text-secondary mt-0.5">
                Configure quais avisos de matches, conexões e termos deseja receber na plataforma e no seu e-mail institucional.
              </p>
            </div>

            <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between gap-2.5 pb-4 border-b border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                    <Icon icon={Bell} size={18} />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-text-primary">
                      Canais de Alerta &amp; Comunicações Automáticas
                    </h3>
                    <p className="font-body text-xs text-text-secondary">
                      Notificações relacionadas a um mesmo match são agrupadas automaticamente na sua caixa de entrada.
                    </p>
                  </div>
                </div>
                {notifSavedToast && (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 font-heading text-[13px] font-bold text-emerald-900">
                    Preferências salvas ✓
                  </span>
                )}
              </div>

              <div className="divide-y divide-border-subtle">
                {(
                  [
                    {
                      key: "newMatches",
                      title: "Novos Matches de Alta Compatibilidade",
                      desc: "Receber alerta sempre que um projeto ou demanda atingir alto índice de convergência técnica.",
                    },
                    {
                      key: "connectionRequests",
                      title: "Solicitações e Avanços de Conexão",
                      desc: "Avisar quando uma empresa ou pesquisador demonstrar interesse ou aprovar uma etapa de contato.",
                    },
                    {
                      key: "termUpdates",
                      title: "Assinatura do Termo de Responsabilidade",
                      desc: "Notificar sobre pendências e liberações de dados após assinatura mútua do termo.",
                    },
                    {
                      key: "auditStatus",
                      title: "Validação Cadastral e Curadoria",
                      desc: "Alertas sobre aprovação do selo de veracidade e solicitações administrativas.",
                    },
                    {
                      key: "innovationDigest",
                      title: "Boletim de Oportunidades e Editais de P&D",
                      desc: "Resumo periódico com novas chamadas industriais e tendências tecnológicas na plataforma.",
                    },
                  ] as const
                ).map((pref) => (
                  <label
                    key={pref.key}
                    className="py-3.5 flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div>
                      <p className="font-heading text-xs font-bold text-text-primary">
                        {pref.title}
                      </p>
                      <p className="font-body text-xs text-text-secondary mt-0.5">
                        {pref.desc}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(notifPrefs[pref.key])}
                      onChange={() => handleToggleNotif(pref.key)}
                      className="h-4 w-4 accent-brand-green-moss rounded cursor-pointer shrink-0"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: JURÍDICO (Termos de Uso e Serviço, Uso de Cookies, Políticas de Privacidade e LGPD + Regularidade Legal no Brasil) */}
        {activeTab === "juridico" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="pb-4 border-b border-border-subtle">
              <h2 className="font-heading text-xl font-bold text-text-primary">
                Jurídico, Privacidade &amp; Conformidade Legal (LGPD)
              </h2>
              <p className="font-body text-xs text-text-secondary mt-0.5">
                Acesse os Termos de Uso e Serviço, Política de Privacidade, Gestão de Cookies e o quadro de conformidade da The Bridge com a legislação brasileira.
              </p>
            </div>

            {/* Cards de Documentos Jurídicos & Links */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* 1. Termos de Uso e Serviço */}
              <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green-moss/10 text-brand-green-moss">
                    <Icon icon={FileText} size={18} />
                  </div>
                  <h3 className="font-heading text-sm font-bold text-text-primary">
                    Termos de Uso e Serviço
                  </h3>
                  <p className="font-body text-xs text-text-secondary leading-relaxed">
                    Regras de utilização da plataforma, governança de submissões de projetos e demandas, confidencialidade e condições gerais de intermediação tecnológica.
                  </p>
                </div>
                <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setLegalDocModal("TERMOS")}
                    className="font-heading text-xs font-bold text-brand-green-moss hover:underline cursor-pointer"
                  >
                    Ler documento completo
                  </button>
                  <Link
                    to="/termos"
                    className="inline-flex items-center gap-1 font-heading text-xs font-semibold text-text-secondary hover:text-text-primary"
                  >
                    <span>Página pública</span>
                    <Icon icon={ExternalLink} size={12} />
                  </Link>
                </div>
              </div>

              {/* 2. Políticas de Privacidade e LGPD */}
              <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                    <Icon icon={ShieldCheck} size={18} />
                  </div>
                  <h3 className="font-heading text-sm font-bold text-text-primary">
                    Política de Privacidade e LGPD
                  </h3>
                  <p className="font-body text-xs text-text-secondary leading-relaxed">
                    Tratamento de dados pessoais e corporativos segundo a Lei nº 13.709/2018 (LGPD), sigilo pré-conexão, direitos do titular e contato do Encarregado (DPO).
                  </p>
                </div>
                <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setLegalDocModal("PRIVACIDADE")}
                    className="font-heading text-xs font-bold text-brand-green-moss hover:underline cursor-pointer"
                  >
                    Ler política de privacidade
                  </button>
                  <Link
                    to="/privacidade"
                    className="inline-flex items-center gap-1 font-heading text-xs font-semibold text-text-secondary hover:text-text-primary"
                  >
                    <span>Página pública</span>
                    <Icon icon={ExternalLink} size={12} />
                  </Link>
                </div>
              </div>

              {/* 3. Política e Uso de Cookies */}
              <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                    <Icon icon={Cookie} size={18} />
                  </div>
                  <h3 className="font-heading text-sm font-bold text-text-primary">
                    Política e Uso de Cookies
                  </h3>
                  <p className="font-body text-xs text-text-secondary leading-relaxed">
                    Transparência sobre o armazenamento local de sessão, autenticação segura, preferências de interface e métricas agregadas de desempenho.
                  </p>
                </div>
                <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setLegalDocModal("COOKIES")}
                    className="font-heading text-xs font-bold text-brand-green-moss hover:underline cursor-pointer"
                  >
                    Ver política de cookies
                  </button>
                  <a
                    href="#gestao-cookies"
                    className="font-heading text-xs font-semibold text-text-secondary hover:text-text-primary"
                  >
                    Configurar ↓
                  </a>
                </div>
              </div>
            </div>

            {/* Gestão de Consentimento de Cookies */}
            <div
              id="gestao-cookies"
              className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs space-y-5"
            >
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                    <Icon icon={Cookie} size={18} />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-text-primary">
                      Preferências de Consentimento de Cookies
                    </h3>
                    <p className="font-body text-xs text-text-secondary">
                      Gerencie as categorias de cookies autorizadas no seu navegador conforme a LGPD.
                    </p>
                  </div>
                </div>
                {cookieSavedToast && (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 font-heading text-[13px] font-bold text-emerald-900">
                    Preferências de cookies salvas ✓
                  </span>
                )}
              </div>

              <div className="divide-y divide-border-subtle text-xs">
                <div className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-heading font-bold text-text-primary">
                      Cookies Estritamente Necessários (Obrigatórios)
                    </p>
                    <p className="font-body text-text-secondary mt-0.5">
                      Indispensáveis para autenticação, segurança da sessão e funcionamento das submissões e termos.
                    </p>
                  </div>
                  <span className="rounded-full bg-surface-primary border border-border-subtle px-2.5 py-0.5 font-heading text-[13px] font-bold text-text-secondary">
                    Sempre Ativo
                  </span>
                </div>

                <label className="py-3.5 flex items-center justify-between gap-4 cursor-pointer">
                  <div>
                    <p className="font-heading font-bold text-text-primary">
                      Cookies Funcionais e de Preferências
                    </p>
                    <p className="font-body text-text-secondary mt-0.5">
                      Memorizam filtros de demandas selecionadas, estado de visualização e preferências da conta.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(cookiePrefs.functional)}
                    onChange={() => handleToggleCookie("functional")}
                    className="h-4 w-4 accent-brand-green-moss rounded cursor-pointer shrink-0"
                  />
                </label>

                <label className="py-3.5 flex items-center justify-between gap-4 cursor-pointer">
                  <div>
                    <p className="font-heading font-bold text-text-primary">
                      Cookies Analíticos e de Desempenho Anonimizados
                    </p>
                    <p className="font-body text-text-secondary mt-0.5">
                      Ajudam a aprimorar a velocidade e a usabilidade da plataforma por meio de métricas estatísticas agregadas.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(cookiePrefs.analytics)}
                    onChange={() => handleToggleCookie("analytics")}
                    className="h-4 w-4 accent-brand-green-moss rounded cursor-pointer shrink-0"
                  />
                </label>
              </div>
            </div>

            {/* Quadro de Regularidade com as Leis do Brasil e LGPD */}
            <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-border-subtle">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green-moss/10 text-brand-green-moss">
                  <Icon icon={Scale} size={18} />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-text-primary">
                    Regularidade da Plataforma com a Legislação Brasileira e LGPD
                  </h3>
                  <p className="font-body text-xs text-text-secondary">
                    Matriz de conformidade regulatória aplicada às operações da The Bridge no Brasil.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {BRAZIL_LEGAL_COMPLIANCE_ITEMS.map((item) => (
                  <div
                    key={item.law}
                    className="rounded-2xl border border-border-subtle bg-surface-primary/50 p-4 space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-heading text-xs font-bold text-text-primary">
                        {item.law}
                      </h4>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 font-heading text-[13px] font-bold text-emerald-900">
                        <Icon icon={CheckCircle2} size={13} />
                        {item.status}
                      </span>
                    </div>
                    <p className="font-body text-xs text-text-secondary leading-relaxed">
                      {item.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Visualizador de Documentos Jurídicos */}
            {legalDocModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-surface-white p-6 md:p-8 shadow-xl border border-border-subtle">
                  <div className="flex items-center justify-between pb-3 border-b border-border-subtle shrink-0">
                    <h3 className="font-heading text-base font-bold text-text-primary">
                      {legalDocModal === "TERMOS"
                        ? "Termos de Uso e Serviço — The Bridge"
                        : legalDocModal === "PRIVACIDADE"
                        ? "Política de Privacidade e Proteção de Dados (LGPD)"
                        : "Política de Uso de Cookies"}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setLegalDocModal(null)}
                      className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-secondary cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="overflow-y-auto py-4 space-y-4 font-body text-xs text-text-secondary leading-relaxed">
                    {legalDocModal === "TERMOS" && (
                      <>
                        <p className="font-heading font-bold text-text-primary">
                          Objeto e Finalidade da Plataforma
                        </p>
                        <p>
                          A The Bridge opera como plataforma digital de conexão entre pesquisadores vinculados a Instituições Científicas, Tecnológicas e de Inovação (ICTs) e empresas demandantes de soluções de Pesquisa, Desenvolvimento e Inovação (PD&amp;I), em consonância com a Lei nº 10.973/2004 e a Lei nº 13.243/2016.
                        </p>
                        <p className="font-heading font-bold text-text-primary">
                          Sigilo Pré-Conexão e Desbloqueio Bilateral
                        </p>
                        <p>
                          Para resguardar a propriedade intelectual (Lei nº 9.279/1996) e a estratégia industrial, os dados nominais de autoria, afiliação e razão social permanecem protegidos até que haja aprovação mútua e assinatura eletrônica do Termo de Responsabilidade e Confidencialidade por ambas as partes.
                        </p>
                        <p className="font-heading font-bold text-text-primary">
                          Assinaturas, Créditos, Renovação e Arrependimento
                        </p>
                        <p>
                          O usuário pode gerenciar a renovação automática, solicitar o cancelamento da assinatura sem multa e exercer o direito de arrependimento em até 7 dias corridos (Art. 49 da Lei nº 8.078/1990 — CDC) diretamente na aba Pagamentos.
                        </p>
                      </>
                    )}

                    {legalDocModal === "PRIVACIDADE" && (
                      <>
                        <p className="font-heading font-bold text-text-primary">
                          Controladoria e Bases Legais (Art. 7º da LGPD — Lei nº 13.709/2018)
                        </p>
                        <p>
                          O tratamento de dados pessoais e institucionais na The Bridge fundamenta-se na execução de contrato e procedimentos preliminares (Art. 7º, V), no legítimo interesse para fomento à inovação tecnológica (Art. 7º, IX) e no consentimento expresso do titular (Art. 7º, I).
                        </p>
                        <p className="font-heading font-bold text-text-primary">
                          Direitos do Titular de Dados (Art. 18 da LGPD)
                        </p>
                        <p>
                          É garantido ao usuário, a qualquer tempo e mediante requisição gratuita no painel de Perfil e Segurança: confirmação da existência de tratamento, acesso aos dados, correção de dados incompletos ou desatualizados, portabilidade, revogação de consentimento e eliminação dos dados pessoais (com janela de segurança de 7 dias de arrependimento de exclusão).
                        </p>
                        <p className="font-heading font-bold text-text-primary">
                          Segurança da Informação e Retenção (Marco Civil da Internet)
                        </p>
                        <p>
                          Os registros de acesso à aplicação são mantidos sob sigilo e segurança pelo prazo legal de 6 meses (Art. 15 da Lei nº 12.965/2014), utilizando criptografia em trânsito (HTTPS/TLS) e controle estrito de acesso administrativo.
                        </p>
                      </>
                    )}

                    {legalDocModal === "COOKIES" && (
                      <>
                        <p className="font-heading font-bold text-text-primary">
                          O que são Cookies e Armazenamento Local
                        </p>
                        <p>
                          Utilizamos cookies e armazenamento local (LocalStorage) estritamente necessários para manter sua sessão autenticada com segurança, além de cookies funcionais opcionais para preservar suas preferências de navegação e filtros de demandas tecnológicas.
                        </p>
                        <p className="font-heading font-bold text-text-primary">
                          Como Gerenciar ou Revogar Cookies
                        </p>
                        <p>
                          Você pode ativar ou desativar os cookies funcionais e analíticos a qualquer momento diretamente na seção &ldquo;Preferências de Consentimento de Cookies&rdquo; dentro desta aba Jurídico, sem prejuízo ao acesso da sua conta.
                        </p>
                      </>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border-subtle flex justify-end shrink-0">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setLegalDocModal(null)}
                      className="bg-brand-green-dark text-brand-off-white font-bold"
                    >
                      Fechar Documento
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
