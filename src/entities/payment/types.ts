/** Enums mirror `app/domain/entities/payment.py` in the backend. */
export type PaymentConcept = "ADVANCE" | "BALANCE" | "EXTENSION";
export type PaymentMethod = "YAPE" | "PLIN" | "BANK_TRANSFER" | "CASH";
export type PaymentValidationStatus =
  | "PENDING_VERIFICATION"
  | "REQUIRES_MANUAL_APPROVAL"
  | "VERIFIED"
  | "REJECTED"
  | "REFUND_PENDING"
  | "REFUNDED";
export type PaymentAuditStatus = "UNREVIEWED" | "REVIEWED" | "FLAGGED";

export const PAYMENT_METHODS: PaymentMethod[] = ["YAPE", "PLIN", "BANK_TRANSFER", "CASH"];
export const PAYMENT_VALIDATION_STATUSES: PaymentValidationStatus[] = [
  "PENDING_VERIFICATION",
  "REQUIRES_MANUAL_APPROVAL",
  "VERIFIED",
  "REJECTED",
  "REFUND_PENDING",
  "REFUNDED",
];
export const PAYMENT_CONCEPTS: PaymentConcept[] = ["ADVANCE", "BALANCE", "EXTENSION"];
export const PAYMENT_AUDIT_STATUSES: PaymentAuditStatus[] = ["UNREVIEWED", "REVIEWED", "FLAGGED"];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  YAPE: "Yape",
  PLIN: "Plin",
  BANK_TRANSFER: "Transferencia bancaria",
  CASH: "Efectivo",
};

/** Exact shape of `PaymentReadResponse` (GET /payments, GET /payments/{id}). `amount` is a Decimal serialized as a string. */
export type PaymentRead = {
  payment_id: string;
  quote_id: string;
  concept: PaymentConcept;
  payment_method: PaymentMethod;
  amount: string;
  validation_status: PaymentValidationStatus;
  audit_status: PaymentAuditStatus | null;
  event_id: string | null;
  transaction_reference: string | null;
  rejection_reason: string | null;
  verified_by_user_id: string | null;
  verified_at: string | null;
  registered_by_user_id: string | null;
  audited_by_user_id: string | null;
  audited_at: string | null;
  audit_notes: string | null;
  created_at: string;
};

/** Query params of GET /payments; `page_size` 100 is the backend maximum. */
export type PaymentFilters = {
  validation_status?: PaymentValidationStatus;
  concept?: PaymentConcept;
  audit_status?: PaymentAuditStatus;
  quote_id?: string;
  event_id?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  page_size?: number;
};

/** PATCH /payments/{id}/verify. VERIFIED needs `event_id` (ADVANCE only); REJECTED needs `rejection_reason`. */
export type VerifyPaymentInput = {
  status: "VERIFIED" | "REJECTED";
  rejection_reason?: string;
  event_id?: string;
};

export type VerifyPaymentResponse = {
  payment_id: string;
  validation_status: PaymentValidationStatus;
  rejection_reason: string | null;
};

/** PATCH /payments/{id}/audit. Only BALANCE/EXTENSION payments; FLAGGED needs `audit_notes`. */
export type AuditPaymentInput = {
  audit_status: Exclude<PaymentAuditStatus, "UNREVIEWED">;
  audit_notes?: string;
};

export type AuditPaymentResponse = {
  payment_id: string;
  audit_status: PaymentAuditStatus;
  audited_at: string;
};

/** PATCH /payments/{id}/refund. Moves REFUND_PENDING to REFUNDED. */
export type RefundPaymentInput = {
  refund_method: PaymentMethod;
  transaction_reference?: string;
  notes?: string;
};

export type RefundPaymentResponse = {
  payment_id: string;
  validation_status: PaymentValidationStatus;
};
