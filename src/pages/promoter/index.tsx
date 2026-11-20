import { Bricolage_Grotesque, DM_Sans } from "next/font/google";

import { ClosingCta } from "./ui/closing-cta";
import { Hero } from "./ui/hero";
import { HowItWorks } from "./ui/how-it-works";
import { ServicesSection } from "./ui/services-section";
import { SiteFooter } from "./ui/site-footer";
import { SiteHeader } from "./ui/site-header";
import { StickyWhatsAppAction } from "./ui/actions";
import { TrustSection } from "./ui/trust-section";
import "./promoter.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--lt-display", display: "swap" });
const body = DM_Sans({ subsets: ["latin"], variable: "--lt-body", display: "swap" });

export function PromoterPage() {
  return (
    <div className={`promoter ${display.variable} ${body.variable}`}>
      <SiteHeader />
      <main>
        <Hero />
        <ServicesSection />
        <HowItWorks />
        <TrustSection />
        <ClosingCta />
      </main>
      <SiteFooter />
      <StickyWhatsAppAction />
    </div>
  );
}
