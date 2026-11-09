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
export const MAX_SEARCH_LENGTH = 100;

/** Query params that carry the filter state; the selection param (`c`) is deliberately not part of this list. */
export const FILTER_PARAMS = { search: "q", scope: "scope", assignedUserId: "assignee", includeResolved: "resolved" } as const;

type ParamReader = { get(name: string): string | null };

/** Reads the filter state from query params; missing or invalid values fall back to the defaults. */
export function parseFilterParams(params: ParamReader, canPickAssignee: boolean): InboxFilterState {
  const scope = params.get(FILTER_PARAMS.scope);
  return {
    search: (params.get(FILTER_PARAMS.search) ?? "").slice(0, MAX_SEARCH_LENGTH),
    scope: scopeOptions.some(option => option.value === scope) ? (scope as ScopeFilter) : initialFilterState.scope,
    assignedUserId: canPickAssignee ? (params.get(FILTER_PARAMS.assignedUserId) ?? "") : "",
    includeResolved: params.get(FILTER_PARAMS.includeResolved) === "1",
  };
}

/** Returns a copy of `params` with only the filter params rewritten; defaults are omitted and other params are kept. */
export function withFilterParams(params: URLSearchParams, state: InboxFilterState, canPickAssignee: boolean): URLSearchParams {
  const next = new URLSearchParams(params.toString());
  Object.values(FILTER_PARAMS).forEach(name => next.delete(name));
  const search = state.search.trim();
  if (search) next.set(FILTER_PARAMS.search, search);
  if (state.scope !== initialFilterState.scope) next.set(FILTER_PARAMS.scope, state.scope);
  if (canPickAssignee && state.assignedUserId) next.set(FILTER_PARAMS.assignedUserId, state.assignedUserId);
  if (state.includeResolved) next.set(FILTER_PARAMS.includeResolved, "1");
  return next;
}

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
