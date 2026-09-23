const brandColors = [
  {
    name: "Green Dark",
    token: "--color-brand-green-dark",
    className: "bg-brand-green-dark",
  },
  {
    name: "Green Moss",
    token: "--color-brand-green-moss",
    className: "bg-brand-green-moss",
  },
  {
    name: "Earth",
    token: "--color-brand-earth",
    className: "bg-brand-earth",
  },
  {
    name: "White",
    token: "--color-brand-white",
    className: "bg-brand-white",
  },
  {
    name: "Off-White",
    token: "--color-brand-off-white",
    className: "bg-brand-off-white",
  },
  {
    name: "Cream",
    token: "--color-brand-cream",
    className: "bg-brand-cream",
  },
  {
    name: "Graphite",
    token: "--color-brand-graphite",
    className: "bg-brand-graphite",
  },
  {
    name: "Brown",
    token: "--color-brand-brown",
    className: "bg-brand-brown",
  },
] as const;

const spacingTokens = [
  { name: "1", className: "w-1" },
  { name: "2", className: "w-2" },
  { name: "4", className: "w-4" },
  { name: "6", className: "w-6" },
  { name: "8", className: "w-8" },
  { name: "12", className: "w-12" },
  { name: "16", className: "w-16" },
  { name: "24", className: "w-24" },
] as const;

const typeSamples = [
  {
    name: "Display XL",
    className: "font-display text-display-xl font-bold",
    text: "Inteligência humana.",
  },
  {
    name: "Display LG",
    className: "font-display text-display-lg font-bold",
    text: "Eficiência tecnológica.",
  },
  {
    name: "H1",
    className: "font-heading text-h1 font-bold",
    text: "Conectando conhecimento.",
  },
  {
    name: "H2",
    className: "font-heading text-h2 font-semibold",
    text: "Pesquisa encontra mercado.",
  },
  {
    name: "H3",
    className: "font-heading text-h3 font-semibold",
    text: "Transformação com propósito.",
  },
  {
    name: "H4",
    className: "font-heading text-h4 font-semibold",
    text: "Uma ponte entre mundos.",
  },
] as const;

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border-subtle py-16 md:py-24">
      <div className="mb-10">
        <p className="mb-3 font-body text-label font-medium uppercase tracking-[0.08em] text-text-muted">
          {eyebrow}
        </p>

        <h2 className="font-heading text-h2 font-semibold text-text-primary">
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}

