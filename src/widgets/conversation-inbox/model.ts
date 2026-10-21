import type { Conversation, ConversationFilters, HandoffReason } from "@/entities/conversation";

export const handoffReasonLabels: Record<HandoffReason, string> = {
  CLIENT_REQUEST: "El cliente pidió hablar con una persona",
  BOT_NOT_UNDERSTOOD: "El bot no entendió la consulta",
  MANUAL_TAKEOVER: "Toma manual",
  BOT_ERROR: "El bot tuvo un error",
};

/** Single-select quick filter: each option maps to the `mode` / `assigned` query params. */
export type ScopeFilter = "all" | "unassigned" | "mine" | "bot";

export const scopeOptions: { value: ScopeFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "unassigned", label: "Sin asignar" },
  { value: "mine", label: "Mías" },
  { value: "bot", label: "Bot" },
];

export type InboxFilterState = {
  search: string;
  scope: ScopeFilter;
  assignedUserId: string;
  includeResolved: boolean;
};

export const initialFilterState: InboxFilterState = {
  search: "",
  scope: "all",
  assignedUserId: "",
  includeResolved: false,
};

export const MIN_SEARCH_LENGTH = 2;

export function toApiFilters(state: InboxFilterState, search: string, canPickAssignee: boolean): ConversationFilters {
  const filters: ConversationFilters = {};
  const q = search.trim();
  if (q.length >= MIN_SEARCH_LENGTH) filters.q = q;
  if (state.scope === "bot") filters.mode = "BOT";
  if (state.scope === "mine") filters.assigned = "me";
  if (state.scope === "unassigned") filters.assigned = "unassigned";
  if (canPickAssignee && state.assignedUserId) filters.assigned_user_id = state.assignedUserId;
  if (state.includeResolved) filters.include_resolved = true;
  return filters;
}

export function hasActiveFilters(filters: ConversationFilters): boolean {
  return Object.keys(filters).length > 0;
}

/** A handoff waits for a person: human mode, open and nobody assigned yet. */
export function isHandoffPending(conversation: Conversation): boolean {
  return conversation.mode === "HUMAN" && conversation.status === "open" && conversation.assigned_user_id === null && conversation.handed_off_at !== null;
}

export function responsibleLabel(conversation: Conversation): string {
  if (conversation.mode === "BOT") return "Bot";
  return conversation.assigned_user_name ?? "Sin asignar";
}

const rtf = new Intl.RelativeTimeFormat("es-PE", { numeric: "auto" });

/** Short relative time («hace 5 min», «ayer»); falls back to a date after a week. */
export function formatRelative(iso: string | null, now: number = Date.now()): string {
  if (!iso) return "";
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return "";
  const seconds = Math.round((time - now) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return "ahora";
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(seconds / 3600), "hour");
  if (abs < 7 * 86400) return rtf.format(Math.round(seconds / 86400), "day");
  return new Date(time).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" });
}
