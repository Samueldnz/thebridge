import { ArrowRight } from "lucide-react";

import ctaImage from "../../assets/brand/photography/about-people.jpg";

import { Button } from "../ui/Button";
import { Container } from "../ui/Container";
import { Icon } from "../ui/Icon";
import { Section } from "../ui/Section";

export function CallToActionSection() {
  return (
    <Section
      id="contato"
      spacing="xl"
      surface="primary"
      className="overflow-hidden"
    >
      <Container size="wide">
        <div className="relative min-h-[560px] overflow-hidden rounded-[2rem] bg-brand-green-dark">
          {/* Background image */}
          <div className="absolute inset-0">
            <img
              src={ctaImage}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-center opacity-40"
            />

            {/* Readability gradient */}
            <div
              aria-hidden="true"
              className={[
                "absolute inset-0",
                "bg-gradient-to-r",
                "from-brand-green-dark",
                "via-brand-green-dark/90",
                "to-brand-green-dark/20",
              ].join(" ")}
            />
          </div>

          {/* Circular graphic treatment */}
          <div
            aria-hidden="true"
            className={[
              "pointer-events-none absolute",
              "-right-[12%] -top-[35%]",
              "h-[125%] w-[75%]",
              "rounded-full",
              "border border-brand-white/30",
            ].join(" ")}
          />

          <div
            aria-hidden="true"
            className={[
              "pointer-events-none absolute",
              "-right-[5%] -top-[28%]",
              "h-[115%] w-[68%]",
              "rounded-full",
              "border border-brand-white/20",
            ].join(" ")}
          />

          {/* Content */}
          <div className="relative z-10 flex min-h-[560px] items-center px-6 py-20 md:px-12 lg:px-16">
            <div className="max-w-2xl">
              <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-brand-cream">
                Faça parte dessa transformação
              </p>

              <h2
                className={[
                  "mt-5",
                  "font-display font-bold",
                  "text-display-sm md:text-display-md lg:text-display-lg",
                  "leading-[1.02]",
                  "tracking-[-0.03em]",
                  "text-brand-off-white",
                ].join(" ")}
              >
                Vamos construir
                <br />
                juntos o próximo capítulo?
              </h2>

              <p className="mt-7 max-w-xl font-body text-body-md leading-7 text-brand-off-white/80">
                Seja parte de um ecossistema que conecta ciência,
                inovação e impacto real.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="inverse"
                  size="lg"
                >
                  Criar conta

                  <Icon
                    icon={ArrowRight}
                    size={17}
                    strokeWidth={1.75}
                  />
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  className="border-brand-off-white/50 text-brand-off-white hover:bg-brand-off-white hover:text-brand-green-dark"
                >
                  Falar com o time
                </Button>
              </div>
            </div>
          </div>

          {/* Editorial keywords */}
          <div className="absolute bottom-10 right-8 z-20 hidden md:block lg:right-12">
            <p className="font-body text-xs uppercase leading-6 tracking-[0.1em] text-brand-white">
              Mais
              <br />
              conexões
              <br />
              mais soluções
              <br />
              mais impacto
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}