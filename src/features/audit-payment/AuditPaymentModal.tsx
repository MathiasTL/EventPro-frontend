"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { auditPayment, paymentActionErrorMessage, paymentKeys, type AuditPaymentInput, type PaymentRead } from "@/entities/payment";
import { Button, ErrorBanner, Field, Modal, Select, Textarea } from "@/shared/ui";

type Props = { payment: PaymentRead | null; onClose: () => void; onDone?: (message: string) => void };

export function AuditPaymentModal({ payment, onClose, onDone }: Props) {
  return (
    <Modal open={!!payment} title="Auditar pago" onClose={onClose}>
      {payment && <AuditPaymentForm key={payment.payment_id} payment={payment} onClose={onClose} onDone={onDone} />}
    </Modal>
  );
}

function AuditPaymentForm({ payment, onClose, onDone }: Props & { payment: PaymentRead }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuditPaymentInput["audit_status"]>("REVIEWED");
  const [notes, setNotes] = useState("");
  const [validation, setValidation] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => auditPayment(payment.payment_id, { audit_status: status, ...(notes.trim() ? { audit_notes: notes.trim() } : {}) }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: paymentKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: paymentKeys.detail(payment.payment_id) }),
      ]);
      onDone?.(status === "FLAGGED" ? "Pago marcado para revisión." : "Pago marcado como revisado.");
      onClose();
    },
  });

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "FLAGGED" && !notes.trim()) { setValidation("Las observaciones son obligatorias al marcar un pago."); return; }
    setValidation(null);
    mutation.mutate();
  }

  const busy = mutation.isPending;
  return (
    <form onSubmit={submit} className="space-y-4">
      <fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
        <Field label="Resultado de la auditoría">
          <Select value={status} onChange={e => setStatus(e.target.value as AuditPaymentInput["audit_status"])}>
            <option value="REVIEWED">Revisado</option>
            <option value="FLAGGED">Marcado para revisión</option>
          </Select>
        </Field>
        <Field label={status === "FLAGGED" ? "Observaciones" : "Observaciones (opcional)"}>
          <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} required={status === "FLAGGED"} />
        </Field>
      </fieldset>
      <ErrorBanner message={validation ?? (mutation.isError ? paymentActionErrorMessage(mutation.error) : null)} />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>Cancelar</Button>
        <Button disabled={busy}>{busy ? "Guardando…" : "Guardar auditoría"}</Button>
      </div>
    </form>
  );
}
