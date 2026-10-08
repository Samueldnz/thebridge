import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  Building2,
  CheckCircle2,
  Factory,
  Globe,
  Mail,
  MapPin,
  Phone,
  Save,
  UserCheck,
} from "lucide-react";

import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { authService, type User } from "../services/auth";
import { formatCNPJ, formatPhone } from "../utils/formatters";

export function CompanyProfilePage() {
  const navigate = useNavigate();
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
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  return (
    <DashboardLayout
      title="Perfil da Empresa (Pessoa Jurídica)"
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
                  Dados atualizados com sucesso no sistema.
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
                  onChange={(e) => handleChange("cnpj", formatCNPJ(e.target.value))}
                  onBlur={() => handleChange("cnpj", formatCNPJ(formData.cnpj))}
                  maxLength={18}
                  placeholder="00.000.000/0001-00"
                  className="w-full rounded-xl border border-border-subtle bg-surface-primary px-3.5 py-2.5 text-xs text-text-primary focus:border-brand-green-moss focus:outline-none font-mono"
                />
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
