"use client";

import { useRef, useState } from "react";
import { Button, ErrorBanner, Field, Input, Modal, Select } from "@/shared/ui";
import { registerExtension, type PaymentMethod, type RegisterExtensionResult } from "./api";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const QUICK_MINUTES = [30, 60];

export function RegisterExtensionForm({ eventId, onRegistered }: { eventId: string; onRegistered: (result: RegisterExtensionResult) => void }) {
  const [open, setOpen] = useState(false);
  const [minutes, setMinutes] = useState(30);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("YAPE");
  const [reference, setReference] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function pickFile(selected: File | null) {
    setPreview(current => { if (current) URL.revokeObjectURL(current); return null; });
    setFile(null);
    setError(null);
    if (!selected) return;
    if (!ALLOWED_TYPES.has(selected.type)) { setError("La foto debe ser JPEG, PNG o WebP."); return; }
    if (selected.size === 0 || selected.size > MAX_BYTES) { setError("La foto debe pesar hasta 5 MB."); return; }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  function reset() {
    setMinutes(30); setAmount(""); setMethod("YAPE"); setReference(""); pickFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) { setError("Toma o adjunta la foto del cobro antes de registrar."); return; }
    const parsedAmount = Number(amount);
    if (!amount || !Number.isFinite(parsedAmount) || parsedAmount <= 0) { setError("Ingresa un importe pactado válido."); return; }
    setBusy(true); setError(null);
    try {
      const result = await registerExtension(eventId, {
        extra_minutes: minutes,
        agreed_rate: parsedAmount.toFixed(2),
        payment_method: method,
        transaction_reference: reference.trim() || undefined,
        evidence_file: file,
      });
      onRegistered(result);
      setOpen(false);
      reset();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo registrar la extensión.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="ghost" className="w-full" onClick={() => setOpen(true)}>Registrar extensión</Button>
      <Modal open={open} title="Registrar tiempo adicional" onClose={() => { if (!busy) { setOpen(false); reset(); } }}>
        <form onSubmit={submit} className="space-y-4">
          <fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
            <div>
              <p className="mb-1 text-sm font-medium text-ep-ink">Minutos adicionales</p>
              <div className="flex gap-2">
                {QUICK_MINUTES.map(value => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMinutes(value)}
                    className={`flex min-h-11 flex-1 items-center justify-center rounded-lg border px-3 text-[0.8125rem] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ep-magenta lg:min-h-10 ${minutes === value ? "border-ep-ink bg-ep-ink text-white" : "border-ep-line-strong bg-ep-pass text-ep-ink hover:bg-white"}`}
                  >
                    +{value} min
                  </button>
                ))}
              </div>
              <Input className="mt-2" type="number" min={1} step={1} value={minutes} onChange={event => setMinutes(Number(event.target.value))} aria-label="Minutos adicionales (otro valor)" />
            </div>
            <Field label="Importe pactado (S/)">
              <Input type="number" min="0.01" step="0.01" value={amount} onChange={event => setAmount(event.target.value)} required placeholder="0.00" />
            </Field>
            <Field label="Medio de pago">
              <Select value={method} onChange={event => setMethod(event.target.value as PaymentMethod)}>
                <option value="YAPE">Yape</option>
                <option value="PLIN">Plin</option>
                <option value="BANK_TRANSFER">Transferencia bancaria</option>
                <option value="CASH">Efectivo</option>
              </Select>
            </Field>
            <Field label="Referencia de la operación (opcional)">
              <Input value={reference} onChange={event => setReference(event.target.value)} maxLength={60} placeholder="Código de operación" />
            </Field>
            <Field label="Foto del cobro">
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={event => pickFile(event.target.files?.[0] ?? null)}
                className="block w-full text-sm text-ep-body file:mr-3 file:min-h-10 file:rounded-lg file:border file:border-ep-line-strong file:bg-ep-pass file:px-3 file:text-[0.8125rem] file:font-semibold file:text-ep-ink hover:file:bg-white"
              />
            </Field>
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Vista previa de la foto del cobro" className="max-h-56 w-full rounded-lg border border-ep-line object-contain" />
            )}
          </fieldset>
          <ErrorBanner message={error} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" disabled={busy} onClick={() => { setOpen(false); reset(); }}>Cancelar</Button>
            <Button disabled={busy} >{busy ? "Registrando…" : "Registrar extensión"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
