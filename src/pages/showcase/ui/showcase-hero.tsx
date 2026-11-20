"use client";

import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";

import { ButtonLink } from "@/shared/ui/button-link";
import { useReveal } from "../lib/use-reveal";

export function ShowcaseHero() {
  const copyRef = useReveal<HTMLDivElement>();
  const visualRef = useReveal<HTMLDivElement>();

  return (
    <section className="showcase-hero" aria-labelledby="showcase-title">
      <div className="showcase-hero-inner">
        <div ref={copyRef} className="showcase-hero-copy">
          <h1 id="showcase-title">
            De un mensaje<br className="showcase-wide-break" /> de WhatsApp a un contrato firmado<span className="showcase-period">.</span>
          </h1>
          <p className="showcase-promise">Sin perder el control.</p>
          <p className="showcase-intro">
            EventPro conecta la atención, la cotización y la operación de un evento. El bot resuelve lo repetitivo; el equipo decide en los momentos clave.
          </p>
          <div className="showcase-hero-actions">
            <ButtonLink href="#flujo" variant="gradient" className="showcase-hero-primary">
              Ver cómo funciona <ArrowDown aria-hidden="true" size={20} />
            </ButtonLink>
            <ButtonLink href="/login" variant="ghost-inverse">
              Ingresar al panel <ArrowUpRight aria-hidden="true" size={20} />
            </ButtonLink>
          </div>
        </div>

        <div ref={visualRef} className="showcase-hero-visual" aria-label="Ejemplo ilustrativo de un mensaje que se convierte en cotización">
          <div className="showcase-visual-meta">
            <span>DEL CHAT A LA COTIZACIÓN</span>
            <span>EVENTPRO / 2026</span>
          </div>
          <div className="showcase-visual-stage">
            <div className="showcase-chat">
              <span className="showcase-chat-label">WhatsApp · Cliente</span>
              <p>Hola, quiero cotizar mi evento.</p>
            </div>

            <div className="showcase-transition" aria-hidden="true">
              <span className="showcase-transition-line" />
              <ArrowRight size={24} strokeWidth={1.8} />
            </div>

            <div className="showcase-quote">
              <div className="showcase-quote-top">
                <span className="ep-cond">Cotización</span>
                <span className="showcase-quote-mark" aria-hidden="true">EP</span>
              </div>
              <div className="showcase-quote-line">
                <span>Servicios</span><strong>S/ 1,000.00</strong>
              </div>
              <div className="showcase-quote-line">
                <span>Movilidad</span><strong>S/ 80.50</strong>
              </div>
              <div className="showcase-quote-total">
                <span>Total</span><strong>S/ 1,080.50</strong>
              </div>
            </div>
          </div>
          <p className="showcase-visual-note">Recorrido ilustrativo con valores de la demostración.</p>
        </div>
      </div>
    </section>
  );
}
