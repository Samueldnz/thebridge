import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";

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

  const featured = contentsData[0];

  return (
    <div className="min-h-screen bg-surface-primary flex flex-col justify-between">
      <PublicHeader />

      <main className="pt-[84px] lg:pt-[96px] pb-24 flex-1">
        {/* Page Header */}
        <section className="border-b border-border-subtle bg-surface-secondary/40 py-16 md:py-20">
          <Container size="wide">
            <div className="max-w-3xl">
              <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-brand-green-moss">
                Conhecimento Aplicado
              </p>
              <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-text-primary md:text-5xl lg:text-6xl">
                Conteúdos &amp; Insights
              </h1>
              <p className="mt-6 font-body text-base md:text-lg leading-relaxed text-text-secondary">
                Artigos, eventos, análises e tendências sobre inovação aberta, transferência de tecnologia, prontidão científica (TRL/CRL) e parcerias estratégicas.
              </p>

              {/* Filter Tabs */}
              <div className="mt-8 flex flex-wrap gap-2">
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

        {/* Featured Content (if on TODOS) */}
        {selectedType === "TODOS" && featured && (
          <section className="py-12 border-b border-border-subtle">
            <Container size="wide">
              <Link
                to={`/conteudos/${featured.slug}`}
                className="group grid gap-8 lg:grid-cols-12 overflow-hidden rounded-3xl border border-border-subtle bg-surface-primary p-6 md:p-8 hover:shadow-lg transition-all"
              >
                <div className="lg:col-span-7 aspect-[16/10] overflow-hidden rounded-2xl bg-brand-cream">
                  <img
                    src={featured.image}
                    alt={featured.alt}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="lg:col-span-5 flex flex-col justify-between py-2">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-brand-green-moss/10 px-3 py-1 font-body text-xs font-semibold uppercase tracking-wider text-brand-green-dark">
                        Destaque • {featured.type}
                      </span>
                      <span className="flex items-center gap-1 font-body text-xs text-text-secondary">
                        <Icon icon={Clock} size={13} />
                        {featured.readTime}
                      </span>
                    </div>

                    <h2 className="mt-4 font-display text-2xl md:text-3xl font-bold leading-snug text-text-primary group-hover:text-brand-green-moss transition-colors">
                      {featured.title}
                    </h2>

                    <p className="mt-4 font-body text-sm leading-relaxed text-text-secondary line-clamp-3">
                      {featured.summary}
                    </p>
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-border-subtle pt-4">
                    <span className="font-body text-xs text-text-secondary">
                      {featured.date}
                    </span>
                    <span className="inline-flex items-center gap-1 font-heading text-sm font-semibold text-brand-green-moss group-hover:translate-x-1 transition-transform">
                      Ler na íntegra
                      <Icon icon={ArrowRight} size={15} />
                    </span>
                  </div>
                </div>
              </Link>
            </Container>
          </section>
        )}

        {/* Contents Grid */}
        <section className="py-16">
          <Container size="wide">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredContents.map((content) => (
                <Link
                  key={content.id}
                  to={`/conteudos/${content.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface-primary hover:shadow-md transition-all"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-brand-cream">
                    <img
                      src={content.image}
                      alt={content.alt}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-brand-green-moss/10 px-3 py-1 font-body text-[11px] font-semibold uppercase tracking-wider text-brand-green-dark">
                          {content.type}
                        </span>
                        <span className="font-body text-xs text-text-muted">
                          {content.readTime}
                        </span>
                      </div>

                      <h3 className="mt-4 font-heading text-lg font-semibold leading-snug text-text-primary group-hover:text-brand-green-moss transition-colors">
                        {content.title}
                      </h3>

                      <p className="mt-3 font-body text-xs leading-relaxed text-text-secondary line-clamp-2">
                        {content.summary}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-border-subtle pt-4 font-body text-xs text-text-secondary">
                      <span>{content.date}</span>
                      <span className="inline-flex items-center gap-1 font-heading font-semibold text-brand-green-moss group-hover:translate-x-1 transition-transform">
                        Acessar
                        <Icon icon={ArrowRight} size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
