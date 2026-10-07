"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState, type FormEvent } from "react";

import { verifyPayment } from "@/entities/payment";
import { ApiError } from "@/shared/api";

export function useVerifyPaymentForm(paymentId: string, onDone: () => void) {
  const queryClient = useQueryClient();
  const [decision, setDecision] = useState<"VERIFIED" | "REJECTED">("VERIFIED");
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      verifyPayment(paymentId, {
        status: decision,
        rejection_reason: decision === "REJECTED" ? rejectionReason.trim() : null,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["payments"] });
      onDone();
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.detail : "No se pudo registrar la decisión.");
    },
  });

  const submit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      if (decision === "REJECTED" && rejectionReason.trim().length === 0) {
        setError("Indica el motivo del rechazo para que el cliente pueda reintentar.");
        return;
      }
      mutation.mutate();
    },
    [decision, rejectionReason, mutation],
  );

  return {
    decision,
    setDecision,
    rejectionReason,
    setRejectionReason,
    error,
    loading: mutation.isPending,
    submit,
  };
}
