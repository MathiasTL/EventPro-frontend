import type { Conversation, LeadStatus } from "./types";

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

/** Spanish labels and tones for the derived lead status (spec 09, 4.2). Text always carries the meaning. */
export const leadStatusMeta: Record<LeadStatus, { label: string; tone: BadgeTone }> = {
  QUOTING: { label: "Cotizando", tone: "neutral" },
  QUOTE_SENT: { label: "Cotización enviada", tone: "info" },
  PAYMENT_STARTED: { label: "Pago iniciado", tone: "warning" },
  CONVERTED: { label: "Convertido", tone: "success" },
  QUOTE_CLOSED: { label: "Vencida o cancelada", tone: "danger" },
  EVENT_DONE: { label: "Evento realizado", tone: "success" },
};

/** Closed work reads struck through: resolved by a person, or the quote expired or was cancelled. */
export function isConversationClosed(conversation: Pick<Conversation, "status" | "lead_status">): boolean {
  return conversation.status === "resolved" || conversation.lead_status === "QUOTE_CLOSED";
}
