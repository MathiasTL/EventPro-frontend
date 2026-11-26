"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentActionErrorMessage, paymentKeys, verifyPayment, type PaymentRead } from "@/entities/payment";
import { getQuote } from "@/entities/quote/api";
import { Button, ErrorBanner, Field, Input, Modal, Textarea } from "@/shared/ui";
import { isUuid, UUID_PATTERN } from "./model";

export type VerifyPaymentAction = "VERIFIED" | "REJECTED";

type Props = {
  payment: PaymentRead | null;
  action: VerifyPaymentAction;
  onClose: () => void;
  onDone?: (message: string) => void;
};

export function VerifyPaymentModal({ payment, action, onClose, onDone }: Props) {
  const approving = action === "VERIFIED";
  return (
    <Modal open={!!payment} title={approving ? "Verificar adelanto" : "Rechazar pago"} onClose={onClose}>
      {payment && <VerifyPaymentForm key={`${payment.payment_id}:${action}`} payment={payment} action={action} onClose={onClose} onDone={onDone} />}
    </Modal>
  );
}

function VerifyPaymentForm({ payment, action, onClose, onDone }: Props & { payment: PaymentRead }) {
  const queryClient = useQueryClient();
  const approving = action === "VERIFIED";
  // The quote decides the event: existing event -> prefilled read-only; none -> backend creates it on verify.
  const quoteQuery = useQuery({ queryKey: ["quotes", "detail", payment.quote_id], queryFn: () => getQuote(payment.quote_id), enabled: approving });
  const quoteEventId = quoteQuery.data?.event_id ?? payment.event_id ?? null;
  const quoteResolved = quoteQuery.isSuccess;
  const [typedEventId, setTypedEventId] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  // Fallback: if the quote cannot be loaded, keep the manual UUID input so verification is not blocked.
  const manualEntry = approving && quoteQuery.isError && !quoteEventId;
  const eventId = quoteEventId ?? typedEventId;
  const [reason, setReason] = useState("");
  const [validation, setValidation] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      verifyPayment(payment.payment_id, approving ? { status: "VERIFIED", ...(eventId.trim() ? { event_id: eventId.trim() } : {}) } : { status: "REJECTED", rejection_reason: reason.trim() }),
    onSuccess: async result => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["quotes"] }),
        queryClient.invalidateQueries({ queryKey: paymentKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: paymentKeys.detail(payment.payment_id) }),
      ]);
      if (approving && result.validation_status === "REQUIRES_MANUAL_APPROVAL") {
        setNotice("No hay cupo para esa fecha: el adelanto pasó a Sobrecupo para aprobación manual.");
        return;
      }
      onDone?.(approving ? "Adelanto verificado. El contrato fue emitido." : "Pago rechazado.");
      onClose();
    },
  });

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (approving && !quoteResolved && !manualEntry) return;
    if (manualEntry && !isUuid(eventId)) { setValidation("Ingresa un ID de evento válido (UUID)."); return; }
    if (!approving && !reason.trim()) { setValidation("El motivo del rechazo es obligatorio."); return; }
    setValidation(null);
    mutation.mutate();
  }

  const busy = mutation.isPending;
  if (notice) {
    return (
      <div className="space-y-4">
        <p role="status" className="text-sm text-ep-body">{notice}</p>
        <div className="flex justify-end"><Button onClick={onClose}>Cerrar</Button></div>
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
        {approving ? (
          <>
            {quoteQuery.isPending ? (
              <p className="text-sm text-ep-mute">Cargando cotización…</p>
            ) : quoteEventId ? (
              <>
                <p className="text-sm text-ep-body">El adelanto se vinculará al evento de la cotización ({payment.quote_id.slice(0, 8)}). Al verificar se emite el contrato.</p>
                <Field label="ID del evento">
                  <Input value={quoteEventId} readOnly />
                </Field>
              </>
            ) : manualEntry ? (
              <>
                <p className="text-sm text-ep-body">No se pudo cargar la cotización. Vincula el adelanto al evento pendiente de firma de la misma cotización ({payment.quote_id.slice(0, 8)}).</p>
                <Field label="ID del evento">
                  <Input value={typedEventId} onChange={e => setTypedEventId(e.target.value)} required pattern={UUID_PATTERN} placeholder="UUID del evento" />
                </Field>
              </>
            ) : (
              <p className="text-sm text-ep-body">Al verificar se creará el evento de la cotización y se emitirá el contrato.</p>
            )}
          </>
        ) : (
          <Field label="Motivo del rechazo">
            <Textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} required />
          </Field>
        )}
      </fieldset>
      <ErrorBanner message={validation ?? (mutation.isError ? paymentActionErrorMessage(mutation.error) : null)} />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>Cancelar</Button>
        <Button variant={approving ? "primary" : "danger"} disabled={busy || (approving && quoteQuery.isPending)}>{busy ? "Procesando…" : approving ? "Verificar adelanto" : "Rechazar pago"}</Button>
      </div>
    </form>
  );
}
