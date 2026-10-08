import { useState, useEffect, useRef, type FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FolderGit2,
  Info,
  Layers,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { authService } from "../services/auth";
import { opportunitiesService, type PatentRequirement } from "../services/opportunities";
import { matchingService } from "../services/matching";

interface LevelOption {
  level: number;
  label: string;
  name: string;
  description: string;
}

const TRL_OPTIONS: LevelOption[] = [
  { level: 1, label: "TRL 1", name: "Princípios Básicos Observados", description: "Princípios básicos observados e relatados na literatura científica." },
  { level: 2, label: "TRL 2", name: "Conceito Tecnológico Formulado", description: "Conceito tecnológico ou aplicação formulada teoricamente." },
  { level: 3, label: "TRL 3", name: "Prova de Conceito Experimental", description: "Prova de conceito analítica e experimental executada em bancada." },
  { level: 4, label: "TRL 4", name: "Validação em Laboratório", description: "Validação de componentes em ambiente de laboratório." },
  { level: 5, label: "TRL 5", name: "Validação em Ambiente Simulado", description: "Validação de componentes integrados em ambiente simulado." },
  { level: 6, label: "TRL 6", name: "Protótipo em Ambiente Relevante", description: "Modelo de engenharia ou protótipo funcional em ambiente relevante." },
  { level: 7, label: "TRL 7", name: "Demonstração em Ambiente Operacional", description: "Demonstração do protótipo do sistema em ambiente operacional real." },
  { level: 8, label: "TRL 8", name: "Sistema Qualificado e Homologado", description: "Sistema real completado e qualificado através de testes normativos." },
  { level: 9, label: "TRL 9", name: "Operação Comercial e Escala Plena", description: "Sistema real comprovado em operação comercial e escala industrial." },
];

const CRL_OPTIONS: LevelOption[] = [
  { level: 1, label: "CRL 1", name: "Hipótese de Mercado", description: "Hipótese de mercado e necessidade não validada comercialmente." },
  { level: 2, label: "CRL 2", name: "Proposta de Valor Mapeada", description: "Proposta de valor identificada e dores do setor mapeadas." },
  { level: 3, label: "CRL 3", name: "Identificação de Clientes-Alvo", description: "Análise de concorrência e identificação de clientes-alvo primários." },
  { level: 4, label: "CRL 4", name: "Interesse Industrial Manifestado", description: "Diálogo preliminar e interesse manifestado por parceiros industriais." },
  { level: 5, label: "CRL 5", name: "Viabilidade Econômica Preliminar", description: "Modelo preliminar de precificação, custos e viabilidade econômica." },
  { level: 6, label: "CRL 6", name: "Piloto ou Co-Desenvolvimento", description: "Parceria de co-desenvolvimento formalizada ou teste piloto contratado." },
  { level: 7, label: "CRL 7", name: "Primeiras Vendas ou Licenciamento", description: "Primeiros acordos de licenciamento ou vendas iniciais formalizadas." },
  { level: 8, label: "CRL 8", name: "Cadeia de Suprimentos Estruturada", description: "Cadeia de suprimentos estruturada e conformidade regulatória plena." },
  { level: 9, label: "CRL 9", name: "Negócio Consolidado no Mercado", description: "Negócio comercialmente viável com tração e receita recorrente." },
];

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

  // Maturidade & Patente
  const [minTrl, setMinTrl] = useState(3);
  const [desiredCrl, setDesiredCrl] = useState(3);
  const [patentRequirement, setPatentRequirement] = useState<PatentRequirement>("PENDING_ACCEPTED");

  // Menus expansíveis de botões para TRL e CRL
  const [isTrlMenuOpen, setIsTrlMenuOpen] = useState(false);
  const [isCrlMenuOpen, setIsCrlMenuOpen] = useState(false);

  const trlMenuRef = useRef<HTMLDivElement>(null);
  const crlMenuRef = useRef<HTMLDivElement>(null);

  // Fecha menus ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (trlMenuRef.current && !trlMenuRef.current.contains(event.target as Node)) {
        setIsTrlMenuOpen(false);
      }
      if (crlMenuRef.current && !crlMenuRef.current.contains(event.target as Node)) {
        setIsCrlMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const selectedTrlObj = TRL_OPTIONS.find((t) => t.level === minTrl) || TRL_OPTIONS[2];
  const selectedCrlObj = CRL_OPTIONS.find((c) => c.level === desiredCrl) || CRL_OPTIONS[2];

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

          {/* Section 2: Maturity Parameters (TRL / CRL) & Intellectual Property */}
          <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs space-y-8">
            <div className="flex items-center gap-3 pb-6 border-b border-border-subtle">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green-moss/10 text-brand-green-dark">
                <Icon icon={Layers} size={20} />
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg text-text-primary">
                  2. Parâmetros de Maturidade (TRL / CRL) &amp; Propriedade Intelectual
                </h2>
                <p className="font-body text-xs text-text-secondary">
                  Selecione os limiares de prontidão tecnológica e comercial da sua demanda por meio dos menus e botões expansíveis.
                </p>
              </div>
            </div>

            {/* TRL Selector (Menu e Botões Expansíveis) */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <label className="font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                  Maturidade Tecnológica Mínima (TRL Mínimo Exigido)
                </label>
                <span className="font-mono text-xs font-bold text-brand-green-dark bg-brand-green-moss/10 px-2.5 py-1 rounded-full w-fit">
                  Selecionado: TRL {minTrl} de 9
                </span>
              </div>

              {/* Botão Expansível de TRL */}
              <div className="relative" ref={trlMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsTrlMenuOpen((prev) => !prev)}
                  className={[
                    "w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all",
                    isTrlMenuOpen
                      ? "border-brand-green-dark bg-brand-green-moss/5 ring-2 ring-brand-green-dark/20"
                      : "border-border-subtle bg-surface-primary hover:border-brand-green-moss hover:bg-surface-white",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span className="flex-shrink-0 flex items-center justify-center h-8 w-14 rounded-lg bg-brand-green-dark text-white font-mono text-xs font-bold">
                      TRL {selectedTrlObj.level}
                    </span>
                    <div className="truncate">
                      <p className="font-heading text-xs md:text-sm font-bold text-text-primary truncate">
                        {selectedTrlObj.name}
                      </p>
                      <p className="font-body text-[11px] text-text-secondary truncate">
                        {selectedTrlObj.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0 text-text-secondary">
                    <span className="text-[11px] font-heading font-medium hidden sm:inline">
                      {isTrlMenuOpen ? "Fechar menu" : "Escolher nível"}
                    </span>
                    <Icon icon={isTrlMenuOpen ? ChevronUp : ChevronDown} size={18} />
                  </div>
                </button>

                {/* Dropdown Menu Expansível com as 9 opções */}
                {isTrlMenuOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-30 max-h-80 overflow-y-auto rounded-2xl border border-border-subtle bg-surface-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-2 border-b border-border-subtle/70 mb-1">
                      <p className="font-heading text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                        Selecione o nível de TRL desejado (1 a 9):
                      </p>
                    </div>

                    <div className="space-y-1">
                      {TRL_OPTIONS.map((opt) => {
                        const isSelected = opt.level === minTrl;
                        return (
                          <button
                            key={opt.level}
                            type="button"
                            onClick={() => {
                              setMinTrl(opt.level);
                              setIsTrlMenuOpen(false);
                            }}
                            className={[
                              "w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors",
                              isSelected
                                ? "bg-brand-green-dark text-white shadow-xs"
                                : "hover:bg-surface-primary text-text-primary",
                            ].join(" ")}
                          >
                            <span
                              className={[
                                "flex-shrink-0 flex items-center justify-center h-6 w-12 rounded-md font-mono text-xs font-bold",
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : "bg-surface-secondary text-text-primary",
                              ].join(" ")}
                            >
                              TRL {opt.level}
                            </span>

                            <div className="flex-1 min-w-0">
                              <p className={["font-heading text-xs font-bold truncate", isSelected ? "text-white" : "text-text-primary"].join(" ")}>
                                {opt.name}
                              </p>
                              <p className={["font-body text-[11px] line-clamp-2 mt-0.5", isSelected ? "text-white/80" : "text-text-secondary"].join(" ")}>
                                {opt.description}
                              </p>
                            </div>

                            {isSelected && (
                              <Icon icon={Check} size={16} className="text-white shrink-0 mt-1" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Botões rápidos de 1 a 9 */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-heading text-[11px] text-text-secondary font-medium">
                    Seleção rápida por botão:
                  </span>
                </div>
                <div className="grid grid-cols-9 gap-1 sm:gap-2">
                  {TRL_OPTIONS.map((opt) => (
                    <button
                      key={opt.level}
                      type="button"
                      onClick={() => setMinTrl(opt.level)}
                      className={[
                        "h-10 rounded-xl font-mono text-xs font-bold transition-all flex flex-col items-center justify-center border",
                        minTrl === opt.level
                          ? "bg-brand-green-dark text-white border-brand-green-dark shadow-sm scale-105"
                          : "bg-surface-primary text-text-secondary border-border-subtle hover:bg-surface-secondary hover:text-text-primary",
                      ].join(" ")}
                      title={`${opt.label}: ${opt.name}`}
                    >
                      <span>{opt.level}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exibição detalhada do nível atual */}
              <div className="rounded-xl bg-surface-primary/70 p-3 border border-border-subtle font-body text-xs text-text-secondary flex items-start gap-2">
                <Icon icon={Info} size={15} className="text-brand-green-moss mt-0.5 shrink-0" />
                <span>
                  <strong>TRL {selectedTrlObj.level}:</strong> {selectedTrlObj.description}
                </span>
              </div>
            </div>

            {/* CRL Selector (Menu e Botões Expansíveis) */}
            <div className="space-y-3 pt-4 border-t border-border-subtle">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <label className="font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                  Maturidade Comercial Almejada (CRL Alvo)
                </label>
                <span className="font-mono text-xs font-bold text-brand-earth bg-brand-earth/10 px-2.5 py-1 rounded-full w-fit">
                  Selecionado: CRL {desiredCrl} de 9
                </span>
              </div>

              {/* Botão Expansível de CRL */}
              <div className="relative" ref={crlMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsCrlMenuOpen((prev) => !prev)}
                  className={[
                    "w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all",
                    isCrlMenuOpen
                      ? "border-brand-earth bg-brand-earth/5 ring-2 ring-brand-earth/20"
                      : "border-border-subtle bg-surface-primary hover:border-brand-earth hover:bg-surface-white",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span className="flex-shrink-0 flex items-center justify-center h-8 w-14 rounded-lg bg-brand-earth text-white font-mono text-xs font-bold">
                      CRL {selectedCrlObj.level}
                    </span>
                    <div className="truncate">
                      <p className="font-heading text-xs md:text-sm font-bold text-text-primary truncate">
                        {selectedCrlObj.name}
                      </p>
                      <p className="font-body text-[11px] text-text-secondary truncate">
                        {selectedCrlObj.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0 text-text-secondary">
                    <span className="text-[11px] font-heading font-medium hidden sm:inline">
                      {isCrlMenuOpen ? "Fechar menu" : "Escolher nível"}
                    </span>
                    <Icon icon={isCrlMenuOpen ? ChevronUp : ChevronDown} size={18} />
                  </div>
                </button>

                {/* Dropdown Menu Expansível com as 9 opções */}
                {isCrlMenuOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-30 max-h-80 overflow-y-auto rounded-2xl border border-border-subtle bg-surface-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-2 border-b border-border-subtle/70 mb-1">
                      <p className="font-heading text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                        Selecione o nível de CRL desejado (1 a 9):
                      </p>
                    </div>

                    <div className="space-y-1">
                      {CRL_OPTIONS.map((opt) => {
                        const isSelected = opt.level === desiredCrl;
                        return (
                          <button
                            key={opt.level}
                            type="button"
                            onClick={() => {
                              setDesiredCrl(opt.level);
                              setIsCrlMenuOpen(false);
                            }}
                            className={[
                              "w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors",
                              isSelected
                                ? "bg-brand-earth text-white shadow-xs"
                                : "hover:bg-surface-primary text-text-primary",
                            ].join(" ")}
                          >
                            <span
                              className={[
                                "flex-shrink-0 flex items-center justify-center h-6 w-12 rounded-md font-mono text-xs font-bold",
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : "bg-surface-secondary text-text-primary",
                              ].join(" ")}
                            >
                              CRL {opt.level}
                            </span>

                            <div className="flex-1 min-w-0">
                              <p className={["font-heading text-xs font-bold truncate", isSelected ? "text-white" : "text-text-primary"].join(" ")}>
                                {opt.name}
                              </p>
                              <p className={["font-body text-[11px] line-clamp-2 mt-0.5", isSelected ? "text-white/80" : "text-text-secondary"].join(" ")}>
                                {opt.description}
                              </p>
                            </div>

                            {isSelected && (
                              <Icon icon={Check} size={16} className="text-white shrink-0 mt-1" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Botões rápidos de 1 a 9 */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-heading text-[11px] text-text-secondary font-medium">
                    Seleção rápida por botão:
                  </span>
                </div>
                <div className="grid grid-cols-9 gap-1 sm:gap-2">
                  {CRL_OPTIONS.map((opt) => (
                    <button
                      key={opt.level}
                      type="button"
                      onClick={() => setDesiredCrl(opt.level)}
                      className={[
                        "h-10 rounded-xl font-mono text-xs font-bold transition-all flex flex-col items-center justify-center border",
                        desiredCrl === opt.level
                          ? "bg-brand-earth text-white border-brand-earth shadow-sm scale-105"
                          : "bg-surface-primary text-text-secondary border-border-subtle hover:bg-surface-secondary hover:text-text-primary",
                      ].join(" ")}
                      title={`${opt.label}: ${opt.name}`}
                    >
                      <span>{opt.level}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exibição detalhada do nível atual */}
              <div className="rounded-xl bg-surface-primary/70 p-3 border border-border-subtle font-body text-xs text-text-secondary flex items-start gap-2">
                <Icon icon={Info} size={15} className="text-brand-earth mt-0.5 shrink-0" />
                <span>
                  <strong>CRL {selectedCrlObj.level}:</strong> {selectedCrlObj.description}
                </span>
              </div>
            </div>

            {/* Patent Requirement Filter */}
            <div className="pt-4 border-t border-border-subtle">
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
                        : "border-border-subtle bg-surface-primary hover:border-text-secondary",
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
