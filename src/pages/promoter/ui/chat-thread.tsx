const messages = [
  { from: "bot", text: "¡Hola! Somos La Tremenda. ¿Qué celebras?" },
  { from: "client", text: "Un cumpleaños en Surco. Me interesa la Hora Loca Premium." },
  { from: "bot", text: "Hora Loca Premium desde S/ 1,200. ¿Quieres sumar algún extra?" },
  { from: "client", text: "Sí, el gorila gigante." },
  { from: "bot", text: "El Muñeco Gorila Gigante es desde S/ 250. Cuéntame la fecha y dirección para incluir la movilidad en tu cotización." },
] as const;

export function ChatThread() {
  return (
    <div className="promoter-chat" role="group" aria-label="Conversación ilustrativa con La Tremenda">
      <div className="promoter-chat-top">
        <span className="promoter-chat-avatar" aria-hidden="true">LT</span>
        <div><strong>La Tremenda</strong><span>Shows y eventos</span></div>
        <span className="promoter-chat-status" aria-hidden="true" />
      </div>
      <ol className="promoter-chat-messages">
        {messages.map((message, index) => (
          <li key={index} className={message.from === "client" ? "promoter-chat-client" : "promoter-chat-bot"}>
            <p>{message.text}</p>
          </li>
        ))}
      </ol>
      <p className="promoter-chat-note">Conversación ilustrativa · cotización final según tu evento</p>
    </div>
  );
}
