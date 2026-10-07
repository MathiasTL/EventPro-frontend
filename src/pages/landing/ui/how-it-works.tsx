const STEPS = [
  {
    number: "01",
    title: "Escribes por WhatsApp",
    body: "El bot te saluda, te muestra los paquetes, temáticas y extras, y te pide fecha, hora y ubicación del evento.",
  },
  {
    number: "02",
    title: "Recibes la cotización",
    body: "EventPro calcula servicios, movilidad con Google Maps y el adelanto del 10 %, y te lo resume en el mismo chat.",
  },
  {
    number: "03",
    title: "Firmas desde el celular",
    body: "El contrato en PDF llega a tu WhatsApp: lo revisas, firmas con tu código OTP y el evento entra en el cronograma.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="border-t border-line bg-background"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <p className="font-mono text-eyebrow text-brand uppercase">
          Cómo funciona
        </p>
        <h2 className="mt-4 max-w-2xl font-display text-title text-ink">
          De un mensaje a un contrato firmado
        </h2>

        <ol className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-10">
          {STEPS.map((step) => (
            <li key={step.number} className="border-t border-line pt-5">
              <span className="font-mono text-sm text-brand">
                {step.number}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
