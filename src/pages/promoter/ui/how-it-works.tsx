import { ChatThread } from "./chat-thread";

const steps = [
  { title: "Cuéntanos tu idea", body: "Escríbenos por WhatsApp y dinos qué celebras, cuándo y dónde." },
  { title: "Recibe tu cotización", body: "Elige paquete y extras; te mostramos el importe con la movilidad incluida en el chat." },
  { title: "Reserva y firma", body: "Envía el adelanto, revisa el contrato digital y fírmalo desde tu celular." },
] as const;

export function HowItWorks() {
  return (
    <section id="como-funciona" className="promoter-how" aria-labelledby="promoter-how-title">
      <div className="promoter-container promoter-how-layout">
        <div className="promoter-how-copy">
          <h2 id="promoter-how-title">Así empieza la fiesta.</h2>
          <ol className="promoter-how-steps">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><h3>{step.title}</h3><p>{step.body}</p></div>
              </li>
            ))}
          </ol>
        </div>
        <ChatThread />
      </div>
    </section>
  );
}
