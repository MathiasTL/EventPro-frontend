import { Wordmark } from "@/shared/ui/Wordmark";

export function BrandPanel() {
  return (
    <section className="ep-login-brand" aria-label="EventPro">
      <div className="ep-login-brand-top">
        <Wordmark tone="dark" />
        <span>ACCESO / EQUIPO</span>
      </div>
      <div className="ep-login-brand-copy">
        <span className="ep-login-brand-index">01 / OPERACIÓN</span>
        <h1>Panel de operación de eventos<span aria-hidden="true">.</span></h1>
        <p>Del primer mensaje al último detalle, todo en el mismo lugar.</p>
      </div>
      <div className="ep-login-brand-foot" aria-hidden="true">
        <span>EVENTPRO</span><span>BACKSTAGE / 2026</span>
      </div>
    </section>
  );
}
