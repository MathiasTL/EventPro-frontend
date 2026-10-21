import { apiFetch } from "@/shared/api/client";

/** `202` body of send and retry (spec 09, 6.4). */
export type QueuedMessage = {
  outbox_id: string;
  chatwoot_conversation_id: number;
  delivery_status: "QUEUED";
};

/** `POST /conversations/{id}/messages` with a JSON body: text only (templates are not offered, D20). */
export const sendTextMessage = (conversationId: number, content: string) =>
  apiFetch<QueuedMessage>(`/conversations/${conversationId}/messages`, { method: "POST", body: { content } });

/**
 * `POST /conversations/{id}/messages` as multipart: one `attachment` part and an optional `content` caption
 * (spec 09, 6.4 and D19; field names taken from the backend router).
 */
export function sendAttachmentMessage(conversationId: number, file: File, caption?: string) {
  const form = new FormData();
  form.append("attachment", file);
  const text = caption?.trim();
  if (text) form.append("content", text);
  return apiFetch<QueuedMessage>(`/conversations/${conversationId}/messages`, { method: "POST", body: form });
}

/** `POST /conversations/{id}/messages/{outbox_id}/retry` (spec 09, 6.7): requeues the same outbox row, empty body. */
export const retryOutboxMessage = (conversationId: number, outboxId: string) =>
  apiFetch<QueuedMessage>(`/conversations/${conversationId}/messages/${outboxId}/retry`, { method: "POST" });
