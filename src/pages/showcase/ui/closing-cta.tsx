import { ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/shared/ui/button-link";

export function ClosingCta() {
  return (
    <section className="showcase-closing" aria-labelledby="closing-title">
      <div className="showcase-closing-inner">
        <div className="showcase-closing-band">
          <h2 id="closing-title">Conoce EventPro en acción.</h2>
          <p>Explora el panel y luego mira la experiencia del cliente.</p>
          <div className="showcase-closing-actions">
            <ButtonLink href="/login" variant="inverse">Ingresar al panel <ArrowUpRight aria-hidden="true" size={20} /></ButtonLink>
            <ButtonLink href="/la-tremenda" variant="ghost-inverse">Ver sitio del cliente <ArrowUpRight aria-hidden="true" size={20} /></ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
