const decisions = [
  {
    title: "Ventana de atención",
    description: "La bandeja muestra cuándo la conversación de WhatsApp puede recibir una respuesta dentro de las 24 h.",
  },
  {
    title: "Sobrecupo",
    description: "Los shows simultáneos que superan el umbral requieren aprobación del encargado.",
  },
  {
    title: "Excepciones",
    description: "El encargado puede ajustar movilidad o tiempos de traslado y emitir un contrato en modo manual.",
  },
] as const;

export function ControlSection() {
  return (
    <section className="showcase-control" aria-labelledby="control-title">
      <div className="showcase-section-inner">
        <div className="showcase-section-heading showcase-control-heading">
          <h2 id="control-title">El bot avanza. El encargado decide.</h2>
          <p>EventPro automatiza lo repetitivo y deja visibles los puntos donde una persona debe intervenir.</p>
        </div>

        <div className="showcase-handoff" aria-label="Traspaso de la conversación entre bot y encargado">
          <div className="showcase-handoff-step showcase-handoff-bot">
            <span className="showcase-handoff-band">BOT</span>
            <div><strong>Atiende el bot</strong><p>Guía la consulta y prepara la cotización.</p></div>
          </div>
          <span className="showcase-handoff-arrow" aria-hidden="true">→</span>
          <div className="showcase-handoff-step showcase-handoff-human">
            <span className="showcase-handoff-band">TÚ</span>
            <div><strong>Tomas el control</strong><p>Respondes, validas y resuelves excepciones.</p></div>
          </div>
          <span className="showcase-handoff-arrow" aria-hidden="true">→</span>
          <div className="showcase-handoff-step showcase-handoff-bot">
            <span className="showcase-handoff-band">BOT</span>
            <div><strong>Vuelve al bot</strong><p>La rutina continúa sin perder el historial.</p></div>
          </div>
        </div>

        <div className="showcase-control-decisions">
          {decisions.map(({ title, description }) => (
            <div key={title}>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
