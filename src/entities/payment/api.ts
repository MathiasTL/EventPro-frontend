import { apiFetch, apiFetchBlob } from "@/shared/api/client";
import type { PageResponse } from "@/shared/types/api";
import type {
  AuditPaymentInput,
  AuditPaymentResponse,
  PaymentFilters,
  PaymentRead,
  RefundPaymentInput,
  RefundPaymentResponse,
  VerifyPaymentInput,
  VerifyPaymentResponse,
} from "./types";

export type Payment = { payment_id: string; quote_id: string; amount: string | number; event_id: string | null; created_at: string; payment_method: string };
export const listPendingPayments = (page = 1) => apiFetch<PageResponse<Payment>>(`/payments?validation_status=REQUIRES_MANUAL_APPROVAL&page=${page}&page_size=20`);
export const decidePayment = (id: string, action: "APPROVE" | "REJECT", notes: string, event_id?: string) => apiFetch(`/overrides/payments/${id}/approve-simultaneous`, { method: "POST", body: { action, notes: notes || null, ...(event_id ? { event_id } : {}) } });

/** GET /payments — paginated, newest first. */
export function listPayments(filters: PaymentFilters = {}): Promise<PageResponse<PaymentRead>> {
  const params = new URLSearchParams();
  if (filters.validation_status) params.set("validation_status", filters.validation_status);
  if (filters.concept) params.set("concept", filters.concept);
  if (filters.audit_status) params.set("audit_status", filters.audit_status);
  if (filters.quote_id) params.set("quote_id", filters.quote_id);
  if (filters.event_id) params.set("event_id", filters.event_id);
  if (filters.from_date) params.set("from_date", filters.from_date);
  if (filters.to_date) params.set("to_date", filters.to_date);
  params.set("page", String(filters.page ?? 1));
  params.set("page_size", String(filters.page_size ?? 20));
  return apiFetch<PageResponse<PaymentRead>>(`/payments?${params.toString()}`);
}

export function getPayment(id: string): Promise<PaymentRead> {
  return apiFetch<PaymentRead>(`/payments/${id}`);
}

/** GET /payments/{id}/evidence — raw bytes served as `application/octet-stream`; sniff the real type. */
export function fetchPaymentEvidence(id: string): Promise<Blob> {
  return apiFetchBlob(`/payments/${id}/evidence`);
}

export function verifyPayment(id: string, input: VerifyPaymentInput): Promise<VerifyPaymentResponse> {
  return apiFetch<VerifyPaymentResponse>(`/payments/${id}/verify`, { method: "PATCH", body: input });
}

export function auditPayment(id: string, input: AuditPaymentInput): Promise<AuditPaymentResponse> {
  return apiFetch<AuditPaymentResponse>(`/payments/${id}/audit`, { method: "PATCH", body: input });
}

export function refundPayment(id: string, input: RefundPaymentInput): Promise<RefundPaymentResponse> {
  return apiFetch<RefundPaymentResponse>(`/payments/${id}/refund`, { method: "PATCH", body: input });
}
