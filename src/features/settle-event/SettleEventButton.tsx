"use client";

import { useState } from "react";
import { Button, ErrorBanner, Modal } from "@/shared/ui";
import { settleEvent, type SettleEventResult } from "./api";

export function SettleEventButton({ eventId, onSettled }: { eventId: string; onSettled: (result: SettleEventResult) => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      const result = await settleEvent(eventId);
      onSettled(result);
      setOpen(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo liquidar el evento.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button className="w-full py-3 text-base" onClick={() => setOpen(true)}>Liquidar evento</Button>
      <Modal open={open} title="Confirmar liquidación" onClose={() => { if (!busy) setOpen(false); }}>
        <div className="space-y-4">
          <p className="text-sm text-zinc-700">
            Vas a cerrar este evento como liquidado. Confirma solo si todo el cobro (servicios, movilidad y extensiones) ya está cubierto.
          </p>
          <ErrorBanner message={error} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" disabled={busy} onClick={() => setOpen(false)}>Cancelar</Button>
            <Button disabled={busy} className="py-3 text-base" onClick={confirm}>{busy ? "Liquidando…" : "Sí, liquidar"}</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
