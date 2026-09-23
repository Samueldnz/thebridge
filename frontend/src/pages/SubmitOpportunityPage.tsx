import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  DollarSign,
  FolderGit2,
  Info,
  Layers,
  Plus,
  Scale,
  ShieldAlert,
  Sparkles,
  Trash2,
} from "lucide-react";

import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { authService } from "../services/auth";
import { opportunitiesService, type PatentRequirement } from "../services/opportunities";
import { competencesService, type CompetenceItem } from "../services/competences";
import { matchingService } from "../services/matching";

export function SubmitOpportunityPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const [user] = useState(authService.getStoredUser());

  // Form State
  const [title, setTitle] = useState("");
  const [industrySector, setIndustrySector] = useState("Saúde & Indústria Farmacêutica");
  const [desiredTechnology, setDesiredTechnology] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [minTrl, setMinTrl] = useState(5);
  const [desiredCrl, setDesiredCrl] = useState(5);
  const [patentRequirement, setPatentRequirement] = useState<PatentRequirement>("PENDING_ACCEPTED");
  const [budgetMin, setBudgetMin] = useState<number>(500000);
  const [budgetMax, setBudgetMax] = useState<number>(2000000);
  const [timeline, setTimeline] = useState("12 a 18 meses");

  // Competences State
  const [allCompetences, setAllCompetences] = useState<CompetenceItem[]>([]);
  const [selectedCompetences, setSelectedCompetences] = useState<
    Array<{ competenceId: string; weight: number; name: string }>
  >([]);
  const [tempCompId, setTempCompId] = useState("");
  const [tempCompWeight, setTempCompWeight] = useState(5);

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

    // Load competences catalog
    competencesService.getCompetences().then((list) => {
      setAllCompetences(list);
      if (list.length > 0 && !isEditing) {
        setTempCompId(list[0].id);
        setSelectedCompetences([
          { competenceId: list[0].id, weight: 5, name: list[0].name },
          { competenceId: list[2] ? list[2].id : list[1].id, weight: 4, name: list[2] ? list[2].name : list[1].name },
        ]);
      }
    });

    if (isEditing && id) {
      opportunitiesService.getOpportunity(id).then((opp) => {
        if (opp) {
          setTitle(opp.title);
          setIndustrySector(opp.industrySector || "Saúde & Indústria Farmacêutica");
          setDesiredTechnology(opp.desiredTechnology || "");
          setDescription(opp.description);
          setKeywords(opp.keywords || "");
          setMinTrl(opp.minTrl);
          setDesiredCrl(opp.desiredCrl);
          setPatentRequirement(opp.patentRequirement);
          if (opp.budgetMin) setBudgetMin(opp.budgetMin);
          if (opp.budgetMax) setBudgetMax(opp.budgetMax);
          if (opp.timeline) setTimeline(opp.timeline);
          setSelectedCompetences(
            opp.competences.map((c) => ({
              competenceId: c.competenceId,
              weight: c.weight,
              name: c.name || c.competenceId,
            }))
          );
        } else {
          setError("Demanda não encontrada para edição.");
        }
      });
    }
  }, [id, isEditing, user]);

  const handleAddCompetence = () => {
    if (!tempCompId) return;
    const compObj = allCompetences.find((c) => c.id === tempCompId);
    if (!compObj) return;

    if (selectedCompetences.some((c) => c.competenceId === tempCompId)) {
      setError("Esta competência já foi adicionada à demanda.");
      return;
    }
    setError(null);
    setSelectedCompetences([
      ...selectedCompetences,
      { competenceId: compObj.id, weight: tempCompWeight, name: compObj.name },
    ]);
  };

  const handleRemoveCompetence = (compId: string) => {
    setSelectedCompetences(selectedCompetences.filter((c) => c.competenceId !== compId));
  };

  const handleUpdateWeight = (compId: string, newWeight: number) => {
    setSelectedCompetences(
      selectedCompetences.map((c) => (c.competenceId === compId ? { ...c, weight: newWeight } : c))
    );
  };

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

    if (selectedCompetences.length === 0) {
      setError("Adicione pelo menos uma competência tecnológica necessária para o matching.");
      return;
    }

    try {
      setLoading(true);

      if (isEditing && id) {
        // Edit existing opportunity
        const updated = await opportunitiesService.updateOpportunity(id, {
          title: title.trim(),
          industrySector: industrySector.trim(),
          desiredTechnology: desiredTechnology.trim() || title.trim(),
          description: description.trim(),
          keywords: keywords.trim(),
          minTrl,
          desiredCrl,
          patentRequirement,
          budgetMin,
          budgetMax,
          currency: "BRL",
          timeline,
          competences: selectedCompetences.map((c) => ({
            competenceId: c.competenceId,
            weight: c.weight,
          })),
        });

        // Trigger rematch
        await matchingService.runRematch();
        setSubmittedOpportunity(updated);
      } else {
        // Create new opportunity (quota checked)
        const res = await opportunitiesService.createOpportunity({
          title: title.trim(),
          industrySector: industrySector.trim(),
          desiredTechnology: desiredTechnology.trim() || title.trim(),
          description: description.trim(),
          keywords: keywords.trim(),
          minTrl,
          desiredCrl,
          patentRequirement,
          budgetMin,
          budgetMax,
          currency: "BRL",
          timeline,
          status: "OPEN",
          competences: selectedCompetences.map((c) => ({
            competenceId: c.competenceId,
            weight: c.weight,
          })),
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
      title={isEditing ? "Editar Demanda Tecnológica" : "Submeter Demanda / Desejo de Ideia"}
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
            Seu perfil corporativo já possui <strong>5 demandas cadastradas</strong> (cota máxima permitida). Para submeter novos requisitos, orçamentos ou tolerâncias de TRL, <strong>edite uma de suas demandas existentes</strong> para recalcular o rematch com grupos de pesquisa.
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
            {isEditing ? "Demanda Atualizada com Sucesso!" : "Demanda Corporativa Cadastrada!"}
          </h2>

          <p className="mt-3 font-body text-sm md:text-base text-text-secondary max-w-lg mx-auto">
            O desafio <strong>"{submittedOpportunity.title}"</strong> foi salvo e o <strong>Rematch</strong> com projetos acadêmicos e patentes foi recalculado.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="rounded-full bg-brand-green-moss/10 px-3 py-1 font-mono text-xs font-semibold text-brand-green-dark">
              Mínimo TRL {submittedOpportunity.minTrl}
            </span>
            <span className="rounded-full bg-brand-earth/10 px-3 py-1 font-mono text-xs font-semibold text-brand-earth">
              Alvo CRL {submittedOpportunity.desiredCrl}
            </span>
            <span className="rounded-full bg-amber-50 px-3 py-1 font-mono text-xs font-semibold text-amber-800">
              Patente: {submittedOpportunity.patentRequirement}
            </span>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate("/dashboard/matching")}
              className="bg-brand-green-dark text-brand-off-white"
            >
              <Icon icon={Sparkles} size={16} />
              Ver Resultados do Rematch
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/dashboard/demandas")}
            >
              Ver Minhas Demandas
            </Button>
          </div>
        </div>
      ) : (
        /* Submission Form */
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-10">
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
                  Identifique o problema ou a oportunidade que sua organização deseja solucionar com a academia.
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

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                    Setor Industrial / Ramo de Atuação
                  </label>
                  <select
                    value={industrySector}
                    onChange={(e) => setIndustrySector(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-primary px-4 py-3 font-body text-sm text-text-primary transition-all focus:border-brand-green-moss focus:bg-surface-white focus:outline-none focus:ring-2 focus:ring-brand-green-moss/20"
                  >
                    <option value="Saúde & Indústria Farmacêutica">Saúde &amp; Indústria Farmacêutica</option>
                    <option value="Agronegócio & Alimentos">Agronegócio &amp; Alimentos</option>
                    <option value="Energia, Óleo & Renováveis">Energia, Óleo &amp; Renováveis</option>
                    <option value="Manufatura Avançada & Química">Manufatura Avançada &amp; Química</option>
                    <option value="Tecnologia da Informação & Telecom">Tecnologia da Informação &amp; Telecom</option>
                    <option value="Mineração & Metais">Mineração &amp; Metais</option>
                    <option value="Outro Setor">Outro Setor</option>
                  </select>
                </div>

                <div>
                  <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                    Tecnologia Almejada / Solução Específica
                  </label>
                  <input
                    type="text"
                    value={desiredTechnology}
                    onChange={(e) => setDesiredTechnology(e.target.value)}
                    placeholder="Ex: Nanocarreadores poliméricos, Células Perovskita, etc."
                    className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-primary px-4 py-3 font-body text-sm text-text-primary transition-all focus:border-brand-green-moss focus:bg-surface-white focus:outline-none focus:ring-2 focus:ring-brand-green-moss/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                  Descrição do Desafio e Requisitos Técnicos *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhe o gargalo tecnológico atual da sua empresa, quais metas técnicas precisam ser alcançadas e os critérios de validação..."
                  className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-primary px-4 py-3 font-body text-sm text-text-primary transition-all focus:border-brand-green-moss focus:bg-surface-white focus:outline-none focus:ring-2 focus:ring-brand-green-moss/20"
                />
              </div>

              <div>
                <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                  Palavras-chave (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="Ex: nanotecnologia, farmacotécnica, liberação controlada"
                  className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-primary px-4 py-3 font-body text-sm text-text-primary transition-all focus:border-brand-green-moss focus:bg-surface-white focus:outline-none focus:ring-2 focus:ring-brand-green-moss/20"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Readiness Requirements & Patent Filters */}
          <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs">
            <div className="flex items-center gap-3 pb-6 border-b border-border-subtle">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Icon icon={Layers} size={20} />
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg text-text-primary">
                  2. Parâmetros de Maturidade e Propriedade Intelectual
                </h2>
                <p className="font-body text-xs text-text-secondary">
                  Limiares exigidos pela sua corporação para filtrar propostas no algoritmo The Bridge.
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-8">
              {/* Min TRL */}
              <div>
                <div className="flex items-baseline justify-between">
                  <label className="font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                    Maturidade Tecnológica Mínima Exigida (TRL Mínimo)
                  </label>
                  <span className="font-mono text-base font-bold text-brand-green-dark bg-brand-green-moss/15 px-3 py-1 rounded-full">
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
                  O algoritmo pontuará 100% no critério de TRL para projetos com maturidade igual ou superior a TRL {minTrl}.
                </p>
              </div>

              {/* Desired CRL */}
              <div>
                <div className="flex items-baseline justify-between">
                  <label className="font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                    Maturidade Comercial Almejada (CRL Desejado)
                  </label>
                  <span className="font-mono text-base font-bold text-brand-earth bg-brand-earth/15 px-3 py-1 rounded-full">
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
                      desc: "Aceita projetos em segredo científico ou domínio aberto.",
                    },
                    {
                      value: "PENDING_ACCEPTED",
                      label: "Aceita em Depósito",
                      desc: "Aceita pedidos depositados no INPI ou patentes já concedidas.",
                    },
                    {
                      value: "REQUIRED",
                      label: "Obrigatória",
                      desc: "Elimina automaticamente projetos sem patente no matching.",
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
          </div>

          {/* Section 3: Budget and Timeline */}
          <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs">
            <div className="flex items-center gap-3 pb-6 border-b border-border-subtle">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Icon icon={DollarSign} size={20} />
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg text-text-primary">
                  3. Recursos Disponíveis e Prazo
                </h2>
                <p className="font-body text-xs text-text-secondary">
                  Informações de fomento para a estruturação do contrato ou projeto de P&amp;D.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              <div>
                <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                  Orçamento Mínimo Previsto (R$)
                </label>
                <input
                  type="number"
                  min={0}
                  step={50000}
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-primary px-4 py-3 font-body text-sm text-text-primary transition-all focus:border-brand-green-moss focus:bg-surface-white focus:outline-none focus:ring-2 focus:ring-brand-green-moss/20"
                />
              </div>

              <div>
                <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                  Orçamento Máximo Previsto (R$)
                </label>
                <input
                  type="number"
                  min={0}
                  step={50000}
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-primary px-4 py-3 font-body text-sm text-text-primary transition-all focus:border-brand-green-moss focus:bg-surface-white focus:outline-none focus:ring-2 focus:ring-brand-green-moss/20"
                />
              </div>

              <div>
                <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                  Prazo Esperado de Execução
                </label>
                <input
                  type="text"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  placeholder="Ex: 12 meses, 24 meses..."
                  className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-primary px-4 py-3 font-body text-sm text-text-primary transition-all focus:border-brand-green-moss focus:bg-surface-white focus:outline-none focus:ring-2 focus:ring-brand-green-moss/20"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Required Competences (Weight: 60%) */}
          <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs">
            <div className="flex items-center gap-3 pb-6 border-b border-border-subtle">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Icon icon={Scale} size={20} />
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg text-text-primary">
                  4. Competências Científicas Requeridas (Peso: 60%)
                </h2>
                <p className="font-body text-xs text-text-secondary">
                  Atribua um peso de 1 a 5 para cada competência exigida no desafio.
                </p>
              </div>
            </div>

            {/* Added Competences List */}
            <div className="mt-6 space-y-3">
              <h3 className="font-heading text-xs font-semibold uppercase text-text-secondary tracking-wide">
                Competências demandadas pela empresa:
              </h3>

              {selectedCompetences.length === 0 ? (
                <p className="text-xs text-text-secondary italic">
                  Nenhuma competência adicionada. Utilize o seletor abaixo.
                </p>
              ) : (
                <div className="divide-y divide-border-subtle rounded-2xl border border-border-subtle bg-surface-primary p-2">
                  {selectedCompetences.map((comp) => (
                    <div
                      key={comp.competenceId}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 gap-3"
                    >
                      <div>
                        <p className="font-heading text-xs font-bold text-text-primary">
                          {comp.name}
                        </p>
                        <span className="font-body text-[11px] text-text-secondary">
                          Peso de relevância no algoritmo: Peso {comp.weight} de 5
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <select
                          value={comp.weight}
                          onChange={(e) => handleUpdateWeight(comp.competenceId, Number(e.target.value))}
                          className="rounded-lg border border-border-subtle bg-surface-white px-2.5 py-1 text-xs font-medium text-text-primary focus:outline-none"
                        >
                          <option value={1}>Peso 1 (Desejável)</option>
                          <option value={2}>Peso 2 (Relevante)</option>
                          <option value={3}>Peso 3 (Importante)</option>
                          <option value={4}>Peso 4 (Muito Importante)</option>
                          <option value={5}>Peso 5 (Crítico / Essencial)</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleRemoveCompetence(comp.competenceId)}
                          className="text-text-secondary hover:text-red-600 transition-colors p-1"
                        >
                          <Icon icon={Trash2} size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Competence Block */}
            <div className="mt-6 rounded-2xl border border-border-subtle bg-surface-secondary/40 p-4">
              <h4 className="font-heading text-xs font-bold text-text-primary mb-3">
                Adicionar competência da taxonomia:
              </h4>

              <div className="grid gap-3 sm:grid-cols-12 items-center">
                <div className="sm:col-span-8">
                  <select
                    value={tempCompId}
                    onChange={(e) => setTempCompId(e.target.value)}
                    className="w-full rounded-xl border border-border-subtle bg-surface-white px-3.5 py-2.5 font-body text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green-moss/20"
                  >
                    {allCompetences.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <select
                    value={tempCompWeight}
                    onChange={(e) => setTempCompWeight(Number(e.target.value))}
                    className="w-full rounded-xl border border-border-subtle bg-surface-white px-3.5 py-2.5 font-body text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green-moss/20"
                  >
                    <option value={1}>Peso 1</option>
                    <option value={2}>Peso 2</option>
                    <option value={3}>Peso 3</option>
                    <option value={4}>Peso 4</option>
                    <option value={5}>Peso 5 (Máximo)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-full justify-center"
                    onClick={handleAddCompetence}
                  >
                    <Icon icon={Plus} size={14} />
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
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
              {loading
                ? "Salvando alterações..."
                : isEditing
                ? "Salvar Demanda & Executar Rematch"
                : "Publicar Demanda Tecnológica"}
              <Icon icon={ArrowRight} size={16} />
            </Button>
          </div>
        </form>
      )}
    </DashboardLayout>
  );
}
