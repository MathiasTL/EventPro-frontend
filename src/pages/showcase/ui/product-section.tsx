"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import { DeviceFrame } from "./device-frame";

const screens = [
  {
    src: "/showcase/panel-conversations-open.webp",
    alt: "Panel de Conversaciones con la cotización dentro del chat y controles para tomar la conversación",
    title: "Conversaciones",
    caption: "La cotización y el traspaso entre bot y encargado comparten el mismo hilo.",
  },
  {
    src: "/showcase/panel-quotes.webp",
    alt: "Tabla real de Cotizaciones con paquete, importe, estado y vencimiento",
    title: "Cotizaciones",
    caption: "Importes, estados y vencimientos se consultan desde el panel.",
  },
  {
    src: "/showcase/panel-catalogo.webp",
    alt: "Catálogo real del panel con paquetes y acciones de administración",
    title: "Catálogo",
    caption: "Paquetes y recursos se administran en un solo lugar.",
  },
  {
    src: "/showcase/panel-solicitudes.webp",
    alt: "Vista real de Solicitudes con presupuesto, validación del comprobante y contrato PDF",
    title: "Solicitudes",
    caption: "El flujo manual conecta presupuesto, comprobante y contrato.",
  },
] as const;

export function ProductSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => { sectionRef.current?.setAttribute("data-enhanced", "true"); }, []);

  function selectWithKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % screens.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + screens.length) % screens.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = screens.length - 1;
    if (next === null) return;
    event.preventDefault();
    setActiveIndex(next);
    tabRefs.current[next]?.focus({ preventScroll: true });
  }

  return (
    <section ref={sectionRef} id="producto" className="showcase-product" aria-labelledby="product-title">
      <div className="showcase-section-inner">
        <div className="showcase-section-heading showcase-product-heading">
          <div>
            <span className="showcase-product-kicker">EL PANEL / 04 VISTAS</span>
            <h2 id="product-title">Software real, a la vista.</h2>
          </div>
          <p>Estas capturas del panel muestran la operación que acompaña al recorrido del cliente.</p>
          <div className="showcase-product-tabs" role="tablist" aria-label="Vistas del panel">
            {screens.map((screen, index) => (
              <button
                key={screen.src}
                ref={(element) => { tabRefs.current[index] = element; }}
                id={`product-tab-${index}`}
                type="button"
                role="tab"
                aria-controls={`product-panel-${index}`}
                aria-selected={activeIndex === index}
                tabIndex={activeIndex === index ? 0 : -1}
                onClick={() => setActiveIndex(index)}
                onKeyDown={(event) => selectWithKey(event, index)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{screen.title}</strong>
              </button>
            ))}
          </div>
        </div>
        <div className="showcase-product-gallery">
          {screens.map((screen, index) => (
            <div
              key={screen.src}
              id={`product-panel-${index}`}
              className="showcase-product-panel"
              role="tabpanel"
              aria-labelledby={`product-tab-${index}`}
              data-active={activeIndex === index ? "true" : undefined}
            >
              <DeviceFrame {...screen} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
