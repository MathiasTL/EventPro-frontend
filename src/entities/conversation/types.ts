/** Mirrors backend `ConversationResponse` (spec 09, 7.2). */

export type ConversationMode = "BOT" | "HUMAN";
/** Raw Chatwoot lifecycle, lowercased by the backend. */
export type ConversationLifecycle = "pending" | "open" | "resolved";
export type LeadStatus = "QUOTING" | "QUOTE_SENT" | "PAYMENT_STARTED" | "CONVERTED" | "QUOTE_CLOSED" | "EVENT_DONE";
export type QuoteStatus = "SENT" | "PAYMENT_STARTED" | "CONVERTED" | "EXPIRED" | "CANCELLED";
export type HandoffReason = "CLIENT_REQUEST" | "BOT_NOT_UNDERSTOOD" | "MANUAL_TAKEOVER" | "BOT_ERROR";
export type AssignedFilter = "me" | "unassigned";

export type ConversationClient = {
  /** `null` when the phone has no registered client (D1). */
  id: string | null;
  name: string;
  phone: string;
};

export type Conversation = {
  chatwoot_conversation_id: number;
  client: ConversationClient;
  quote_id: string | null;
  quote_status: QuoteStatus | null;
  lead_status: LeadStatus;
  status: ConversationLifecycle;
  mode: ConversationMode;
  assigned_user_id: string | null;
  assigned_user_name: string | null;
  unread_count: number;
  handoff_reason: HandoffReason | null;
  handed_off_at: string | null;
  last_message_preview: string | null;
  last_message_at: string | null;
  service_window_open: boolean;
  service_window_expires_at: string | null;
};

/** Query params of `GET /conversations`. `assigned_user_id` is SUPERADMIN-only (403 otherwise). */
export type ConversationFilters = {
  mode?: ConversationMode;
  assigned?: AssignedFilter;
  assigned_user_id?: string;
  /** Free text, 2 to 100 characters. */
  q?: string;
  include_resolved?: boolean;
};

/** Page-number pagination (the conversations endpoint is not cursor based). */
export type ConversationPage = {
  items: Conversation[];
  page: number;
  page_size: number;
  total: number;
};
