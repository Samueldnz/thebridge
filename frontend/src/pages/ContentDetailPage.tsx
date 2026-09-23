import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Share2, Tag, ArrowRight } from "lucide-react";

import { PublicHeader } from "../components/layout/PublicHeader";
import { PublicFooter } from "../components/layout/PublicFooter";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { contentsData } from "../data/contentsData";

export function ContentDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const content = contentsData.find(
    (item) => item.slug === slug || item.id === slug
  );

  if (!content) {
    return (
      <div className="min-h-screen bg-surface-primary flex flex-col justify-between">
        <PublicHeader />
        <main className="pt-32 pb-20 flex-1">
          <Container size="narrow" className="text-center">
            <h1 className="font-display text-3xl font-bold text-text-primary">
              Conteúdo não encontrado
            </h1>
            <p className="mt-4 font-body text-text-secondary">
              O artigo ou publicação que você está procurando não existe ou foi removido.
            </p>
            <div className="mt-8">
              <Button onClick={() => navigate("/conteudos")}>
                <Icon icon={ArrowLeft} size={16} />
                Ver todos os conteúdos
              </Button>
            </div>
          </Container>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const relatedContents = contentsData.filter((item) => item.id !== content.id);

  return (
    <div className="min-h-screen bg-surface-primary flex flex-col justify-between">
      <PublicHeader />

      <main className="pt-[84px] lg:pt-[96px] pb-24 flex-1">
        {/* Breadcrumb & Navigation */}
        <div className="border-b border-border-subtle bg-surface-primary py-4">
          <Container size="wide">
            <div className="flex items-center gap-2 font-body text-xs text-text-secondary">
              <Link to="/" className="hover:text-brand-green-moss">
                Início
              </Link>
              <span>/</span>
              <Link to="/conteudos" className="hover:text-brand-green-moss">
                Conteúdos
              </Link>
              <span>/</span>
              <span className="text-text-primary font-medium truncate max-w-xs md:max-w-md">
                {content.title}
              </span>
            </div>
          </Container>
        </div>

        {/* Article Header */}
        <article className="pt-10 md:pt-14">
          <Container size="narrow">
            <Link
              to="/conteudos"
              className="inline-flex items-center gap-1.5 font-heading text-xs font-semibold text-brand-green-moss hover:underline mb-6"
            >
              <Icon icon={ArrowLeft} size={14} />
              Voltar para todos os conteúdos
            </Link>

            <div className="flex items-center gap-3">
              <span className="rounded-full bg-brand-green-moss/10 px-3.5 py-1 font-body text-xs font-semibold uppercase tracking-wider text-brand-green-dark">
                {content.type}
              </span>
              <span className="flex items-center gap-1 font-body text-xs text-text-secondary">
                <Icon icon={Clock} size={13} />
                {content.readTime}
              </span>
            </div>

            <h1 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-text-primary md:text-5xl">
              {content.title}
            </h1>

            <p className="mt-6 font-body text-base md:text-lg leading-relaxed text-text-secondary border-l-2 border-brand-green-moss pl-4 italic">
              {content.summary}
            </p>

            {/* Author info & Metadata */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-border-subtle py-4 font-body text-xs text-text-secondary">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-brand-green-dark text-brand-cream flex items-center justify-center font-heading font-bold text-sm">
                  TB
                </div>
                <div>
                  <p className="font-heading font-semibold text-text-primary text-sm">
                    {content.author}
                  </p>
                  <p className="text-text-secondary">{content.authorRole}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Icon icon={Calendar} size={14} />
                  {content.date}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    alert("Link do artigo copiado para a área de transferência!");
                  }}
                  className="inline-flex items-center gap-1 text-text-primary hover:text-brand-green-moss"
                >
                  <Icon icon={Share2} size={14} />
                  Compartilhar
                </button>
              </div>
            </div>
          </Container>

          {/* Featured Image - Alinhado à largura do texto e centralizado */}
          <Container size="narrow" className="mt-10">
            <div className="overflow-hidden rounded-3xl border border-border-subtle aspect-[16/9] max-h-[480px] bg-brand-cream mx-auto w-full">
              <img
                src={content.image}
                alt={content.alt}
                className="h-full w-full object-cover"
              />
            </div>
          </Container>


          {/* Article Body - 2 to 3 Paragraphs */}
          <Container size="narrow" className="mt-12">
            <div className="prose prose-lg max-w-none space-y-6 font-body text-base md:text-lg leading-relaxed text-text-primary/90">
              {content.paragraphs.map((p, idx) => (
                <p key={idx} className="first-letter:text-4xl first-letter:font-bold first-letter:font-display first-letter:text-brand-green-dark first-letter:float-left first-letter:mr-2">
                  {p}
                </p>
              ))}
            </div>

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-border-subtle flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 font-heading text-xs font-semibold uppercase text-text-secondary mr-2">
                <Icon icon={Tag} size={13} />
                Tags:
              </span>
              {content.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-surface-secondary px-3 py-1 font-body text-xs text-text-secondary"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* CTA Box */}
            <div className="mt-12 rounded-2xl bg-brand-green-dark p-8 text-brand-off-white">
              <h3 className="font-display text-2xl font-bold">
                Conecte sua pesquisa ou demanda tecnológica
              </h3>
              <p className="mt-2 font-body text-sm text-brand-off-white/80">
                O The Bridge aproxima pesquisadores e empresas com algoritmos de compatibilidade dedicados a TRL, CRL e patentes.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button
                  variant="inverse"
                  size="md"
                  onClick={() => navigate("/cadastro")}
                >
                  Criar conta gratuita
                  <Icon icon={ArrowRight} size={15} />
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  className="border-brand-off-white/40 text-brand-off-white hover:bg-brand-off-white hover:text-brand-green-dark"
                  onClick={() => navigate("/matching")}
                >
                  Conheça o Matching
                </Button>
              </div>
            </div>
          </Container>
        </article>

        {/* Related Contents Section */}
        {relatedContents.length > 0 && (
          <section className="mt-24 border-t border-border-subtle pt-16 bg-surface-secondary/30">
            <Container size="wide">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="font-heading text-xs font-semibold uppercase tracking-wider text-brand-green-moss">
                    Mais ideias
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-bold text-text-primary">
                    Outros conteúdos recomendados
                  </h2>
                </div>
                <Link
                  to="/conteudos"
                  className="font-heading text-sm font-semibold text-brand-green-moss hover:underline"
                >
                  Ver todos &rarr;
                </Link>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {relatedContents.map((item) => (
                  <Link
                    key={item.id}
                    to={`/conteudos/${item.slug}`}
                    className="group flex flex-col md:flex-row overflow-hidden rounded-2xl border border-border-subtle bg-surface-primary hover:shadow-md transition-shadow"
                  >
                    <div className="md:w-2/5 aspect-[4/3] md:aspect-auto overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.alt}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6 md:w-3/5 flex flex-col justify-between">
                      <div>
                        <span className="rounded-full bg-brand-green-moss/10 px-2.5 py-0.5 font-body text-[10px] font-semibold uppercase text-brand-green-dark">
                          {item.type}
                        </span>
                        <h4 className="mt-3 font-heading text-base font-semibold leading-snug text-text-primary group-hover:text-brand-green-moss transition-colors">
                          {item.title}
                        </h4>
                      </div>
                      <time className="mt-4 font-body text-xs text-text-secondary">
                        {item.date}
                      </time>
                    </div>
                  </Link>
                ))}
              </div>
            </Container>
          </section>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
