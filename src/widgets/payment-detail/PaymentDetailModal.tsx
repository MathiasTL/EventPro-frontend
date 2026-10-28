"use client";

import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PAYMENT_METHOD_LABELS,
  paymentDetailOptions,
  PaymentAuditBadge,
  PaymentConceptBadge,
  PaymentEvidenceViewer,
  PaymentStatusBadge,
  type PaymentRead,
} from "@/entities/payment";
import { AuditPaymentModal, canAudit } from "@/features/audit-payment";
import { canRefund, RefundPaymentModal } from "@/features/refund-payment";
import { canReject, canVerify, VerifyPaymentModal, type VerifyPaymentAction } from "@/features/verify-payment";
import { formatLimaDateTime } from "@/shared/lib/date";
import { formatSoles } from "@/shared/lib/format";
import { Button, ErrorBanner, Modal } from "@/shared/ui";

type Props = { payment: PaymentRead | null; onClose: () => void; onDone: (message: string) => void };
type ActiveAction = { kind: "verify"; action: VerifyPaymentAction } | { kind: "audit" } | { kind: "refund" } | null;

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="font-semibold text-zinc-500">{label}</dt>
      <dd className="break-all text-zinc-900">{children ?? "—"}</dd>
    </>
  );
}

const when = (value: string | null) => (value ? formatLimaDateTime(value) : null);

export function PaymentDetailModal({ payment, onClose, onDone }: Props) {
  return (
    <Modal open={!!payment} title="Detalle del pago" onClose={onClose}>
      {payment && <PaymentDetail key={payment.payment_id} initial={payment} onClose={onClose} onDone={onDone} />}
    </Modal>
  );
}

function PaymentDetail({ initial, onClose, onDone }: { initial: PaymentRead; onClose: () => void; onDone: (message: string) => void }) {
  const [active, setActive] = useState<ActiveAction>(null);
  const query = useQuery({ ...paymentDetailOptions(initial.payment_id), initialData: initial, initialDataUpdatedAt: 0 });
  const payment = query.data;
  const closeAction = () => setActive(null);

  const verify = canVerify(payment);
  const reject = canReject(payment);
  const audit = canAudit(payment);
  const refund = canRefund(payment);

  return (
    <div className="space-y-5 text-sm">
      <ErrorBanner message={query.isError ? "No se pudo actualizar el detalle del pago." : null} />
      <div className="flex flex-wrap items-center gap-2">
        <PaymentConceptBadge concept={payment.concept} />
        <PaymentStatusBadge status={payment.validation_status} />
        <PaymentAuditBadge status={payment.audit_status} />
        <span className="ml-auto text-base font-semibold text-zinc-900">{formatSoles(payment.amount)}</span>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs">
        <Row label="ID del pago">{payment.payment_id}</Row>
        <Row label="Cotización">{payment.quote_id}</Row>
        <Row label="Evento">{payment.event_id}</Row>
        <Row label="Método">{PAYMENT_METHOD_LABELS[payment.payment_method]}</Row>
        <Row label="Referencia">{payment.transaction_reference}</Row>
        <Row label="Registrado">{when(payment.created_at)}</Row>
        <Row label="Registrado por">{payment.registered_by_user_id}</Row>
        <Row label="Verificado por">{payment.verified_by_user_id}</Row>
        <Row label="Verificado el">{when(payment.verified_at)}</Row>
        <Row label="Motivo de rechazo">{payment.rejection_reason}</Row>
        <Row label="Auditado por">{payment.audited_by_user_id}</Row>
        <Row label="Auditado el">{when(payment.audited_at)}</Row>
        <Row label="Observaciones">{payment.audit_notes}</Row>
      </dl>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Comprobante</p>
        <PaymentEvidenceViewer paymentId={payment.payment_id} />
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-200 pt-4">
        {verify && <Button onClick={() => setActive({ kind: "verify", action: "VERIFIED" })}>Verificar</Button>}
        {reject && <Button variant="danger" onClick={() => setActive({ kind: "verify", action: "REJECTED" })}>Rechazar</Button>}
        {audit && <Button variant="ghost" onClick={() => setActive({ kind: "audit" })}>Auditar</Button>}
        {refund && <Button onClick={() => setActive({ kind: "refund" })}>Registrar reembolso</Button>}
        <Button variant="ghost" onClick={onClose}>Cerrar</Button>
      </div>

      <VerifyPaymentModal payment={active?.kind === "verify" ? payment : null} action={active?.kind === "verify" ? active.action : "VERIFIED"} onClose={closeAction} onDone={onDone} />
      <AuditPaymentModal payment={active?.kind === "audit" ? payment : null} onClose={closeAction} onDone={onDone} />
      <RefundPaymentModal payment={active?.kind === "refund" ? payment : null} onClose={closeAction} onDone={onDone} />
    </div>
  );
}
