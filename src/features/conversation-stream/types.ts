import type { Conversation, ConversationClient, HandoffReason } from "@/entities/conversation";
import type { Message } from "@/entities/message";

/**
 * Payloads of the SSE events. Mirrors the backend envelope `data` (spec 09, section 8;
 * `conversation_events.py`). The browser receives `data` only, the event name comes from `event:`.
 */

export const CONVERSATION_STREAM_EVENT_NAMES = [
  "conversation.updated",
  "message.created",
  "message.updated",
  "handoff.requested",
] as const;

export type ConversationStreamEventName = (typeof CONVERSATION_STREAM_EVENT_NAMES)[number];

/** Client as published by the worker: name and phone can be missing when the gateway did not report them. */
export type StreamClient = {
  id: string | null;
  name: string | null;
  phone: string | null;
};

/**
 * Full inbox item when published by the API (takeover, release) or the worker with enrichment.
 * The worker may omit `quote_status`, `lead_status` and `assigned_user_name` (batch queries not available).
 */
export type ConversationUpdatedData = Omit<
  Conversation,
  "client" | "quote_status" | "lead_status" | "assigned_user_name"
> &
  Partial<Pick<Conversation, "quote_status" | "lead_status" | "assigned_user_name">> & {
    client: StreamClient;
  };

/** `author_name` is never part of the event; the cache resolves it from the unsent row when possible. */
export type StreamMessage = Omit<Message, "author_name"> & { author_name?: string | null };

export type MessageCreatedData = {
  chatwoot_conversation_id: number;
  message: StreamMessage;
};

/** Delivery fields only (plus the id used as key). */
export type MessageUpdatedData = {
  chatwoot_conversation_id: number;
  message: Pick<
    Message,
    "id" | "delivery_status" | "failure_reason" | "failure_code" | "outbox_id" | "retryable"
  >;
};

export type HandoffRequestedData = {
  chatwoot_conversation_id: number;
  handoff_reason: HandoffReason | null;
  /** Summary without free text from the customer (spec 09, section 11). */
  handoff_summary: string | null;
  client: StreamClient;
  handed_off_at: string | null;
};

export type ConversationStreamEvent =
  | { name: "conversation.updated"; data: ConversationUpdatedData }
  | { name: "message.created"; data: MessageCreatedData }
  | { name: "message.updated"; data: MessageUpdatedData }
  | { name: "handoff.requested"; data: HandoffRequestedData };

/** `error` is terminal: the connection gave up after repeated failures and only `retry` restarts it. */
export type ConversationStreamStatus = "connecting" | "open" | "reconnecting" | "closed" | "error";

/** Partial change applied to a cached conversation; `undefined` fields are left untouched. */
export type ConversationPatch = Partial<Omit<Conversation, "chatwoot_conversation_id" | "client">> & {
  client?: Partial<StreamClient>;
};

export type { ConversationClient };
