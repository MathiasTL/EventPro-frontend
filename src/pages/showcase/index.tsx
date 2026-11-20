import { MotionReady } from "./lib/motion-ready";
import { ShowcaseFooter } from "./ui/showcase-footer";
import { ShowcaseHeader } from "./ui/showcase-header";
import { ShowcaseHero } from "./ui/showcase-hero";
import { ProblemSection } from "./ui/problem-section";
import { FlowSection } from "./ui/flow-section";
import { ControlSection } from "./ui/control-section";
import { ProductSection } from "./ui/product-section";
import { ArchitectureSection } from "./ui/architecture-section";
import { ImpactSection } from "./ui/impact-section";
import { TeamSection } from "./ui/team-section";
import { ClosingCta } from "./ui/closing-cta";

export function ShowcasePage() {
  return (
    <div className="showcase">
      <MotionReady />
      <ShowcaseHeader />
      <main id="contenido">
        <ShowcaseHero />
        <ProblemSection />
        <FlowSection />
        <ControlSection />
        <ProductSection />
        <ArchitectureSection />
        <ImpactSection />
        <TeamSection />
        <ClosingCta />
      </main>
      <ShowcaseFooter />
    </div>
  );
}
