import { MessageCircleMore } from "lucide-react";

export function ChatStep() {
  return (
    <div className="flow-artifact flow-chat-artifact">
      <div className="flow-artifact-bar">
        <span><MessageCircleMore aria-hidden="true" size={20} /> WhatsApp</span>
        <span>Conversación</span>
      </div>
      <div className="flow-chat-body">
        <div className="flow-message flow-message-client">
          <span>Cliente</span>
          <p>Quiero cotizar mi evento.</p>
        </div>
        <div className="flow-message flow-message-bot">
          <span>Bot de EventPro</span>
          <p>Te presento el Combo Full Fiesta (Hora Loca + DJ).</p>
        </div>
      </div>
      <div className="flow-artifact-foot">El primer contacto ya queda en el mismo recorrido.</div>
    </div>
  );
}
