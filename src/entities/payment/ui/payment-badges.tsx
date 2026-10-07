import type { PaymentAuditStatus, PaymentConcept, PaymentValidationStatus } from "@/shared/types";

const VALIDATION_STYLES: Record<PaymentValidationStatus, string> = {
  PENDING_VERIFICATION: "bg-amber-100 text-amber-900",
  REQUIRES_MANUAL_APPROVAL: "bg-secondary-soft text-secondary",
  VERIFIED: "bg-tertiary-soft text-tertiary",
  REJECTED: "bg-red-100 text-red-800",
  REFUND_PENDING: "bg-card text-primary",
  REFUNDED: "bg-surface text-neutral",
};

const VALIDATION_LABELS: Record<PaymentValidationStatus, string> = {
  PENDING_VERIFICATION: "Por verificar",
  REQUIRES_MANUAL_APPROVAL: "Requiere aprobación",
  VERIFIED: "Verificado",
  REJECTED: "Rechazado",
  REFUND_PENDING: "Devolución pendiente",
  REFUNDED: "Devuelto",
};

export function PaymentStatusBadge({ status }: { status: PaymentValidationStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-0.5 font-label text-xs font-semibold ${VALIDATION_STYLES[status]}`}
    >
      {VALIDATION_LABELS[status]}
    </span>
  );
}

const CONCEPT_LABELS: Record<PaymentConcept, string> = {
  ADVANCE: "Adelanto",
  BALANCE: "Saldo",
  EXTENSION: "Extensión",
};

export function PaymentConceptBadge({ concept }: { concept: PaymentConcept }) {
  return (
    <span className="inline-flex items-center rounded-md bg-primary px-2.5 py-0.5 font-label text-xs font-medium text-white">
      {CONCEPT_LABELS[concept]}
    </span>
  );
}

const AUDIT_LABELS: Record<PaymentAuditStatus, string> = {
  UNREVIEWED: "Sin auditar",
  REVIEWED: "Auditado",
  FLAGGED: "Observado",
};

export function PaymentAuditBadge({ status }: { status: PaymentAuditStatus }) {
  return (
    <span className="inline-flex items-center rounded-md bg-surface px-2.5 py-0.5 font-label text-xs font-medium text-neutral">
      {AUDIT_LABELS[status]}
    </span>
  );
}
