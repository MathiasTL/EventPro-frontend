"use client";

import { useAuth } from "@/app/providers/AuthProvider";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/shared/api/client";
import { formatSoles } from "@/shared/lib/format";
import { Badge, Button, ErrorBanner, Field, Input, Modal, Select, Textarea } from "@/shared/ui";

export type BookingInput = {
  client_name: string;
  phone: string;
  address: string;
  district: string;
  event_date: string;
  start_time: string;
  package_id: string;
  theme_id: string | null;
  extra_ids: string[];
  client_provides_transport: boolean;
  manual_mobility_amount?: string;
  mobility_override_reason?: string | null;
};
type Booking = {
  quote_id: string;
  client_name: string;
  phone: string;
  package_name: string;
  event_date: string;
  start_time: string;
  total_amount: string;
  advance_amount: string;
  pending_balance: string;
  payment_id: string;
  payment_status: string;
  quote_status: string;
  event_id: string | null;
  contract_id: string | null;
  contract_number: string | null;
  registered_by_user_id: string | null;
};

function downloadPdf(encoded: string, filename: string) {
  const bytes = Uint8Array.from(atob(encoded), char => char.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  const link = document.createElement("a"); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ManualBookingFlow({ request, advance, canRegister = false }: { request: BookingInput | null; advance?: string; canRegister?: boolean }) {
  const { user } = useAuth();
  const [refundRequest, setRefundRequest] = useState<{ booking: Booking; confirm: boolean } | null>(null);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [registered, setRegistered] = useState(false);
  const [quoteId] = useState(() => crypto.randomUUID());
  const load = useCallback(async () => { try { setItems(await apiFetch<Booking[]>(`/manual-bookings?page=${page}&page_size=20`)); } catch (caught) { setError(caught instanceof Error ? caught.message : "No se pudieron cargar las solicitudes."); } finally { setLoading(false); } }, [page]);
  useEffect(() => { let cancelled = false; apiFetch<Booking[]>(`/manual-bookings?page=${page}&page_size=20`).then(rows => { if (!cancelled) setItems(rows); }).catch(caught => { if (!cancelled) setError(caught instanceof Error ? caught.message : "No se pudieron cargar las solicitudes."); }).finally(() => { if (!cancelled) setLoading(false); }); return () => { cancelled = true; }; }, [page]);

  async function register(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!request) return;
    const data = new FormData(event.currentTarget);
    const file = data.get("receipt_file");
    if (!(file instanceof File) || file.size === 0 || file.size > 5 * 1024 * 1024) { setError("Adjunta un comprobante de hasta 5 MiB."); return; }
    data.set("payload_json", JSON.stringify({ ...request, quote_id: quoteId, payment_method: data.get("payment_method"), paid_amount: data.get("paid_amount") }));
    data.delete("payment_method"); data.delete("paid_amount");
    setBusy(true); setError(null); setSuccess(null);
    try { await apiFetch<Booking>("/manual-bookings", { method: "POST", body: data }); setRegistered(true); setSuccess("Comprobante registrado. Ahora el encargado debe revisarlo y validar el adelanto."); await load(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "No se pudo registrar el adelanto."); }
    finally { setBusy(false); }
  }

  async function confirm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selected) return;
    const data = new FormData(event.currentTarget);
    const reason = String(data.get("override_reason") ?? "").trim();
    setBusy(true); setError(null); setSuccess(null);
    try { const result = await apiFetch<Booking>(`/manual-bookings/${selected.quote_id}/confirm`, { method: "POST", body: { receipt_verified: true, approve_overbooking: data.get("approve_overbooking") === "on", override_reason: reason || null } }); setSelected(null); setSuccess(result.event_id ? `Reserva registrada y contrato ${result.contract_number} emitido. Ya puedes descargarlo.` : "El pago requiere revisión por capacidad. No se creó una reserva; coordina recursos o solicita devolución."); await load(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "No se pudo confirmar la reserva."); }
    finally { setBusy(false); }
  }

  async function refund(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!refundRequest) return;
    const data = new FormData(event.currentTarget);
    setBusy(true); setError(null); setSuccess(null);
    try {
      await apiFetch<Booking>(`/manual-bookings/${refundRequest.booking.quote_id}/refund`, { method: "POST", body: { action: refundRequest.confirm ? "CONFIRM" : "REQUEST", reason: String(data.get("reason")).trim() } });
      setSuccess(refundRequest.confirm ? "Devolución realizada registrada." : "Devolución pendiente registrada. Aún debes efectuar el reembolso.");
      setRefundRequest(null); await load();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "No se pudo registrar la devolución."); }
    finally { setBusy(false); }
  }

  async function receipt(booking: Booking) {
    setBusy(true); setError(null);
    try {
      // El endpoint existente protege la evidencia con el mismo rol del panel.
      const { API_URL } = await import("@/shared/config/env");
      const { getToken, clearSession } = await import("@/shared/lib/auth-storage");
      const response = await fetch(`${API_URL}/payments/${booking.payment_id}/evidence`, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (!response.ok) { if (response.status === 401) clearSession(); throw new Error("No se pudo descargar el comprobante."); }
      const blob = await response.blob(); const url = URL.createObjectURL(blob);
      const link = document.createElement("a"); link.href = url; link.download = `comprobante-${booking.payment_id}.${blob.type === "application/pdf" ? "pdf" : blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg"}`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "No se pudo abrir el comprobante."); }
    finally { setBusy(false); }
  }

  async function contract(booking: Booking) {
    setBusy(true); setError(null);
    try { const result = await apiFetch<{ filename: string; pdf_base64: string }>(`/manual-bookings/${booking.quote_id}/contract`); downloadPdf(result.pdf_base64, result.filename); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "No se pudo descargar el contrato."); }
    finally { setBusy(false); }
  }

  return <div className="space-y-5 border-t border-zinc-200 pt-6">
    {request && canRegister && !registered && <form onSubmit={register} className="space-y-4 rounded-xl border border-zinc-200 p-5"><h3 className="font-semibold">Registrar comprobante del adelanto</h3><p className="text-sm text-zinc-500">El pago quedará pendiente de revisión. Registrar un comprobante todavía no reserva el evento.</p><div className="grid gap-4 sm:grid-cols-2"><Field label="Medio de pago"><Select name="payment_method" disabled={busy}><option value="YAPE">Yape</option><option value="PLIN">Plin</option><option value="BANK_TRANSFER">Transferencia bancaria</option><option value="CASH">Efectivo</option></Select></Field><Field label="Importe recibido (S/)"><Input name="paid_amount" type="number" min="0.01" step="0.01" defaultValue={advance} required disabled={busy} /></Field></div><Field label="Comprobante (JPEG, PNG, WebP o PDF; máximo 5 MiB)"><Input name="receipt_file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required disabled={busy} /></Field><Button disabled={busy}>{busy ? "Registrando…" : "Registrar adelanto pendiente"}</Button></form>}
    {!selected && !refundRequest && <ErrorBanner message={error} />}{success && <p role="status" className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">{success}</p>}
    <div className="flex items-center justify-between"><h3 className="font-semibold">Solicitudes y contratos recientes</h3><Button variant="ghost" disabled={busy || loading} onClick={load}>Actualizar</Button></div>
    {loading ? <p>Cargando solicitudes…</p> : !items.length ? <p className="text-sm text-zinc-500">Genera un presupuesto y registra un comprobante para iniciar el proceso.</p> : <div className="space-y-3">{items.map(booking => <article key={booking.quote_id} className="space-y-3 rounded-xl border border-zinc-200 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h4 className="font-medium">{booking.client_name} · {booking.package_name}</h4><Badge tone={booking.event_id ? "success" : "warning"}>{booking.event_id ? "Reservado · contrato pendiente de firma" : booking.payment_status === "PENDING_VERIFICATION" ? "Adelanto pendiente de validación" : booking.payment_status}</Badge></div><p className="text-sm text-zinc-500">{booking.event_date} · {booking.start_time.slice(0, 5)} · Total {formatSoles(booking.total_amount)} · Adelanto {formatSoles(booking.advance_amount)}</p><div className="flex flex-wrap gap-2"><Button variant="ghost" disabled={busy} onClick={() => receipt(booking)}>Ver comprobante</Button>{booking.contract_id ? <Button disabled={busy} onClick={() => contract(booking)}>Descargar contrato</Button> : ["PENDING_VERIFICATION", "REQUIRES_MANUAL_APPROVAL"].includes(booking.payment_status) && <Button disabled={busy} onClick={() => { setError(null); setSelected(booking); }}>{booking.payment_status === "REQUIRES_MANUAL_APPROVAL" ? "Revisar sobrecupo" : "Validar adelanto y reservar"}</Button>}{["REQUIRES_MANUAL_APPROVAL", "REFUND_PENDING"].includes(booking.payment_status) && <Button variant="danger" disabled={busy} onClick={() => { setError(null); setRefundRequest({ booking, confirm: booking.payment_status === "REFUND_PENDING" }); }}>{booking.payment_status === "REFUND_PENDING" ? "Registrar devolución realizada" : "Solicitar devolución"}</Button>}</div>{booking.event_id && <p className="text-xs text-zinc-500">Evento: {booking.event_id} · Contrato: {booking.contract_number}</p>}</article>)}</div>}
    <div className="flex items-center justify-between"><Button variant="ghost" disabled={page === 1 || busy || loading} onClick={() => { setLoading(true); setPage(page - 1); }}>Anterior</Button><span className="text-sm">Página {page}</span><Button variant="ghost" disabled={items.length < 20 || busy || loading} onClick={() => { setLoading(true); setPage(page + 1); }}>Siguiente</Button></div>
    <Modal open={!!refundRequest} title={refundRequest?.confirm ? "Registrar devolución realizada" : "Solicitar devolución"} onClose={() => { if (!busy) setRefundRequest(null); }}><form onSubmit={refund} className="space-y-4"><p className="text-sm">{refundRequest?.confirm ? "Registra la devolución solo después de transferir realmente el dinero al cliente." : "El pago quedará pendiente de devolución; esta acción no transfiere dinero."}</p><Field label={refundRequest?.confirm ? "Referencia de la devolución realizada" : "Motivo de rechazo del sobrecupo"}><Textarea name="reason" required minLength={10} maxLength={500} disabled={busy} /></Field>{refundRequest?.confirm && <label className="flex gap-2 text-sm"><input type="checkbox" required disabled={busy} /><span>Comprobé que el dinero fue devuelto al cliente.</span></label>}<ErrorBanner message={error} /><Button disabled={busy}>{busy ? "Guardando…" : "Registrar"}</Button></form></Modal>
    <Modal open={!!selected} title="Validar adelanto y reservar" onClose={() => { if (!busy) { setSelected(null); setError(null); } }}><form onSubmit={confirm} className="space-y-4"><p className="text-sm">Al confirmar, se revalida disponibilidad, se reserva el evento y se genera el contrato automáticamente.</p><label className="flex items-start gap-2 text-sm"><input type="checkbox" required disabled={busy} className="mt-1" /><span>Revisé el comprobante y comprobé la recepción de {formatSoles(selected?.advance_amount)}. El archivo por sí solo no confirma una transferencia.</span></label>{selected?.registered_by_user_id === user?.id && <p className="text-sm text-amber-800">Registraste este pago. Debe revisarlo otro encargado; un superadministrador puede justificar una excepción.</p>}{selected?.payment_status === "REQUIRES_MANUAL_APPROVAL" && <label className="flex gap-2 text-sm"><input name="approve_overbooking" type="checkbox" required disabled={busy} /><span>Autorizar sobrecupo con recursos coordinados. Esto no permite reservar inventario faltante.</span></label>}{(selected?.payment_status === "REQUIRES_MANUAL_APPROVAL" || selected?.registered_by_user_id === user?.id) && <Field label="Motivo documentado de autorización"><Textarea name="override_reason" required minLength={10} maxLength={500} disabled={busy} /></Field>}<ErrorBanner message={error} /><Button disabled={busy || (selected?.registered_by_user_id === user?.id && user?.role !== "SUPERADMIN")}>{busy ? "Reservando y generando contrato…" : "Confirmar validación"}</Button></form></Modal>
  </div>;
}
