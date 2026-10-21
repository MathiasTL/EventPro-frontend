import { apiFetch, apiFetchBlob } from "@/shared/api/client";
import type { MessagePage } from "./types";

export const MESSAGES_PAGE_SIZE = 30;

/** `before` is the id of the oldest message already loaded; omit it for the newest page. */
export function listMessages(conversationId: number, before?: number, limit = MESSAGES_PAGE_SIZE) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (before !== undefined) params.set("before", String(before));
  return apiFetch<MessagePage>(`/conversations/${conversationId}/messages?${params}`);
}

/**
 * Downloads an attachment through the EventPro proxy with the JWT (spec 03, 4.3).
 * Backend task B9: the proxy endpoint is not implemented yet.
 * The path is rebuilt from ids because `attachments[].url` already carries the `/api/v1` prefix of `API_URL`.
 */
export const fetchAttachmentBlob = (conversationId: number, attachmentId: number) =>
  apiFetchBlob(`/conversations/${conversationId}/attachments/${attachmentId}`);
