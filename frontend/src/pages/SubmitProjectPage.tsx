import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { authService } from "../services/auth";
import {
  projectsService,
  type PatentStatus,
  type ProjectDocumentItem,
} from "../services/projects";
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

type ProjectTabId =
  | "geral"
  | "maturidade"
  | "competencias"
  | "dossie"
  | "documentos"
  | "propriedade_intelectual";

interface MenuGroup {
  groupLabel: string;
  items: { id: ProjectTabId; label: string }[];
}

const menuGroups: MenuGroup[] = [
  {
    groupLabel: "Estrutura do Projeto",
    items: [
      { id: "geral", label: "Informações Gerais" },
      { id: "maturidade", label: "Maturidade e Patente" },
      { id: "competencias", label: "Competências Científicas" },
    ],
  },
  {
    groupLabel: "Dossiê Corporativo",
    items: [
      { id: "dossie", label: "Dossiê Técnico" },
      { id: "documentos", label: "Artigos e Documentos" },
      { id: "propriedade_intelectual", label: "Propriedade Intelectual" },
    ],
  },
];

export function SubmitProjectPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const [user] = useState(authService.getStoredUser());
  const [activeTab, setActiveTab] = useState<ProjectTabId>("geral");

  // Form State
  const [title, setTitle] = useState("");
  const [researchField, setResearchField] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [trl, setTrl] = useState(4);
  const [crl, setCrl] = useState(3);
  const [patentStatus, setPatentStatus] = useState<PatentStatus>("PENDING");

  // Dossier State (Qualitativo / Não entra no cálculo do score)
  const [industryProblem, setIndustryProblem] = useState("");
  const [competitiveAdvantage, setCompetitiveAdvantage] = useState("");
  const [partnershipGoals, setPartnershipGoals] = useState<string[]>([]);
  const [operatingConditions, setOperatingConditions] = useState("");
  const [scalabilityGaps, setScalabilityGaps] = useState("");
  const [estimatedBudget, setEstimatedBudget] = useState("");
  const [estimatedTimelineMonths, setEstimatedTimelineMonths] = useState("");
  const [ownershipType, setOwnershipType] = useState<
    "UNIVERSIDADE" | "NIT" | "INDEPENDENTE" | "LABORATORIO_PRIVADO" | "EMPRESA_SPINOFF"
  >("UNIVERSIDADE");
  const [patentClaimsSummary, setPatentClaimsSummary] = useState("");
  const [priorFunding, setPriorFunding] = useState("");
  const [hasExclusiveCommitment, setHasExclusiveCommitment] = useState(false);

  // Dynamic Documents List
  const [documents, setDocuments] = useState<ProjectDocumentItem[]>([]);
  const [tempDocTitle, setTempDocTitle] = useState("");
  const [tempDocLink, setTempDocLink] = useState("");
  const [tempDocType, setTempDocType] = useState("Artigo Científico Publicado");

  // Competences State
  const [allCompetences, setAllCompetences] = useState<CompetenceItem[]>([]);
  const [selectedCompetences, setSelectedCompetences] = useState<
    Array<{ competenceId: string; level: number; name: string }>
  >([]);
  const [tempCompId, setTempCompId] = useState("");
  const [tempCompLevel, setTempCompLevel] = useState(4);

  // UI State
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

          if (p.dossier) {
            setIndustryProblem(p.dossier.industryProblem || "");
            setCompetitiveAdvantage(p.dossier.competitiveAdvantage || "");
            setPartnershipGoals(p.dossier.partnershipGoals || []);
            setOperatingConditions(p.dossier.operatingConditions || "");
            setScalabilityGaps(p.dossier.scalabilityGaps || "");
            setEstimatedBudget(p.dossier.estimatedBudget || "");
            setEstimatedTimelineMonths(p.dossier.estimatedTimelineMonths || "");
            setOwnershipType(p.dossier.ownershipType || "UNIVERSIDADE");
            setPatentClaimsSummary(p.dossier.patentClaimsSummary || "");
            setPriorFunding(p.dossier.priorFunding || "");
            setHasExclusiveCommitment(Boolean(p.dossier.hasExclusiveCommitment));

            if (p.dossier.documents && Array.isArray(p.dossier.documents) && p.dossier.documents.length > 0) {
              setDocuments(p.dossier.documents);
            } else if (p.dossier.evidenceLinks) {
              const legacyItems = p.dossier.evidenceLinks
                .split(";")
                .map((s) => s.trim())
                .filter(Boolean);
              if (legacyItems.length > 0) {
                setDocuments(
                  legacyItems.map((text, idx) => ({
                    id: `doc-legacy-${idx}-${Date.now()}`,
                    title: text,
                    type: "Artigo Científico Publicado",
                  }))
                );
              }
            }
          }
        } else {
          setError("Projeto não encontrado para edição.");
        }
      });
    }
  }, [id, isEditing, user]);

  const togglePartnershipGoal = (goal: string) => {
    setPartnershipGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

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

  const handleAddDocument = () => {
    if (!tempDocTitle.trim()) {
      setError("Por favor, preencha o título do artigo ou documento.");
      return;
    }
    setError(null);
    const newDoc: ProjectDocumentItem = {
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: tempDocTitle.trim(),
      linkOrDoi: tempDocLink.trim() || undefined,
      type: tempDocType || "Artigo Científico Publicado",
    };
    setDocuments((prev) => [...prev, newDoc]);
    setTempDocTitle("");
    setTempDocLink("");
    setTempDocType("Artigo Científico Publicado");
  };

  const handleRemoveDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Por favor, preencha o título do projeto.");
      setActiveTab("geral");
      return;
    }

    if (!description.trim() || description.length < 30) {
      setError("A descrição do projeto deve conter pelo menos 30 caracteres.");
      setActiveTab("geral");
      return;
    }

    if (selectedCompetences.length === 0) {
      setError("Adicione pelo menos uma competência científica ao projeto.");
      setActiveTab("competencias");
      return;
    }

    try {
      setLoading(true);

      const serializedEvidence =
        documents.length > 0
          ? documents.map((d) => (d.linkOrDoi ? `${d.title} (${d.linkOrDoi})` : d.title)).join("; ")
          : undefined;

      const dossierData = {
        industryProblem: industryProblem.trim() || undefined,
        competitiveAdvantage: competitiveAdvantage.trim() || undefined,
        partnershipGoals: partnershipGoals.length > 0 ? partnershipGoals : undefined,
        operatingConditions: operatingConditions.trim() || undefined,
        scalabilityGaps: scalabilityGaps.trim() || undefined,
        estimatedBudget: estimatedBudget.trim() || undefined,
        estimatedTimelineMonths: estimatedTimelineMonths.trim() || undefined,
        documents: documents.length > 0 ? documents : undefined,
        evidenceLinks: serializedEvidence,
        ownershipType,
        patentClaimsSummary: patentClaimsSummary.trim() || undefined,
        priorFunding: priorFunding.trim() || undefined,
        hasExclusiveCommitment,
      };

      if (isEditing && id) {
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
            name: c.name,
          })),
          dossier: dossierData,
        });

        await matchingService.runRematch();
        setSubmittedProject(updated);
      } else {
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
            name: c.name,
          })),
          dossier: dossierData,
        });

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

  const renderFormButtons = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border-subtle">
      <p className="text-xs text-text-secondary text-center sm:text-left">
        As alterações do projeto são salvas imediatamente e atualizadas no motor de matching.
      </p>
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
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
            ? "Salvando..."
            : isEditing
            ? "Salvar Alterações do Projeto"
            : "Salvar e Publicar Projeto"}
        </Button>
      </div>
    </div>
  );

  return (
    <DashboardLayout
      title={isEditing ? "Editar Projeto Científico" : "Submeter Novo Projeto Científico"}
      subtitle={isEditing ? "Gerencie os parâmetros do projeto e do dossiê corporativo" : "Perfil Pesquisador / ICT"}
      actions={
        <Link
          to="/dashboard/projetos"
          className="inline-flex items-center font-heading text-xs font-semibold text-text-secondary hover:text-brand-green-moss"
        >
          Voltar para Meus Projetos
        </Link>
      }
    >
      {isQuotaExceeded && !isEditing ? (
        <div className="mx-auto max-w-2xl rounded-3xl border border-amber-300 bg-amber-50/70 p-8 md:p-12 text-center shadow-md">
          <h2 className="font-display text-2xl font-bold text-amber-950">
            Limite de 5 Projetos Atingido
          </h2>
          <p className="mt-3 font-body text-sm text-amber-900 max-w-md mx-auto leading-relaxed">
            Seu perfil já possui 5 projetos cadastrados. Para cadastrar novas características ou patentes,
            edite um dos seus projetos existentes na plataforma.
          </p>
          <div className="mt-8 flex justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/dashboard/projetos")}
              className="bg-brand-green-dark text-brand-off-white"
            >
              Gerenciar e Editar Meus Projetos
            </Button>
          </div>
        </div>
      ) : submittedProject ? (
        <div className="mx-auto max-w-2xl rounded-3xl border border-border-subtle bg-surface-white p-8 md:p-12 text-center shadow-md space-y-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-text-primary">
            {isEditing ? "Projeto Atualizado e Salvo com Sucesso" : "Projeto Salvo e Publicado com Sucesso"}
          </h2>
          <p className="font-body text-sm text-text-secondary max-w-lg mx-auto">
            O projeto "{submittedProject.title}" foi salvo com sucesso em seu painel e o matching foi recalculado.
          </p>
          <div className="flex flex-col gap-2 pt-2 items-center">
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
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={() => navigate("/dashboard/projetos")}
              className="bg-brand-green-dark text-brand-off-white"
            >
              Ver Meus Projetos Salvos
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/dashboard/matching")}
            >
              Ver Resultados do Matching
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-6 rounded-2xl border border-red-300 bg-red-50 p-4 text-xs font-medium text-red-800">
              {error}
            </div>
          )}

          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Left Navigation Sidebar */}
            <aside className="w-full lg:w-[240px] shrink-0 lg:sticky lg:top-24">
              <nav
                aria-label="Menu de navegação do projeto"
                className="rounded-2xl border border-border-subtle bg-surface-white p-3 shadow-xs space-y-4"
              >
                {menuGroups.map((group, gIdx) => (
                  <div
                    key={group.groupLabel}
                    className={gIdx > 0 ? "pt-3 border-t border-border-subtle" : ""}
                  >
                    <p className="px-3 pb-1.5 font-heading text-[13px] font-semibold text-text-secondary">
                      {group.groupLabel}
                    </p>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setError(null);
                              setActiveTab(item.id);
                            }}
                            className={[
                              "relative w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left font-heading text-xs transition-all cursor-pointer",
                              isActive
                                ? "bg-brand-green-moss/12 font-bold text-brand-green-dark"
                                : "font-medium text-text-secondary hover:bg-surface-primary hover:text-text-primary",
                            ].join(" ")}
                          >
                            {isActive && (
                              <span
                                aria-hidden="true"
                                className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-brand-green-moss"
                              />
                            )}
                            <span className="truncate">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </aside>

            {/* Right Content Area */}
            <div className="flex-1 min-w-0 w-full">
              {/* TAB: INFORMAÇÕES GERAIS */}
              {activeTab === "geral" && (
                <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs space-y-6">
                  <div className="pb-4 border-b border-border-subtle">
                    <h2 className="font-heading font-bold text-lg text-text-primary">
                      Informações Gerais
                    </h2>
                    <p className="font-body text-xs text-text-secondary mt-0.5">
                      Identificação principal da tecnologia e escopo científico da pesquisa.
                    </p>
                  </div>

                  <div className="flex flex-col gap-6">
                    <div>
                      <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                        Título do Projeto ou Invenção *
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-primary px-4 py-3 font-body text-sm text-text-primary focus:border-brand-green-moss focus:bg-surface-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                        Área Científica ou Campo de Pesquisa
                      </label>
                      <input
                        type="text"
                        value={researchField}
                        onChange={(e) => setResearchField(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-primary px-4 py-3 font-body text-sm text-text-primary focus:border-brand-green-moss focus:bg-surface-white focus:outline-none"
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
                        className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-primary px-4 py-3 font-body text-sm text-text-primary focus:border-brand-green-moss focus:bg-surface-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                        Resumo Técnico e Objetivos *
                      </label>
                      <textarea
                        required
                        rows={6}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-primary px-4 py-3 font-body text-sm text-text-primary focus:border-brand-green-moss focus:bg-surface-white focus:outline-none"
                      />
                      <p className="mt-1 text-[11px] text-text-secondary">
                        Mínimo de 30 caracteres. Explique o diferencial técnico e metodologia.
                      </p>
                    </div>
                  </div>

                  {renderFormButtons()}
                </div>
              )}

              {/* TAB: MATURIDADE E PATENTE */}
              {activeTab === "maturidade" && (
                <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs space-y-6">
                  <div className="pb-4 border-b border-border-subtle">
                    <h2 className="font-heading font-bold text-lg text-text-primary">
                      Maturidade e Patente
                    </h2>
                    <p className="font-body text-xs text-text-secondary mt-0.5">
                      Classificação de prontidão tecnológica, maturidade comercial e proteção de propriedade intelectual.
                    </p>
                  </div>

                  <div className="flex flex-col gap-6">
                    <div>
                      <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide mb-2">
                        Nível de Prontidão Tecnológica (TRL)
                      </label>
                      <select
                        value={trl}
                        onChange={(e) => setTrl(Number(e.target.value))}
                        className="w-full rounded-xl border border-border-subtle bg-surface-white px-3.5 py-3 font-body text-xs text-text-primary focus:outline-none focus:border-brand-green-moss cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                          <option key={lvl} value={lvl}>
                            Nível {lvl}
                          </option>
                        ))}
                      </select>
                      <div className="mt-2 rounded-xl bg-surface-secondary/60 p-3 border border-border-subtle font-body text-xs text-text-secondary">
                        {trlExplanations[trl]}
                      </div>
                    </div>

                    <div>
                      <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide mb-2">
                        Nível de Prontidão Comercial (CRL)
                      </label>
                      <select
                        value={crl}
                        onChange={(e) => setCrl(Number(e.target.value))}
                        className="w-full rounded-xl border border-border-subtle bg-surface-white px-3.5 py-3 font-body text-xs text-text-primary focus:outline-none focus:border-brand-green-moss cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                          <option key={lvl} value={lvl}>
                            Nível {lvl}
                          </option>
                        ))}
                      </select>
                      <div className="mt-2 rounded-xl bg-surface-secondary/60 p-3 border border-border-subtle font-body text-xs text-text-secondary">
                        {crlExplanations[crl]}
                      </div>
                    </div>

                    <div>
                      <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide mb-2">
                        Status de Propriedade Intelectual (Patente)
                      </label>

                      <div className="flex flex-col gap-3">
                        {[
                          { value: "NONE", label: "Sem Patente", desc: "Segredo científico ou domínio aberto" },
                          { value: "PENDING", label: "Patente em Depósito", desc: "Pedido protocolado no INPI ou PCT" },
                          { value: "GRANTED", label: "Patente Concedida", desc: "Carta patente emitida e vigente" },
                        ].map((item) => (
                          <label
                            key={item.value}
                            onClick={() => setPatentStatus(item.value as PatentStatus)}
                            className={[
                              "flex flex-col p-4 rounded-2xl border cursor-pointer transition-all",
                              patentStatus === item.value
                                ? "border-brand-green-moss bg-brand-green-moss/5 ring-1 ring-brand-green-moss/30"
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
                            <span className="mt-1 font-body text-[13px] text-text-secondary">
                              {item.desc}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {renderFormButtons()}
                </div>
              )}

              {/* TAB: COMPETÊNCIAS CIENTÍFICAS */}
              {activeTab === "competencias" && (
                <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs space-y-6">
                  <div className="pb-4 border-b border-border-subtle">
                    <h2 className="font-heading font-bold text-lg text-text-primary">
                      Competências Científicas
                    </h2>
                    <p className="font-body text-xs text-text-secondary mt-0.5">
                      Vincule as competências do seu grupo de pesquisa e declare a proficiência técnica de 1 a 5.
                    </p>
                  </div>

                  <div className="flex flex-col gap-6">
                    <div>
                      <h3 className="font-heading text-xs font-semibold uppercase text-text-secondary tracking-wide mb-3">
                        Competências vinculadas ao projeto:
                      </h3>

                      {selectedCompetences.length === 0 ? (
                        <p className="text-xs text-text-secondary italic">
                          Nenhuma competência selecionada ainda. Utilize o formulário abaixo para adicionar.
                        </p>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {selectedCompetences.map((comp) => (
                            <div
                              key={comp.competenceId}
                              className="rounded-2xl border border-border-subtle bg-surface-primary p-4 flex flex-col gap-3"
                            >
                              <div>
                                <p className="font-heading text-xs font-bold text-text-primary">
                                  {comp.name}
                                </p>
                                <span className="font-body text-[13px] text-text-secondary">
                                  Proficiência técnica selecionada: Nível {comp.level} de 5
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border-subtle">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {[1, 2, 3, 4, 5].map((lvl) => (
                                    <button
                                      key={lvl}
                                      type="button"
                                      onClick={() => handleUpdateLevel(comp.competenceId, lvl)}
                                      className={[
                                        "px-2.5 py-1 text-xs font-heading font-semibold rounded-lg border transition-all cursor-pointer",
                                        lvl === comp.level
                                          ? "bg-brand-green-dark text-white border-brand-green-dark"
                                          : "bg-surface-white text-text-secondary border-border-subtle hover:bg-surface-secondary",
                                      ].join(" ")}
                                    >
                                      Nível {lvl}
                                    </button>
                                  ))}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveCompetence(comp.competenceId)}
                                  className="px-2.5 py-1 text-xs font-heading text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                                >
                                  Remover
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-border-subtle bg-surface-secondary/40 p-4 flex flex-col gap-4">
                      <h4 className="font-heading text-xs font-bold text-text-primary">
                        Adicionar competência da taxonomia:
                      </h4>

                      <div>
                        <label className="block font-heading text-[11px] font-semibold text-text-secondary uppercase mb-1">
                          Competência:
                        </label>
                        <select
                          value={tempCompId}
                          onChange={(e) => setTempCompId(e.target.value)}
                          className="w-full rounded-xl border border-border-subtle bg-surface-white px-3.5 py-2.5 font-body text-xs text-text-primary focus:outline-none"
                        >
                          {allCompetences.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.category})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-heading text-[11px] font-semibold text-text-secondary uppercase mb-1">
                          Nível de Proficiência:
                        </label>
                        <select
                          value={tempCompLevel}
                          onChange={(e) => setTempCompLevel(Number(e.target.value))}
                          className="w-full rounded-xl border border-border-subtle bg-surface-white px-3.5 py-2.5 font-body text-xs text-text-primary focus:outline-none"
                        >
                          <option value={1}>Nível 1 (Básico)</option>
                          <option value={2}>Nível 2 (Intermediário)</option>
                          <option value={3}>Nível 3 (Sólido)</option>
                          <option value={4}>Nível 4 (Avançado)</option>
                          <option value={5}>Nível 5 (Referência)</option>
                        </select>
                      </div>

                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleAddCompetence}
                        className="w-full justify-center"
                      >
                        + Adicionar Competência
                      </Button>
                    </div>
                  </div>

                  {renderFormButtons()}
                </div>
              )}

              {/* TAB: DOSSIÊ TÉCNICO */}
              {activeTab === "dossie" && (
                <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs space-y-6">
                  <div className="pb-4 border-b border-border-subtle">
                    <h2 className="font-heading font-bold text-lg text-text-primary">
                      Dossiê Técnico
                    </h2>
                    <p className="font-body text-xs text-text-secondary mt-0.5">
                      Informações não-confidenciais para análise prévia de viabilidade pelas empresas interessadas.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border-subtle bg-surface-secondary/40 p-4 text-xs text-text-secondary leading-relaxed">
                    Nota de Integridade: As informações deste dossiê são estritamente qualitativas e não afetam o cálculo numérico do score de compatibilidade. Nomes de pesquisadores, ICT de origem e números de protocolo INPI permanecem confidenciais.
                  </div>

                  <div className="flex flex-col gap-6">
                    <div>
                      <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                        Dor da Indústria Resolvida
                      </label>
                      <textarea
                        rows={3}
                        value={industryProblem}
                        onChange={(e) => setIndustryProblem(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-primary px-4 py-3 font-body text-sm text-text-primary focus:border-brand-green-moss focus:bg-surface-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                        Diferencial Competitivo e Benchmarks Quantitativos
                      </label>
                      <textarea
                        rows={3}
                        value={competitiveAdvantage}
                        onChange={(e) => setCompetitiveAdvantage(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-primary px-4 py-3 font-body text-sm text-text-primary focus:border-brand-green-moss focus:bg-surface-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide mb-2">
                        Modalidades de Parceria Almejadas
                      </label>
                      <div className="flex flex-col gap-2">
                        {[
                          "Licenciamento de Tecnologia ou Patente",
                          "Co-desenvolvimento e P&D Conjunto",
                          "Prova de Conceito ou Piloto Industrial",
                          "Aporte ou Investimento em Spin-off",
                          "Validação Regulatória e Homologação",
                          "Prestação de Serviços Tecnológicos",
                        ].map((goal) => {
                          const isSelected = partnershipGoals.includes(goal);
                          return (
                            <button
                              key={goal}
                              type="button"
                              onClick={() => togglePartnershipGoal(goal)}
                              className={[
                                "w-full text-left px-3.5 py-2.5 rounded-xl font-heading text-xs font-semibold border transition-all cursor-pointer",
                                isSelected
                                  ? "bg-brand-green-moss/15 text-brand-green-dark border-brand-green-moss font-bold"
                                  : "bg-surface-primary text-text-secondary border-border-subtle hover:bg-surface-secondary",
                              ].join(" ")}
                            >
                              {isSelected ? "[ Selecionado ] " : "[ ] "}
                              {goal}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                        Condições Operacionais e Escala de Bancada Comprovada
                      </label>
                      <textarea
                        rows={3}
                        value={operatingConditions}
                        onChange={(e) => setOperatingConditions(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-primary px-4 py-3 font-body text-sm text-text-primary focus:border-brand-green-moss focus:bg-surface-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                        Desafios e Gaps Conhecidos para Escala Piloto
                      </label>
                      <textarea
                        rows={3}
                        value={scalabilityGaps}
                        onChange={(e) => setScalabilityGaps(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-primary px-4 py-3 font-body text-sm text-text-primary focus:border-brand-green-moss focus:bg-surface-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                        Orçamento Estimado para Fase Piloto
                      </label>
                      <input
                        type="text"
                        value={estimatedBudget}
                        onChange={(e) => setEstimatedBudget(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-primary px-4 py-3 font-body text-sm text-text-primary focus:border-brand-green-moss focus:bg-surface-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                        Prazo Estimado até Piloto
                      </label>
                      <input
                        type="text"
                        value={estimatedTimelineMonths}
                        onChange={(e) => setEstimatedTimelineMonths(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-primary px-4 py-3 font-body text-sm text-text-primary focus:border-brand-green-moss focus:bg-surface-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                        Fomento Público Prévio Recebido
                      </label>
                      <input
                        type="text"
                        value={priorFunding}
                        onChange={(e) => setPriorFunding(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-primary px-4 py-3 font-body text-sm text-text-primary focus:border-brand-green-moss focus:bg-surface-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {renderFormButtons()}
                </div>
              )}

              {/* TAB: ARTIGOS E DOCUMENTOS */}
              {activeTab === "documentos" && (
                <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs space-y-6">
                  <div className="pb-4 border-b border-border-subtle">
                    <h2 className="font-heading font-bold text-lg text-text-primary">
                      Artigos e Documentos
                    </h2>
                    <p className="font-body text-xs text-text-secondary mt-0.5">
                      Adicione artigos científicos, laudos laboratoriais e relatórios técnicos associados a esta tecnologia.
                    </p>
                  </div>

                  <div className="flex flex-col gap-6">
                    {/* Lista de Documentos Cadastrados */}
                    <div>
                      <h3 className="font-heading text-xs font-semibold uppercase text-text-secondary tracking-wide mb-3">
                        Documentos vinculados ao projeto:
                      </h3>

                      {documents.length === 0 ? (
                        <p className="text-xs text-text-secondary italic">
                          Nenhum documento ou artigo adicionado ainda. Utilize o formulário abaixo.
                        </p>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {documents.map((doc) => (
                            <div
                              key={doc.id}
                              className="rounded-2xl border border-border-subtle bg-surface-primary p-4 flex flex-col gap-2"
                            >
                              <div className="flex flex-col gap-1">
                                <span className="font-heading text-xs font-bold text-text-primary">
                                  {doc.title}
                                </span>
                                {doc.type && (
                                  <span className="font-body text-[11px] text-brand-green-dark font-medium">
                                    Tipo: {doc.type}
                                  </span>
                                )}
                                {doc.linkOrDoi && (
                                  <span className="font-mono text-xs text-text-secondary break-all">
                                    {doc.linkOrDoi}
                                  </span>
                                )}
                              </div>

                              <div className="pt-2 border-t border-border-subtle flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDocument(doc.id)}
                                  className="text-xs font-heading font-semibold text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                                >
                                  Remover Documento
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Formulário para Adicionar Documento */}
                    <div className="rounded-2xl border border-border-subtle bg-surface-secondary/40 p-4 flex flex-col gap-4">
                      <h4 className="font-heading text-xs font-bold text-text-primary">
                        Adicionar novo artigo ou documento:
                      </h4>

                      <div>
                        <label className="block font-heading text-[11px] font-semibold text-text-secondary uppercase mb-1">
                          Título do Artigo ou Documento *
                        </label>
                        <input
                          type="text"
                          value={tempDocTitle}
                          onChange={(e) => setTempDocTitle(e.target.value)}
                          className="w-full rounded-xl border border-border-subtle bg-surface-white px-3.5 py-2.5 font-body text-xs text-text-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-heading text-[11px] font-semibold text-text-secondary uppercase mb-1">
                          Link ou Identificador DOI (Opcional)
                        </label>
                        <input
                          type="text"
                          value={tempDocLink}
                          onChange={(e) => setTempDocLink(e.target.value)}
                          className="w-full rounded-xl border border-border-subtle bg-surface-white px-3.5 py-2.5 font-body text-xs text-text-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-heading text-[11px] font-semibold text-text-secondary uppercase mb-1">
                          Tipo do Documento
                        </label>
                        <select
                          value={tempDocType}
                          onChange={(e) => setTempDocType(e.target.value)}
                          className="w-full rounded-xl border border-border-subtle bg-surface-white px-3.5 py-2.5 font-body text-xs text-text-primary focus:outline-none"
                        >
                          <option value="Artigo Científico Publicado">Artigo Científico Publicado</option>
                          <option value="Relatório Técnico de Bancada">Relatório Técnico de Bancada</option>
                          <option value="Certificado de Ensaio / Laudo">Certificado de Ensaio / Laudo</option>
                          <option value="Dissertação ou Tese">Dissertação ou Tese</option>
                          <option value="Outro Documento">Outro Documento</option>
                        </select>
                      </div>

                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleAddDocument}
                        className="w-full justify-center"
                      >
                        + Adicionar Documento
                      </Button>
                    </div>
                  </div>

                  {renderFormButtons()}
                </div>
              )}

              {/* TAB: PROPRIEDADE INTELECTUAL */}
              {activeTab === "propriedade_intelectual" && (
                <div className="rounded-3xl border border-border-subtle bg-surface-white p-6 md:p-8 shadow-xs space-y-6">
                  <div className="pb-4 border-b border-border-subtle">
                    <h2 className="font-heading font-bold text-lg text-text-primary">
                      Propriedade Intelectual
                    </h2>
                    <p className="font-body text-xs text-text-secondary mt-0.5">
                      Titularidade institucional, acordos de exclusividade e escopo protegido das reivindicações.
                    </p>
                  </div>

                  <div className="flex flex-col gap-6">
                    <div>
                      <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                        Estrutura de Titularidade da Tecnologia
                      </label>
                      <select
                        value={ownershipType}
                        onChange={(e) => setOwnershipType(e.target.value as any)}
                        className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-white px-4 py-3 font-body text-xs text-text-primary focus:outline-none"
                      >
                        <option value="UNIVERSIDADE">Universidade Pública / ICT Estadual ou Federal</option>
                        <option value="NIT">Núcleo de Inovação Tecnológica (NIT) Institucional</option>
                        <option value="INDEPENDENTE">Pesquisador Independente / Titularidade Própria</option>
                        <option value="LABORATORIO_PRIVADO">Instituto de Pesquisa / Laboratório Privado</option>
                        <option value="EMPRESA_SPINOFF">Empresa Spin-off / Deep Tech Constituída</option>
                      </select>
                    </div>

                    <div className="rounded-2xl border border-border-subtle bg-surface-primary p-4">
                      <div className="flex items-start gap-3">
                        <input
                          id="exclusive-check"
                          type="checkbox"
                          checked={hasExclusiveCommitment}
                          onChange={(e) => setHasExclusiveCommitment(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-border-subtle text-brand-green-dark accent-brand-green-dark cursor-pointer"
                        />
                        <label htmlFor="exclusive-check" className="font-body text-xs text-text-primary cursor-pointer select-none leading-relaxed">
                          Existe compromisso prévio de exclusividade comercial ou opção de compra com alguma empresa?
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block font-heading text-xs font-bold text-text-primary uppercase tracking-wide">
                        Resumo das Reivindicações Técnicas Protegidas
                      </label>
                      <textarea
                        rows={3}
                        value={patentClaimsSummary}
                        onChange={(e) => setPatentClaimsSummary(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-primary px-4 py-3 font-body text-sm text-text-primary focus:border-brand-green-moss focus:bg-surface-white focus:outline-none"
                      />
                      <p className="mt-1 text-[11px] text-text-secondary">
                        Descreva o escopo técnico protegido. Não insira o número do protocolo do INPI neste formulário para manter a blindagem.
                      </p>
                    </div>
                  </div>

                  {renderFormButtons()}
                </div>
              )}
            </div>
          </div>
        </form>
      )}
    </DashboardLayout>
  );
}
