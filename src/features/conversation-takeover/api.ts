import { apiFetch } from "@/shared/api/client";
import type { Conversation } from "@/entities/conversation";

/** `POST /conversations/{id}/takeover` (spec 09, 6.3). A SUPERADMIN on another user's conversation reassigns it (6.6). */
export const takeoverConversation = (conversationId: number) =>
  apiFetch<Conversation>(`/conversations/${conversationId}/takeover`, { method: "POST" });

/** `POST /conversations/{id}/release` (spec 09, 6.5): hands the conversation back to the bot. */
export const releaseConversation = (conversationId: number) =>
  apiFetch<Conversation>(`/conversations/${conversationId}/release`, { method: "POST" });
