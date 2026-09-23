import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Factory,
  Globe,
  Info,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";

import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { authService, calculateProfileTier, type User } from "../services/auth";

export function CompanyProfilePage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getStoredUser());
  const [rulesExpanded, setRulesExpanded] = useState(false);

  const [formData, setFormData] = useState({
    companyName: currentUser?.companyName || "",
    cnpj: currentUser?.cnpj || "",
    industrySector: currentUser?.industrySector || "",
    location: currentUser?.location || "",
    name: currentUser?.name || "",
    roleTitle: currentUser?.roleTitle || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    website: currentUser?.website || "",
    linkedin: currentUser?.linkedin || "",
    bio: currentUser?.bio || "",
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Live calculation of tier for company
  const tierResult = calculateProfileTier({
    ...currentUser,
    profileType: "COMPANY",
    ...formData,
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const updated = await authService.updateProfile(formData);
      setCurrentUser(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error("Erro ao salvar perfil corporativo:", err);
    } finally {
      setSaving(false);
    }
  };

  const getTierBadgeConfig = (tier: string) => {
    switch (tier) {
      case "OURO":
        return {
          title: "Empresa Ouro 🥇",
          badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
          barColor: "bg-gradient-to-r from-amber-400 to-yellow-500",
          textColor: "text-amber-800",
          bgGlow: "bg-amber-50/70 border-amber-200",
          subtitle: "CNPJ & Organização Validados • Selo Corporativo Verificado de Alta Relevância",
        };
      case "PRATA":
        return {
          title: "Empresa Prata 🥈",
          badgeColor: "bg-blue-100 text-blue-900 border-blue-300",
          barColor: "bg-gradient-to-r from-blue-400 to-blue-500",
          textColor: "text-blue-800",
          bgGlow: "bg-blue-50/70 border-blue-200",
          subtitle: "CNPJ Ativo & Ponto de Contato Confirmado • Desbloqueio de Reuniões",
        };
      case "BRONZE":
      default:
        return {
          title: "Empresa Bronze 🥉",
          badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
          barColor: "bg-gradient-to-r from-amber-600 to-amber-700",
          textColor: "text-amber-700",
          bgGlow: "bg-orange-50/40 border-amber-100",
          subtitle: "Cadastro Básico — Informe CNPJ e razão social para qualificar a empresa",
        };
    }
  };

  const tierUI = getTierBadgeConfig(tierResult.tier);

  return (
    <DashboardLayout
      title="Perfil da Empresa (Pessoa Jurídica)"
      subtitle="Razão social, CNPJ corporativo, setor industrial de mercado e representante legal de P&amp;D."
      actions={
        <Button
          onClick={() => handleSave()}
          disabled={saving}
          size="sm"
          className="bg-brand-green-dark text-brand-off-white"
        >
          <Icon icon={Save} size={15} />
          {saving ? "Salvando..." : "Salvar Dados Corporativos"}
        </Button>
      }
    >
      <div className="space-y-8">
        {/* Feedback Alert */}
        {saveSuccess && (
          <div className="rounded-2xl border border-blue-300 bg-blue-50 p-4 text-blue-950 flex items-center justify-between shadow-xs animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
                <Icon icon={CheckCircle2} size={20} />
              </div>
              <div>
                <p className="font-heading text-sm font-bold">Perfil corporativo salvo com sucesso!</p>
                <p className="font-body text-xs text-blue-900">
                  Dados atualizados. Nível da empresa: <strong>{tierUI.title}</strong> ({tierResult.score}% preenchido).
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="font-heading text-xs font-bold text-blue-900 hover:underline"
            >
              Ir ao Painel →
            </button>
          </div>
        )}

        {/* Gamified Tier Card for Company */}
        <div className={`rounded-3xl border p-6 md:p-8 shadow-xs ${tierUI.bgGlow} transition-all`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-surface-white border border-blue-200 shadow-xs">
                <Icon icon={Building2} size={36} className="text-blue-800" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-heading font-bold shadow-2xs ${tierUI.badgeColor}`}>
                    <Icon icon={Sparkles} size={13} />
                    {tierUI.title}
                  </span>
                  <span className="text-xs font-mono font-semibold text-text-secondary">
                    {tierResult.score}% qualificado
                  </span>
                </div>
                <h3 className="mt-1 font-heading text-xl font-bold text-text-primary">
                  Status de Qualificação Corporativa
                </h3>
                <p className="mt-0.5 font-body text-xs text-text-secondary">
                  {tierUI.subtitle}
                </p>
              </div>
            </div>

            {/* Progress to Next Tier */}
            <div className="w-full lg:w-72 shrink-0">
              <div className="flex justify-between text-xs font-mono mb-1.5 text-text-secondary">
                <span>Progresso Corporativo</span>
                <span className="font-bold text-text-primary">{tierResult.score}/100 pts</span>
              </div>
              <div className="h-3 w-full bg-border-subtle/80 rounded-full overflow-hidden p-0.5 border border-border-subtle">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${tierUI.barColor}`}
                  style={{ width: `${Math.max(5, tierResult.score)}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] font-body text-text-secondary text-right">
                {tierResult.nextTier ? (
                  <>
                    Faltam <strong>{tierResult.pointsToNextTier} pts</strong> para atingir o nível{" "}
                    <strong>{tierResult.nextTier === "OURO" ? "Ouro 🥇" : "Prata 🥈"}</strong>
                  </>
                ) : (
                  <span className="font-semibold text-emerald-800">
                    ⭐ Perfil Corporativo Máximo Verificado!
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Expandable Box: Regras dos Níveis & Fatores de Pontuação */}
          <div className="mt-6 pt-5 border-t border-border-subtle/80">
            <button
              type="button"
              onClick={() => setRulesExpanded(!rulesExpanded)}
              className="w-full flex items-center justify-between rounded-2xl border border-border-subtle bg-surface-white/90 hover:bg-surface-white p-4 text-left transition-all shadow-2xs group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-800 group-hover:scale-105 transition-transform">
                  <Icon icon={Info} size={18} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-heading text-xs font-bold text-text-primary group-hover:text-blue-900 transition-colors">
                      Regras dos Níveis &amp; Fatores de Pontuação
                    </p>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">
                      {tierResult.checklist.filter((c) => c.completed).length} de {tierResult.checklist.length} obedecidos
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] font-body text-text-secondary">
                    {rulesExpanded
                      ? "Clique para recolher as regras e fatores"
                      : "Clique para expandir as regras de Bronze/Prata/Ouro e ver os fatores corporativos obedecidos"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden sm:inline-block font-heading text-xs font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
                  {rulesExpanded ? "Recolher" : "Ver Regras"}
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-secondary text-text-secondary group-hover:text-text-primary transition-colors">
                  <Icon icon={rulesExpanded ? ChevronUp : ChevronDown} size={16} />
                </div>
              </div>
            </button>

            {/* Expandable Content Container */}
            {rulesExpanded && (
              <div className="mt-4 space-y-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                {/* Three Tier Benefits Comparison */}
                <div>
                  <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-text-secondary mb-3 flex items-center gap-1.5">
                    <Icon icon={Award} size={14} />
                    Regras de Progressão dos Níveis:
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className={`rounded-2xl p-3.5 border ${tierResult.tier === "BRONZE" ? "bg-surface-white border-amber-300 ring-2 ring-amber-200/50" : "bg-surface-white/60 border-border-subtle"}`}>
                      <div className="flex items-center justify-between text-xs font-heading font-bold text-amber-800">
                        <span>Bronze (0 a 39%)</span>
                        <span>🥉</span>
                      </div>
                      <p className="mt-1 text-[11px] font-body text-text-secondary">
                        Acesso básico ao painel, submissão de demandas e visualização de tecnologias.
                      </p>
                    </div>

                    <div className={`rounded-2xl p-3.5 border ${tierResult.tier === "PRATA" ? "bg-surface-white border-blue-400 ring-2 ring-blue-200" : "bg-surface-white/60 border-border-subtle"}`}>
                      <div className="flex items-center justify-between text-xs font-heading font-bold text-blue-900">
                        <span>Prata (40 a 79%)</span>
                        <span>🥈</span>
                      </div>
                      <p className="mt-1 text-[11px] font-body text-text-secondary">
                        CNPJ e contato corporativo verificados. Desbloqueio para agendamento de reuniões diretas.
                      </p>
                    </div>

                    <div className={`rounded-2xl p-3.5 border ${tierResult.tier === "OURO" ? "bg-surface-white border-yellow-400 ring-2 ring-yellow-200" : "bg-surface-white/60 border-border-subtle"}`}>
                      <div className="flex items-center justify-between text-xs font-heading font-bold text-amber-900">
                        <span>Ouro (80 a 100%)</span>
                        <span>🥇</span>
                      </div>
                      <p className="mt-1 text-[11px] font-body text-text-secondary">
                        Selo de Alta Credibilidade. Suas demandas ganham prioridade máxima de recomendação.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Checklist of Company Requirements */}
                <div>
                  <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-text-secondary mb-3 flex items-center gap-1.5">
                    <Icon icon={ShieldCheck} size={14} />
                    Fatores Obedecidos e Pendentes ({tierResult.checklist.filter((c) => c.completed).length}/{tierResult.checklist.length}):
                  </h4>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {tierResult.checklist.map((item) => (
                      <div
                        key={item.id}
                        className={`rounded-xl border p-2.5 flex items-center justify-between text-xs transition-colors ${
                          item.completed
                            ? "border-blue-200 bg-blue-50/50 text-blue-950 font-semibold"
                            : "border-border-subtle bg-surface-white/80 text-text-secondary"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <Icon
                            icon={item.completed ? CheckCircle2 : Clock}
                            size={14}
                            className={item.completed ? "text-blue-700 shrink-0" : "text-text-secondary shrink-0 opacity-40"}
                          />
                          <span className="truncate">
                            {item.label}
                          </span>
                        </div>
                        <span className={`shrink-0 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          item.completed ? "bg-blue-100 text-blue-900" : "bg-surface-secondary text-text-secondary"
                        }`}>
                          {item.completed ? `✓ +${item.points} pts` : `+${item.points} pts`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* The Company Editing Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Dados da Organização (Pessoa Jurídica) */}
          <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-border-subtle">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                <Icon icon={Building2} size={18} />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-text-primary">
                  1. Dados da Organização (Pessoa Jurídica)
                </h3>
                <p className="font-body text-xs text-text-secondary">
                  Informações cadastrais e fiscais da empresa demandante de tecnologia.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                  Razão Social / Nome da Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  placeholder="Ex: Eurofarma Laboratórios S.A."
                  className="w-full rounded-xl border border-border-subtle bg-surface-primary px-3.5 py-2.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                  CNPJ Corporativo *
                </label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => handleChange("cnpj", e.target.value)}
                  placeholder="00.000.000/0001-00"
                  className="w-full rounded-xl border border-border-subtle bg-surface-primary px-3.5 py-2.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none font-mono"
                />
                <p className="mt-1 text-[11px] text-text-secondary">
                  Garante a autenticidade jurídica da empresa parceira.
                </p>
              </div>

              <div>
                <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                  Setor Industrial / Segmento de Atuação *
                </label>
                <div className="relative">
                  <Icon icon={Factory} size={14} className="absolute left-3 top-3 text-text-secondary" />
                  <input
                    type="text"
                    value={formData.industrySector}
                    onChange={(e) => handleChange("industrySector", e.target.value)}
                    placeholder="Ex: Farmacêutico, Agro & Bioinsumos, Energia, TI"
                    className="w-full rounded-xl border border-border-subtle bg-surface-primary pl-9 pr-3.5 py-2.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                  Sede da Empresa (Cidade - UF)
                </label>
                <div className="relative">
                  <Icon icon={MapPin} size={14} className="absolute left-3 top-3 text-text-secondary" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="Ex: São Paulo - SP, Itapevi - SP"
                    className="w-full rounded-xl border border-border-subtle bg-surface-primary pl-9 pr-3.5 py-2.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Ponto de Contato & Representante */}
          <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-border-subtle">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green-moss/10 text-brand-green-moss">
                <Icon icon={UserCheck} size={18} />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-text-primary">
                  2. Representante Corporativo &amp; Ponto de Contato
                </h3>
                <p className="font-body text-xs text-text-secondary">
                  Profissional responsável por conduzir as conversas de matching e inovação aberta.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                  Nome do Representante Corporativo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Ex: Carlos Eduardo Silva"
                  className="w-full rounded-xl border border-border-subtle bg-surface-primary px-3.5 py-2.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                  Cargo / Função Executiva
                </label>
                <input
                  type="text"
                  value={formData.roleTitle}
                  onChange={(e) => handleChange("roleTitle", e.target.value)}
                  placeholder="Ex: Diretor de Inovação Aberta, Gerente de P&D"
                  className="w-full rounded-xl border border-border-subtle bg-surface-primary px-3.5 py-2.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                  E-mail Corporativo de Contato
                </label>
                <div className="relative">
                  <Icon icon={Mail} size={14} className="absolute left-3 top-3 text-text-secondary" />
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full rounded-xl border border-border-subtle bg-surface-secondary pl-9 pr-3.5 py-2.5 text-xs text-text-secondary cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-[11px] text-text-secondary">
                  E-mail institucional vinculado à conta.
                </p>
              </div>

              <div>
                <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                  Telefone / WhatsApp Comercial
                </label>
                <div className="relative">
                  <Icon icon={Phone} size={14} className="absolute left-3 top-3 text-text-secondary" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="(11) 3000-0000"
                    className="w-full rounded-xl border border-border-subtle bg-surface-primary pl-9 pr-3.5 py-2.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Presença Digital Corporativa */}
          <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-border-subtle">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-earth/10 text-brand-earth">
                <Icon icon={Globe} size={18} />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-text-primary">
                  3. Presença Digital Corporativa
                </h3>
                <p className="font-body text-xs text-text-secondary">
                  Canais institucionais para apresentação aos grupos de pesquisa.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                  Website Corporativo / Portal de Inovação
                </label>
                <div className="relative">
                  <Icon icon={Globe} size={14} className="absolute left-3 top-3 text-text-secondary" />
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                    placeholder="https://empresa.com.br"
                    className="w-full rounded-xl border border-border-subtle bg-surface-primary pl-9 pr-3.5 py-2.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                  LinkedIn Corporativo da Organização
                </label>
                <input
                  type="text"
                  value={formData.linkedin}
                  onChange={(e) => handleChange("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/company/minha-empresa"
                  className="w-full rounded-xl border border-border-subtle bg-surface-primary px-3.5 py-2.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Estratégia de Inovação Aberta */}
          <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-border-subtle">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-800">
                <Icon icon={Award} size={18} />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-text-primary">
                  4. Estratégia de Inovação Aberta &amp; Desafios Tecnológicos
                </h3>
                <p className="font-body text-xs text-text-secondary">
                  Resumo institucional apresentado aos pesquisadores para contextualizar as demandas.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                Apresentação da Organização e Foco em P&amp;D
              </label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="Descreva a atuação da empresa no mercado, principais programas de inovação aberta, tecnologias prioritárias buscadas na academia e diretrizes de cooperação tecnológica..."
                className="w-full rounded-2xl border border-border-subtle bg-surface-primary p-3.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none resize-y"
              />
              <div className="flex justify-between items-center mt-1 text-[11px] text-text-secondary">
                <span>Mínimo 15 caracteres para pontuação na barra de qualificação.</span>
                <span>{formData.bio.length} caracteres</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/dashboard")}
            >
              Voltar ao Painel
            </Button>

            <Button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto bg-brand-green-dark text-brand-off-white"
            >
              <Icon icon={Save} size={16} />
              {saving ? "Salvando Alterações..." : "Salvar Perfil da Empresa"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
