"use client";
import { useCallback, useEffect, useState } from "react";
import { decidePayment, listPendingPayments, type Payment } from "@/entities/payment/api";
import { formatDate, formatSoles } from "@/shared/lib/format";
import { Button, EmptyState, ErrorBanner, Field, Input, Modal, Table, Textarea } from "@/shared/ui";

export function OverbookedPayments({ onSuccess }: { onSuccess: (message: string) => void }) {
  const [items, setItems] = useState<Payment[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decision, setDecision] = useState<{ payment: Payment; action: "APPROVE" | "REJECT" } | null>(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => { try { const result = await listPendingPayments(page); setItems(result.items); setTotal(result.total); setError(null); } catch (caught) { setError(caught instanceof Error ? caught.message : "No se pudieron cargar los pagos."); } finally { setLoading(false); } }, [page]);
  useEffect(() => { let cancelled = false; listPendingPayments(page).then(result => { if (!cancelled) { setItems(result.items); setTotal(result.total); setError(null); } }).catch(caught => { if (!cancelled) setError(caught instanceof Error ? caught.message : "No se pudieron cargar los pagos."); }).finally(() => { if (!cancelled) setLoading(false); }); return () => { cancelled = true; }; }, [page]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!decision) return; const data = new FormData(event.currentTarget); setBusy(true); setError(null);
    try { await decidePayment(decision.payment.payment_id, decision.action, String(data.get("notes") ?? ""), String(data.get("event_id") ?? "").trim() || undefined); setDecision(null); onSuccess(decision.action === "APPROVE" ? "Pago aprobado. Estado: verificado." : "Sobrecupo rechazado. Reembolso pendiente."); await load(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "No se pudo registrar la decisión."); }
    finally { setBusy(false); }
  }
  return <div className="space-y-4"><div className="flex items-center justify-between"><p className="text-sm text-zinc-500">{total} pagos pendientes</p><Button variant="ghost" disabled={loading} onClick={load}>Actualizar</Button></div>{!decision && <ErrorBanner message={error} />}{loading ? <p className="py-10 text-center text-sm text-zinc-500">Cargando pagos…</p> : !error && (items.length ? <Table head={["Pago", "Monto", "Fecha", "Decisión"]}>{items.map(payment => <tr key={payment.payment_id}><td className="px-4 py-4"><p className="font-mono text-xs">{payment.payment_id.slice(0, 8)}</p><p className="text-xs text-zinc-500">{payment.payment_method}</p></td><td className="px-4 py-4">{formatSoles(payment.amount)}</td><td className="px-4 py-4">{formatDate(payment.created_at)}</td><td className="px-4 py-4"><div className="flex gap-2"><Button onClick={() => { setError(null); setDecision({ payment, action: "APPROVE" }); }}>Aprobar</Button><Button variant="ghost" onClick={() => { setError(null); setDecision({ payment, action: "REJECT" }); }}>Rechazar</Button></div></td></tr>)}</Table> : <EmptyState message="No hay pagos pendientes de aprobación manual." />)}{total > 20 && <div className="flex justify-end gap-3"><Button variant="ghost" disabled={page === 1 || loading} onClick={() => setPage(page - 1)}>Anterior</Button><span className="py-2 text-sm">Página {page}</span><Button variant="ghost" disabled={page * 20 >= total || loading} onClick={() => setPage(page + 1)}>Siguiente</Button></div>}<Modal open={!!decision} title={decision?.action === "APPROVE" ? "Aprobar sobrecupo" : "Rechazar sobrecupo"} onClose={() => { if (!busy) { setDecision(null); setError(null); } }}><form onSubmit={submit} className="space-y-4">{decision?.action === "APPROVE" && <><p className="text-sm text-zinc-500">Vincula el pago a un evento existente para confirmar la aprobación.</p><Field label="ID del evento"><Input name="event_id" defaultValue={decision.payment.event_id ?? ""} required pattern="[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}" placeholder="UUID del evento" /></Field></>}<Field label="Observaciones"><Textarea name="notes" rows={3} /></Field><ErrorBanner message={error} /><div className="flex justify-end gap-2"><Button type="button" variant="ghost" disabled={busy} onClick={() => { setDecision(null); setError(null); }}>Cancelar</Button><Button disabled={busy}>{busy ? "Procesando…" : "Confirmar decisión"}</Button></div></form></Modal></div>;
}
