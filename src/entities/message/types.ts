/** Mirrors backend `MessagePageResponse` (spec 09, 7.3). */

export type MessageDirection = "INCOMING" | "OUTGOING" | "ACTIVITY";
export type AuthorType = "CLIENT" | "BOT" | "AGENT";
/** Thread messages map Chatwoot statuses; the backend types this field as free text. */
export type DeliveryStatus = "SENT" | "DELIVERED" | "READ" | "FAILED";
export type UnsentDeliveryStatus = "QUEUED" | "FAILED";
export type OutboxMessageType = "TEXT" | "TEMPLATE" | "INTERACTIVE" | "DOCUMENT";

export type MessageAttachment = {
  id: number;
  file_type: string;
  content_type: string | null;
  /** Backend route including the `/api/v1` prefix; use `fetchAttachmentBlob` instead of loading it directly. */
  url: string;
};

export type Message = {
  /** Chatwoot message id; also the `before` cursor. */
  id: number | string;
  direction: MessageDirection;
  author_type: AuthorType | null;
  /** Only set for `AGENT`. */
  author_name: string | null;
  content: string;
  attachments: MessageAttachment[];
  delivery_status: DeliveryStatus | null;
  failure_reason: string | null;
  failure_code: number | null;
  outbox_id: string | null;
  retryable: boolean;
  created_at: string;
};

/** Outbox row not yet confirmed in the thread; only on the first page. */
export type UnsentMessage = {
  outbox_id: string;
  author_type: AuthorType;
  author_name: string | null;
  message_type: OutboxMessageType;
  content: string;
  delivery_status: UnsentDeliveryStatus;
  failure_reason: string | null;
  retryable: boolean;
  created_at: string;
};

/** Newest first. `unsent` is present only when `before` was omitted. */
export type MessagePage = {
  items: Message[];
  has_more: boolean;
  unsent?: UnsentMessage[];
};
