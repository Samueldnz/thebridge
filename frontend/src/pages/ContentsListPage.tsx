import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Calendar } from "lucide-react";

import { PublicHeader } from "../components/layout/PublicHeader";
import { PublicFooter } from "../components/layout/PublicFooter";
import { Container } from "../components/ui/Container";
import { Icon } from "../components/ui/Icon";
import { contentsData } from "../data/contentsData";

export function ContentsListPage() {
  const [selectedType, setSelectedType] = useState<string>("TODOS");

  const types = ["TODOS", "Artigo", "Evento", "Insights"];

  const filteredContents =
    selectedType === "TODOS"
      ? contentsData
      : contentsData.filter((item) => item.type === selectedType);

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
              <span className="text-text-primary font-medium">Conteúdos</span>
            </div>
          </Container>
        </div>

        {/* Contents List (Formato de Lista) */}
        <section className="py-8 md:py-12">
          <Container size="wide">
            {/* Filter Tabs & Counter */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle pb-6">
              <div className="flex flex-wrap items-center gap-2">
                {types.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={[
                      "rounded-full px-5 py-2 font-heading text-xs font-semibold uppercase tracking-wider transition-all",
                      selectedType === type
                        ? "bg-brand-green-dark text-brand-off-white shadow-sm"
                        : "bg-surface-white border border-border-subtle text-text-secondary hover:text-text-primary hover:border-brand-green-moss/50",
                    ].join(" ")}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="text-xs text-text-secondary font-mono">
                Exibindo {filteredContents.length} {filteredContents.length === 1 ? "publicação" : "publicações"}
                {selectedType !== "TODOS" && ` em "${selectedType}"`}
              </div>
            </div>

            <div className="space-y-6">
              {filteredContents.map((content) => (
                <article
                  key={content.id}
                  className="group rounded-3xl border border-border-subtle bg-surface-white p-5 md:p-7 shadow-xs hover:shadow-lg hover:border-brand-green-moss/40 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                    {/* Thumbnail Image */}
                    <div className="w-full md:w-72 lg:w-80 aspect-[16/10] shrink-0 overflow-hidden rounded-2xl bg-brand-cream border border-border-subtle">
                      <img
                        src={content.image}
                        alt={content.alt}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>

                    {/* Information Body */}
                    <div className="flex-1 flex flex-col justify-between self-stretch min-w-0">
                      <div>
                        {/* Meta Tags */}
                        <div className="flex flex-wrap items-center gap-2.5 pb-2">
                          <span className="rounded-full bg-brand-green-moss/10 px-3 py-0.5 font-body text-[11px] font-semibold uppercase tracking-wider text-brand-green-dark border border-brand-green-moss/20">
                            {content.type}
                          </span>
                          <span className="text-text-secondary text-xs flex items-center gap-1 font-body">
                            <Icon icon={Clock} size={13} />
                            {content.readTime}
                          </span>
                          <span className="text-text-secondary/40 text-xs">•</span>
                          <span className="text-text-secondary text-xs flex items-center gap-1 font-body">
                            <Icon icon={Calendar} size={13} />
                            {content.date}
                          </span>
                        </div>

                        {/* Title */}
                        <Link to={`/conteudos/${content.slug}`}>
                          <h2 className="font-heading text-xl md:text-2xl font-bold text-text-primary group-hover:text-brand-green-moss transition-colors leading-snug mt-1">
                            {content.title}
                          </h2>
                        </Link>

                        {/* Summary */}
                        <p className="mt-3 font-body text-sm text-text-secondary leading-relaxed line-clamp-2 md:line-clamp-3">
                          {content.summary}
                        </p>

                        {/* Tag Pills */}
                        {content.tags && content.tags.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {content.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-md bg-surface-primary px-2 py-0.5 text-[11px] font-mono font-medium text-text-secondary border border-border-subtle"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer Actions (Sem 'Por ...') */}
                      <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-end">
                        <Link
                          to={`/conteudos/${content.slug}`}
                          className="inline-flex items-center gap-1.5 font-heading text-xs md:text-sm font-semibold text-brand-green-moss group-hover:translate-x-1 transition-transform"
                        >
                          Ler publicação completa
                          <Icon icon={ArrowRight} size={15} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              {filteredContents.length === 0 && (
                <div className="rounded-3xl border border-dashed border-border-subtle bg-surface-white p-12 text-center">
                  <p className="font-heading text-lg font-semibold text-text-primary">
                    Nenhum conteúdo encontrado nesta categoria.
                  </p>
                  <p className="mt-2 font-body text-sm text-text-secondary">
                    Tente selecionar outra categoria de filtro acima.
                  </p>
                </div>
              )}
            </div>
          </Container>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
