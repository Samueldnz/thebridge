import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  FileCheck,
  GraduationCap,
  Users2,
} from "lucide-react";

import { PublicHeader } from "../components/layout/PublicHeader";
import { PublicFooter } from "../components/layout/PublicFooter";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";

import heroMatchImg from "../assets/brand/photography/hero-science.jpg";

export function MatchingServicesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-primary flex flex-col justify-between">
      <PublicHeader />

      <main className="pt-[84px] lg:pt-[96px] pb-24 flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-brand-green-dark py-20 lg:py-28 text-brand-off-white">
          <div className="absolute inset-0">
            <img
              src={heroMatchImg}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover opacity-20"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-brand-green-dark via-brand-green-dark/95 to-brand-green-dark/80"
            />
          </div>

          <Container size="wide" className="relative z-10">
            <div className="max-w-3xl">
              <h1 className="font-display text-4xl font-bold tracking-tight text-brand-off-white md:text-6xl leading-[1.1]">
                Serviços de Matching
              </h1>

              <p className="mt-6 font-body text-base md:text-lg leading-relaxed text-brand-off-white/80">
                Aproximamos a vanguarda científica das universidades das reais demandas do mercado através de um motor determinístico de compatibilidade tecnológica, maturidade e propriedade intelectual.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button
                  variant="inverse"
                  size="lg"
                  onClick={() => navigate("/cadastro")}
                >
                  Experimentar o Matching
                  <Icon icon={ArrowRight} size={16} />
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="border-brand-off-white/40 text-brand-off-white hover:bg-brand-off-white hover:text-brand-green-dark"
                  onClick={() => navigate("/nossa-historia")}
                >
                  Conhecer Nossa História
                </Button>
              </div>
            </div>
          </Container>
        </section>


        {/* How Matching Works (The Algorithm) */}
        <section className="py-20 border-b border-border-subtle bg-surface-primary">
          <Container size="wide">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-brand-green-moss">
                Engenharia de Compatibilidade
              </p>
              <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold text-text-primary">
                Como funciona o nosso algoritmo
              </h2>
              <p className="mt-4 font-body text-sm md:text-base text-text-secondary">
                Eliminamos centenas de horas de busca manual em catálogos e repositórios acadêmicos avaliando 3 dimensões essenciais ponderadas.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {/* Component 1: Competências */}
              <div className="rounded-2xl border border-border-subtle bg-surface-white p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green-moss/10 text-brand-green-moss mb-6">
                    <Icon icon={BrainCircuit} size={24} />
                  </div>
                  <div className="flex items-baseline justify-between mb-2">
                    <h3 className="font-heading text-xl font-bold text-text-primary">
                      Competências
                    </h3>
                    <span className="font-display text-2xl font-bold text-brand-green-moss">
                      60%
                    </span>
                  </div>
                  <p className="font-body text-sm text-text-secondary leading-relaxed">
                    Taxonomia hierárquica de competências técnicas. O algoritmo avalia os pesos solicitados pela oportunidade (1 a 5) contra os níveis comprovados pelo projeto do pesquisador, calculando a cobertura exata do domínio.
                  </p>
                </div>
                <div className="mt-6 border-t border-border-subtle pt-4 font-body text-xs text-text-muted">
                  Fórmula: Média ponderada dos níveis pelas exigências
                </div>
              </div>

              {/* Component 2: TRL */}
              <div className="rounded-2xl border border-border-subtle bg-surface-white p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green-moss/10 text-brand-green-moss mb-6">
                    <Icon icon={BarChart3} size={24} />
                  </div>
                  <div className="flex items-baseline justify-between mb-2">
                    <h3 className="font-heading text-xl font-bold text-text-primary">
                      Maturidade TRL
                    </h3>
                    <span className="font-display text-2xl font-bold text-brand-green-moss">
                      20%
                    </span>
                  </div>
                  <p className="font-body text-sm text-text-secondary leading-relaxed">
                    Technology Readiness Level (1 a 9). Mede a proximidade entre a maturidade técnica atual da pesquisa e o estágio mínimo esperado pela empresa para incorporação ou investimento.
                  </p>
                </div>
                <div className="mt-6 border-t border-border-subtle pt-4 font-body text-xs text-text-muted">
                  Fórmula: min(TRL Projeto / TRL Desejado, 1.0)
                </div>
              </div>


              {/* Component 3: CRL & Patentes */}
              <div className="rounded-2xl border border-border-subtle bg-surface-white p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green-moss/10 text-brand-green-moss mb-6">
                    <Icon icon={FileCheck} size={24} />
                  </div>
                  <div className="flex items-baseline justify-between mb-2">
                    <h3 className="font-heading text-xl font-bold text-text-primary">
                      CRL &amp; Patentes
                    </h3>
                    <span className="font-display text-2xl font-bold text-brand-green-moss">
                      20%
                    </span>
                  </div>
                  <p className="font-body text-sm text-text-secondary leading-relaxed">
                    Commercial Readiness Level (1 a 9) e validação de requisitos de propriedade intelectual. Filtra e qualifica projetos conforme status de patentes (concedida, pendente ou livre).
                  </p>
                </div>
                <div className="mt-6 border-t border-border-subtle pt-4 font-body text-xs text-text-muted">
                  Validação de patentes e prontidão de mercado
                </div>
              </div>
            </div>
          </Container>
        </section>


        {/* Benefits for Both Sides */}
        <section className="py-20 bg-surface-primary">
          <Container size="wide">
            <div className="grid gap-8 md:grid-cols-2">
              {/* For Researchers */}
              <div className="rounded-3xl border border-border-subtle bg-surface-secondary/30 p-8 md:p-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green-dark text-brand-off-white mb-6">
                  <Icon icon={GraduationCap} size={24} />
                </div>
                <h3 className="font-display text-2xl font-bold text-text-primary">
                  Para Pesquisadores e Institutos
                </h3>
                <p className="mt-3 font-body text-sm text-text-secondary">
                  Valorize suas teses, patentes e publicações científicas encontrando parceiros industriais dispostos a co-financiar e aplicar sua tecnologia.
                </p>
                <ul className="mt-6 space-y-3 font-body text-xs text-text-secondary">
                  <li className="flex items-center gap-2">
                    <Icon icon={CheckCircle2} size={15} className="text-brand-green-moss" />
                    <span>Visibilidade qualificada para grupos de pesquisa e laboratórios</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon icon={CheckCircle2} size={15} className="text-brand-green-moss" />
                    <span>Compatibilidade automática com editais e demandas empresariais</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon icon={CheckCircle2} size={15} className="text-brand-green-moss" />
                    <span>Preservação de autoria e propriedade intelectual</span>
                  </li>
                </ul>
              </div>

              {/* For Companies */}
              <div className="rounded-3xl border border-border-subtle bg-surface-secondary/30 p-8 md:p-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green-dark text-brand-off-white mb-6">
                  <Icon icon={Users2} size={24} />
                </div>
                <h3 className="font-display text-2xl font-bold text-text-primary">
                  Para Empresas e Investidores
                </h3>
                <p className="mt-3 font-body text-sm text-text-secondary">
                  Encontre soluções tecnológicas proprietárias e pesquisadores de ponta sem os gargalos de prospecção tradicional.
                </p>
                <ul className="mt-6 space-y-3 font-body text-xs text-text-secondary">
                  <li className="flex items-center gap-2">
                    <Icon icon={CheckCircle2} size={15} className="text-brand-green-moss" />
                    <span>Acesso a um pipeline filtrado por TRL e competências estratégicas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon icon={CheckCircle2} size={15} className="text-brand-green-moss" />
                    <span>Redução substancial do tempo de P&amp;D e contratação de parceiros</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon icon={CheckCircle2} size={15} className="text-brand-green-moss" />
                    <span>Inovação de alto impacto com embasamento científico comprovado</span>
                  </li>
                </ul>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
