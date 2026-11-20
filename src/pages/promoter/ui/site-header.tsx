import Link from "next/link";

import { WhatsAppAction } from "./actions";

export function SiteHeader() {
  return (
    <header className="promoter-header">
      <div className="promoter-header-inner">
        <Link href="/la-tremenda" className="promoter-wordmark" aria-label="La Tremenda, ir al inicio">
          <span>La</span><strong>Tremenda<span aria-hidden="true">.</span></strong>
        </Link>
        <nav aria-label="Navegación principal" className="promoter-nav">
          <a href="#servicios">Servicios</a>
          <a href="#como-funciona">Cómo funciona</a>
        </nav>
        <WhatsAppAction className="promoter-header-action" />
      </div>
    </header>
  );
}
