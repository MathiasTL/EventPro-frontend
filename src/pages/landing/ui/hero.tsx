import { ChatThread } from "./chat-thread";
import { IngresarAction, WhatsAppAction } from "./actions";

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-16 pt-12 sm:px-8 lg:pb-24 lg:pt-20">
      <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="max-w-xl">
          <p className="font-mono text-eyebrow text-brand uppercase">
            Lima, Perú · Eventos sociales y corporativos
          </p>
          <h1 className="mt-5 font-semibold text-hero text-ink">
            Tu evento empieza con un mensaje.
          </h1>
          <p className="mt-6 text-lead text-muted">
            Escribe a EventPro por WhatsApp, elige paquete, temática y extras, y
            recibe la cotización con la movilidad ya calculada. El contrato
            llega a tu chat para firmarlo desde el celular.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <IngresarAction />
            <WhatsAppAction />
          </div>

          <p className="mt-4 text-sm text-muted">
            Cotizar por WhatsApp no requiere registro; el panel es para
            encargados y operadores del equipo.
          </p>
        </div>

        <ChatThread />
      </div>
    </section>
  );
}
