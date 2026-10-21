"use client";

import { sendErrorMessage } from "../errors";
import { useRetryMessage } from "../use-send-message";

/** «Reintentar» for a failed message: requeues the same outbox row (spec 09, 6.7). */
export function RetryButton({ conversationId, outboxId }: { conversationId: number; outboxId: string }) {
  const mutation = useRetryMessage(conversationId);
  return (
    <span className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => mutation.mutate(outboxId)}
        disabled={mutation.isPending}
        className="rounded-md border border-red-300 bg-white px-2 py-0.5 text-xs font-semibold text-red-800 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {mutation.isPending ? "Reintentando…" : "Reintentar"}
      </button>
      <span role="alert" className={mutation.isError ? "text-xs font-medium text-red-700" : "sr-only"}>
        {mutation.isError ? sendErrorMessage(mutation.error) : ""}
      </span>
    </span>
  );
}
