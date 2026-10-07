"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState, type FormEvent } from "react";

import { auditPayment } from "@/entities/payment";
import { ApiError } from "@/shared/api";

export function useAuditPaymentForm(paymentId: string, onDone: () => void) {
  const queryClient = useQueryClient();
  const [auditNotes, setAuditNotes] = useState("");
  const [flagged, setFlagged] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      auditPayment(paymentId, {
        audit_status: flagged ? "FLAGGED" : "REVIEWED",
        audit_notes: auditNotes.trim() ? auditNotes.trim() : null,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["payments"] });
      onDone();
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.detail : "No se pudo auditar el cobro.");
    },
  });

  const submit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      if (flagged && auditNotes.trim().length === 0) {
        setError("Describe la observación para marcar el cobro como observado.");
        return;
      }
      mutation.mutate();
    },
    [flagged, auditNotes, mutation],
  );

  return { auditNotes, setAuditNotes, flagged, setFlagged, error, loading: mutation.isPending, submit };
}
