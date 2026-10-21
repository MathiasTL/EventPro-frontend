import { apiFetch } from "@/shared/api/client";
import type { Conversation, ConversationFilters, ConversationPage } from "./types";

export const CONVERSATIONS_PAGE_SIZE = 20;

function filterParams(filters: ConversationFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.mode) params.set("mode", filters.mode);
  if (filters.assigned) params.set("assigned", filters.assigned);
  if (filters.assigned_user_id) params.set("assigned_user_id", filters.assigned_user_id);
  const q = filters.q?.trim();
  if (q && q.length >= 2) params.set("q", q);
  if (filters.include_resolved) params.set("include_resolved", "true");
  return params;
}

export function listConversations(filters: ConversationFilters, page = 1, pageSize = CONVERSATIONS_PAGE_SIZE) {
  const params = filterParams(filters);
  params.set("page", String(page));
  params.set("page_size", String(pageSize));
  return apiFetch<ConversationPage>(`/conversations?${params}`);
}

export const getConversation = (id: number) => apiFetch<Conversation>(`/conversations/${id}`);

/** Marks the thread as read for the current user (204, no body). */
export const markConversationRead = (id: number) => apiFetch<void>(`/conversations/${id}/read`, { method: "POST" });
