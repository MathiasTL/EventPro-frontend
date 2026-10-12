import { apiFetch } from "@/shared/api/client";
import type { EventStatus } from "@/entities/event/types";

export type PaymentMethod = "YAPE" | "PLIN" | "BANK_TRANSFER" | "CASH";

export type RegisterExtensionInput = {
  extra_minutes: number;
  agreed_rate: string;
  payment_method: PaymentMethod;
  transaction_reference?: string;
  evidence_file: File;
};

export type RegisterExtensionResult = {
  event_id: string;
  status: EventStatus;
  extension_id: string;
  payment: {
    payment_id: string;
    concept: string;
    amount: number;
    validation_status: string;
    audit_status: string;
  };
};

/** POST /events/{id}/extensions (multipart) — US-18: tiempo adicional cobrado con evidencia. */
export function registerExtension(eventId: string, input: RegisterExtensionInput): Promise<RegisterExtensionResult> {
  const data = new FormData();
  data.set("extra_minutes", String(input.extra_minutes));
  data.set("agreed_rate", input.agreed_rate);
  data.set("payment_method", input.payment_method);
  if (input.transaction_reference) data.set("transaction_reference", input.transaction_reference);
  data.set("evidence_file", input.evidence_file);
  return apiFetch<RegisterExtensionResult>(`/events/${eventId}/extensions`, { method: "POST", body: data });
}
