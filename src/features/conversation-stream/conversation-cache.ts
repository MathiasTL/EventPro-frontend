import type { InfiniteData } from "@tanstack/react-query";
import type { Conversation, ConversationFilters, ConversationPage } from "@/entities/conversation";
import type { ConversationPatch } from "./types";

/** Pure cache transforms for conversation lists and details. No query client access here. */

export type ConversationListData = InfiniteData<ConversationPage, number>;

export type ListPatchResult =
  | { kind: "patched"; data: ConversationListData }
  /** The row is not in this list (or would not belong to it any more): the caller must refetch. */
  | { kind: "refetch" }
  /** The row is not in this list and the filters exclude it: nothing to do. */
  | { kind: "skip" };

/** Values that are never overwritten with `null`: the worker reports null when the gateway has no value. */
function mergeClient(current: Conversation["client"], patch: ConversationPatch["client"]): Conversation["client"] {
  if (!patch) return current;
  return {
    id: patch.id === undefined ? current.id : patch.id,
    name: patch.name ?? current.name,
    phone: patch.phone ?? current.phone,
  };
}

export function mergeConversation(current: Conversation, patch: ConversationPatch): Conversation {
  const { client, ...rest } = patch;
  const defined = Object.fromEntries(Object.entries(rest).filter(([, value]) => value !== undefined));
  const merged: Conversation = { ...current, ...defined, client: mergeClient(current.client, client) };
  // The assignee name is only trustworthy when it arrives with the id; otherwise it is stale.
  if (patch.assigned_user_id !== undefined && patch.assigned_user_id !== current.assigned_user_id) {
    merged.assigned_user_name = patch.assigned_user_name ?? null;
  }
  return merged;
}

/** True when the patch changed the assignee without carrying the new name (the cached name is unknown). */
export function hasStaleAssigneeName(current: Conversation, patch: ConversationPatch): boolean {
  return (
    patch.assigned_user_id !== undefined &&
    patch.assigned_user_id !== null &&
    patch.assigned_user_id !== current.assigned_user_id &&
    patch.assigned_user_name === undefined
  );
}

/**
 * Whether a conversation can appear in a list with these filters. Unknown information
 * (free text, current user for "me") is assumed to match.
 */
export function couldMatchFilters(
  filters: ConversationFilters,
  row: Pick<Conversation, "mode" | "status" | "assigned_user_id">,
  currentUserId: string | null,
): boolean {
  if (filters.mode && row.mode !== filters.mode) return false;
  if (!filters.include_resolved && row.status === "resolved") return false;
  if (filters.assigned === "unassigned" && row.assigned_user_id !== null) return false;
  if (filters.assigned === "me" && currentUserId && row.assigned_user_id !== currentUserId) return false;
  if (filters.assigned_user_id && row.assigned_user_id !== filters.assigned_user_id) return false;
  return true;
}

function byLastMessageDesc(a: Conversation, b: Conversation): number {
  const at = a.last_message_at ? Date.parse(a.last_message_at) : 0;
  const bt = b.last_message_at ? Date.parse(b.last_message_at) : 0;
  return bt - at;
}

/** Re-sorts rows by `last_message_at` descending while keeping the size of every loaded page. */
function resort(data: ConversationListData): ConversationListData {
  const rows = data.pages.flatMap(page => page.items);
  const sorted = [...rows].sort(byLastMessageDesc); // Array#sort is stable.
  if (sorted.every((row, index) => row === rows[index])) return data;
  let offset = 0;
  const pages = data.pages.map(page => {
    const items = sorted.slice(offset, offset + page.items.length);
    offset += page.items.length;
    return { ...page, items };
  });
  return { ...data, pages };
}

/**
 * Applies a patch to the row `id` of one cached list. Rows that stay in the list are patched in
 * place and moved by recency; rows that are absent or no longer match the filters ask for a refetch
 * instead of guessing the page layout.
 */
export function patchConversationList(
  data: ConversationListData,
  filters: ConversationFilters,
  id: number,
  patch: ConversationPatch,
  currentUserId: string | null,
): ListPatchResult {
  const original = findOriginal(data, id);

  if (!original) {
    // A patch without membership fields (handoff) cannot be checked against the filters.
    if (patch.mode !== undefined && patch.status !== undefined && patch.assigned_user_id !== undefined) {
      const probe = { mode: patch.mode, status: patch.status, assigned_user_id: patch.assigned_user_id };
      if (!couldMatchFilters(filters, probe, currentUserId)) return { kind: "skip" };
    }
    return { kind: "refetch" };
  }

  const merged = mergeConversation(original, patch);
  if (!couldMatchFilters(filters, merged, currentUserId) || hasStaleAssigneeName(original, patch)) {
    return { kind: "refetch" };
  }
  const pages = data.pages.map(page => ({
    ...page,
    items: page.items.map(row => (row.chatwoot_conversation_id === id ? merged : row)),
  }));
  return { kind: "patched", data: resort({ ...data, pages }) };
}

function findOriginal(data: ConversationListData, id: number): Conversation | null {
  for (const page of data.pages) {
    const row = page.items.find(item => item.chatwoot_conversation_id === id);
    if (row) return row;
  }
  return null;
}

export type DetailPatchResult = { data: Conversation; stale: boolean };

/** Patches a cached detail; `stale` asks the caller to refetch it. */
export function patchConversationDetail(current: Conversation, patch: ConversationPatch): DetailPatchResult {
  return { data: mergeConversation(current, patch), stale: hasStaleAssigneeName(current, patch) };
}
