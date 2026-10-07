interface Message {
  from: "bot" | "cliente";
  text: string;
}

const MESSAGES: Message[] = [
  { from: "bot", text: "¡Hola! Soy EventPro. ¿Qué evento quieres cotizar?" },
  { from: "cliente", text: "Hora Loca el 12 de octubre en Surco" },
  {
    from: "bot",
    text: "Paquetes de Hora Loca: Básica S/ 450 · Medium S/ 750 · Premium S/ 1,200",
  },
  {
    from: "cliente",
    text: "Premium, temática Neón Glow y Muñeco Gorila Gigante",
  },
  {
    from: "bot",
    text: "Servicios S/ 1,200 + extras S/ 250 = S/ 1,450. Adelanto del 10 %: S/ 145.",
  },
  { from: "cliente", text: "Sí, mándamelo" },
  {
    from: "bot",
    text: "Contrato listo en el chat: revísalo y fírmalo con tu código OTP.",
  },
];

export function ChatThread() {
  return (
    <section
      aria-label="Ejemplo de conversación con el bot de EventPro"
      className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="flex items-center gap-2 border-b border-line pb-3">
        <span
          aria-hidden="true"
          className="h-2.5 w-2.5 rounded-full bg-whatsapp"
        />
        <span className="text-sm font-semibold text-ink">EventPro</span>
        <span className="ml-auto font-mono text-[0.7rem] tracking-widest text-muted uppercase">
          Respuesta automática
        </span>
      </div>

      <ol className="mt-4 space-y-3">
        {MESSAGES.map((message, index) => (
          <li
            key={message.text}
            className={`chat-in flex ${
              message.from === "cliente" ? "justify-end" : "justify-start"
            }`}
            style={{ animationDelay: `${index * 420}ms` }}
          >
            <p
              className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                message.from === "bot"
                  ? "rounded-tl-sm bg-brand-tint text-ink"
                  : "rounded-tr-sm bg-whatsapp text-whatsapp-ink"
              }`}
            >
              {message.text}
            </p>
          </li>
        ))}
      </ol>

      <p className="mt-4 border-t border-line pt-3 font-mono text-[0.7rem] tracking-widest text-muted uppercase">
        Cotización de muestra
      </p>
    </section>
  );
}
