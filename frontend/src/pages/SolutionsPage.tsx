import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  Network,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import { PublicHeader } from "../components/layout/PublicHeader";
import { PublicFooter } from "../components/layout/PublicFooter";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";

import solutionsHeroImg from "../assets/brand/photography/cases-energy.jpg";

export function SolutionsPage() {
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
              <span className="text-text-primary font-medium">Soluções</span>
            </div>
          </Container>
        </div>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-brand-green-dark py-20 lg:py-28 text-brand-off-white">
          <div className="absolute inset-0">
            <img
              src={solutionsHeroImg}
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
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 font-heading text-xs font-semibold text-brand-cream hover:underline mb-6"
              >
                <Icon icon={ArrowLeft} size={14} />
                Voltar para o início
              </Link>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-green-moss/20 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-brand-cream border border-brand-green-moss/30 mb-4 block w-fit">
                Ecossistema Integrado de Inovação
              </span>

              <h1 className="font-display text-4xl font-bold tracking-tight text-brand-off-white md:text-6xl leading-[1.1]">
                Nossas Soluções
              </h1>

              <p className="mt-6 font-body text-base md:text-lg leading-relaxed text-brand-off-white/80">
                Uma infraestrutura completa de transferência de tecnologia orientada por inteligência artificial, unindo a produção científica de ponta às demandas reais de inovação da indústria.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button
                  variant="inverse"
                  size="lg"
                  onClick={() => navigate("/cadastro")}
                >
                  Criar Minha Conta
                  <Icon icon={ArrowRight} size={16} />
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="border-brand-off-white/40 text-brand-off-white hover:bg-brand-off-white hover:text-brand-green-dark"
                  onClick={() => navigate("/matching")}
                >
                  Conhecer o Motor de Matching
                </Button>
              </div>
            </div>
          </Container>
        </section>

        {/* The 3 Core Pillars */}
        <section className="py-20 border-b border-border-subtle bg-surface-primary">
          <Container size="wide">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-brand-green-moss">
                Jornada Completa de Inovação Aberta
              </p>
              <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold text-text-primary">
                Três pilares para o impacto real
              </h2>
              <p className="mt-4 font-body text-sm md:text-base text-text-secondary">
                Da submissão do desafio tecnológico até a formalização do convênio de P&amp;D.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {/* Pillar 1: Conectar */}
              <div className="rounded-3xl border border-border-subtle bg-surface-white p-8 flex flex-col justify-between hover:shadow-lg transition-all">
                <div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green-moss/10 text-brand-green-moss mb-6">
                    <Icon icon={Network} size={28} />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-text-primary">
                    1. Conectar
                  </h3>
                  <p className="mt-4 font-body text-sm text-text-secondary leading-relaxed">
                    Aproximação baseada em inteligência semântica: cientistas submetem seus projetos, publicações e patentes, enquanto empresas cadastram demandas tecnológicas para ativar o matching automatizado de alta precisão.
                  </p>
                  <ul className="mt-6 space-y-2.5 font-body text-xs text-text-secondary">
                    <li className="flex items-center gap-2">
                      <Icon icon={CheckCircle2} size={14} className="text-brand-green-moss" />
                      <span>Motor de busca semântica por vetores</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon icon={CheckCircle2} size={14} className="text-brand-green-moss" />
                      <span>Ranking dos Top 10 projetos científicos mais aderentes</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Pillar 2: Acelerar */}
              <div className="rounded-3xl border border-border-subtle bg-surface-white p-8 flex flex-col justify-between hover:shadow-lg transition-all">
                <div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green-moss/10 text-brand-green-moss mb-6">
                    <Icon icon={Target} size={28} />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-text-primary">
                    2. Acelerar
                  </h3>
                  <p className="mt-4 font-body text-sm text-text-secondary leading-relaxed">
                    Diagnóstico objetivo de maturidade científica e prontidão técnica (TRL). Alinhamento rigoroso entre as expectativas de investimento da empresa e os estágios reais de validação laboratorial da pesquisa.
                  </p>
                  <ul className="mt-6 space-y-2.5 font-body text-xs text-text-secondary">
                    <li className="flex items-center gap-2">
                      <Icon icon={CheckCircle2} size={14} className="text-brand-green-moss" />
                      <span>Calibração matemática de relevância com explicabilidade</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon icon={CheckCircle2} size={14} className="text-brand-green-moss" />
                      <span>Acesso imediato aos dados e contatos diretos dos autores</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Pillar 3: Escalar */}
              <div className="rounded-3xl border border-border-subtle bg-surface-white p-8 flex flex-col justify-between hover:shadow-lg transition-all">
                <div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green-moss/10 text-brand-green-moss mb-6">
                    <Icon icon={TrendingUp} size={28} />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-text-primary">
                    3. Escalar
                  </h3>
                  <p className="mt-4 font-body text-sm text-text-secondary leading-relaxed">
                    Viabilização ágil de contratos de cooperação técnico-científica, co-desenvolvimento, licenciamento de propriedade intelectual e enquadramento em incentivos fiscais da Lei do Bem.
                  </p>
                  <ul className="mt-6 space-y-2.5 font-body text-xs text-text-secondary">
                    <li className="flex items-center gap-2">
                      <Icon icon={CheckCircle2} size={14} className="text-brand-green-moss" />
                      <span>Preservação de autoria e segurança jurídica</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon icon={CheckCircle2} size={14} className="text-brand-green-moss" />
                      <span>Conexão direta com laboratórios de ponta em todo o país</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Dedicated Solutions by Audience */}
        <section className="py-24 bg-surface-secondary/30">
          <Container size="wide">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* For Academia */}
              <div className="rounded-3xl border border-border-subtle bg-surface-primary p-8 md:p-12 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green-dark text-brand-off-white">
                      <Icon icon={GraduationCap} size={24} />
                    </div>
                    <div>
                      <h3 className="font-heading text-2xl font-bold text-text-primary">
                        Para a Comunidade Científica
                      </h3>
                      <p className="font-body text-xs text-text-secondary">
                        Pesquisadores, bolsistas, laboratórios e institutos de ciência e tecnologia
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 font-body text-sm text-text-secondary">
                    <div className="flex items-start gap-3">
                      <Icon icon={Rocket} size={18} className="text-brand-green-moss shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-text-primary">Captação de Recursos &amp; Financiamento:</strong> Encontre empresas dispostas a financiar bolsas, reagentes e infraestrutura de bancada para pesquisas com aplicação prática.
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon icon={BrainCircuit} size={18} className="text-brand-green-moss shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-text-primary">Submissão Estruturada de Projetos:</strong> Cadastre suas pesquisas com competências técnicas e maturidade TRL para integrar o radar tecnológico corporativo.
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon icon={ShieldCheck} size={18} className="text-brand-green-moss shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-text-primary">Qualificação com Selos de Perfil:</strong> Validação de credenciais acadêmicas (Bronze, Prata e Ouro checado com Lattes) para destacar seu grupo de pesquisa.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border-subtle">
                  <Button onClick={() => navigate("/cadastro")}>
                    Cadastrar como Pesquisador
                    <Icon icon={ArrowRight} size={15} />
                  </Button>
                </div>
              </div>

              {/* For Companies */}
              <div className="rounded-3xl border border-border-subtle bg-surface-primary p-8 md:p-12 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green-dark text-brand-off-white">
                      <Icon icon={Briefcase} size={24} />
                    </div>
                    <div>
                      <h3 className="font-heading text-2xl font-bold text-text-primary">
                        Para o Setor Produtivo
                      </h3>
                      <p className="font-body text-xs text-text-secondary">
                        Indústrias, corporações inovadoras, equipes de P&amp;D e investidores
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 font-body text-sm text-text-secondary">
                    <div className="flex items-start gap-3">
                      <Icon icon={Sparkles} size={18} className="text-brand-green-moss shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-text-primary">Acesso Exclusivo ao Matching por IA:</strong> Submeta seus desejos de projetos e receba instantaneamente as 10 pesquisas acadêmicas mais compatíveis.
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon icon={Target} size={18} className="text-brand-green-moss shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-text-primary">Inovação Aberta com Rigor Científico:</strong> Supere gargalos tecnológicos contratando diretamente pesquisadores líderes e laboratórios homologados.
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon icon={ShieldCheck} size={18} className="text-brand-green-moss shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-text-primary">Incentivos Fiscais (Lei do Bem):</strong> Facilite o enquadramento de investimentos em cooperação universidade-empresa perante os órgãos de fomento.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border-subtle">
                  <Button onClick={() => navigate("/cadastro")}>
                    Cadastrar como Empresa
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
