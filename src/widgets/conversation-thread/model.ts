import type { Conversation } from "@/entities/conversation";
import type { DeliveryStatus, Message, MessagePage, UnsentMessage } from "@/entities/message";

/** Mirrors the wording of spec 09, 12.3 and D20. */
export const WINDOW_CLOSED_NOTICE = "Han pasado más de 24 h; el cliente debe escribir primero.";
export const MESSAGING_UNAVAILABLE_NOTICE = "La mensajería no está disponible temporalmente.";
export const DEFAULT_FAILURE_REASON = "No se pudo entregar el mensaje.";

export type ComposerBlock = { reason: string; showTakeover: boolean };

type GateInput = {
  conversation: Conversation | undefined;
  currentUserId: string;
  role: string | null | undefined;
  loading: boolean;
  unavailable: boolean;
};

/**
 * Composer rules (spec 09, 6.4, 12.3 and D20). Returns why the composer is disabled, or `null` when the user
 * may write. `showTakeover` asks the widget to offer «Tomar» (or «Reasignarme») next to the explanation.
 */
export function composerBlock({ conversation, currentUserId, role, loading, unavailable }: GateInput): ComposerBlock | null {
  if (unavailable) return { reason: MESSAGING_UNAVAILABLE_NOTICE, showTakeover: false };
  if (loading || !conversation) return { reason: "Cargando la conversación…", showTakeover: false };

  const assignee = conversation.assigned_user_id;
  if (assignee === null) {
    if (conversation.status === "resolved") return { reason: "Esta conversación está resuelta. Tómala para reabrirla y responder.", showTakeover: true };
    if (conversation.mode === "BOT") return { reason: "El bot atiende esta conversación. Tómala para responder.", showTakeover: true };
    return { reason: "Toma la conversación para responder.", showTakeover: true };
  }
  if (assignee !== currentUserId) {
    const name = conversation.assigned_user_name ?? "otro encargado";
    return { reason: `Esta conversación la atiende ${name}.`, showTakeover: role === "SUPERADMIN" };
  }
  if (!conversation.service_window_open) return { reason: WINDOW_CLOSED_NOTICE, showTakeover: false };
  return null;
}

export const deliveryLabels: Record<DeliveryStatus, string> = {
  SENT: "Enviado",
  DELIVERED: "Entregado",
  READ: "Leído",
  FAILED: "No enviado",
};

export type TimelineEntry =
  | { kind: "day"; key: string; label: string }
  | { kind: "message"; key: string; message: Message }
  | { kind: "unsent"; key: string; row: UnsentMessage };

const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

export function dayLabel(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (dayKey(date) === dayKey(now)) return "Hoy";
  if (dayKey(date) === dayKey(yesterday)) return "Ayer";
  return date.toLocaleDateString("es-PE", { day: "numeric", month: "long", year: date.getFullYear() === now.getFullYear() ? undefined : "numeric" });
}

export function formatTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

/** «mañana 14:30» style text is avoided: an absolute short date and time is unambiguous. */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("es-PE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

/**
 * Pages are newest first (and so are the items inside a page); the thread is shown oldest first with day
 * separators. `unsent` rows (first page only) are the newest and go last.
 */
export function buildTimeline(pages: MessagePage[]): TimelineEntry[] {
  const messages = pages.flatMap(page => page.items).reverse();
  const unsent = [...(pages[0]?.unsent ?? [])].sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
  const entries: TimelineEntry[] = [];
  let lastDay = "";
  const pushDay = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return;
    const key = dayKey(date);
    if (key === lastDay) return;
    lastDay = key;
    entries.push({ kind: "day", key: `day-${key}`, label: dayLabel(iso) });
  };
  for (const message of messages) {
    pushDay(message.created_at);
    entries.push({ kind: "message", key: `m-${message.id}`, message });
  }
  for (const row of unsent) {
    pushDay(row.created_at);
    entries.push({ kind: "unsent", key: `u-${row.outbox_id}`, row });
  }
  return entries;
}

/**
 * Messages carry the author name but not the author id, so «own» is matched by name.
 * Two encargados with the same full name would both look own; the backend does not expose an id to tell them apart.
 */
export function isOwnAuthor(authorName: string | null, ownName: string | null): boolean {
  return authorName !== null && ownName !== null && authorName.trim().toLowerCase() === ownName.trim().toLowerCase();
}
