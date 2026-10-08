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
  Send,
  X,
  ArrowRightLeft,
} from "lucide-react";

import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { authService, type User } from "../services/auth";
import { connectionsService } from "../services/connections";
import { adminAuditService } from "../services/adminAudit";
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

  // User change requests states (Email & Profile Type)
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState("");
  const [emailJustification, setEmailJustification] = useState("");
  const [submittingEmailReq, setSubmittingEmailReq] = useState(false);

  const [profileTypeModalOpen, setProfileTypeModalOpen] = useState(false);
  const [profileTypeJustification, setProfileTypeJustification] = useState("");
  const [submittingProfileTypeReq, setSubmittingProfileTypeReq] = useState(false);

  const [requestSuccessMessage, setRequestSuccessMessage] = useState<string | null>(null);

  const handleSendEmailRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmailInput.trim() || !newEmailInput.includes("@")) return;
    setSubmittingEmailReq(true);
    try {
      await adminAuditService.submitUserRequest({
        userId: currentUser?.id || `usr-${Date.now()}`,
        userName: formData.name || "Pesquisador",
        currentEmail: formData.email,
        requestedEmail: newEmailInput.trim().toLowerCase(),
        currentProfileType: "RESEARCHER",
        type: "ALTERACAO_EMAIL",
        title: "Solicitação de Alteração de E-mail Acadêmico",
        justification: emailJustification.trim() || "Solicitação de alteração cadastral de e-mail acadêmico/institucional.",
      });

      connectionsService.addNotification({
        title: "Solicitação de alteração de e-mail enviada",
        sender: "Administração The Bridge",
        category: "SISTEMA",
        preview: `Seu pedido para alterar o e-mail para "${newEmailInput}" foi encaminhado para análise.`,
        body: `Prezado(a) pesquisador(a),\n\nRecebemos sua solicitação para alterar o e-mail de acesso da sua conta para ${newEmailInput}.\n\nNossa equipe irá verificar as informações e homologar a alteração em breve.`,
        actionUrl: "/dashboard/perfil",
      });

      setEmailModalOpen(false);
      setNewEmailInput("");
      setEmailJustification("");
      setRequestSuccessMessage("Solicitação de alteração de e-mail enviada para a administração com sucesso!");
      setTimeout(() => setRequestSuccessMessage(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingEmailReq(false);
    }
  };

  const handleSendProfileTypeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileTypeJustification.trim()) return;
    setSubmittingProfileTypeReq(true);
    try {
      await adminAuditService.submitUserRequest({
        userId: currentUser?.id || `usr-${Date.now()}`,
        userName: formData.name || "Pesquisador",
        currentEmail: formData.email,
        currentProfileType: "RESEARCHER",
        requestedProfileType: "COMPANY",
        type: "MUDANCA_PERFIL",
        title: "Solicitação de Migração de Perfil: Pesquisador ➔ Empresa",
        justification: profileTypeJustification.trim(),
      });

      connectionsService.addNotification({
        title: "Solicitação de mudança de tipo de perfil enviada",
        sender: "Administração The Bridge",
        category: "SISTEMA",
        preview: "Seu pedido de migração para Empresa foi encaminhado para análise.",
        body: `Prezado(a) pesquisador(a),\n\nRecebemos sua solicitação para migração de conta de Pesquisador para Empresa (Pessoa Jurídica).\n\nA equipe administrativa da The Bridge analisará seu pedido em breve.`,
        actionUrl: "/dashboard/perfil",
      });

      setProfileTypeModalOpen(false);
      setProfileTypeJustification("");
      setRequestSuccessMessage("Solicitação de mudança de tipo de perfil enviada para a administração com sucesso!");
      setTimeout(() => setRequestSuccessMessage(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingProfileTypeReq(false);
    }
  };

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

      // Despacha para a fila de auditoria e envia notificação no Discord do TI
      await adminAuditService.submitProfileForAudit(updated);

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



        {/* Request Success Alert */}
        {requestSuccessMessage && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-950 flex items-center justify-between shadow-xs animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5">
              <Icon icon={CheckCircle2} size={18} className="text-emerald-700 shrink-0" />
              <p className="font-heading text-xs font-bold">{requestSuccessMessage}</p>
            </div>
            <button
              onClick={() => setRequestSuccessMessage(null)}
              className="text-emerald-800 hover:text-emerald-950 p-1 cursor-pointer"
            >
              <Icon icon={X} size={14} />
            </button>
          </div>
        )}

        {/* Profile Type Badge & Request Link Banner */}
        <div className="rounded-2xl border border-border-subtle bg-surface-white p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Icon icon={GraduationCap} size={16} />
            </div>
            <div>
              <span className="font-heading font-semibold text-text-secondary block text-[11px]">Tipo de Conta Atual:</span>
              <span className="font-heading text-xs font-bold text-text-primary">
                Pesquisador (Pessoa Física)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setProfileTypeModalOpen(true)}
            className="rounded-xl border border-border-subtle bg-surface-primary px-3 py-1.5 font-heading text-xs font-bold text-brand-green-moss hover:bg-emerald-50 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Icon icon={ArrowRightLeft} size={13} />
            Solicitar mudança de tipo de perfil ↗
          </button>
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
                  onChange={(e) => handleChange("cpf", formatCPF(e.target.value))}
                  onBlur={() => handleChange("cpf", formatCPF(formData.cpf))}
                  maxLength={14}
                  placeholder="000.000.000-00"
                  className="w-full rounded-xl border border-border-subtle bg-surface-primary px-3.5 py-2.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-heading font-semibold text-text-primary">
                    E-mail de Contato (Identificador)
                  </label>
                  <button
                    type="button"
                    onClick={() => setEmailModalOpen(true)}
                    className="text-[11px] font-heading font-bold text-brand-green-moss hover:underline cursor-pointer"
                  >
                    Solicitar mudança de e-mail ↗
                  </button>
                </div>
                <div className="relative">
                  <Icon icon={Mail} size={14} className="absolute left-3 top-3 text-text-secondary" />
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full rounded-xl border border-border-subtle bg-surface-secondary pl-9 pr-3.5 py-2.5 text-xs text-text-secondary cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-[11px] text-text-secondary flex items-center justify-between">
                  <span>Identificador principal da conta no The Bridge.</span>
                  <button
                    type="button"
                    onClick={() => setEmailModalOpen(true)}
                    className="text-brand-green-moss hover:underline cursor-pointer font-medium"
                  >
                    Solicitar alteração de e-mail
                  </button>
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

        {/* Modal: Solicitar Mudança de E-mail */}
        {emailModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-3xl bg-surface-white p-6 md:p-8 shadow-xl border border-border-subtle space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
                    <Icon icon={Mail} size={18} />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-text-primary">
                      Solicitar Alteração de E-mail de Acesso
                    </h3>
                    <p className="font-body text-xs text-text-secondary">
                      E-mail atual: <strong className="text-text-primary">{formData.email}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(false)}
                  className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-secondary cursor-pointer"
                >
                  <Icon icon={X} size={18} />
                </button>
              </div>

              <form onSubmit={handleSendEmailRequest} className="space-y-4">
                <div className="rounded-2xl border border-border-subtle bg-surface-primary/40 p-3.5 text-xs text-text-secondary space-y-1">
                  <span className="font-heading font-bold text-text-primary block">Por que é necessária a solicitação?</span>
                  <p>
                    A alteração do e-mail cadastrado requer confirmação de segurança e aprovação pela equipe de TI/Compliance da The Bridge para garantir a integridade dos seus artigos e projetos vinculados.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                    Novo E-mail Acadêmico / Pessoal Desejado *
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmailInput}
                    onChange={(e) => setNewEmailInput(e.target.value)}
                    placeholder="novo.email@universidade.edu.br"
                    className="w-full rounded-xl border border-border-subtle bg-surface-primary px-3.5 py-2.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                    Justificativa para a Alteração *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={emailJustification}
                    onChange={(e) => setEmailJustification(e.target.value)}
                    placeholder="Descreva o motivo da troca de e-mail (ex: mudança de departamento, encerramento de vínculo institucional anterior)..."
                    className="w-full rounded-2xl border border-border-subtle bg-surface-primary p-3.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none resize-y"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setEmailModalOpen(false)}
                    className="cursor-pointer"
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newEmailInput.trim() || submittingEmailReq}
                    className="bg-brand-green-dark text-white font-bold cursor-pointer"
                  >
                    <Icon icon={Send} size={14} />
                    {submittingEmailReq ? "Enviando..." : "Enviar Solicitação"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Solicitar Mudança de Tipo de Perfil */}
        {profileTypeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-3xl bg-surface-white p-6 md:p-8 shadow-xl border border-border-subtle space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-800">
                    <Icon icon={ArrowRightLeft} size={18} />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-text-primary">
                      Solicitar Migração de Perfil
                    </h3>
                    <p className="font-body text-xs text-text-secondary">
                      De: Pesquisador (Pessoa Física) ➔ Para: Empresa (Pessoa Jurídica)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setProfileTypeModalOpen(false)}
                  className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-secondary cursor-pointer"
                >
                  <Icon icon={X} size={18} />
                </button>
              </div>

              <form onSubmit={handleSendProfileTypeRequest} className="space-y-4">
                <div className="rounded-2xl border border-border-subtle bg-surface-primary/40 p-3.5 text-xs text-text-secondary space-y-1">
                  <span className="font-heading font-bold text-text-primary block">Atenção sobre a migração de perfil:</span>
                  <p>
                    A migração altera o escopo da sua conta para publicação de demandas tecnológicas e busca de parcerias corporativas de P&amp;D (requer dados de Pessoa Jurídica / CNPJ).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                    Justificativa para a Migração de Perfil *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={profileTypeJustification}
                    onChange={(e) => setProfileTypeJustification(e.target.value)}
                    placeholder="Descreva por que deseja migrar sua conta para Perfil Empresa (ex: fundação de spin-off acadêmica, startup deep tech)..."
                    className="w-full rounded-2xl border border-border-subtle bg-surface-primary p-3.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none resize-y"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setProfileTypeModalOpen(false)}
                    className="cursor-pointer"
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={!profileTypeJustification.trim() || submittingProfileTypeReq}
                    className="bg-brand-green-dark text-white font-bold cursor-pointer"
                  >
                    <Icon icon={Send} size={14} />
                    {submittingProfileTypeReq ? "Enviando..." : "Enviar Solicitação"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
