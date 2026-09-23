import { PublicFooter } from "../components/layout/PublicFooter";
import { PublicHeader } from "../components/layout/PublicHeader";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { HeroSection } from "../components/section/HeroSection";
import { SolutionsSection } from "../components/section/SolutionsSection";
import { EcosystemSection } from "../components/section/EcosystemSection";
import { ContentSection } from "../components/section/ContentSection";
import { CasesSection } from "../components/section/CasesSection";
import { AboutSection } from "../components/section/AboutSection";
import { CallToActionSection } from "../components/section/CallToActionSection";

export function PreviewLayoutPage() {
  return (
    <div className="min-h-screen">
      <PublicHeader />

      <main>
        <Section spacing="xl">
          <Container size="narrow">
            <div className="space-y-6">
              <p className="font-body text-sm uppercase tracking-wide text-text-secondary">
                Preview de layout
              </p>

              <h1 className="font-display text-4xl font-bold tracking-tight text-text-primary md:text-6xl">
                The Bridge
              </h1>

              <p className="max-w-2xl font-body text-base leading-7 text-text-secondary">
                Página temporária para visualizar o header e o footer
                oficiais antes de começarmos a construir a Home.
              </p>
            </div>
          </Container>
        </Section>

        <HeroSection />

        <SolutionsSection />

        <EcosystemSection />

        <ContentSection />

        <CasesSection />

        <AboutSection />

        <CallToActionSection />
      </main>

      <PublicFooter />

      
    </div>
  );
}