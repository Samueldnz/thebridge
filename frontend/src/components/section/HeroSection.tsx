import { ArrowRight } from "lucide-react";

import heroScience from "../../assets/brand/photography/hero-science.jpg";

import { Button } from "../ui/Button";
import { Container } from "../ui/Container";
import { Icon } from "../ui/Icon";
import { Section } from "../ui/Section";

export function HeroSection() {
  return (
    <Section
      spacing="lg"
      className="overflow-hidden"
    >
      <Container size="wide">
        <div className="grid min-h-[680px] items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Content */}
          <div className="relative z-10 lg:col-span-6">
            <div className="max-w-2xl">
              <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-brand-green-moss">
                Conhecimento que transforma
              </p>

              <h1
                className={[
                  "mt-5",
                  "font-display font-bold",
                  "text-display-md md:text-display-lg",
                  "text-text-primary",
                  "tracking-[-0.03em]",
                ].join(" ")}
              >
                Da ciência
                <br />
                ao impacto real.
              </h1>

              <p className="mt-8 max-w-xl font-body text-body-lg text-text-secondary">
                Conectamos universidades, empresas, investidores e
                governo para transformar conhecimento em soluções que
                geram impacto no mundo real.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button size="lg">
                  Conheça nossas soluções

                  <Icon
                    icon={ArrowRight}
                    size={17}
                    strokeWidth={1.75}
                  />
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                >
                  Faça parte do ecossistema
                </Button>
              </div>
            </div>
          </div>

          {/* Image / Brand graphic */}
          <div className="relative lg:col-span-6">
            <div className="relative mx-auto w-full max-w-[620px]">
              {/* Outer circular treatment */}
              <div
                aria-hidden="true"
                className={[
                  "pointer-events-none absolute",
                  "-inset-[8%]",
                  "rounded-full",
                  "border border-brand-green-moss/40",
                ].join(" ")}
              />

              {/* Secondary circular line */}
              <div
                aria-hidden="true"
                className={[
                  "pointer-events-none absolute",
                  "inset-[5%]",
                  "rounded-full",
                  "border border-brand-white/50",
                  "z-10",
                ].join(" ")}
              />

              {/* Image */}
              <div
                className={[
                  "relative",
                  "aspect-square",
                  "overflow-hidden",
                  "rounded-full",
                  "bg-brand-cream",
                ].join(" ")}
              >
                <img
                  src={heroScience}
                  alt="Pesquisador trabalhando com microscópio"
                  className={[
                    "h-full",
                    "w-full",
                    "object-cover",
                    "object-center",
                  ].join(" ")}
                />

                {/* Subtle brand overlay */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-brand-green-dark/10"
                />
              </div>

              {/* Circular graphic crossing the image */}
              <div
                aria-hidden="true"
                className={[
                  "pointer-events-none absolute",
                  "-right-[7%]",
                  "top-[18%]",
                  "h-[64%]",
                  "w-[64%]",
                  "rounded-full",
                  "border border-brand-white/50",
                ].join(" ")}
              />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}