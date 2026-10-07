import { Bricolage_Grotesque } from "next/font/google";

import { Audiences } from "./ui/audiences";
import { ClosingCta } from "./ui/closing-cta";
import { Hero } from "./ui/hero";
import { HowItWorks } from "./ui/how-it-works";
import { SiteFooter } from "./ui/site-footer";
import { SiteHeader } from "./ui/site-header";

const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export function LandingPage() {
  return (
    <div
      className={`${displayFont.variable} flex min-h-screen flex-1 flex-col bg-background`}
    >
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
