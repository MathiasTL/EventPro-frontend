"use client";

import { useState } from "react";
import { Button, ErrorBanner } from "@/shared/ui";
import { startEvent, type StartEventResult } from "./api";

export function StartEventButton({ eventId, onStarted }: { eventId: string; onStarted: (result: StartEventResult) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    setBusy(true);
    setError(null);
    try {
      const result = await startEvent(eventId);
      onStarted(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo iniciar el show.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <ErrorBanner message={error} />
      <Button className="w-full py-3 text-base" disabled={busy} onClick={handleStart}>
        {busy ? "Iniciando…" : "Iniciar show"}
      </Button>
    </div>
  );
}
