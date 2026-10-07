const AUDIENCES = [
  {
    label: "Para clientes",
    title: "Cotiza sin llamar",
    body: "Pregunta por WhatsApp, revisa la cotización en el chat y firma el contrato desde tu celular, sin archivos sueltos ni esperas.",
  },
  {
    label: "Para encargados",
    title: "El panel a tu medida",
    body: "Catálogo, disponibilidad, contratos, pagos y reportes en un solo lugar; apruebas o rechazas lo que aparece en el momento.",
  },
  {
    label: "Para elencos",
    title: "La agenda en el bolsillo",
    body: "Desde tu celular ves los eventos del día, registras el cobro del saldo con evidencia y confirmas que el show está en marcha.",
  },
];

export function Audiences() {
  return (
    <section className="bg-brand-tint">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <p className="font-mono text-eyebrow text-brand uppercase">
          Para quién es
        </p>
        <h2 className="mt-4 max-w-2xl font-semibold text-title text-ink">
          Tres formas de vivir EventPro
        </h2>

        <ul className="mt-10 grid gap-5 sm:grid-cols-3">
          {AUDIENCES.map((audience) => (
            <li
              key={audience.label}
              className="rounded-xl border border-line bg-white p-6"
            >
              <p className="font-mono text-eyebrow text-brand uppercase">
                {audience.label}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-ink">
                {audience.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {audience.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
