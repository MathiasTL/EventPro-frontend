import { ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/shared/ui/button-link";
import { Wordmark } from "@/shared/ui/Wordmark";
import { FLOW_STEPS } from "../model/flow-steps";

export function ClosingCta() {
  return (
    <section className="showcase-closing" aria-labelledby="closing-title">
      <div className="showcase-closing-inner">
        <div className="showcase-closing-band">
          <div className="showcase-closing-copy">
            <h2 id="closing-title">Conoce EventPro en acción.</h2>
            <p>Explora el panel y luego mira la experiencia del cliente.</p>
            <div className="showcase-closing-actions">
              <ButtonLink href="/login" variant="inverse">Ingresar al panel <ArrowUpRight aria-hidden="true" size={20} /></ButtonLink>
              <ButtonLink href="/la-tremenda" variant="ghost-inverse">Ver sitio del cliente <ArrowUpRight aria-hidden="true" size={20} /></ButtonLink>
            </div>
          </div>
          <div className="showcase-closing-recap" aria-label="Recorrido de EventPro en cinco pasos">
            <div className="showcase-closing-recap-head"><Wordmark tone="dark" /><span>DEL CHAT AL EVENTO</span></div>
            <ol>
              {FLOW_STEPS.map((step, index) => (
                <li key={step.id}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step.title}</strong></li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
