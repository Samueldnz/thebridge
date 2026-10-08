import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FolderGit2,
  Info,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { authService } from "../services/auth";
import { opportunitiesService, type PatentRequirement } from "../services/opportunities";
import { matchingService } from "../services/matching";

const PATENT_LABELS: Record<PatentRequirement, string> = {
  NOT_REQUIRED: "Dispensável",
  PENDING_ACCEPTED: "Aceita em Depósito",
  REQUIRED: "Obrigatória",
};

export function SubmitOpportunityPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const [user] = useState(authService.getStoredUser());

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");

  // Maturidade & Patente (Expansível)
  const [isMaturityExpanded, setIsMaturityExpanded] = useState(false);
  const [minTrl, setMinTrl] = useState(3);
  const [desiredCrl, setDesiredCrl] = useState(3);
  const [patentRequirement, setPatentRequirement] = useState<PatentRequirement>("PENDING_ACCEPTED");

  // UI state
  const [loading, setLoading] = useState(false);
  const [submittedOpportunity, setSubmittedOpportunity] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);

  useEffect(() => {
    // Check quota if creating
    if (!isEditing) {
      opportunitiesService.getMyOpportunities(user?.id).then((myOpps) => {
        if (myOpps.length >= 5) {
          setIsQuotaExceeded(true);
        }
      });
    }

    if (isEditing && id) {
      opportunitiesService.getOpportunity(id).then((opp) => {
        if (opp) {
          setTitle(opp.title);
          setDescription(opp.description);
          setKeywords(opp.keywords || "");
          setMinTrl(opp.minTrl ?? 3);
          setDesiredCrl(opp.desiredCrl ?? 3);
          setPatentRequirement(opp.patentRequirement ?? "PENDING_ACCEPTED");
        } else {
          setError("Demanda não encontrada para edição.");
        }
      });
    }
  }, [id, isEditing, user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Por favor, preencha o título do desafio ou demanda.");
      return;
    }

    if (!description.trim() || description.length < 30) {
      setError("A descrição da demanda corporativa deve conter pelo menos 30 caracteres.");
      return;
    }

    try {
      setLoading(true);

      if (isEditing && id) {
        // Edit existing opportunity
        const updated = await opportunitiesService.updateOpportunity(id, {
          title: title.trim(),
          description: description.trim(),
          keywords: keywords.trim(),
          minTrl,
          desiredCrl,
          patentRequirement,
          competences: [],
        });

        // Trigger rematch
        await matchingService.runRematch();
        setSubmittedOpportunity(updated);
      } else {
        // Create new opportunity (quota checked)
        const res = await opportunitiesService.createOpportunity({
          title: title.trim(),
          description: description.trim(),
          keywords: keywords.trim(),
          minTrl,
          desiredCrl,
          patentRequirement,
          status: "OPEN",
          competences: [],
        });

        // Trigger rematch
        await matchingService.runRematch();
        setSubmittedOpportunity(res);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro ao processar demanda corporativa.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title={isEditing ? "Editar Demanda Tecnológica" : "Submeter Demanda / Desafio Tecnológico"}
      subtitle={isEditing ? "Atualização de Parâmetros & Rematch Algorítmico" : "Perfil Empresa / Corporativo (Limite de até 5 demandas)"}
      actions={
        <Link
          to="/dashboard/demandas"
          className="inline-flex items-center gap-1.5 font-heading text-xs font-semibold text-text-secondary hover:text-brand-green-moss"
        >
          <Icon icon={ArrowLeft} size={14} />
          Voltar para Minhas Demandas
        </Link>
      }
    >
      {isQuotaExceeded && !isEditing ? (
        /* Quota Exceeded Block */
        <div className="mx-auto max-w-2xl rounded-3xl border border-amber-300 bg-amber-50/70 p-8 md:p-12 text-center shadow-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 mb-6">
            <Icon icon={ShieldAlert} size={36} />
          </div>

          <h2 className="font-display text-2xl font-bold text-amber-950">
            Limite de 5 Demandas Atingido
          </h2>

          <p className="mt-3 font-body text-sm text-amber-900 max-w-md mx-auto leading-relaxed">
            Seu perfil corporativo já possui <strong>5 demandas cadastradas</strong> (cota máxima permitida). Para submeter novos requisitos, <strong>edite uma de suas demandas existentes</strong> para recalcular o rematch com projetos e artigos científicos.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate("/dashboard/demandas")}
              className="bg-brand-green-dark text-brand-off-white"
            >
              <Icon icon={FolderGit2} size={16} />
              Gerenciar e Editar Minhas Demandas
            </Button>
          </div>
        </div>
      ) : submittedOpportunity ? (
        /* Success Screen */
        <div className="mx-auto max-w-2xl rounded-3xl border border-border-subtle bg-surface-white p-8 md:p-12 text-center shadow-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 mb-6">
            <Icon icon={CheckCircle2} size={36} />
          </div>

          <h2 className="font-display text-2xl md:text-3xl font-bold text-text-primary">
            {isEditing ? "Demanda Atualizada e Salva com Sucesso!" : "Demanda Salva e Publicada com Sucesso!"}
          </h2>

          <p className="mt-3 font-body text-sm md:text-base text-text-secondary max-w-lg mx-auto">
            O desafio <strong>"{submittedOpportunity.title}"</strong> foi salvo com sucesso em seu painel e o <strong>Rematch</strong> com projetos acadêmicos e patentes foi recalculado.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="rounded-full bg-brand-green-moss/10 px-3 py-1 font-mono text-xs font-semibold text-brand-green-dark">
              TRL Mínimo: {submittedOpportunity.minTrl}
            </span>
            <span className="rounded-full bg-brand-earth/10 px-3 py-1 font-mono text-xs font-semibold text-brand-earth">
              CRL Alvo: {submittedOpportunity.desiredCrl}
            </span>
            <span className="rounded-full bg-amber-50 px-3 py-1 font-mono text-xs font-semibold text-amber-800">
              Patente: {PATENT_LABELS[submittedOpportunity.patentRequirement as PatentRequirement] || submittedOpportunity.patentRequirement}
            </span>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              onClick={() =>
                navigate(`/dashboard/matching?opportunityId=${submittedOpportunity.id}`)
              }
              className="bg-brand-green-dark text-brand-off-white hover:bg-brand-green-moss transition-all shadow-md"
            >
              <Icon icon={Sparkles} size={16} />
              Fazer Matching de Projetos com IA
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/dashboard/demandas")}
            >
              <Icon icon={FolderGit2} size={16} />
              Minhas Demandas Salvas
            </Button>
          </div>
        </div>
      ) : (
        /* Submission Form */
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-8">
          {error && (
            <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-xs font-medium text-red-800 flex items-center gap-2">
              <Icon icon={Info} size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Business Need & Scope */}
          <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs">
            <div className="flex items-center gap-3 pb-6 border-b border-border-subtle">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Icon icon={Building2} size={20} />
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg text-text-primary">
                  1. Definição do Desafio / Demanda Tecnológica
                </h2>
                <p className="font-body text-xs text-text-secondary">
                  Identifique o problema ou a oportunidade que sua organização deseja solucionar com a academia e grupos de pesquisa.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                  Título da Demanda / Oportunidade *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Sistemas Nanométricos para Aumento de Biodisponibilidade de Princípios Ativos"
                  className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-primary px-4 py-3 font-body text-sm text-text-primary transition-all focus:border-brand-green-moss focus:bg-surface-white focus:outline-none focus:ring-2 focus:ring-brand-green-moss/20"
                />
              </div>

              <div>
                <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                  Descrição do Desafio e Requisitos Técnicos *
                </label>
                <textarea
                  required
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhe o gargalo tecnológico atual da sua empresa, quais metas técnicas precisam ser alcançadas e os critérios de validação..."
                  className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-primary px-4 py-3 font-body text-sm text-text-primary transition-all focus:border-brand-green-moss focus:bg-surface-white focus:outline-none focus:ring-2 focus:ring-brand-green-moss/20"
                />
                <p className="mt-1.5 font-body text-[11px] text-text-secondary">
                  Mínimo de 30 caracteres. Quanto mais clara a descrição técnica, maior a precisão semântica do algoritmo de IA.
                </p>
              </div>

              <div>
                <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                  Palavras-chave (Keywords separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="Ex: nanotecnologia, farmacotécnica, liberação controlada, ensaios pré-clínicos"
                  className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-primary px-4 py-3 font-body text-sm text-text-primary transition-all focus:border-brand-green-moss focus:bg-surface-white focus:outline-none focus:ring-2 focus:ring-brand-green-moss/20"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Expandable Maturity (TRL / CRL) & Intellectual Property */}
          <div className="rounded-3xl border border-border-subtle bg-surface-white shadow-xs overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setIsMaturityExpanded((prev) => !prev)}
              className="w-full flex items-center justify-between p-6 md:p-8 text-left hover:bg-surface-primary/50 transition-colors focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green-moss/10 text-brand-green-dark">
                  <Icon icon={SlidersHorizontal} size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading font-bold text-base md:text-lg text-text-primary">
                      2. Parâmetros de Maturidade (TRL / CRL) &amp; Patente
                    </h2>
                    <span className="rounded-full bg-surface-secondary px-2.5 py-0.5 font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                      Opcional
                    </span>
                  </div>
                  <p className="font-body text-xs text-text-secondary mt-0.5">
                    {isMaturityExpanded
                      ? "Oculte ou ajuste os limiares de maturidade tecnológica, comercial e patente."
                      : `Configuração atual: TRL Mínimo ${minTrl} · CRL Alvo ${desiredCrl} · Patente: ${PATENT_LABELS[patentRequirement]}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pl-4 text-text-secondary">
                <span className="hidden sm:inline font-heading text-xs font-semibold text-brand-green-moss">
                  {isMaturityExpanded ? "Recolher opções" : "Expandir opções"}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-primary border border-border-subtle text-text-secondary">
                  <Icon icon={isMaturityExpanded ? ChevronUp : ChevronDown} size={18} />
                </div>
              </div>
            </button>

            {isMaturityExpanded && (
              <div className="p-6 md:p-8 pt-2 border-t border-border-subtle/60 bg-surface-primary/20 space-y-8 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs text-text-secondary bg-blue-50/70 border border-blue-200/60 rounded-xl p-3.5">
                  <Icon icon={Info} size={16} className="text-blue-600 shrink-0" />
                  <span>
                    Estes parâmetros definem os filtros de maturidade e propriedade intelectual para matching com vitrines tecnológicas e projetos cadastrados.
                  </span>
                </div>

                {/* Min TRL */}
                <div>
                  <div className="flex items-baseline justify-between">
                    <label className="font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                      Maturidade Tecnológica Mínima Exigida (TRL Mínimo)
                    </label>
                    <span className="font-mono text-sm font-bold text-brand-green-dark bg-brand-green-moss/15 px-3 py-1 rounded-full">
                      TRL Mínimo: {minTrl} de 9
                    </span>
                  </div>

                  <input
                    type="range"
                    min={1}
                    max={9}
                    step={1}
                    value={minTrl}
                    onChange={(e) => setMinTrl(Number(e.target.value))}
                    className="mt-4 w-full accent-brand-green-dark cursor-pointer h-2 bg-border-subtle rounded-lg"
                  />

                  <p className="mt-2 font-body text-xs text-text-secondary">
                    Nível 1 (Princípios básicos observados) até Nível 9 (Sistema testado e comprovado em ambiente operacional pleno).
                  </p>
                </div>

                {/* Desired CRL */}
                <div>
                  <div className="flex items-baseline justify-between">
                    <label className="font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                      Maturidade Comercial Almejada (CRL Desejado)
                    </label>
                    <span className="font-mono text-sm font-bold text-brand-earth bg-brand-earth/15 px-3 py-1 rounded-full">
                      CRL Alvo: {desiredCrl} de 9
                    </span>
                  </div>

                  <input
                    type="range"
                    min={1}
                    max={9}
                    step={1}
                    value={desiredCrl}
                    onChange={(e) => setDesiredCrl(Number(e.target.value))}
                    className="mt-4 w-full accent-brand-earth cursor-pointer h-2 bg-border-subtle rounded-lg"
                  />

                  <p className="mt-2 font-body text-xs text-text-secondary">
                    Nível 1 (Proposta de valor preliminar) até Nível 9 (Negócio escalável e consolidado no mercado).
                  </p>
                </div>

                {/* Patent Requirement Filter */}
                <div>
                  <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide mb-3">
                    Requisito de Propriedade Intelectual (Patente)
                  </label>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      {
                        value: "NOT_REQUIRED",
                        label: "Dispensável",
                        desc: "Aceita projetos em segredo industrial, publicação aberta ou sem depósito.",
                      },
                      {
                        value: "PENDING_ACCEPTED",
                        label: "Aceita em Depósito",
                        desc: "Aceita pedidos depositados no INPI ou patentes já concedidas.",
                      },
                      {
                        value: "REQUIRED",
                        label: "Obrigatória",
                        desc: "Exige que o projeto possua patente concedida ou depositada.",
                      },
                    ].map((item) => (
                      <label
                        key={item.value}
                        onClick={() => setPatentRequirement(item.value as PatentRequirement)}
                        className={[
                          "flex flex-col p-4 rounded-2xl border cursor-pointer transition-all",
                          patentRequirement === item.value
                            ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600/20"
                            : "border-border-subtle bg-surface-white hover:border-text-secondary",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-heading text-xs font-bold text-text-primary">
                            {item.label}
                          </span>
                          <input
                            type="radio"
                            name="patentRequirement"
                            value={item.value}
                            checked={patentRequirement === item.value}
                            onChange={() => {}}
                            className="accent-blue-600"
                          />
                        </div>
                        <span className="mt-1 font-body text-[11px] text-text-secondary">
                          {item.desc}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border-subtle">
            <p className="text-xs text-text-secondary text-center sm:text-left">
              * Sua demanda corporativa é <strong>salva imediatamente</strong> no seu perfil e disponibilizada no motor de Matching com IA.
            </p>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/dashboard/demandas")}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="bg-brand-green-dark text-brand-off-white"
              >
                <Icon icon={CheckCircle2} size={16} />
                {loading
                  ? "Salvando..."
                  : isEditing
                  ? "Salvar Alterações da Demanda"
                  : "Salvar e Publicar Demanda"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </DashboardLayout>
  );
}
