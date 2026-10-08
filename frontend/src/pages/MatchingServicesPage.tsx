import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Users2,
  Workflow,
} from "lucide-react";

import { PublicHeader } from "../components/layout/PublicHeader";
import { PublicFooter } from "../components/layout/PublicFooter";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";

export function MatchingServicesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-primary flex flex-col justify-between">
      <PublicHeader />

      <main className="pt-[84px] lg:pt-[96px] pb-24 flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-border-subtle bg-surface-primary py-4">
          <Container size="wide">
            <div className="flex items-center gap-2 font-body text-xs text-text-secondary">
              <Link to="/" className="hover:text-brand-green-moss">
                Início
              </Link>
              <span>/</span>
              <span className="text-text-primary font-medium">Matching</span>
            </div>
          </Container>
        </div>

        {/* How Matching Works (The AI & Vector Search Engine) */}
        <section className="py-16 md:py-20 border-b border-border-subtle bg-surface-primary">
          <Container size="wide">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h1 className="font-display text-3xl md:text-5xl font-bold text-text-primary">
                Como funciona o motor de matching
              </h1>
              <p className="mt-4 font-body text-sm md:text-base text-text-secondary">
                Eliminamos centenas de horas de prospecção manual avaliando a aderência semântica e tecnológica entre desafios corporativos e a produção científica de excelência.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {/* Component 1: Busca Semântica Vetorial */}
              <div className="rounded-3xl border border-border-subtle bg-surface-white p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green-moss/10 text-brand-green-moss mb-6">
                    <Icon icon={BrainCircuit} size={24} />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-text-primary mb-2">
                    Busca Semântica Vetorial
                  </h3>
                  <p className="font-body text-sm text-text-secondary leading-relaxed">
                    Modelos avançados de embeddings de linguagem traduzem os objetivos da demanda corporativa em coordenadas conceituais, comparando a essência do desafio tecnológico contra o acervo científico além de simples palavras-chave.
                  </p>
                </div>
                <div className="mt-6 border-t border-border-subtle pt-4 font-mono text-xs text-text-muted">
                  Embeddings densos de alta dimensão
                </div>
              </div>

              {/* Component 2: Calibração de Relevância */}
              <div className="rounded-3xl border border-border-subtle bg-surface-white p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green-moss/10 text-brand-green-moss mb-6">
                    <Icon icon={Sparkles} size={24} />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-text-primary mb-2">
                    Calibração de Relevância
                  </h3>
                  <p className="font-body text-sm text-text-secondary leading-relaxed">
                    O score de similaridade por cosseno é normalizado pela fórmula rigorosa:
                    <span className="block my-2 rounded-xl bg-surface-primary p-2 font-mono text-xs font-bold text-brand-green-dark border border-border-subtle text-center">
                      Relevância (%) = ((score - 0.35) / 0.40) × 100
                    </span>
                    Garantindo que a empresa receba sempre os Top 10 projetos com índice auditável de 0% a 100%.
                  </p>
                </div>
                <div className="mt-6 border-t border-border-subtle pt-4 font-mono text-xs text-text-muted">
                  Ranking dos Top 10 resultados calibrados
                </div>
              </div>

              {/* Component 3: Conexão Direta */}
              <div className="rounded-3xl border border-border-subtle bg-surface-white p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green-moss/10 text-brand-green-moss mb-6">
                    <Icon icon={Workflow} size={24} />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-text-primary mb-2">
                    Conexão Direta &amp; P&amp;D
                  </h3>
                  <p className="font-body text-sm text-text-secondary leading-relaxed">
                    Identificadas as pesquisas mais aderentes, a empresa visualiza imediatamente autores, instituições, áreas de conhecimento e e-mails de contato direto para formalizar acordos de cooperação, licenciamento ou contratação de laboratório.
                  </p>
                </div>
                <div className="mt-6 border-t border-border-subtle pt-4 font-mono text-xs text-text-muted">
                  Desintermediação e agilidade contratual
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Exclusive Workflow per Profile */}
        <section className="py-20 bg-surface-primary">
          <Container size="wide">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary">
                Uma dinâmica sob medida para cada ator
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* For Companies */}
              <div className="rounded-3xl border border-border-subtle bg-surface-secondary/30 p-8 md:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green-dark text-brand-off-white mb-6">
                    <Icon icon={Users2} size={24} />
                  </div>
                  <span className="rounded-full bg-brand-green-dark text-white px-3 py-1 text-xs font-mono font-bold">
                    Acesso Exclusivo ao Matching
                  </span>
                  <h3 className="font-display text-2xl font-bold text-text-primary mt-3">
                    Para Empresas e Corporações
                  </h3>
                  <p className="mt-3 font-body text-sm text-text-secondary leading-relaxed">
                    As empresas cadastram suas demandas de inovação e desejos corporativos de projetos para acionar o motor de busca vetorial:
                  </p>
                  <ul className="mt-6 space-y-3 font-body text-xs text-text-secondary">
                    <li className="flex items-center gap-2">
                      <Icon icon={CheckCircle2} size={15} className="text-brand-green-moss" />
                      <span>Submissão de demandas tecnológicas e competências necessárias</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon icon={CheckCircle2} size={15} className="text-brand-green-moss" />
                      <span>Recomendação instantânea dos 10 melhores projetos científicos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon icon={CheckCircle2} size={15} className="text-brand-green-moss" />
                      <span>Contato direto com pesquisadores líderes para acelerar P&amp;D</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-border-subtle">
                  <Button onClick={() => navigate("/cadastro")}>
                    Cadastrar Empresa e Buscar Matches
                    <Icon icon={ArrowRight} size={15} />
                  </Button>
                </div>
              </div>

              {/* For Researchers */}
              <div className="rounded-3xl border border-border-subtle bg-surface-secondary/30 p-8 md:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green-dark text-brand-off-white mb-6">
                    <Icon icon={GraduationCap} size={24} />
                  </div>
                  <span className="rounded-full bg-brand-green-moss/20 text-brand-green-dark px-3 py-1 text-xs font-mono font-bold border border-brand-green-moss/30">
                    Provedores de Tecnologia &amp; Ciência
                  </span>
                  <h3 className="font-display text-2xl font-bold text-text-primary mt-3">
                    Para Pesquisadores e Laboratórios
                  </h3>
                  <p className="mt-3 font-body text-sm text-text-secondary leading-relaxed">
                    Os cientistas submetem seus projetos, patentes e competências para integrarem o radar tecnológico acessado pelas indústrias:
                  </p>
                  <ul className="mt-6 space-y-3 font-body text-xs text-text-secondary">
                    <li className="flex items-center gap-2">
                      <Icon icon={CheckCircle2} size={15} className="text-brand-green-moss" />
                      <span>Cadastro de projetos científicos com maturidade TRL e patentes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon icon={CheckCircle2} size={15} className="text-brand-green-moss" />
                      <span>Selos de qualificação de perfil (Bronze, Prata e Ouro checado com Lattes)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon icon={CheckCircle2} size={15} className="text-brand-green-moss" />
                      <span>Oportunidades de captação de recursos e financiamento privado de P&amp;D</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-border-subtle">
                  <Button variant="secondary" onClick={() => navigate("/cadastro")}>
                    Submeter Projetos como Pesquisador
                    <Icon icon={ArrowRight} size={15} />
                  </Button>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
