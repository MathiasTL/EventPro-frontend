import { apiFetch } from "@/shared/api/client";
import type { PageResponse } from "@/shared/types/api";
export type Payment = { payment_id: string; quote_id: string; amount: string | number; event_id: string | null; created_at: string; payment_method: string };
export const listPendingPayments = (page = 1) => apiFetch<PageResponse<Payment>>(`/payments?validation_status=REQUIRES_MANUAL_APPROVAL&page=${page}&page_size=20`);
export const decidePayment = (id: string, action: "APPROVE" | "REJECT", notes: string, event_id?: string) => apiFetch(`/overrides/payments/${id}/approve-simultaneous`, { method: "POST", body: { action, notes: notes || null, ...(event_id ? { event_id } : {}) } });
