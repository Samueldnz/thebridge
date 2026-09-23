import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Network,
  Target,
  TrendingUp,
} from "lucide-react";

import { Button } from "../ui/Button";
import { Container } from "../ui/Container";
import { Icon } from "../ui/Icon";
import { Section } from "../ui/Section";

const solutions = [
  {
    title: "Conectar",
    description:
      "Aproximamos talentos, instituições e oportunidades em um ecossistema vivo.",
    icon: Network,
  },
  {
    title: "Acelerar",
    description:
      "Oferecemos suporte para transformar ideias em projetos viáveis.",
    icon: Target,
  },
  {
    title: "Escalar",
    description:
      "Impulsionamos soluções com impacto real na sociedade e no mercado.",
    icon: TrendingUp,
  },
];

export function SolutionsSection() {
  const navigate = useNavigate();

  return (
    <Section
      id="solucoes"
      spacing="xl"
      surface="primary"
    >
      <Container size="wide">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          {/* Intro */}
          <div className="lg:col-span-5">
            <div className="max-w-xl">
              <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-brand-green-moss">
                Soluções para cada etapa da jornada
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
                Do potencial
                <br />
                à transformação
              </h2>

              <p className="mt-7 max-w-lg font-body text-body-md leading-7 text-text-secondary">
                Nossas soluções conectam pessoas, recursos e conhecimento
                para acelerar a inovação e gerar impacto.
              </p>

              <div className="mt-8">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate("/solucoes")}
                >
                  Explorar todas as soluções

                  <Icon
                    icon={ArrowRight}
                    size={17}
                    strokeWidth={1.75}
                  />
                </Button>
              </div>

            </div>
          </div>

          {/* Solutions */}
          <div className="lg:col-span-7">
            <div className="grid md:grid-cols-3">
              {solutions.map((solution, index) => (
                <article
                  key={solution.title}
                  className={[
                    "group",
                    "relative",
                    "py-2 md:px-7 md:py-0",
                    index > 0
                      ? "mt-10 border-t border-border-subtle pt-10 md:mt-0 md:border-l md:border-t-0 md:pt-0"
                      : "",
                  ].join(" ")}
                >
                  {/* Icon */}
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-green-moss/10">
                    <Icon
                      icon={solution.icon}
                      size={34}
                      strokeWidth={1.5}
                      className="text-brand-green-dark"
                    />
                  </div>

                  {/* Content */}
                  <h3 className="mt-7 font-heading text-xl font-semibold tracking-[-0.02em] text-text-primary">
                    {solution.title}
                  </h3>

                  <p className="mt-4 max-w-[220px] font-body text-sm leading-6 text-text-secondary">
                    {solution.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}