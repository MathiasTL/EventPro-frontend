"use client";

import { Button, Input } from "@/shared/ui";

import { useVerifyPaymentForm } from "../model/use-verify-payment-form";

export function VerifyPaymentForm({ paymentId, onDone }: { paymentId: string; onDone: () => void }) {
  const { decision, setDecision, rejectionReason, setRejectionReason, error, loading, submit } =
    useVerifyPaymentForm(paymentId, onDone);

  return (
    <form onSubmit={submit} className="space-y-4">
      {error ? (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300">
          {error}
        </div>
      ) : null}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={decision === "VERIFIED" ? "primary" : "ghost"}
          onClick={() => setDecision("VERIFIED")}
        >
          Aprobar
        </Button>
        <Button
          type="button"
          variant={decision === "REJECTED" ? "primary" : "ghost"}
          onClick={() => setDecision("REJECTED")}
        >
          Rechazar
        </Button>
      </div>
      {decision === "REJECTED" ? (
        <Input
          label="Motivo del rechazo"
          placeholder="Monto incompleto, captura ilegible..."
          required
          value={rejectionReason}
          onChange={(event) => setRejectionReason(event.target.value)}
        />
      ) : null}
      <Button type="submit" loading={loading} className="w-full">
        Confirmar decisión
      </Button>
    </form>
  );
}
