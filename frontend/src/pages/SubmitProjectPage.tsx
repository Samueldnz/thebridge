import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  FolderGit2,
  Info,
  Lightbulb,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";

import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { authService } from "../services/auth";
import { projectsService, type PatentStatus } from "../services/projects";
import { competencesService, type CompetenceItem } from "../services/competences";
import { matchingService } from "../services/matching";

const trlExplanations: Record<number, string> = {
  1: "TRL 1 — Princípios básicos observados e relatados na literatura científica.",
  2: "TRL 2 — Conceito tecnológico ou aplicação formulada teoricamente.",
  3: "TRL 3 — Prova de conceito analítica e experimental executada em bancada.",
  4: "TRL 4 — Validação de componentes em ambiente de laboratório.",
  5: "TRL 5 — Validação de componentes integrados em ambiente simulado.",
  6: "TRL 6 — Modelo de engenharia ou protótipo funcional em ambiente relevante.",
  7: "TRL 7 — Demonstração do protótipo do sistema em ambiente operacional real.",
  8: "TRL 8 — Sistema real completado e qualificado através de testes normativos.",
  9: "TRL 9 — Sistema real comprovado em operação comercial e escala industrial.",
};

const crlExplanations: Record<number, string> = {
  1: "CRL 1 — Hipótese de mercado e necessidade não validada comercialmente.",
  2: "CRL 2 — Proposta de valor identificada e dores do setor mapeadas.",
  3: "CRL 3 — Análise de concorrência e identificação de clientes-alvo primários.",
  4: "CRL 4 — Diálogo preliminar e interesse manifestado por parceiros industriais.",
  5: "CRL 5 — Modelo preliminar de precificação, custos e viabilidade econômica.",
  6: "CRL 6 — Parceria de co-desenvolvimento formalizada ou teste piloto contratado.",
  7: "CRL 7 — Primeiros acordos de licenciamento ou vendas iniciais formalizadas.",
  8: "CRL 8 — Cadeia de suprimentos estruturada e conformidade regulatória plena.",
  9: "CRL 9 — Negócio comercialmente viável com tração e receita recorrente.",
};

