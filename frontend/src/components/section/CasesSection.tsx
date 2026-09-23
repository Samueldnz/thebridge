import { ArrowRight } from "lucide-react";

import agricultureImage from "../../assets/brand/photography/cases-agriculture.jpg";
import energyImage from "../../assets/brand/photography/cases-energy.jpg";
import healthImage from "../../assets/brand/photography/Untitled-1.jpg";

import { Button } from "../ui/Button";
import { Container } from "../ui/Container";
import { Icon } from "../ui/Icon";
import { Section } from "../ui/Section";

const cases = [
  {
    category: "Agro e biotecnologia",
    title: "Solução biotecnológica para agricultura sustentável",
    image: agricultureImage,
    alt: "Pesquisador analisando o desenvolvimento de uma cultura agrícola",
  },
  {
    category: "Energia limpa",
    title: "Tecnologia universitária impulsiona energia renovável",
    image: energyImage,
    alt: "Painéis fotovoltaicos instalados em uma área agrícola",
  },
  {
    category: "Saúde e bem-estar",
    title: "Inovação em saúde com impacto social",
    image: healthImage,
    alt: "Pesquisador trabalhando com microscópio",
  },
];

export function CasesSection() {
  return (
    <Section
      id="casos"
      spacing="xl"
      surface="primary"
    >
      <Container size="wide">
        {/* Header */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-brand-green-moss">
              Da pesquisa para a sociedade
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
              Casos que geram
              <br />
              impacto real
            </h2>

            <p className="mt-7 max-w-xl font-body text-body-md leading-7 text-text-secondary">
              Conheça iniciativas que saíram do ambiente acadêmico
              e se tornaram soluções para desafios do mundo real.
            </p>
          </div>

          <div className="shrink-0">
            <Button
              variant="secondary"
              size="lg"
            >
              Ver todos os casos

              <Icon
                icon={ArrowRight}
                size={17}
                strokeWidth={1.75}
              />
            </Button>
          </div>
        </div>

        {/* Cases */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {cases.map((item) => (
            <article
              key={item.title}
              className={[
                "group",
                "overflow-hidden",
                "border border-border-subtle",
                "bg-surface-white",
                "transition-shadow duration-300",
                "hover:shadow-md",
              ].join(" ")}
            >
              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.alt}
                  className={[
                    "h-full w-full object-cover",
                    "transition-transform duration-500",
                    "group-hover:scale-[1.03]",
                  ].join(" ")}
                />
              </div>

              {/* Content */}
              <div className="flex min-h-[250px] flex-col p-6 md:p-7">
                <span className="inline-flex w-fit rounded-full bg-brand-green-moss/10 px-4 py-2 font-body text-[10px] font-medium uppercase tracking-[0.08em] text-brand-green-dark">
                  {item.category}
                </span>

                <h3
                  className={[
                    "mt-5",
                    "font-heading text-xl font-semibold",
                    "leading-7 tracking-[-0.02em]",
                    "text-text-primary",
                  ].join(" ")}
                >
                  {item.title}
                </h3>

                <a
                  href="#"
                  className={[
                    "mt-auto inline-flex w-fit items-center gap-2 pt-8",
                    "font-heading text-sm font-semibold",
                    "text-text-primary",
                    "transition-colors duration-200",
                    "hover:text-brand-green-moss",
                  ].join(" ")}
                >
                  Ver caso

                  <Icon
                    icon={ArrowRight}
                    size={16}
                    strokeWidth={1.75}
                  />
                </a>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}