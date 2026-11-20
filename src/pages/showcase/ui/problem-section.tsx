const problems = [
  {
    before: "Cotizaciones hechas una por una en WhatsApp",
    after: "Paquetes y movilidad calculados con reglas consistentes.",
  },
  {
    before: "Contratos armados a mano, con riesgo de errores",
    after: "Un PDF generado desde la cotización y firmado desde el celular.",
  },
  {
    before: "La agenda y los recursos dependen de la memoria",
    after: "Cronograma, disponibilidad y alertas para decidir a tiempo.",
  },
  {
    before: "Las indicaciones del cliente se pierden en el chat",
    after: "Las observaciones acompañan al evento hasta el elenco.",
  },
  {
    before: "Ingresos y costos sin una vista conjunta",
    after: "Pagos, costos y margen reunidos para el encargado.",
  },
] as const;

export function ProblemSection() {
  return (
    <section id="problema" className="showcase-problem" aria-labelledby="problem-title">
      <div className="showcase-problem-inner">
        <div className="showcase-problem-heading">
          <h2 id="problem-title">El evento no puede depender de la memoria.</h2>
          <p>Cuando la operación vive en chats y archivos sueltos, cada decisión exige reconstruir lo que pasó.</p>
        </div>
        <div className="showcase-problem-grid" role="table" aria-label="Antes y después de EventPro">
          <div className="showcase-problem-columns" role="row">
            <span role="columnheader">Antes</span>
            <span role="columnheader">Con EventPro</span>
          </div>
          {problems.map(({ before, after }) => (
            <div key={before} className="showcase-problem-row" role="row">
              <p role="cell" className="showcase-problem-before">{before}</p>
              <p role="cell" className="showcase-problem-after">{after}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
