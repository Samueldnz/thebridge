import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  GraduationCap,
  Globe,
  Info,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  FlaskConical,
  FileText,
} from "lucide-react";

import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { authService, calculateProfileTier, type User } from "../services/auth";

export function ResearcherProfilePage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getStoredUser());
  const [rulesExpanded, setRulesExpanded] = useState(false);

  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    cpf: currentUser?.cpf || "",
    phone: currentUser?.phone || "",
    roleTitle: currentUser?.roleTitle || "",
    university: currentUser?.university || "",
    department: currentUser?.department || "",
    location: currentUser?.location || "",
    lattes: currentUser?.lattes || "",
    linkedin: currentUser?.linkedin || "",
    bio: currentUser?.bio || "",
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Live calculation of tier for researcher
  const tierResult = calculateProfileTier({
    ...currentUser,
    profileType: "RESEARCHER",
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
      console.error("Erro ao salvar perfil do pesquisador:", err);
    } finally {
      setSaving(false);
    }
  };

  const getTierBadgeConfig = (tier: string) => {
    switch (tier) {
      case "OURO":
        return {
          title: "Pesquisador Ouro 🥇",
          badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
          barColor: "bg-gradient-to-r from-amber-400 to-yellow-500",
          textColor: "text-amber-800",
          bgGlow: "bg-amber-50/70 border-amber-200",
          subtitle: "Validação Acadêmica Completa • Prioridade no Algoritmo de Matching",
        };
      case "PRATA":
        return {
          title: "Pesquisador Prata 🥈",
          badgeColor: "bg-slate-100 text-slate-900 border-slate-300",
          barColor: "bg-gradient-to-r from-slate-400 to-slate-500",
          textColor: "text-slate-800",
          bgGlow: "bg-slate-50/70 border-slate-200",
          subtitle: "Vínculo Universitário & CPF Validados • Contato Habilitado",
        };
      case "BRONZE":
      default:
        return {
          title: "Pesquisador Bronze 🥉",
          badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
          barColor: "bg-gradient-to-r from-amber-600 to-amber-700",
          textColor: "text-amber-700",
          bgGlow: "bg-orange-50/40 border-amber-100",
          subtitle: "Cadastro Básico — Preencha sua instituição e Lattes para subir de nível",
        };
    }
  };

  const tierUI = getTierBadgeConfig(tierResult.tier);

  return (
    <DashboardLayout
      title="Perfil do Pesquisador (Pessoa Física)"
      subtitle="Dados de identificação civil, vínculos universitários, titulação e currículo científico Lattes."
      actions={
        <Button
          onClick={() => handleSave()}
          disabled={saving}
          size="sm"
          className="bg-brand-green-dark text-brand-off-white"
        >
          <Icon icon={Save} size={15} />
          {saving ? "Salvando..." : "Salvar Dados Acadêmicos"}
        </Button>
      }
    >
      <div className="space-y-8">
        {/* Feedback Alert */}
        {saveSuccess && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 flex items-center justify-between shadow-xs animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <Icon icon={CheckCircle2} size={20} />
              </div>
              <div>
                <p className="font-heading text-sm font-bold">Perfil acadêmico salvo com sucesso!</p>
                <p className="font-body text-xs text-emerald-800">
                  Dados atualizados. Seu nível científico é <strong>{tierUI.title}</strong> ({tierResult.score}% preenchido).
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="font-heading text-xs font-bold text-emerald-900 hover:underline"
            >
              Ir ao Painel →
            </button>
          </div>
        )}

        {/* Gamified Tier Card for Researcher */}
        <div className={`rounded-3xl border p-6 md:p-8 shadow-xs ${tierUI.bgGlow} transition-all`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-surface-white border border-emerald-200 shadow-xs">
                <Icon icon={GraduationCap} size={36} className="text-brand-green-moss" />
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
                  Status de Qualificação Científica
                </h3>
                <p className="mt-0.5 font-body text-xs text-text-secondary">
                  {tierUI.subtitle}
                </p>
              </div>
            </div>

            {/* Progress to Next Tier */}
            <div className="w-full lg:w-72 shrink-0">
              <div className="flex justify-between text-xs font-mono mb-1.5 text-text-secondary">
                <span>Progresso Acadêmico</span>
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
                    ⭐ Perfil Acadêmico Máximo Verificado!
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
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-green-moss/10 text-brand-green-moss group-hover:scale-105 transition-transform">
                  <Icon icon={Info} size={18} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-heading text-xs font-bold text-text-primary group-hover:text-brand-green-moss transition-colors">
                      Regras dos Níveis &amp; Fatores de Pontuação
                    </p>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                      {tierResult.checklist.filter((c) => c.completed).length} de {tierResult.checklist.length} obedecidos
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] font-body text-text-secondary">
                    {rulesExpanded
                      ? "Clique para recolher as regras e fatores"
                      : "Clique para expandir as regras de Bronze/Prata/Ouro e ver os fatores obedecidos"}
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
                        Acesso inicial, visualização de demandas industriais e cota de 5 projetos.
                      </p>
                    </div>

                    <div className={`rounded-2xl p-3.5 border ${tierResult.tier === "PRATA" ? "bg-surface-white border-slate-400 ring-2 ring-slate-200" : "bg-surface-white/60 border-border-subtle"}`}>
                      <div className="flex items-center justify-between text-xs font-heading font-bold text-slate-800">
                        <span>Prata (40 a 79%)</span>
                        <span>🥈</span>
                      </div>
                      <p className="mt-1 text-[11px] font-body text-text-secondary">
                        Universidade e CPF validados. Maior confiabilidade para empresas em busca de P&amp;D.
                      </p>
                    </div>

                    <div className={`rounded-2xl p-3.5 border ${tierResult.tier === "OURO" ? "bg-surface-white border-yellow-400 ring-2 ring-yellow-200" : "bg-surface-white/60 border-border-subtle"}`}>
                      <div className="flex items-center justify-between text-xs font-heading font-bold text-amber-900">
                        <span>Ouro (80 a 100%)</span>
                        <span>🥇</span>
                      </div>
                      <p className="mt-1 text-[11px] font-body text-text-secondary">
                        Selo Ouro com Lattes checado. Topo das recomendações automáticas de matching.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Checklist of Researcher Requirements */}
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
                            ? "border-emerald-200 bg-emerald-50/50 text-emerald-950 font-semibold"
                            : "border-border-subtle bg-surface-white/80 text-text-secondary"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <Icon
                            icon={item.completed ? CheckCircle2 : Clock}
                            size={14}
                            className={item.completed ? "text-emerald-700 shrink-0" : "text-text-secondary shrink-0 opacity-40"}
                          />
                          <span className="truncate">
                            {item.label}
                          </span>
                        </div>
                        <span className={`shrink-0 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          item.completed ? "bg-emerald-100 text-emerald-900" : "bg-surface-secondary text-text-secondary"
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

        {/* The Researcher Editing Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Identificação Civil & Contato */}
          <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-border-subtle">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green-moss/10 text-brand-green-moss">
                <Icon icon={UserIcon} size={18} />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-text-primary">
                  1. Identificação Civil &amp; Contato Pessoal
                </h3>
                <p className="font-body text-xs text-text-secondary">
                  Dados civis do pesquisador responsável pela submissão das tecnologias.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                  Nome Completo do Pesquisador *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Ex: Dra. Carolina Fontes"
                  className="w-full rounded-xl border border-border-subtle bg-surface-primary px-3.5 py-2.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                  CPF do Pesquisador *
                </label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => handleChange("cpf", e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full rounded-xl border border-border-subtle bg-surface-primary px-3.5 py-2.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none font-mono"
                />
                <p className="mt-1 text-[11px] text-text-secondary">
                  Utilizado para validação de autoria e propriedade intelectual.
                </p>
              </div>

              <div>
                <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                  E-mail de Contato (Identificador)
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
                  E-mail associado permanentemente à sua conta.
                </p>
              </div>

              <div>
                <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                  Telefone / WhatsApp de Contato
                </label>
                <div className="relative">
                  <Icon icon={Phone} size={14} className="absolute left-3 top-3 text-text-secondary" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full rounded-xl border border-border-subtle bg-surface-primary pl-9 pr-3.5 py-2.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                  Localização da Pesquisa (Cidade - UF)
                </label>
                <div className="relative">
                  <Icon icon={MapPin} size={14} className="absolute left-3 top-3 text-text-secondary" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="Ex: São Paulo - SP, Campinas - SP, Rio de Janeiro - RJ"
                    className="w-full rounded-xl border border-border-subtle bg-surface-primary pl-9 pr-3.5 py-2.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Vínculo Científico & Acadêmico */}
          <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-border-subtle">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                <Icon icon={GraduationCap} size={18} />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-text-primary">
                  2. Vínculo Científico &amp; Qualificação Acadêmica
                </h3>
                <p className="font-body text-xs text-text-secondary">
                  Instituição acadêmica, grupo de pesquisa e titulação do pesquisador.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                  Universidade Vinculada / ICT *
                </label>
                <div className="relative">
                  <Icon icon={GraduationCap} size={14} className="absolute left-3 top-3 text-text-secondary" />
                  <input
                    type="text"
                    value={formData.university}
                    onChange={(e) => handleChange("university", e.target.value)}
                    placeholder="Ex: USP, UNICAMP, UFRJ, UFMG, Embrapa, IPT"
                    className="w-full rounded-xl border border-border-subtle bg-surface-primary pl-9 pr-3.5 py-2.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none"
                  />
                </div>
                <p className="mt-1 text-[11px] text-text-secondary">
                  Universidade ou instituto de pesquisa titular das patentes/projetos.
                </p>
              </div>

              <div>
                <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                  Laboratório / Departamento / Grupo de Pesquisa
                </label>
                <div className="relative">
                  <Icon icon={FlaskConical} size={14} className="absolute left-3 top-3 text-text-secondary" />
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                    placeholder="Ex: Lab de Nanotecnologia Molecular, Depto de Bioquímica"
                    className="w-full rounded-xl border border-border-subtle bg-surface-primary pl-9 pr-3.5 py-2.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                  Titulação Acadêmica &amp; Cargo no Laboratório
                </label>
                <input
                  type="text"
                  value={formData.roleTitle}
                  onChange={(e) => handleChange("roleTitle", e.target.value)}
                  placeholder="Ex: Doutora em Biotecnologia • Professora Titular • Coordenadora de P&D"
                  className="w-full rounded-xl border border-border-subtle bg-surface-primary px-3.5 py-2.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Produção & Redes Científicas */}
          <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-border-subtle">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                <Icon icon={FileText} size={18} />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-text-primary">
                  3. Currículo Lattes &amp; Redes Científicas
                </h3>
                <p className="font-body text-xs text-text-secondary">
                  Comprovação pública de publicações, artigos e trajetória científica.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                  Link do Currículo Lattes (CNPq) *
                </label>
                <div className="relative">
                  <Icon icon={Globe} size={14} className="absolute left-3 top-3 text-text-secondary" />
                  <input
                    type="text"
                    value={formData.lattes}
                    onChange={(e) => handleChange("lattes", e.target.value)}
                    placeholder="http://lattes.cnpq.br/0000000000000000"
                    className="w-full rounded-xl border border-border-subtle bg-surface-primary pl-9 pr-3.5 py-2.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none"
                  />
                </div>
                <p className="mt-1 text-[11px] text-text-secondary">
                  Essencial para pontuação no nível Ouro e validação da autoridade científica.
                </p>
              </div>

              <div>
                <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                  Perfil no LinkedIn
                </label>
                <input
                  type="text"
                  value={formData.linkedin}
                  onChange={(e) => handleChange("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/in/meu-perfil"
                  className="w-full rounded-xl border border-border-subtle bg-surface-primary px-3.5 py-2.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Linhas de Pesquisa & Resumo Técnico */}
          <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-border-subtle">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-800">
                <Icon icon={Award} size={18} />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-text-primary">
                  4. Linhas de Pesquisa &amp; Resumo Científico
                </h3>
                <p className="font-body text-xs text-text-secondary">
                  Apresentação detalhada da atuação científica para empresas interessadas em cooperação.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                Resumo das Competências e Linhas de Pesquisa
              </label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="Descreva as principais linhas de pesquisa do laboratório, principais artigos publicados, patentes desenvolvidas e histórico de projetos cooperativos com a indústria..."
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
              {saving ? "Salvando Alterações..." : "Salvar Perfil do Pesquisador"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
