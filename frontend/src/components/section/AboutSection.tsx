import { ArrowRight } from "lucide-react";

import aboutImage from "../../assets/brand/photography/about-people.jpg";

import { Button } from "../ui/Button";
import { Container } from "../ui/Container";
import { Icon } from "../ui/Icon";
import { Section } from "../ui/Section";

export function AboutSection() {
  return (
    <Section
      id="sobre"
      spacing="xl"
      surface="primary"
      className="overflow-hidden"
    >
      <Container size="wide">
        <div className="grid items-center lg:grid-cols-12">
          {/* Content */}
          <div className="relative z-10 lg:col-span-6">
            <div className="max-w-xl">
              <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-brand-green-moss">
                Propósito que conecta
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
                Uma ponte para
                <br />
                um futuro melhor
              </h2>

              <p className="mt-7 max-w-xl font-body text-body-md leading-7 text-text-secondary">
                Acreditamos no poder da colaboração para transformar
                conhecimento em soluções que geram impacto positivo
                na sociedade, na economia e no planeta.
              </p>

              <div className="mt-8">
                <Button size="lg">
                  Nossa história

                  <Icon
                    icon={ArrowRight}
                    size={17}
                    strokeWidth={1.75}
                  />
                </Button>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative mt-14 lg:col-span-6 lg:mt-0">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[620px] lg:aspect-[5/6]">
              {/* Graphic rings */}
              <div
                aria-hidden="true"
                className={[
                  "pointer-events-none absolute",
                  "-inset-[10%]",
                  "z-10",
                  "rounded-full",
                  "border border-brand-white/70",
                ].join(" ")}
              />

              <div
                aria-hidden="true"
                className={[
                  "pointer-events-none absolute",
                  "inset-[5%]",
                  "z-10",
                  "rounded-full",
                  "border border-brand-white/50",
                ].join(" ")}
              />

              {/* Image */}
              <div className="relative h-full w-full overflow-hidden rounded-[50%_50%_50%_0] bg-brand-cream">
                <img
                  src={aboutImage}
                  alt="Profissional em ambiente natural"
                  className="h-full w-full object-cover object-center"
                />

                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-brand-green-dark/5"
                />
              </div>

              {/* Editorial keywords */}
              <div className="absolute bottom-[12%] right-[4%] z-20">
                <p className="font-body text-[11px] uppercase leading-5 tracking-[0.1em] text-brand-white">
                  Pessoas
                  <br />
                  Ideias
                  <br />
                  Parcerias
                  <br />
                  Impacto
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}