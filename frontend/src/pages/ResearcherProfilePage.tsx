import { useState } from "react";
import {
  Award,
  CheckCircle2,
  GraduationCap,
  Globe,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  User as UserIcon,
  FlaskConical,
  FileText,
} from "lucide-react";

import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { authService, type User } from "../services/auth";
import { connectionsService } from "../services/connections";
import { formatCPF, formatPhone } from "../utils/formatters";

export function ResearcherProfilePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getStoredUser());

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

  // Verification analysis state
  const [verificationStatus, setVerificationStatus] = useState<string>(
    currentUser?.verificationStatus || "NAO_SUBMETIDO"
  );
  const [submittingVerification, setSubmittingVerification] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

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

  const handleSubmitForVerification = async () => {
    setSubmittingVerification(true);
    try {
      const payload = {
        ...formData,
        verificationStatus: "EM_ANALISE" as const,
        verificationSubmittedAt: new Date().toLocaleDateString("pt-BR"),
      };
      const updated = await authService.updateProfile(payload);
      setCurrentUser(updated);
      setVerificationStatus("EM_ANALISE");
      setVerificationSuccess(true);

      connectionsService.addNotification({
        title: "Perfil do pesquisador submetido para análise de veracidade",
        sender: "Auditoria & Compliance The Bridge",
        category: "SISTEMA",
        preview: "Suas credenciais acadêmicas e CPF foram encaminhados para validação.",
        body: `Prezado(a) pesquisador(a) ${formData.name || ""},\n\nRecebemos a submissão do seu perfil acadêmico para análise de veracidade.\n\nNossa curadoria científica irá verificar a titularidade institucional junto a ${formData.university || "sua universidade"} e conferir os registros informados do currículo Lattes.\n\nApós homologação, seu perfil receberá o selo oficial de verificação na plataforma The Bridge.`,
        actionUrl: "/dashboard/perfil",
      });

      setTimeout(() => setVerificationSuccess(false), 5000);
    } catch (err) {
      console.error("Erro ao submeter perfil do pesquisador:", err);
    } finally {
      setSubmittingVerification(false);
    }
  };

  return (
    <DashboardLayout
      title="Perfil do Pesquisador (Pessoa Física)"
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleSubmitForVerification}
            disabled={submittingVerification}
            size="sm"
            className="border-emerald-600 text-emerald-800 hover:bg-emerald-50 text-xs font-bold shadow-xs cursor-pointer"
          >
            <Icon icon={ShieldCheck} size={15} className="text-emerald-700" />
            {submittingVerification
              ? "Submetendo..."
              : verificationStatus === "EM_ANALISE"
              ? "Perfil em Análise ⏳"
              : "SUBMETER PERFIL PARA ANÁLISE DE VERACIDADE"}
          </Button>

          <Button
            onClick={() => handleSave()}
            disabled={saving}
            size="sm"
            className="bg-brand-green-dark text-brand-off-white font-bold"
          >
            <Icon icon={Save} size={15} />
            {saving ? "Salvando..." : "SALVAR PERFIL"}
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Verification Success Alert */}
        {verificationSuccess && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-950 flex items-center gap-3 shadow-xs animate-in fade-in duration-300">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
              <Icon icon={ShieldCheck} size={20} />
            </div>
            <div>
              <p className="font-heading text-sm font-bold">Perfil submetido para análise de veracidade!</p>
              <p className="font-body text-xs text-emerald-900">
                Nossa equipe irá confirmar as informações fornecidas e vínculos acadêmicos informados para certificar seu perfil na plataforma.
              </p>
            </div>
          </div>
        )}

        {/* Feedback Alert - Without Voltar ao Painel */}
        {saveSuccess && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 flex items-center justify-between shadow-xs animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <Icon icon={CheckCircle2} size={20} />
              </div>
              <div>
                <p className="font-heading text-sm font-bold">Perfil acadêmico salvo com sucesso!</p>
                <p className="font-body text-xs text-emerald-800">
                  Dados atualizados com sucesso no sistema.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Verification Status Banner if already in analysis */}
        {verificationStatus === "EM_ANALISE" && !verificationSuccess && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4 text-amber-950 flex items-center gap-3 shadow-xs">
            <Icon icon={ShieldCheck} size={20} className="text-amber-700 shrink-0" />
            <div className="text-xs">
              <span className="font-heading font-bold block">Status: Perfil em Análise de Veracidade ⏳</span>
              <span className="font-body text-amber-900">
                Suas informações acadêmicas e credenciais estão em processo de validação pela curadoria The Bridge.
              </span>
            </div>
          </div>
        )}



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
                  onChange={(e) => handleChange("cpf", formatCPF(e.target.value))}
                  onBlur={() => handleChange("cpf", formatCPF(formData.cpf))}
                  maxLength={14}
                  placeholder="000.000.000-00"
                  className="w-full rounded-xl border border-border-subtle bg-surface-primary px-3.5 py-2.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none font-mono"
                />
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
                    onChange={(e) => handleChange("phone", formatPhone(e.target.value))}
                    onBlur={() => handleChange("phone", formatPhone(formData.phone))}
                    maxLength={15}
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

          {/* Action Buttons Footer */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleSubmitForVerification}
              disabled={submittingVerification}
              size="md"
              className="border-emerald-600 text-emerald-800 hover:bg-emerald-50 text-xs font-bold cursor-pointer"
            >
              <Icon icon={ShieldCheck} size={16} className="text-emerald-700" />
              {submittingVerification
                ? "Submetendo..."
                : verificationStatus === "EM_ANALISE"
                ? "Perfil em Análise ⏳"
                : "SUBMETER PERFIL PARA ANÁLISE DE VERACIDADE"}
            </Button>

            <Button
              type="submit"
              disabled={saving}
              size="md"
              className="bg-brand-green-dark text-brand-off-white font-bold cursor-pointer"
            >
              <Icon icon={Save} size={16} />
              {saving ? "Salvando..." : "SALVAR PERFIL"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
