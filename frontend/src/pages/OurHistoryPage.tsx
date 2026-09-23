import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Compass,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  LineChart,
  Target,
} from "lucide-react";

import { PublicHeader } from "../components/layout/PublicHeader";
import { PublicFooter } from "../components/layout/PublicFooter";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";

import historyImg from "../assets/brand/photography/about-people.jpg";
import labImg from "../assets/brand/photography/hero-science.jpg";

export function OurHistoryPage() {
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
              <span className="text-text-primary font-medium">Nossa História &amp; Quem Somos</span>
            </div>
          </Container>
        </div>

        {/* Hero Section */}
        <section className="py-16 md:py-24 border-b border-border-subtle bg-surface-secondary/30">
          <Container size="wide">
            <div className="max-w-3xl">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 font-heading text-xs font-semibold text-brand-green-moss hover:underline mb-6"
              >
                <Icon icon={ArrowLeft} size={14} />
                Voltar para o início
              </Link>

              <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-brand-green-moss">
                Propósito que Conecta
              </p>
              <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-text-primary md:text-5xl lg:text-6xl">
                Nossa História &amp; Quem Somos
              </h1>
              <p className="mt-6 font-body text-base md:text-xl leading-relaxed text-text-secondary">
                A jornada de construir a ponte que transforma o conhecimento produzido nas universidades em soluções de impacto tangível para o mercado e para a sociedade.
              </p>
            </div>
          </Container>
        </section>

        {/* Quem Somos - Identity Block */}
        <section id="quem-somos" className="py-16 md:py-20 border-b border-border-subtle bg-surface-primary">
          <Container size="wide">
            <div className="max-w-3xl">
              <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-brand-green-moss">
                Quem Somos
              </p>
              <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold tracking-tight text-text-primary">
                A ponte entre a excelência científica e a escala de mercado
              </h2>
              <p className="mt-4 font-body text-base md:text-lg leading-relaxed text-text-secondary">
                Somos um ecossistema integrador que conecta pesquisadores, universidades, investidores e indústrias, transformando descobertas acadêmicas em negócios sustentáveis e soluções de alto impacto econômico e social.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              <div className="rounded-2xl border border-border-subtle bg-surface-white p-6 shadow-sm">
                <div className="h-10 w-10 rounded-xl bg-brand-green-moss/10 text-brand-green-moss flex items-center justify-center mb-4">
                  <Icon icon={GraduationCap} size={20} />
                </div>
                <h3 className="font-heading font-bold text-lg text-text-primary">
                  Pesquisadores &amp; ICTs
                </h3>
                <p className="mt-2 font-body text-xs text-text-secondary leading-relaxed">
                  Conexão direta com demandas do mercado, validação de propriedade intelectual e canais estruturados para captação de recursos e P&amp;D conjunto.
                </p>
              </div>

              <div className="rounded-2xl border border-border-subtle bg-surface-white p-6 shadow-sm">
                <div className="h-10 w-10 rounded-xl bg-brand-green-moss/10 text-brand-green-moss flex items-center justify-center mb-4">
                  <Icon icon={Building2} size={20} />
                </div>
                <h3 className="font-heading font-bold text-lg text-text-primary">
                  Empresas &amp; Indústria
                </h3>
                <p className="mt-2 font-body text-xs text-text-secondary leading-relaxed">
                  Acesso ágil ao estado da arte do conhecimento acadêmico, resolvendo gargalos técnicos e acelerando o lançamento de inovações sustentáveis.
                </p>
              </div>

              <div className="rounded-2xl border border-border-subtle bg-surface-white p-6 shadow-sm">
                <div className="h-10 w-10 rounded-xl bg-brand-green-moss/10 text-brand-green-moss flex items-center justify-center mb-4">
                  <Icon icon={LineChart} size={20} />
                </div>
                <h3 className="font-heading font-bold text-lg text-text-primary">
                  Investidores &amp; Fomento
                </h3>
                <p className="mt-2 font-body text-xs text-text-secondary leading-relaxed">
                  Pipeline qualificado de deep techs e projetos científicos de alta maturidade, com métricas transparentes de TRL e CRL para mitigar riscos de investimento.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* Narrative & Story Section (3 to 4 Paragraphs) */}
        <section className="py-20">
          <Container size="wide">
            <div className="grid gap-12 lg:grid-cols-12 items-center">
              <div className="lg:col-span-7">
                <div className="prose prose-lg max-w-none space-y-6 font-body text-base md:text-lg leading-relaxed text-text-primary/90">
                  <p className="first-letter:text-5xl first-letter:font-bold first-letter:font-display first-letter:text-brand-green-dark first-letter:float-left first-letter:mr-3">
                    A ideia do <strong>The Bridge</strong> nasceu da inquietação diante de um dos maiores paradoxos do desenvolvimento nacional: o Brasil figura com destaque na produção acadêmica e científica internacional, mas historicamente enfrentou barreiras profundas para traduzir esse capital intelectual em patentes ativas, transferência de tecnologia e novos empreendimentos de alta tecnologia.
                  </p>
                  <p>
                    Percebemos que essa desconexão não decorria de falta de competência ou interesse, mas sim da ausência de uma linguagem comum. De um lado, pesquisadores e universidades enfrentavam processos burocráticos e desconheciam os gargalos urgentes das cadeias de suprimento industriais; do outro lado, empresas inovadoras operavam em prazos curtos e não possuíam mecanismos estruturados para navegar pela densa produção científica do país.
                  </p>
                  <p>
                    Foi para dissolver essa distância que concebemos a plataforma The Bridge. Criamos um ecossistema fundado em métricas objetivas — como a taxonomia padronizada de competências científicas e a calibração de maturidade tecnológica (TRL) e comercial (CRL) —, permitindo que uma necessidade corporativa encontre com precisão matemática o grupo de pesquisa mais qualificado para solucioná-la.
                  </p>
                  <p>
                    Hoje, The Bridge consolida-se como a plataforma de referência para aproximar academia, indústria, startups e investidores. Acreditamos que a ciência só atinge sua plenitude quando ultrapassa os muros dos laboratórios e se transforma em vacinas mais acessíveis, biocombustíveis eficientes, produtividade agrícola sustentável e soluções que protegem o nosso planeta.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <div className="overflow-hidden rounded-3xl border border-border-subtle bg-brand-cream aspect-[4/3] shadow-md">
                  <img
                    src={historyImg}
                    alt="Fundadores e pesquisadores do The Bridge"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-3xl border border-border-subtle bg-brand-cream aspect-[16/9] shadow-md">
                  <img
                    src={labImg}
                    alt="Laboratório científico parceiro da plataforma"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Core Values */}
        <section className="py-20 bg-surface-secondary/40 border-y border-border-subtle">
          <Container size="wide">
            <div className="text-center max-w-xl mx-auto mb-14">
              <h2 className="font-display text-3xl font-bold text-text-primary">
                Nossos Princípios Fundamentais
              </h2>
              <p className="mt-3 font-body text-sm text-text-secondary">
                O que guia cada algoritmo, linha de código e parceria que formamos.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-border-subtle bg-surface-primary p-6">
                <div className="h-10 w-10 rounded-xl bg-brand-green-moss/10 text-brand-green-moss flex items-center justify-center mb-4">
                  <Icon icon={Lightbulb} size={20} />
                </div>
                <h3 className="font-heading font-semibold text-base text-text-primary">
                  Rigor Científico
                </h3>
                <p className="mt-2 font-body text-xs text-text-secondary leading-relaxed">
                  Respeitamos os métodos e a excelência da pesquisa acadêmica como alicerce indispensável da verdadeira inovação.
                </p>
              </div>

              <div className="rounded-2xl border border-border-subtle bg-surface-primary p-6">
                <div className="h-10 w-10 rounded-xl bg-brand-green-moss/10 text-brand-green-moss flex items-center justify-center mb-4">
                  <Icon icon={Target} size={20} />
                </div>
                <h3 className="font-heading font-semibold text-base text-text-primary">
                  Impacto Real
                </h3>
                <p className="mt-2 font-body text-xs text-text-secondary leading-relaxed">
                  Buscamos soluções práticas que gerem valor econômico sustentável e benefícios diretos para a sociedade.
                </p>
              </div>

              <div className="rounded-2xl border border-border-subtle bg-surface-primary p-6">
                <div className="h-10 w-10 rounded-xl bg-brand-green-moss/10 text-brand-green-moss flex items-center justify-center mb-4">
                  <Icon icon={HeartHandshake} size={20} />
                </div>
                <h3 className="font-heading font-semibold text-base text-text-primary">
                  Confiança &amp; Sigilo
                </h3>
                <p className="mt-2 font-body text-xs text-text-secondary leading-relaxed">
                  Garantimos segurança jurídica, proteção da propriedade intelectual e conformidade absoluta em cada conexão.
                </p>
              </div>

              <div className="rounded-2xl border border-border-subtle bg-surface-primary p-6">
                <div className="h-10 w-10 rounded-xl bg-brand-green-moss/10 text-brand-green-moss flex items-center justify-center mb-4">
                  <Icon icon={Compass} size={20} />
                </div>
                <h3 className="font-heading font-semibold text-base text-text-primary">
                  Interoperabilidade
                </h3>
                <p className="mt-2 font-body text-xs text-text-secondary leading-relaxed">
                  Construímos pontes universais que integram diferentes setores produtivos, universidades públicas e privadas.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* CTA */}
        <section className="py-20">
          <Container size="narrow" className="text-center">
            <h2 className="font-display text-3xl font-bold text-text-primary">
              Faça parte da nossa história
            </h2>
            <p className="mt-4 font-body text-base text-text-secondary">
              Seja cadastrando suas pesquisas acadêmicas ou submetendo as demandas tecnológicas da sua organização.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" onClick={() => navigate("/cadastro")}>
                Criar conta gratuita
                <Icon icon={ArrowRight} size={16} />
              </Button>
            </div>
          </Container>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