export function SubmitProjectPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const [user] = useState(authService.getStoredUser());

  // Form State
  const [title, setTitle] = useState("");
  const [researchField, setResearchField] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [trl, setTrl] = useState(4);
  const [crl, setCrl] = useState(3);
  const [patentStatus, setPatentStatus] = useState<PatentStatus>("PENDING");

  // Competences State
  const [allCompetences, setAllCompetences] = useState<CompetenceItem[]>([]);
  const [selectedCompetences, setSelectedCompetences] = useState<
    Array<{ competenceId: string; level: number; name: string }>
  >([]);
  const [tempCompId, setTempCompId] = useState("");
  const [tempCompLevel, setTempCompLevel] = useState(4);

  // UI state
  const [loading, setLoading] = useState(false);
  const [submittedProject, setSubmittedProject] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);

  useEffect(() => {
    // Check quota if creating
    if (!isEditing) {
      projectsService.getMyProjects(user?.id).then((myProjects) => {
        if (myProjects.length >= 5) {
          setIsQuotaExceeded(true);
        }
      });
    }

    // Load competences catalog and existing project data if editing
    competencesService.getCompetences().then((list) => {
      setAllCompetences(list);
      if (list.length > 0 && !isEditing) {
        setTempCompId(list[0].id);
        setSelectedCompetences([
          { competenceId: list[0].id, level: 5, name: list[0].name },
          { competenceId: list[1].id, level: 4, name: list[1].name },
        ]);
      }
    });

    if (isEditing && id) {
      projectsService.getProject(id).then((p) => {
        if (p) {
          setTitle(p.title);
          setResearchField(p.researchField || "");
          setDescription(p.description);
          setKeywords(p.keywords || "");
          setTrl(p.trl);
          setCrl(p.crl);
          setPatentStatus(p.patentStatus);
          setSelectedCompetences(
            p.competences.map((c) => ({
              competenceId: c.competenceId,
              level: c.level,
              name: c.name || c.competenceId,
            }))
          );
        } else {
          setError("Projeto não encontrado para edição.");
        }
      });
    }
  }, [id, isEditing, user]);

  const handleAddCompetence = () => {
    if (!tempCompId) return;
    const compObj = allCompetences.find((c) => c.id === tempCompId);
    if (!compObj) return;

    if (selectedCompetences.some((c) => c.competenceId === tempCompId)) {
      setError("Esta competência já foi adicionada ao projeto.");
      return;
    }
    setError(null);
    setSelectedCompetences([
      ...selectedCompetences,
      { competenceId: compObj.id, level: tempCompLevel, name: compObj.name },
    ]);
  };

  const handleRemoveCompetence = (compId: string) => {
    setSelectedCompetences(selectedCompetences.filter((c) => c.competenceId !== compId));
  };

  const handleUpdateLevel = (compId: string, newLevel: number) => {
    setSelectedCompetences(
      selectedCompetences.map((c) => (c.competenceId === compId ? { ...c, level: newLevel } : c))
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Por favor, preencha o título do projeto.");
      return;
    }

    if (!description.trim() || description.length < 30) {
      setError("A descrição do projeto deve conter pelo menos 30 caracteres.");
      return;
    }

    if (selectedCompetences.length === 0) {
      setError("Adicione pelo menos uma competência científica ao projeto para o matching.");
      return;
    }

    try {
      setLoading(true);

      if (isEditing && id) {
        // Edit existing project
        const updated = await projectsService.updateProject(id, {
          title: title.trim(),
          researchField: researchField.trim(),
          description: description.trim(),
          keywords: keywords.trim(),
          trl,
          crl,
          patentStatus,
          competences: selectedCompetences.map((c) => ({
            competenceId: c.competenceId,
            level: c.level,
          })),
        });

        // Trigger rematch
        await matchingService.runRematch();
        setSubmittedProject(updated);
      } else {
        // Create new project (quota checked)
        const res = await projectsService.createProject({
          title: title.trim(),
          researchField: researchField.trim() || "Inovação & Biotecnologia",
          description: description.trim(),
          keywords: keywords.trim(),
          trl,
          crl,
          patentStatus,
          status: "PUBLISHED",
          competences: selectedCompetences.map((c) => ({
            competenceId: c.competenceId,
            level: c.level,
          })),
        });

        // Trigger rematch
        await matchingService.runRematch();
        setSubmittedProject(res);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro ao processar projeto.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title={isEditing ? "Editar Projeto Científico" : "Submeter Novo Projeto Científico"}
      subtitle={isEditing ? "Atualização de Parâmetros & Rematch Algorítmico" : "Perfil Pesquisador / ICT (Limite de até 5 projetos)"}
      actions={
        <Link
          to="/dashboard/projetos"
          className="inline-flex items-center gap-1.5 font-heading text-xs font-semibold text-text-secondary hover:text-brand-green-moss"
        >
          <Icon icon={ArrowLeft} size={14} />
          Voltar para Meus Projetos
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
            Limite de 5 Projetos Atingido
          </h2>

          <p className="mt-3 font-body text-sm text-amber-900 max-w-md mx-auto leading-relaxed">
            Seu perfil de pesquisador já possui <strong>5 projetos cadastrados</strong> (cota máxima permitida). Para submeter novas características, evolução de TRL ou patentes, <strong>edite um dos seus projetos existentes</strong> para recalcular o rematch com as demandas industriais.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate("/dashboard/projetos")}
              className="bg-brand-green-dark text-brand-off-white"
            >
              <Icon icon={FolderGit2} size={16} />
              Gerenciar e Editar Meus Projetos
            </Button>
          </div>
        </div>
      ) : submittedProject ? (
        /* Success Screen */
        <div className="mx-auto max-w-2xl rounded-3xl border border-border-subtle bg-surface-white p-8 md:p-12 text-center shadow-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-6">
            <Icon icon={CheckCircle2} size={36} />
          </div>

          <h2 className="font-display text-2xl md:text-3xl font-bold text-text-primary">
            {isEditing ? "Projeto Atualizado com Sucesso!" : "Projeto Submetido com Sucesso!"}
          </h2>

          <p className="mt-3 font-body text-sm md:text-base text-text-secondary max-w-lg mx-auto">
            O projeto <strong>"{submittedProject.title}"</strong> foi salvo e o <strong>Rematch</strong> com as demandas industriais já foi recalculado pelo algoritmo The Bridge.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="rounded-full bg-brand-green-moss/10 px-3 py-1 font-mono text-xs font-semibold text-brand-green-dark">
              TRL {submittedProject.trl}
            </span>
            <span className="rounded-full bg-brand-earth/10 px-3 py-1 font-mono text-xs font-semibold text-brand-earth">
              CRL {submittedProject.crl}
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1 font-mono text-xs font-semibold text-blue-800">
              Patente: {submittedProject.patentStatus}
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
              onClick={() => navigate("/dashboard/projetos")}
            >
              Ver Meus Projetos
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

          {/* Section 1: Basic Information */}
          <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs">
            <div className="flex items-center gap-3 pb-6 border-b border-border-subtle">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green-moss/10 text-brand-green-moss">
                <Icon icon={Lightbulb} size={20} />
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg text-text-primary">
                  1. Informações Científicas do Projeto
                </h2>
                <p className="font-body text-xs text-text-secondary">
                  Descreva o escopo da pesquisa e a área de aplicação.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                  Título do Projeto ou Invenção *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Nanopartículas Poliméricas para Entrega Guiada de Quimioterápicos"
                  className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-primary px-4 py-3 font-body text-sm text-text-primary transition-all focus:border-brand-green-moss focus:bg-surface-white focus:outline-none focus:ring-2 focus:ring-brand-green-moss/20"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                    Área Científica / Campo de Pesquisa
                  </label>
                  <input
                    type="text"
                    value={researchField}
                    onChange={(e) => setResearchField(e.target.value)}
                    placeholder="Ex: Nanobiotecnologia, Farmacologia, Inteligência Artificial..."
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
                    placeholder="Ex: nanotecnologia, liberação controlada, oncologia"
                    className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-primary px-4 py-3 font-body text-sm text-text-primary transition-all focus:border-brand-green-moss focus:bg-surface-white focus:outline-none focus:ring-2 focus:ring-brand-green-moss/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                  Resumo Técnico e Objetivos *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explique o diferencial técnico da tecnologia, a solução que ela oferece a problemas reais, testes já realizados e resultados alcançados..."
                  className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-primary px-4 py-3 font-body text-sm text-text-primary transition-all focus:border-brand-green-moss focus:bg-surface-white focus:outline-none focus:ring-2 focus:ring-brand-green-moss/20"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Technology & Commercial Readiness (TRL & CRL) */}
          <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs">
            <div className="flex items-center gap-3 pb-6 border-b border-border-subtle">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green-moss/10 text-brand-green-moss">
                <Icon icon={BrainCircuit} size={20} />
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg text-text-primary">
                  2. Maturidade Tecnológica &amp; Comercial (TRL &amp; CRL)
                </h2>
                <p className="font-body text-xs text-text-secondary">
                  Critérios objetivos para a calibragem algorítmica de matching (ponderação de 20% cada).
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-8">
              {/* TRL Slider */}
              <div>
                <div className="flex items-baseline justify-between">
                  <label className="font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                    Nível de Prontidão Tecnológica (TRL)
                  </label>
                  <span className="font-mono text-base font-bold text-brand-green-dark bg-brand-green-moss/15 px-3 py-1 rounded-full">
                    TRL {trl} de 9
                  </span>
                </div>

                <input
                  type="range"
                  min={1}
                  max={9}
                  step={1}
                  value={trl}
                  onChange={(e) => setTrl(Number(e.target.value))}
                  className="mt-4 w-full accent-brand-green-dark cursor-pointer h-2 bg-border-subtle rounded-lg"
                />

                <div className="mt-3 rounded-xl bg-surface-secondary/50 p-3.5 border border-border-subtle font-body text-xs text-text-secondary flex items-start gap-2">
                  <Icon icon={Info} size={15} className="text-brand-green-moss mt-0.5 shrink-0" />
                  <span>{trlExplanations[trl]}</span>
                </div>
              </div>

              {/* CRL Slider */}
              <div>
                <div className="flex items-baseline justify-between">
                  <label className="font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                    Nível de Prontidão Comercial (CRL)
                  </label>
                  <span className="font-mono text-base font-bold text-brand-earth bg-brand-earth/15 px-3 py-1 rounded-full">
                    CRL {crl} de 9
                  </span>
                </div>

                <input
                  type="range"
                  min={1}
                  max={9}
                  step={1}
                  value={crl}
                  onChange={(e) => setCrl(Number(e.target.value))}
                  className="mt-4 w-full accent-brand-earth cursor-pointer h-2 bg-border-subtle rounded-lg"
                />

                <div className="mt-3 rounded-xl bg-surface-secondary/50 p-3.5 border border-border-subtle font-body text-xs text-text-secondary flex items-start gap-2">
                  <Icon icon={Info} size={15} className="text-brand-earth mt-0.5 shrink-0" />
                  <span>{crlExplanations[crl]}</span>
                </div>
              </div>

              {/* Patent Status */}
              <div>
                <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide mb-3">
                  Status de Propriedade Intelectual (Patente)
                </label>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { value: "NONE", label: "Sem Patente", desc: "Segredo científico ou domínio aberto" },
                    { value: "PENDING", label: "Patente em Depósito", desc: "Pedido protocolado no INPI / PCT" },
                    { value: "GRANTED", label: "Patente Concedida", desc: "Carta patente emitida e vigente" },
                  ].map((item) => (
                    <label
                      key={item.value}
                      onClick={() => setPatentStatus(item.value as PatentStatus)}
                      className={[
                        "flex flex-col p-4 rounded-2xl border cursor-pointer transition-all",
                        patentStatus === item.value
                          ? "border-brand-green-moss bg-brand-green-moss/5 ring-2 ring-brand-green-moss/20"
                          : "border-border-subtle bg-surface-primary hover:border-text-secondary",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-heading text-xs font-bold text-text-primary">
                          {item.label}
                        </span>
                        <input
                          type="radio"
                          name="patentStatus"
                          value={item.value}
                          checked={patentStatus === item.value}
                          onChange={() => {}}
                          className="accent-brand-green-moss"
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

          {/* Section 3: Scientific Competences & Taxonomy (Weight: 60%) */}
          <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs">
            <div className="flex items-center gap-3 pb-6 border-b border-border-subtle">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green-moss/10 text-brand-green-moss">
                <Icon icon={ShieldCheck} size={20} />
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg text-text-primary">
                  3. Competências Científicas Associadas (Peso: 60%)
                </h2>
                <p className="font-body text-xs text-text-secondary">
                  Selecione as competências do seu grupo e atribua o nível de proficiência técnica (1 a 5).
                </p>
              </div>
            </div>

            {/* Added Competences List */}
            <div className="mt-6 space-y-3">
              <h3 className="font-heading text-xs font-semibold uppercase text-text-secondary tracking-wide">
                Competências vinculadas ao projeto:
              </h3>

              {selectedCompetences.length === 0 ? (
                <p className="text-xs text-text-secondary italic">
                  Nenhuma competência selecionada ainda. Utilize o seletor abaixo.
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
                          Proficiência declarada: Nível {comp.level} de 5
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Rating 1-5 */}
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => handleUpdateLevel(comp.competenceId, lvl)}
                              className={[
                                "p-1 transition-colors rounded",
                                lvl <= comp.level ? "text-amber-500" : "text-border-subtle",
                              ].join(" ")}
                            >
                              <Icon icon={Star} size={18} fill={lvl <= comp.level ? "currentColor" : "none"} />
                            </button>
                          ))}
                        </div>

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
                    value={tempCompLevel}
                    onChange={(e) => setTempCompLevel(Number(e.target.value))}
                    className="w-full rounded-xl border border-border-subtle bg-surface-white px-3.5 py-2.5 font-body text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green-moss/20"
                  >
                    <option value={1}>Nível 1 (Básico)</option>
                    <option value={2}>Nível 2 (Intermediário)</option>
                    <option value={3}>Nível 3 (Sólido)</option>
                    <option value={4}>Nível 4 (Avançado)</option>
                    <option value={5}>Nível 5 (Referência)</option>
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
              onClick={() => navigate("/dashboard/projetos")}
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
                ? "Salvar Projeto & Executar Rematch"
                : "Publicar Projeto para Matching"}
              <Icon icon={ArrowRight} size={16} />
            </Button>
          </div>
        </form>
      )}
    </DashboardLayout>
  );
}
