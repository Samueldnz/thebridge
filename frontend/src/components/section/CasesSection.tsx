import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import agricultureImage from "../../assets/brand/photography/cases-agriculture.jpg";
import energyImage from "../../assets/brand/photography/cases-energy.jpg";
import healthImage from "../../assets/brand/photography/Untitled-1.jpg";

import { Button } from "../ui/Button";
import { Container } from "../ui/Container";
import { Icon } from "../ui/Icon";
import { Section } from "../ui/Section";

const matchingFeatures = [
  {
    category: "Algoritmo de Compatibilidade",
    title: "Matching Ponderado (Competências, TRL & CRL)",
    description:
      "Cálculo automatizado que avalia a aderência de competências técnicas (60%), prontidão tecnológica TRL (20%) e maturidade comercial CRL (20%), eliminando semanas de busca manual.",
    image: energyImage,
    alt: "Infraestrutura tecnológica e científica representando matching inteligente",
    link: "/matching",
  },
  {
    category: "Propriedade Intelectual",
    title: "Curadoria & Homologação de Patentes",
    description:
      "Mapeamento rigoroso de patentes concedidas ou em depósito, requisitos regulatórios e áreas de pesquisa aplicada para empresas e corporações inovadoras.",
    image: agricultureImage,
    alt: "Pesquisa aplicada em biotecnologia e inovação sustentável",
    link: "/matching",
  },
  {
    category: "Transferência Tecnológica",
    title: "Conexão Direta & Homologação Ágil",
    description:
      "Estruturação de parcerias estratégicas, licenciamento ágil de tecnologias e colaboração científica contínua entre grupos de pesquisa e o setor produtivo.",
    image: healthImage,
    alt: "Pesquisador trabalhando em laboratório de vanguarda",
    link: "/matching",
  },
];

export function CasesSection() {
  const navigate = useNavigate();

  return (
    <Section
      id="matching"
      spacing="xl"
      surface="primary"
    >
      <Container size="wide">
        {/* Header */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-brand-green-moss">
              Inteligência &amp; Propósito
            </p>

            <h2
              className={[
                "mt-5",
                "font-display font-bold",
                "text-display-sm md:text-display-md",
                "leading-[1.02]",
                "tracking-[-0.03em]",
                "text-text-primary",
              ].join(" ")}
            >
              Serviços de Matching
            </h2>

            <p className="mt-7 max-w-xl font-body text-body-md leading-7 text-text-secondary">
              Conheça o motor de matchmaking da The Bridge e a nossa tecnologia
              para construir a ponte estratégica entre a ciência das universidades
              e a capacidade de escala do mercado.
            </p>
          </div>

          <div className="shrink-0">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/matching")}
            >
              Conhecer o Matching
              <Icon
                icon={ArrowRight}
                size={17}
                strokeWidth={1.75}
              />
            </Button>
          </div>
        </div>

        {/* Features / Quem Somos Cards */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {matchingFeatures.map((item) => (
            <article
              key={item.title}
              onClick={() => navigate(item.link)}
              className={[
                "group cursor-pointer",
                "overflow-hidden",
                "border border-border-subtle",
                "bg-surface-white",
                "transition-all duration-300",
                "hover:shadow-lg hover:border-brand-green-moss/40",
              ].join(" ")}
            >
              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden bg-brand-cream">
                <img
                  src={item.image}
                  alt={item.alt}
                  className={[
                    "h-full w-full",
                    "object-cover",
                    "transition-transform duration-500",
                    "group-hover:scale-[1.03]",
                  ].join(" ")}
                />
              </div>

              {/* Content */}
              <div className="p-8">
                <p className="font-body text-xs font-medium uppercase tracking-[0.08em] text-brand-green-moss">
                  {item.category}
                </p>

                <h3
                  className={[
                    "mt-4",
                    "font-display font-bold",
                    "text-xl",
                    "leading-snug",
                    "tracking-[-0.02em]",
                    "text-text-primary",
                    "transition-colors duration-200",
                    "group-hover:text-brand-green-moss",
                  ].join(" ")}
                >
                  {item.title}
                </h3>

                <p className="mt-4 font-body text-xs leading-relaxed text-text-secondary">
                  {item.description}
                </p>

                <div className="mt-6 flex items-center gap-1 font-heading text-xs font-semibold text-brand-green-moss group-hover:translate-x-1 transition-transform">
                  <span>Saiba mais</span>
                  <Icon icon={ArrowRight} size={14} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}