import type { PaymentRead } from "@/entities/payment";

/** Only BALANCE/EXTENSION payments are audited; REVIEWED is final and a FLAGGED payment cannot go back to UNREVIEWED. */
export const canAudit = (payment: PaymentRead) =>
  (payment.concept === "BALANCE" || payment.concept === "EXTENSION") && payment.audit_status !== "REVIEWED";
