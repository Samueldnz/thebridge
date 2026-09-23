import {
  ArrowRight,
  Building2,
  GraduationCap,
  Landmark,
  LineChart,
} from "lucide-react";

import ecosystemLogo from "../../assets/brand/logo/TheBridge_Logotipo_Perfil.svg";

import { Button } from "../ui/Button";
import { Container } from "../ui/Container";
import { Icon } from "../ui/Icon";
import { Section } from "../ui/Section";

const ecosystemNodes = [
  {
    label: "Universidades\ne ICTs",
    icon: GraduationCap,
    position: "top",
  },
  {
    label: "Empresas",
    icon: Building2,
    position: "right",
  },
  {
    label: "Governo",
    icon: Landmark,
    position: "bottom",
  },
  {
    label: "Investidores",
    icon: LineChart,
    position: "left",
  },
] as const;

export function EcosystemSection() {
  return (
    <Section
      id="ecossistema"
      spacing="xl"
      surface="primary"
    >
      <Container size="wide">
        <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-10">
          {/* Intro */}
          <div className="lg:col-span-5">
            <div className="max-w-xl">
              <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-brand-green-moss">
                Juntos somos mais longe
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
                Um ecossistema
                <br />
                que faz a diferença
              </h2>

              <p className="mt-7 max-w-lg font-body text-body-md leading-7 text-text-secondary">
                Universidades, empresas, investidores e governo
                trabalhando juntos por um futuro mais inovador,
                sustentável e inclusivo.
              </p>

              <div className="mt-8">
                <Button
                  variant="secondary"
                  size="lg"
                >
                  Conheça o ecossistema

                  <Icon
                    icon={ArrowRight}
                    size={17}
                    strokeWidth={1.75}
                  />
                </Button>
              </div>
            </div>
          </div>

          {/* Ecosystem graph */}
          <div className="lg:col-span-7">
            <div
              className={[
                "relative mx-auto",
                "aspect-square",
                "w-full",
                "max-w-[620px]",
                "lg:max-w-[680px]",
                "lg:aspect-square",
              ].join(" ")}
            >
              {/* Connection system */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0"
              >
                {/* Outer ring */}
                <div
                  className={[
                    "absolute inset-[7%]",
                    "rounded-full",
                    "border border-brand-earth/15",
                  ].join(" ")}
                />

                {/* Inner ring */}
                <div
                  className={[
                    "absolute inset-[19%]",
                    "rounded-full",
                    "border border-brand-earth/15",
                  ].join(" ")}
                />

                {/* Horizontal axis */}
                <div
                  className={[
                    "absolute left-[7%] right-[7%] top-1/2",
                    "h-px -translate-y-1/2",
                    "bg-brand-earth/10",
                  ].join(" ")}
                />

                {/* Vertical axis */}
                <div
                  className={[
                    "absolute bottom-[7%] top-[7%] left-1/2",
                    "w-px -translate-x-1/2",
                    "bg-brand-earth/10",
                  ].join(" ")}
                />

                {/* Animated orbital arc */}
                <div
                  className={[
                    "absolute inset-[7%]",
                    "rounded-full",
                    "border border-transparent",
                    "border-t-brand-green-moss/30",
                    "border-r-brand-green-moss/10",
                    "animate-[spin_32s_linear_infinite]",
                  ].join(" ")}
                />
              </div>

              {/* Center */}
              <div
                className={[
                  "absolute left-1/2 top-1/2 z-20",
                  "h-[30%] w-[30%]",
                  "-translate-x-1/2 -translate-y-1/2",
                  "overflow-hidden rounded-full",
                  "bg-brand-green-dark",
                  "shadow-lg",
                  "md:h-[34%] md:w-[34%]",
                ].join(" ")}
              >
                <img
                  src={ecosystemLogo}
                  alt="The Bridge"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Ecosystem nodes */}
              {ecosystemNodes.map((node) => {
                const positionClasses = {
                    top: [
                        "left-1/2 top-[1%]",
                        "-translate-x-1/2",
                    ].join(" "),

                    right: [
                        "right-[1%] top-1/2",
                        "-translate-y-1/2",
                    ].join(" "),

                    bottom: [
                        "bottom-[1%] left-1/2",
                        "-translate-x-1/2",
                    ].join(" "),

                    left: [
                        "left-[1%] top-1/2",
                        "-translate-y-1/2",
                    ].join(" "),
                    };

                return (
                  <div
                    key={node.position}
                    className={[
                      "absolute z-20",
                      positionClasses[node.position],
                      "flex flex-col items-center",
                    ].join(" ")}
                  >
                    {/* Node */}
                    <div
                      className={[
                        "flex items-center justify-center",
                        "rounded-full",
                        "bg-brand-off-white",
                        "shadow-[0_0_0_1px_rgba(93,82,75,0.04)]",
                        "h-[72px] w-[72px]",
                        "md:h-32 md:w-32",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "flex h-full w-full items-center justify-center",
                          "rounded-full",
                          "bg-brand-green-moss/10",
                        ].join(" ")}
                      >
                        <Icon
                          icon={node.icon}
                          size={30}
                          strokeWidth={1.5}
                          className="text-brand-green-dark md:h-10 md:w-10"
                        />
                      </div>
                    </div>

                    {/* Label */}
                    <p
                      className={[
                        "mt-2",
                        "w-[92px]",
                        "whitespace-pre-line",
                        "text-center",
                        "font-heading text-[11px] font-semibold leading-[1.25]",
                        "text-text-primary",
                        "md:mt-4 md:w-auto md:text-sm md:leading-5",
                      ].join(" ")}
                    >
                      {node.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}