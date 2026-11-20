import { IngresarAction, WhatsAppAction } from "./actions";

export function ClosingCta() {
  return (
    <section className="bg-violet-700">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 text-center sm:px-8 lg:py-20">
        <h2 className="mx-auto max-w-2xl font-semibold text-title text-white">
          ¿Listo para tu próximo evento?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lead text-violet-100">
          Cotiza por WhatsApp en minutos, o entra al panel si ya formas parte
          del equipo.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <IngresarAction variant="inverse" />
          <WhatsAppAction />
        </div>
      </div>
    </section>
  );
}
