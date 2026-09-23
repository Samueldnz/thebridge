import { PublicFooter } from "../components/layout/PublicFooter";
import { PublicHeader } from "../components/layout/PublicHeader";

import { AboutSection } from "../components/section/AboutSection";
import { CallToActionSection } from "../components/section/CallToActionSection";
import { CasesSection } from "../components/section/CasesSection";
import { ContentSection } from "../components/section/ContentSection";
import { EcosystemSection } from "../components/section/EcosystemSection";
import { HeroSection } from "../components/section/HeroSection";
import { SolutionsSection } from "../components/section/SolutionsSection";

export function HomePage() {
  return (
    <div className="min-h-screen bg-surface-primary">
      <PublicHeader />

      <main className="pt-[72px] lg:pt-[76px]">
        <HeroSection/>

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