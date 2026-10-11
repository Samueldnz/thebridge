import { type ReactNode, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Award,
  Bell,
  Building2,
  CheckCircle2,
  Coins,
  CreditCard,
  KeyRound,
  Lock,
  Mail,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Ticket,
  User as UserIcon,
  ArrowRightLeft,
  Check,
  Clock,
  Receipt,
} from "lucide-react";

import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { calculateProfileTier, type User } from "../../services/auth";

export type ProfileSettingsTabId =
  | "perfil"
  | "pagamentos"
  | "verificacao"
  | "seguranca";

interface CreditTransaction {
  id: string;
  date: string;
  description: string;
  creditsDelta: number;
  amountBrl: string;
  status: "APROVADO" | "CORTESIA" | "UTILIZADO";
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

interface ProfileSettingsViewProps {
  user: User | null;
  isResearcher: boolean;
  profileTabContent: ReactNode;
  verificationStatus: string;
  submittingVerification: boolean;
  onSubmitForVerification: () => void;
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
  submittingVerification,
  onSubmitForVerification,
  onOpenEmailModal,
  onOpenProfileTypeModal,
  onSaveProfile,
  savingProfile,
}: ProfileSettingsViewProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as ProfileSettingsTabId) || "perfil";
  const [activeTab, setActiveTab] = useState<ProfileSettingsTabId>(
    ["perfil", "pagamentos", "verificacao", "seguranca"].includes(initialTab)
      ? initialTab
      : "perfil"
  );

  useEffect(() => {
    const t = searchParams.get("tab") as ProfileSettingsTabId;
    if (t && ["perfil", "pagamentos", "verificacao", "seguranca"].includes(t)) {
      setActiveTab(t);
    }
  }, [searchParams]);

  const handleSelectTab = (tab: ProfileSettingsTabId) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  // Credits & Subscription persistence per user
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

  // Security & Notification states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordToast, setPasswordToast] = useState<string | null>(null);

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

  const handleToggleNotif = (key: keyof typeof notifPrefs) => {
    const next = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(next);
    localStorage.setItem(`${storagePrefix}_notif_prefs`, JSON.stringify(next));
    setNotifSavedToast(true);
    setTimeout(() => setNotifSavedToast(false), 2500);
  };

  const tierInfo = calculateProfileTier(user);

  const menuGroups = [
    {
      groupLabel: "Conta & Cadastro",
      items: [
        {
          id: "perfil" as ProfileSettingsTabId,
          label: "Perfil",
          icon: isResearcher ? UserIcon : Building2,
        },
        {
          id: "verificacao" as ProfileSettingsTabId,
          label: "Verificação & Nível",
          icon: ShieldCheck,
          badge:
            verificationStatus === "VERIFICADO"
              ? "Verificado"
              : verificationStatus === "EM_ANALISE"
              ? "Em análise"
              : tierInfo.tier,
        },
      ],
    },
    {
      groupLabel: "Assinatura & Conexões",
      items: [
        {
          id: "pagamentos" as ProfileSettingsTabId,
          label: "Pagamentos & Créditos",
          icon: CreditCard,
          badge: `${creditsBalance} créd.`,
        },
      ],
    },
    {
      groupLabel: "Acesso & Alertas",
      items: [
        {
          id: "seguranca" as ProfileSettingsTabId,
          label: "Segurança & Notificações",
          icon: Lock,
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row items-start gap-8">
      {/* Left Navigation Sidebar (GitHub Settings Reference Structure in The Bridge Visual Style) */}
      <aside className="w-full lg:w-[260px] shrink-0 lg:sticky lg:top-24">
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
                        "relative w-full flex items-center justify-between gap-2.5 rounded-xl px-3.5 py-2.5 text-left font-heading text-xs transition-all cursor-pointer",
                        isActive
                          ? "bg-brand-green-moss/12 font-bold text-brand-green-dark"
                          : "font-medium text-text-secondary hover:bg-surface-primary hover:text-text-primary",
                      ].join(" ")}
                    >
                      {/* Active left accent bar matching reference */}
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-brand-green-moss"
                        />
                      )}
                      <span className="flex items-center gap-2.5 truncate">
                        <Icon
                          icon={item.icon}
                          size={16}
                          className={
                            isActive ? "text-brand-green-moss shrink-0" : "text-text-secondary shrink-0"
                          }
                        />
                        <span className="truncate">{item.label}</span>
                      </span>

                      {item.badge && (
                        <span
                          className={[
                            "shrink-0 rounded-full px-2 py-0.5 text-[13px] font-semibold",
                            isActive
                              ? "bg-brand-green-moss text-brand-off-white"
                              : "bg-surface-primary text-text-secondary border border-border-subtle",
                          ].join(" ")}
                        >
                          {item.badge}
                        </span>
                      )}
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
        {/* TAB 1: PERFIL (Conteúdo Atual do Editar Perfil) */}
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

        {/* TAB 2: PAGAMENTOS & CRÉDITOS */}
        {activeTab === "pagamentos" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="pb-4 border-b border-border-subtle">
              <h2 className="font-heading text-xl font-bold text-text-primary">
                Pagamentos, Assinatura &amp; Créditos de Conexão
              </h2>
              <p className="font-body text-xs text-text-secondary mt-0.5">
                Consulte o plano de assinatura ativo da sua conta, seu saldo de créditos para desbloquear conexões e adquira pacotes adicionais.
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
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 font-heading text-[13px] font-bold text-emerald-900">
                      <Icon icon={CheckCircle2} size={14} />
                      ASSINATURA ATIVA
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
                    Registro de aquisições de pacotes, bônus promocionais e desbloqueios realizados.
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
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 font-heading text-[13px] font-bold text-emerald-900">
                            {tx.status}
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
          </div>
        )}

        {/* TAB 3: VERIFICAÇÃO & NÍVEL DO PERFIL */}
        {activeTab === "verificacao" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="pb-4 border-b border-border-subtle">
              <h2 className="font-heading text-xl font-bold text-text-primary">
                Verificação de Veracidade &amp; Nível do Perfil
              </h2>
              <p className="font-body text-xs text-text-secondary mt-0.5">
                Acompanhe o status da homologação cadastral da sua conta e o índice de completude do seu perfil na plataforma.
              </p>
            </div>

            {/* Selo de Verificação Card */}
            <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
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
                          : "Não Submetido"}
                      </span>
                    </div>
                    <p className="font-body text-xs text-text-secondary mt-1 max-w-2xl leading-relaxed">
                      {isResearcher
                        ? "A verificação autentica seu vínculo acadêmico junto à universidade/ICT e confirma a titularidade do Currículo Lattes, aumentando a confiança das empresas nas negociações."
                        : "A verificação autentica a regularidade do CNPJ junto à Receita Federal e valida a representação institucional da empresa perante as universidades e NITs."}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={onSubmitForVerification}
                  disabled={submittingVerification || verificationStatus === "EM_ANALISE"}
                  className="bg-brand-green-dark text-brand-off-white font-bold shrink-0"
                >
                  <Icon icon={ShieldCheck} size={15} />
                  {submittingVerification
                    ? "Submetendo..."
                    : verificationStatus === "EM_ANALISE"
                    ? "Em Análise ⏳"
                    : "Submeter Perfil para Verificação"}
                </Button>
              </div>
            </div>

            {/* Pontuação e Checklist do Perfil (Bronze / Prata / Ouro) */}
            <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border-subtle">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
                    <Icon icon={Award} size={20} />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-text-primary">
                      Nível de Qualificação Cadastral: {tierInfo.tier} ({tierInfo.score}/100 pts)
                    </h3>
                    <p className="font-body text-xs text-text-secondary">
                      {tierInfo.nextTier
                        ? `Faltam ${tierInfo.pointsToNextTier} pontos para alcançar o nível ${tierInfo.nextTier}.`
                        : "Parabéns! Seu perfil atingiu a pontuação máxima de qualificação Ouro."}
                    </p>
                  </div>
                </div>
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
                      +{item.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SEGURANÇA & NOTIFICAÇÕES */}
        {activeTab === "seguranca" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="pb-4 border-b border-border-subtle">
              <h2 className="font-heading text-xl font-bold text-text-primary">
                Segurança da Conta &amp; Preferências de Notificação
              </h2>
              <p className="font-body text-xs text-text-secondary mt-0.5">
                Gerencie suas credenciais de acesso, solicitações administrativas de conta e alertas por e-mail.
              </p>
            </div>

            {passwordToast && (
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-950 flex items-center gap-2.5 shadow-xs">
                <Icon icon={CheckCircle2} size={18} className="text-emerald-700 shrink-0" />
                <p className="font-heading text-xs font-bold">{passwordToast}</p>
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

            {/* Preferências de Notificação */}
            <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between gap-2.5 pb-4 border-b border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                    <Icon icon={Bell} size={18} />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-text-primary">
                      Preferências de Alertas &amp; Comunicações
                    </h3>
                    <p className="font-body text-xs text-text-secondary">
                      Escolha quais eventos devem gerar avisos na sua caixa de notificações e por e-mail.
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
      </div>
    </div>
  );
}
