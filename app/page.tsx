import type { Metadata } from "next";

export { LandingPage as default } from "@/pages/landing";

export const metadata: Metadata = {
  title: "EventPro · Cotiza tu evento por WhatsApp",
  description:
    "EventPro automatiza el ciclo de tu evento en Lima: cotiza por WhatsApp con catálogo, temáticas y extras, calcula la movilidad y firma el contrato digital desde el celular. Panel para encargados y agenda para elencos.",
  openGraph: {
    title: "EventPro · Cotiza tu evento por WhatsApp",
    description:
      "Cotiza, firma tu contrato y gestiona tu evento en un solo lugar.",
    locale: "es_PE",
    type: "website",
  },
};