export default function FoundationDemo() {
  return (
    <main className="min-h-screen bg-surface-primary text-text-primary">
      {/* ======================================================
          HEADER
          ====================================================== */}

      <header className="border-b border-border-subtle bg-surface-inverse text-text-inverse">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20 lg:px-16">
          <p className="mb-4 font-body text-label font-medium uppercase tracking-[0.08em] text-brand-green-moss">
            The Bridge / Foundation
          </p>

          <h1 className="max-w-5xl font-display text-display-lg font-bold">
            Design Token System
          </h1>

          <p className="mt-6 max-w-2xl font-body text-body-md text-text-inverse/80">
            Página interna para validação visual da Foundation da The Bridge.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 md:px-8 lg:px-16">
        {/* ====================================================
            COLORS
            ==================================================== */}

        <Section eyebrow="01 / Colors" title="Brand palette">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {brandColors.map((color) => (
              <div
                key={color.token}
                className="overflow-hidden border border-border-subtle bg-surface-white"
              >
                <div className={`h-32 ${color.className}`} />

                <div className="p-4">
                  <p className="font-heading text-sm font-semibold">
                    {color.name}
                  </p>

                  <p className="mt-1 font-body text-xs text-text-secondary">
                    {color.token}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ====================================================
            SEMANTIC COLORS
            ==================================================== */}

        <Section eyebrow="02 / Semantic" title="Semantic surfaces">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border border-border-subtle bg-surface-white p-8">
              <p className="font-body text-label uppercase text-text-muted">
                Surface Primary
              </p>

              <h3 className="mt-4 font-heading text-h3 font-semibold">
                Conteúdo principal
              </h3>

              <p className="mt-4 max-w-xl font-body text-body-sm text-text-secondary">
                Superfície principal para páginas e conteúdos da aplicação.
              </p>
            </div>

            <div className="bg-surface-inverse p-8 text-text-inverse">
              <p className="font-body text-label uppercase text-brand-green-moss">
                Surface Inverse
              </p>

              <h3 className="mt-4 font-heading text-h3 font-semibold">
                Conteúdo inverso
              </h3>

              <p className="mt-4 max-w-xl font-body text-body-sm text-text-inverse/80">
                Superfície escura para momentos de contraste e destaque.
              </p>
            </div>
          </div>
        </Section>

        {/* ====================================================
            TYPOGRAPHY
            ==================================================== */}

        <Section eyebrow="03 / Typography" title="Type scale">
          <div className="space-y-10">
            {typeSamples.map((sample) => (
              <div
                key={sample.name}
                className="border-b border-border-subtle pb-8"
              >
                <p className="mb-4 font-body text-label uppercase text-text-muted">
                  {sample.name}
                </p>

                <p className={sample.className}>{sample.text}</p>
              </div>
            ))}

            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <p className="mb-3 font-body text-label uppercase text-text-muted">
                  Body / Roboto Mono
                </p>

                <p className="font-body text-body-md text-text-primary">
                  The Bridge conecta conhecimento, inovação e mercado através
                  de uma abordagem humana e tecnológica.
                </p>
              </div>

              <div>
                <p className="mb-3 font-body text-label uppercase text-text-muted">
                  Small / Roboto Mono
                </p>

                <p className="font-body text-body-sm text-text-secondary">
                  Texto secundário para informações complementares, metadados
                  e descrições.
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* ====================================================
            SPACING
            ==================================================== */}

        <Section eyebrow="04 / Spacing" title="Spacing scale">
          <div className="space-y-4">
            {spacingTokens.map((spacing) => (
              <div key={spacing.name} className="flex items-center gap-4">
                <span className="w-12 shrink-0 font-body text-xs text-text-secondary">
                  {spacing.name}
                </span>

                <div
                  className={`${spacing.className} h-4 bg-brand-green-moss`}
                />
              </div>
            ))}
          </div>
        </Section>

        {/* ====================================================
            RADII
            ==================================================== */}

        <Section eyebrow="05 / Radius" title="Radius scale">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-none border border-border-strong bg-surface-secondary p-8">
              <p className="font-body text-xs">none</p>
            </div>

            <div className="rounded-sm bg-surface-secondary p-8">
              <p className="font-body text-xs">sm</p>
            </div>

            <div className="rounded-md bg-surface-secondary p-8">
              <p className="font-body text-xs">md</p>
            </div>

            <div className="rounded-lg bg-surface-secondary p-8">
              <p className="font-body text-xs">lg</p>
            </div>
          </div>
        </Section>

        {/* ====================================================
            ELEVATION
            ==================================================== */}

        <Section eyebrow="06 / Elevation" title="Elevation">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-surface-white p-8 shadow-sm">
              <p className="font-body text-label uppercase text-text-muted">
                Shadow SM
              </p>
            </div>

            <div className="bg-surface-white p-8 shadow-md">
              <p className="font-body text-label uppercase text-text-muted">
                Shadow MD
              </p>
            </div>

            <div className="bg-surface-white p-8 shadow-lg">
              <p className="font-body text-label uppercase text-text-muted">
                Shadow LG
              </p>
            </div>
          </div>
        </Section>

        {/* ====================================================
            INTERACTION
            ==================================================== */}

        <Section eyebrow="07 / Interaction" title="States">
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              className="bg-brand-green-dark px-6 py-4 font-body text-sm text-brand-white transition duration-200 hover:bg-brand-green-moss focus-visible:outline-2 focus-visible:outline-brand-green-moss focus-visible:outline-offset-4"
            >
              Primary action
            </button>

            <button
              type="button"
              className="border border-border-strong bg-transparent px-6 py-4 font-body text-sm text-text-primary transition duration-200 hover:bg-brand-cream focus-visible:outline-2 focus-visible:outline-brand-green-moss focus-visible:outline-offset-4"
            >
              Secondary action
            </button>

            <button
              type="button"
              disabled
              className="cursor-not-allowed bg-brand-earth/30 px-6 py-4 font-body text-sm text-text-muted"
            >
              Disabled
            </button>
          </div>
        </Section>

        {/* ====================================================
            SUMMARY
            ==================================================== */}

        <section className="border-t border-border-subtle py-16 md:py-24">
          <div className="bg-brand-green-dark p-8 text-brand-white md:p-12">
            <p className="font-body text-label uppercase tracking-[0.08em] text-brand-green-moss">
              Foundation status
            </p>

            <h2 className="mt-4 font-display text-display-md font-bold">
              Tokens carregados.
            </h2>

            <p className="mt-6 max-w-2xl font-body text-body-md text-brand-off-white/80">
              A Foundation está pronta para a próxima camada do Design System:
              primitives e componentes de interface.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}