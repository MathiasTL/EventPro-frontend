const actors = [
  {
    name: "Cliente",
    benefit: "Recibe una cotización clara en el chat y firma el contrato desde su celular.",
  },
  {
    name: "Encargado",
    benefit: "Ve el estado de cada solicitud, interviene cuando hace falta y conserva el control del negocio.",
  },
  {
    name: "Elenco",
    benefit: "Consulta su agenda y las observaciones del cliente antes de llegar al evento.",
  },
] as const;

export function ImpactSection() {
  return (
    <section className="showcase-impact" aria-labelledby="impact-title">
      <div className="showcase-section-inner">
        <div className="showcase-section-heading showcase-impact-heading">
          <h2 id="impact-title">Una operación más clara para todos.</h2>
        </div>
        <div className="showcase-impact-list">
          {actors.map(({ name, benefit }) => (
            <div key={name}>
              <h3>{name}</h3>
              <p>{benefit}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
