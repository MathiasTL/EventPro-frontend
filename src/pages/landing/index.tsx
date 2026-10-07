import { Audiences } from "./ui/audiences";
import { ClosingCta } from "./ui/closing-cta";
import { Hero } from "./ui/hero";
import { HowItWorks } from "./ui/how-it-works";
import { SiteFooter } from "./ui/site-footer";
import { SiteHeader } from "./ui/site-header";

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Audiences />
        <ClosingCta />
      </main>
      <SiteFooter />
    </div>
  );
}
