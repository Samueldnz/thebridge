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
  ShieldAlert,
  ShieldCheck,
  UserCheck,
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

  const detectedLogoUrl = formData.website ? getCompanyLogoUrl(formData.website) : "";

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
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
      </div>
    </DashboardLayout>
  );
}
