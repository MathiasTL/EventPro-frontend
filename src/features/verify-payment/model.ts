import type { PaymentRead } from "@/entities/payment";

export const UUID_PATTERN = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}";
const UUID_REGEX = new RegExp(`^${UUID_PATTERN}$`);

export const isUuid = (value: string) => UUID_REGEX.test(value.trim());

/** VERIFIED is only valid for an ADVANCE payment still awaiting verification. */
export const canVerify = (payment: PaymentRead) =>
  payment.concept === "ADVANCE" && payment.validation_status === "PENDING_VERIFICATION";

/** REJECTED is valid from PENDING_VERIFICATION or REQUIRES_MANUAL_APPROVAL. */
export const canReject = (payment: PaymentRead) =>
  payment.validation_status === "PENDING_VERIFICATION" || payment.validation_status === "REQUIRES_MANUAL_APPROVAL";
