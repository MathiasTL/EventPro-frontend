"use client";

import { Button, Input } from "@/shared/ui";

import { useAuditPaymentForm } from "../model/use-audit-payment-form";

export function AuditPaymentForm({ paymentId, onDone }: { paymentId: string; onDone: () => void }) {
  const { auditNotes, setAuditNotes, flagged, setFlagged, error, loading, submit } =
    useAuditPaymentForm(paymentId, onDone);

  return (
    <form onSubmit={submit} className="space-y-4">
      {error ? (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300">
          {error}
        </div>
      ) : null}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={flagged} onChange={(event) => setFlagged(event.target.checked)} />
        Marcar como observado
      </label>
      <Input
        label="Notas de auditoría"
        placeholder="Monto de captura vs. registrado..."
        value={auditNotes}
        onChange={(event) => setAuditNotes(event.target.value)}
      />
      <Button type="submit" loading={loading} className="w-full">
        Guardar auditoría
      </Button>
    </form>
  );
}
