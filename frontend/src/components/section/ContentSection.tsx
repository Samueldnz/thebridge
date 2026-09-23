import { useNavigate, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { Button } from "../ui/Button";
import { Container } from "../ui/Container";
import { Icon } from "../ui/Icon";
import { Section } from "../ui/Section";
import { contentsData } from "../../data/contentsData";

export function ContentSection() {
  const navigate = useNavigate();

  return (
    <Section
      id="conteudos"
      spacing="xl"
      surface="primary"
    >
      <Container size="wide">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          {/* Intro */}
          <div className="lg:col-span-4">
            <div className="max-w-md">
              <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-brand-green-moss">
                Ideias que impulsionam
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
                Conteúdos para
                <br />
                inspirar e construir
              </h2>

              <p className="mt-7 max-w-md font-body text-body-md leading-7 text-text-secondary">
                Artigos, eventos, histórias e insights sobre inovação,
                ciência e impacto.
              </p>

              <div className="mt-8">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate("/conteudos")}
                >
                  Ver todos os conteúdos

                  <Icon
                    icon={ArrowRight}
                    size={17}
                    strokeWidth={1.75}
                  />
                </Button>
              </div>
            </div>
          </div>

          {/* Content cards */}
          <div className="lg:col-span-8">
            <div className="grid gap-6 md:grid-cols-3">
              {contentsData.map((content) => (
                <Link
                  key={content.id}
                  to={`/conteudos/${content.slug}`}
                  className={[
                    "group block",
                    "overflow-hidden",
                    "border border-border-subtle",
                    "bg-surface-white",
                    "transition-all duration-300",
                    "hover:shadow-lg hover:border-brand-green-moss/40",
                  ].join(" ")}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-brand-cream">
                    <img
                      src={content.image}
                      alt={content.alt}
                      className={[
                        "h-full w-full",
                        "object-cover",
                        "transition-transform duration-500",
                        "group-hover:scale-[1.03]",
                      ].join(" ")}
                    />
                  </div>

                  <div className="flex min-h-[230px] flex-col p-6">
                    <span className="inline-flex w-fit rounded-full bg-brand-green-moss/10 px-4 py-2 font-body text-[10px] font-medium uppercase tracking-[0.08em] text-brand-green-dark">
                      {content.type}
                    </span>

                    <h3 className="mt-5 font-heading text-lg font-semibold leading-6 tracking-[-0.02em] text-text-primary group-hover:text-brand-green-moss transition-colors">
                      {content.title}
                    </h3>

                    <time className="mt-auto pt-8 font-body text-xs text-text-secondary">
                      {content.date}
                    </time>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}