import { useState } from "react";
import {
  Award,
  Building2,
  CheckCircle2,
  Factory,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  Send,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  X,
  ArrowRightLeft,
} from "lucide-react";

import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { authService, type User } from "../services/auth";
import { formatCNPJ, formatPhone } from "../utils/formatters";
import {
  validateCnpjWithBrasilApi,
  getCompanyLogoUrl,
  extractDomain,
  type BrasilApiCnpjData,
} from "../services/brasilApi";
import { connectionsService } from "../services/connections";
import { adminAuditService } from "../services/adminAudit";

export function CompanyProfilePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getStoredUser());

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
    logoUrl: currentUser?.logoUrl || "",
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // BrasilAPI validation state
  const [validatingCnpj, setValidatingCnpj] = useState(false);
  const [cnpjData, setCnpjData] = useState<BrasilApiCnpjData | null>(
    currentUser?.cnpjValidationData
      ? ({
          cnpj: currentUser.cnpj || "",
          razao_social: currentUser.cnpjValidationData.razaoSocial || "",
          nome_fantasia: currentUser.cnpjValidationData.nomeFantasia || "",
          descricao_situacao_cadastral: currentUser.cnpjValidationData.situacao || "ATIVA",
          municipio: currentUser.cnpjValidationData.municipio,
          uf: currentUser.cnpjValidationData.uf,
        } as BrasilApiCnpjData)
      : null
  );
  const [cnpjError, setCnpjError] = useState<string | null>(null);

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

  const detectedLogoUrl = formData.website ? getCompanyLogoUrl(formData.website) : "";

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  };

  const handleSendEmailRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmailInput.trim() || !newEmailInput.includes("@")) return;
    setSubmittingEmailReq(true);
    try {
      await adminAuditService.submitUserRequest({
        userId: currentUser?.id || `usr-${Date.now()}`,
        userName: formData.companyName || formData.name || "Empresa",
        currentEmail: formData.email,
        requestedEmail: newEmailInput.trim().toLowerCase(),
        currentProfileType: "COMPANY",
        type: "ALTERACAO_EMAIL",
        title: "Solicitação de Alteração de E-mail Corporativo",
        justification: emailJustification.trim() || "Solicitação de alteração cadastral de e-mail institucional.",
      });

      connectionsService.addNotification({
        title: "Solicitação de alteração de e-mail enviada",
        sender: "Administração The Bridge",
        category: "SISTEMA",
        preview: `Seu pedido para alterar o e-mail para "${newEmailInput}" foi encaminhado para análise.`,
        body: `Prezado(a) gestor(a),\n\nRecebemos sua solicitação para alterar o e-mail de acesso da empresa "${formData.companyName}" para ${newEmailInput}.\n\nNossa equipe irá verificar as informações e homologar a alteração em breve.`,
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
        userName: formData.companyName || formData.name || "Empresa",
        currentEmail: formData.email,
        currentProfileType: "COMPANY",
        requestedProfileType: "RESEARCHER",
        type: "MUDANCA_PERFIL",
        title: "Solicitação de Migração de Perfil: Empresa ➔ Pesquisador",
        justification: profileTypeJustification.trim(),
      });

      connectionsService.addNotification({
        title: "Solicitação de mudança de tipo de perfil enviada",
        sender: "Administração The Bridge",
        category: "SISTEMA",
        preview: "Seu pedido de migração para Pesquisador foi encaminhado para análise.",
        body: `Prezado(a) usuário(a),\n\nRecebemos sua solicitação para migração de conta de Empresa para Pesquisador.\n\nA equipe administrativa da The Bridge analisará seu pedido em breve.`,
        actionUrl: "/dashboard/perfil",
      });

      setProfileTypeModalOpen(false);
      setProfileTypeJustification("");
      setRequestSuccessMessage("Solicitação de migração de perfil enviada para a administração com sucesso!");
      setTimeout(() => setRequestSuccessMessage(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingProfileTypeReq(false);
    }
  };

  const handleValidateCnpj = async (inputCnpj = formData.cnpj) => {
    const clean = inputCnpj.replace(/\D/g, "");
    if (clean.length !== 14) {
      setCnpjError("Digite o CNPJ completo com 14 dígitos para validar.");
      return;
    }
    setCnpjError(null);
    setValidatingCnpj(true);
    try {
      const res = await validateCnpjWithBrasilApi(clean);
      if (res.valid && res.data) {
        setCnpjData(res.data);
        setCnpjError(null);
        // Autofill empty fields with official data
        setFormData((prev) => ({
          ...prev,
          companyName: prev.companyName || res.data!.razao_social || "",
          industrySector: prev.industrySector || res.data!.cnae_fiscal_descricao || "",
          location:
            prev.location ||
            (res.data!.municipio && res.data!.uf
              ? `${res.data!.municipio} - ${res.data!.uf}`
              : prev.location),
          phone: prev.phone || (res.data!.ddd_telefone_1 ? formatPhone(res.data!.ddd_telefone_1) : prev.phone),
        }));
      } else {
        setCnpjData(null);
        setCnpjError(res.error || "CNPJ não localizado na base pública da Receita Federal.");
      }
    } catch {
      setCnpjError("Erro de comunicação ao consultar BrasilAPI.");
    } finally {
      setValidatingCnpj(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const effectiveLogo = detectedLogoUrl || formData.logoUrl;
      const payload = {
        ...formData,
        logoUrl: effectiveLogo,
        cnpjValidated: !!cnpjData,
        cnpjValidationData: cnpjData
          ? {
              razaoSocial: cnpjData.razao_social,
              nomeFantasia: cnpjData.nome_fantasia,
              situacao: cnpjData.descricao_situacao_cadastral,
              municipio: cnpjData.municipio,
              uf: cnpjData.uf,
            }
          : undefined,
      };
      const updated = await authService.updateProfile(payload);
      setCurrentUser(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error("Erro ao salvar perfil corporativo:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForVerification = async () => {
    setSubmittingVerification(true);
    try {
      const effectiveLogo = detectedLogoUrl || formData.logoUrl;
      const payload = {
        ...formData,
        logoUrl: effectiveLogo,
        cnpjValidated: !!cnpjData,
        cnpjValidationData: cnpjData
          ? {
              razaoSocial: cnpjData.razao_social,
              nomeFantasia: cnpjData.nome_fantasia,
              situacao: cnpjData.descricao_situacao_cadastral,
              municipio: cnpjData.municipio,
              uf: cnpjData.uf,
            }
          : undefined,
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
        title: "Perfil corporativo submetido para análise de veracidade",
        sender: "Auditoria & Compliance The Bridge",
        category: "SISTEMA",
        preview: "Suas informações corporativas e CNPJ foram encaminhados para validação.",
        body: `Prezado(a) gestor(a),\n\nRecebemos a submissão das informações da empresa "${formData.companyName || "Empresa"}" (CNPJ: ${formData.cnpj || "Não informado"}) para análise de veracidade.\n\nNossa equipe jurídica e de conformidade irá averiguar a autenticidade cadastral junto à Receita Federal e canais institucionais.\n\nAssim que homologado, o selo de perfil corporativo verificado será atribuído à sua organização.`,
        actionUrl: "/dashboard/perfil",
      });

      setTimeout(() => setVerificationSuccess(false), 5000);
    } catch (err) {
      console.error("Erro ao submeter perfil:", err);
    } finally {
      setSubmittingVerification(false);
    }
  };

  return (
    <DashboardLayout
      title="Perfil da Empresa (Pessoa Jurídica)"
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
                Nossa equipe irá confirmar as informações fornecidas junto à Receita Federal e canais oficiais para certificar sua empresa na plataforma.
              </p>
            </div>
          </div>
        )}

        {/* Feedback Alert - Without Voltar ao Painel */}
        {saveSuccess && (
          <div className="rounded-2xl border border-blue-300 bg-blue-50 p-4 text-blue-950 flex items-center justify-between shadow-xs animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
                <Icon icon={CheckCircle2} size={20} />
              </div>
              <div>
                <p className="font-heading text-sm font-bold">Perfil salvo com sucesso!</p>
                <p className="font-body text-xs text-blue-900">
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
                Suas informações cadastrais estão em processo de validação pela curadoria The Bridge.
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
              <Icon icon={Building2} size={16} />
            </div>
            <div>
              <span className="font-heading font-semibold text-text-secondary block text-[11px]">Tipo de Conta Atual:</span>
              <span className="font-heading text-xs font-bold text-text-primary">
                Empresa (Pessoa Jurídica)
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-heading font-semibold text-text-primary">
                    CNPJ Corporativo *
                  </label>
                  <button
                    type="button"
                    onClick={() => handleValidateCnpj()}
                    disabled={validatingCnpj || !formData.cnpj}
                    className="inline-flex items-center gap-1 font-heading text-[11px] font-bold text-brand-green-moss hover:underline cursor-pointer disabled:opacity-50"
                  >
                    {validatingCnpj ? (
                      <>
                        <Icon icon={Loader2} size={11} className="animate-spin" />
                        <span>Consultando Receita Federal...</span>
                      </>
                    ) : (
                      <>
                        <Icon icon={ShieldCheck} size={12} />
                        <span>Validar via BrasilAPI</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => {
                    const formatted = formatCNPJ(e.target.value);
                    handleChange("cnpj", formatted);
                    if (formatted.replace(/\D/g, "").length === 14) {
                      handleValidateCnpj(formatted);
                    }
                  }}
                  onBlur={() => {
                    const formatted = formatCNPJ(formData.cnpj);
                    handleChange("cnpj", formatted);
                    if (formatted.replace(/\D/g, "").length === 14 && !cnpjData) {
                      handleValidateCnpj(formatted);
                    }
                  }}
                  maxLength={18}
                  placeholder="00.000.000/0001-00"
                  className="w-full rounded-xl border border-border-subtle bg-surface-primary px-3.5 py-2.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none font-mono"
                />

                {/* BrasilAPI CNPJ feedback */}
                {cnpjData && (
                  <div className="mt-2 p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/80 text-emerald-950 text-xs flex items-start gap-2 animate-in fade-in">
                    <Icon icon={CheckCircle2} size={15} className="text-emerald-700 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-heading font-bold">
                        CNPJ Validado na Receita Federal (BrasilAPI): {cnpjData.razao_social}
                      </p>
                      <p className="text-[11px] text-emerald-800 font-body">
                        Situação: <strong>{cnpjData.descricao_situacao_cadastral || "ATIVA"}</strong>
                        {cnpjData.municipio && cnpjData.uf ? ` • ${cnpjData.municipio} - ${cnpjData.uf}` : ""}
                      </p>
                    </div>
                  </div>
                )}

                {cnpjError && (
                  <div className="mt-2 p-2 rounded-xl border border-red-300 bg-red-50 text-red-800 text-[11px] flex items-center gap-1.5 animate-in fade-in">
                    <Icon icon={ShieldAlert} size={14} className="text-red-700 shrink-0" />
                    <span>{cnpjError}</span>
                  </div>
                )}
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
                  placeholder="Ex: Carlos Eduardo Silveira"
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-heading font-semibold text-text-primary">
                    E-mail Corporativo de Contato
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
                  <span>E-mail institucional fixo para login.</span>
                  <button
                    type="button"
                    onClick={() => setEmailModalOpen(true)}
                    className="text-brand-green-moss hover:underline font-semibold cursor-pointer"
                  >
                    Enviar solicitação de troca
                  </button>
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
                    onChange={(e) => handleChange("phone", formatPhone(e.target.value))}
                    onBlur={() => handleChange("phone", formatPhone(formData.phone))}
                    maxLength={15}
                    placeholder="(11) 98765-4321"
                    className="w-full rounded-xl border border-border-subtle bg-surface-primary pl-9 pr-3.5 py-2.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Presença Digital Corporativa & Logo */}
          <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-border-subtle">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                <Icon icon={Globe} size={18} />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-text-primary">
                  3. Presença Digital Corporativa &amp; Logo
                </h3>
                <p className="font-body text-xs text-text-secondary">
                  Canais institucionais para apresentação aos grupos de pesquisa e identificação visual da empresa.
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

                {/* Company Logo preview from website */}
                {detectedLogoUrl && (
                  <div className="mt-2.5 flex items-center gap-3 p-2.5 rounded-xl border border-border-subtle bg-surface-primary/70">
                    <div className="h-9 w-9 shrink-0 rounded-full bg-white border border-border-subtle p-1 flex items-center justify-center overflow-hidden shadow-2xs">
                      <img
                        src={detectedLogoUrl}
                        alt="Logo da Empresa"
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                    <div className="text-xs">
                      <span className="font-heading font-bold text-text-primary block">
                        Logo Corporativo Detectado
                      </span>
                      <span className="text-[11px] text-text-secondary font-body">
                        Usado como foto/ícone do perfil ({extractDomain(formData.website)})
                      </span>
                    </div>
                  </div>
                )}
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
                placeholder="Apresente as diretrizes de inovação da empresa, áreas de interesse prioritário e histórico de parcerias com universidades..."
                className="w-full rounded-xl border border-border-subtle bg-surface-primary p-3.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none"
              />
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleSubmitForVerification}
              disabled={submittingVerification}
              size="md"
              className="border-emerald-600 text-emerald-800 hover:bg-emerald-50 text-xs font-bold"
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
              className="bg-brand-green-dark text-brand-off-white font-bold"
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
                      Solicitar Alteração de E-mail
                    </h3>
                    <p className="font-body text-xs text-text-secondary">
                      E-mail atual: {formData.email}
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
                <div>
                  <label className="block text-xs font-heading font-semibold text-text-primary mb-1">
                    Novo E-mail Corporativo Desejado *
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmailInput}
                    onChange={(e) => setNewEmailInput(e.target.value)}
                    placeholder="novo.email@empresa.com.br"
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
                    placeholder="Descreva o motivo da troca de e-mail (ex: mudança de gestor, reestruturação de domínio corporativo)..."
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
                      De: Empresa (Pessoa Jurídica) ➔ Para: Pesquisador (Pessoa Física)
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
                    A migração altera o escopo da sua conta para submissão de artigos científicos, patentes acadêmicas e competências de pesquisa.
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
                    placeholder="Descreva por que deseja migrar sua conta para Pesquisador (ex: descontinuação de pessoa jurídica e retorno para pesquisa acadêmica)..."
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
