"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentActionErrorMessage, paymentKeys, verifyPayment, type PaymentRead } from "@/entities/payment";
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
  // An unresolved ADVANCE has no event_id, so the prefill is normally empty; the encargado links the event awaiting signature.
  const [eventId, setEventId] = useState(payment.event_id ?? "");
  const [reason, setReason] = useState("");
  const [validation, setValidation] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      verifyPayment(payment.payment_id, approving ? { status: "VERIFIED", event_id: eventId.trim() } : { status: "REJECTED", rejection_reason: reason.trim() }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: paymentKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: paymentKeys.detail(payment.payment_id) }),
      ]);
      onDone?.(approving ? "Adelanto verificado. El contrato fue emitido." : "Pago rechazado.");
      onClose();
    },
  });

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (approving && !isUuid(eventId)) { setValidation("Ingresa un ID de evento válido (UUID)."); return; }
    if (!approving && !reason.trim()) { setValidation("El motivo del rechazo es obligatorio."); return; }
    setValidation(null);
    mutation.mutate();
  }

  const busy = mutation.isPending;
  return (
    <form onSubmit={submit} className="space-y-4">
      <fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
        {approving ? (
          <>
            <p className="text-sm text-zinc-500">
              Vincula el adelanto al evento pendiente de firma de la misma cotización ({payment.quote_id.slice(0, 8)}). Al verificar se emite el contrato.
            </p>
            <Field label="ID del evento">
              <Input value={eventId} onChange={e => setEventId(e.target.value)} required pattern={UUID_PATTERN} placeholder="UUID del evento" />
            </Field>
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
        <Button variant={approving ? "primary" : "danger"} disabled={busy}>{busy ? "Procesando…" : approving ? "Verificar adelanto" : "Rechazar pago"}</Button>
      </div>
    </form>
  );
}
