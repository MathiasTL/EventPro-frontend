import { ArrowUpRight, MessageCircle } from "lucide-react";

import { buildWhatsAppUrl } from "@/shared/config";

const WHATSAPP_MESSAGE = "Hola La Tremenda, quiero cotizar mi evento.";

export function WhatsAppAction({ className = "" }: { className?: string }) {
  const url = buildWhatsAppUrl(WHATSAPP_MESSAGE);
  const content = <><MessageCircle aria-hidden="true" size={22} strokeWidth={2.2} /><span>Cotiza por WhatsApp</span><ArrowUpRight aria-hidden="true" size={20} /></>;

  if (!url) {
    return <button type="button" disabled className={`promoter-whatsapp-action ${className}`}>{content}</button>;
  }

  return <a href={url} target="_blank" rel="noreferrer" className={`promoter-whatsapp-action ${className}`}>{content}</a>;
}

export function StickyWhatsAppAction() {
  return <div className="promoter-sticky-action"><WhatsAppAction /></div>;
}
