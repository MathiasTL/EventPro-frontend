"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
  paymentActionErrorMessage,
  paymentKeys,
  refundPayment,
  type PaymentMethod,
  type PaymentRead,
} from "@/entities/payment";
import { Button, ErrorBanner, Field, Input, Modal, Select, Textarea } from "@/shared/ui";

type Props = { payment: PaymentRead | null; onClose: () => void; onDone?: (message: string) => void };

export function RefundPaymentModal({ payment, onClose, onDone }: Props) {
  return (
    <Modal open={!!payment} title="Confirmar reembolso" onClose={onClose}>
      {payment && <RefundPaymentForm key={payment.payment_id} payment={payment} onClose={onClose} onDone={onDone} />}
    </Modal>
  );
}

function RefundPaymentForm({ payment, onClose, onDone }: Props & { payment: PaymentRead }) {
  const queryClient = useQueryClient();
  const [method, setMethod] = useState<PaymentMethod>(payment.payment_method);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      refundPayment(payment.payment_id, {
        refund_method: method,
        ...(reference.trim() ? { transaction_reference: reference.trim() } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: paymentKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: paymentKeys.detail(payment.payment_id) }),
      ]);
      onDone?.("Reembolso registrado.");
      onClose();
    },
  });

  const busy = mutation.isPending;
  return (
    <form onSubmit={event => { event.preventDefault(); mutation.mutate(); }} className="space-y-4">
      <fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
        <p className="text-sm text-zinc-500">Indica cómo se devolvió el dinero al cliente. Esta acción cierra el pago como reembolsado.</p>
        <Field label="Medio de reembolso">
          <Select value={method} onChange={e => setMethod(e.target.value as PaymentMethod)}>
            {PAYMENT_METHODS.map(value => <option key={value} value={value}>{PAYMENT_METHOD_LABELS[value]}</option>)}
          </Select>
        </Field>
        <Field label="Referencia de la operación (opcional)">
          <Input value={reference} onChange={e => setReference(e.target.value)} maxLength={60} placeholder="Código de operación" />
        </Field>
        <Field label="Observaciones (opcional)">
          <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
        </Field>
      </fieldset>
      <ErrorBanner message={mutation.isError ? paymentActionErrorMessage(mutation.error) : null} />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>Cancelar</Button>
        <Button disabled={busy}>{busy ? "Procesando…" : "Confirmar reembolso"}</Button>
      </div>
    </form>
  );
}
