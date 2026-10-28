import { Badge } from "@/shared/ui";
import type { PaymentAuditStatus, PaymentConcept, PaymentValidationStatus } from "../types";

type Tone = "neutral" | "success" | "warning" | "danger";

const STATUS: Record<PaymentValidationStatus, { label: string; tone: Tone }> = {
  PENDING_VERIFICATION: { label: "Pendiente de verificación", tone: "warning" },
  REQUIRES_MANUAL_APPROVAL: { label: "Requiere aprobación manual", tone: "warning" },
  VERIFIED: { label: "Verificado", tone: "success" },
  REJECTED: { label: "Rechazado", tone: "danger" },
  REFUND_PENDING: { label: "Reembolso pendiente", tone: "warning" },
  REFUNDED: { label: "Reembolsado", tone: "neutral" },
};

const CONCEPT: Record<PaymentConcept, string> = {
  ADVANCE: "Adelanto",
  BALANCE: "Saldo",
  EXTENSION: "Extensión",
};

const AUDIT: Record<PaymentAuditStatus, { label: string; tone: Tone }> = {
  UNREVIEWED: { label: "Sin revisar", tone: "neutral" },
  REVIEWED: { label: "Revisado", tone: "success" },
  FLAGGED: { label: "Observado", tone: "danger" },
};

export function PaymentStatusBadge({ status }: { status: PaymentValidationStatus }) {
  const { label, tone } = STATUS[status];
  return <Badge tone={tone}>{label}</Badge>;
}

export function PaymentConceptBadge({ concept }: { concept: PaymentConcept }) {
  return <Badge>{CONCEPT[concept]}</Badge>;
}

/** Audit applies only to BALANCE/EXTENSION; a null status (ADVANCE) renders nothing. */
export function PaymentAuditBadge({ status }: { status: PaymentAuditStatus | null }) {
  if (!status) return null;
  const { label, tone } = AUDIT[status];
  return <Badge tone={tone}>{label}</Badge>;
}
