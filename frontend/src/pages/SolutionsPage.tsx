import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  Network,
  Rocket,
  ShieldCheck,
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

              <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-brand-green-moss">
                Soluções Integradas
              </p>

              <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-brand-off-white md:text-6xl leading-[1.1]">
                Nossas Soluções
              </h1>

              <p className="mt-6 font-body text-base md:text-lg leading-relaxed text-brand-off-white/80">
                Uma suíte de ferramentas tecnológicas desenhadas para acelerar cada etapa da transferência de tecnologia entre pesquisadores de elite e corporações inovadoras.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button
                  variant="inverse"
                  size="lg"
                  onClick={() => navigate("/cadastro")}
                >
                  Começar agora
                  <Icon icon={ArrowRight} size={16} />
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="border-brand-off-white/40 text-brand-off-white hover:bg-brand-off-white hover:text-brand-green-dark"
                  onClick={() => navigate("/matching")}
                >
                  Ver motor de matching
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
                Jornada Completa de Inovação
              </p>
              <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold text-text-primary">
                Três pilares para o impacto real
              </h2>
              <p className="mt-4 font-body text-sm md:text-base text-text-secondary">
                Do primeiro contato à formalização do contrato de cooperação técnico-científica.
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
                    Aproximação baseada em dados: cientistas cadastram projetos, publicações e patentes, enquanto empresas publicam suas demandas e desafios tecnológicos de forma anônima ou aberta.
                  </p>
                  <ul className="mt-6 space-y-2.5 font-body text-xs text-text-secondary">
                    <li className="flex items-center gap-2">
                      <Icon icon={CheckCircle2} size={14} className="text-brand-green-moss" />
                      <span>Motor de recomendação automatizado</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon icon={CheckCircle2} size={14} className="text-brand-green-moss" />
                      <span>Filtros avançados por setor industrial e área CAPES/CNPq</span>
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
                    Diagnóstico objetivo de maturidade científica e comercial. Avaliação nas escalas TRL e CRL para alinhar expectativas de investimento, prototipagem e testes de laboratório.
                  </p>
                  <ul className="mt-6 space-y-2.5 font-body text-xs text-text-secondary">
                    <li className="flex items-center gap-2">
                      <Icon icon={CheckCircle2} size={14} className="text-brand-green-moss" />
                      <span>Mapeamento de riscos tecnológicos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon icon={CheckCircle2} size={14} className="text-brand-green-moss" />
                      <span>Roteiro de desenvolvimento conjunto de P&amp;D</span>
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
                    Facilitamos a viabilização de convênios de cooperação, licenciamento de patentes, captação de recursos de subvenção econômica e conexão com fundos de venture capital.
                  </p>
                  <ul className="mt-6 space-y-2.5 font-body text-xs text-text-secondary">
                    <li className="flex items-center gap-2">
                      <Icon icon={CheckCircle2} size={14} className="text-brand-green-moss" />
                      <span>Segurança jurídica e termos de confidencialidade</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon icon={CheckCircle2} size={14} className="text-brand-green-moss" />
                      <span>Integração com ecossistemas de fomento</span>
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
              <div className="rounded-3xl border border-border-subtle bg-surface-primary p-8 md:p-12 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green-dark text-brand-off-white">
                    <Icon icon={GraduationCap} size={24} />
                  </div>
                  <div>
                    <h3 className="font-heading text-2xl font-bold text-text-primary">
                      Para a Comunidade Científica
                    </h3>
                    <p className="font-body text-xs text-text-secondary">
                      Pesquisadores, bolsistas, NITs e laboratórios
                    </p>
                  </div>
                </div>

                <div className="space-y-4 font-body text-sm text-text-secondary">
                  <div className="flex items-start gap-3">
                    <Icon icon={Rocket} size={18} className="text-brand-green-moss shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-text-primary">Monetização e Captação de Recursos:</strong> Encontre empresas dispostas a financiar bolsas, equipamentos e reagentes para projetos aplicados.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon icon={Briefcase} size={18} className="text-brand-green-moss shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-text-primary">Transferência de Tecnologia Descomplicada:</strong> Apoio na tradução de especificações acadêmicas para linguagem de negócios.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon icon={ShieldCheck} size={18} className="text-brand-green-moss shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-text-primary">Garantia de Crédito e Direitos Morais:</strong> Registro auditável de interações para proteger a autoria de seus grupos de pesquisa.
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
              <div className="rounded-3xl border border-border-subtle bg-surface-primary p-8 md:p-12 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green-dark text-brand-off-white">
                    <Icon icon={Briefcase} size={24} />
                  </div>
                  <div>
                    <h3 className="font-heading text-2xl font-bold text-text-primary">
                      Para o Setor Produtivo
                    </h3>
                    <p className="font-body text-xs text-text-secondary">
                      Indústrias, corporações, P&amp;D e investidores
                    </p>
                  </div>
                </div>

                <div className="space-y-4 font-body text-sm text-text-secondary">
                  <div className="flex items-start gap-3">
                    <Icon icon={Target} size={18} className="text-brand-green-moss shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-text-primary">Inovação Aberta com Rigor:</strong> Supere gargalos que equipes internas não conseguem resolver contratando laboratórios especializados.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon icon={Network} size={18} className="text-brand-green-moss shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-text-primary">Radar Tecnológico Contínuo:</strong> Seja notificado sempre que um projeto aderente às suas teses for publicado por qualquer universidade parceira.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon icon={ShieldCheck} size={18} className="text-brand-green-moss shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-text-primary">Incentivos Fiscais (Lei do Bem):</strong> Facilite a comprovação de investimentos em pesquisa básica e aplicada perante os órgãos reguladores.
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
