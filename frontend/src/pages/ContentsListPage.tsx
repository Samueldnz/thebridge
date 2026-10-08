import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, User, Calendar } from "lucide-react";

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
        {/* Page Header (Sem a caixa de 'CONHECIMENTO APLICADO') */}
        <section className="border-b border-border-subtle bg-surface-secondary/40 py-12 md:py-16">
          <Container size="wide">
            <div className="max-w-3xl">
              <h1 className="font-display text-4xl font-bold tracking-tight text-text-primary md:text-5xl lg:text-6xl">
                Conteúdos &amp; Insights
              </h1>
              <p className="mt-4 font-body text-base md:text-lg leading-relaxed text-text-secondary">
                Artigos, eventos, análises e tendências sobre inovação aberta, transferência de tecnologia, prontidão científica (TRL/CRL) e parcerias estratégicas.
              </p>

              {/* Filter Tabs */}
              <div className="mt-8 flex flex-wrap items-center gap-2">
                {types.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={[
                      "rounded-full px-5 py-2 font-heading text-xs font-semibold uppercase tracking-wider transition-all",
                      selectedType === type
                        ? "bg-brand-green-dark text-brand-off-white shadow-sm"
                        : "bg-surface-primary border border-border-subtle text-text-secondary hover:text-text-primary hover:border-brand-green-moss/50",
                    ].join(" ")}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* Contents List (Formato de Lista) */}
        <section className="py-12 md:py-16">
          <Container size="wide">
            <div className="mb-6 flex items-center justify-between text-xs text-text-secondary font-mono">
              <span>
                Exibindo {filteredContents.length} {filteredContents.length === 1 ? "publicação" : "publicações"}
                {selectedType !== "TODOS" && ` em "${selectedType}"`}
              </span>
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

                      {/* Footer Actions */}
                      <div className="mt-6 pt-4 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          <Icon icon={User} size={14} className="text-brand-green-moss shrink-0" />
                          <span>
                            Por <strong className="text-text-primary font-medium">{content.author}</strong>
                            {content.authorRole && (
                              <span className="text-text-secondary/70"> ({content.authorRole})</span>
                            )}
                          </span>
                        </div>

                        <Link
                          to={`/conteudos/${content.slug}`}
                          className="inline-flex items-center gap-1.5 font-heading text-xs md:text-sm font-semibold text-brand-green-moss group-hover:translate-x-1 transition-transform self-start sm:self-auto"
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
