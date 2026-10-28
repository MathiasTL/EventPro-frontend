import type { PaymentRead } from "@/entities/payment";

/** A refund can only be confirmed while the payment is REFUND_PENDING. */
export const canRefund = (payment: PaymentRead) => payment.validation_status === "REFUND_PENDING";
