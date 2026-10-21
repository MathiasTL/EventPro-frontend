"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getQuote } from "@/entities/quote/api";
import type { QuoteDetail } from "@/entities/quote/types";
import { ApiRequestError } from "@/shared/api/client";
import { Button, ErrorBanner } from "@/shared/ui";
import { QuoteShell, QuoteStatusBadge, eventDate, instant, money } from "./ui";

const paymentLabels: Record<string, string> = { ADVANCE: "Adelanto", BALANCE: "Saldo", EXTENSION: "Extensión", PENDING_VERIFICATION: "Pendiente de verificación", REQUIRES_MANUAL_APPROVAL: "Requiere aprobación manual", VERIFIED: "Verificado", REJECTED: "Rechazado", REFUND_PENDING: "Reembolso pendiente", REFUNDED: "Reembolsado" };

export function QuoteDetailPage({ quoteId }: { quoteId: string }) {
  return <QuoteShell><QuoteDetailContent key={quoteId} quoteId={quoteId} /></QuoteShell>;
}

function QuoteDetailContent({ quoteId }: { quoteId: string }) {
  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let cancelled = false;
    getQuote(quoteId).then(result => { if (!cancelled) { setQuote(result); setError(null); } }).catch(caught => {
      if (!cancelled) { setQuote(null); setError(caught instanceof ApiRequestError && caught.status === 404 ? "La cotización solicitada no existe." : caught instanceof Error ? caught.message : "No se pudo cargar la cotización."); }
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [quoteId, refresh]);

  return <>
    <Link href="/panel/quotes" className="mb-6 inline-block text-sm font-medium text-violet-700 hover:underline">← Volver a cotizaciones</Link>
    <h1 className="mb-6 text-3xl font-bold tracking-tight">Detalle de cotización</h1>
    <ErrorBanner message={error} />
    {error && <Button variant="ghost" onClick={() => { setLoading(true); setRefresh(n => n + 1); }}>Reintentar</Button>}
    {loading ? <p role="status" className="p-10 text-center text-zinc-500">Cargando detalle…</p> : quote && <>
      <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">{quote.client.full_name}</h2><p className="mt-1 text-sm text-zinc-500">{quote.client.phone}</p><p className="mt-2 break-all text-xs text-zinc-400">Referencia: {quote.quote_id}</p></div><QuoteStatusBadge status={quote.status} /></div><dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2 lg:grid-cols-4"><div><dt className="text-zinc-500">Evento · hora Lima</dt><dd className="mt-1 font-medium">{eventDate(quote.event_date)} · {quote.event_time.slice(0, 5)}</dd></div><div><dt className="text-zinc-500">Lugar</dt><dd className="mt-1 font-medium">{quote.location_address}<br />{quote.location_district}</dd></div><div><dt className="text-zinc-500">Origen</dt><dd className="mt-1 font-medium">{quote.source === "MANUAL" ? "Solicitud manual" : "WhatsApp"}</dd></div><div><dt className="text-zinc-500">Vencimiento · Lima</dt><dd className="mt-1 font-medium">{instant(quote.expires_at)}</dd></div></dl></section>
      <div className="grid items-start gap-6 lg:grid-cols-3"><section className="rounded-2xl border border-zinc-200 bg-white p-6 lg:col-span-2"><h2 className="mb-5 text-lg font-semibold">Servicios cotizados</h2><div className="flex justify-between gap-4 border-b border-zinc-100 pb-4"><div><p className="font-medium">{quote.package.name}</p><p className="mt-1 text-sm text-zinc-500">{quote.theme ? `Temática: ${quote.theme.name}` : "Sin temática"}</p></div><span>{money(quote.package.base_price)}</span></div>{quote.extras.map(extra => <div key={extra.extra_id} className="flex justify-between gap-4 border-b border-zinc-100 py-4 text-sm"><div><p>{extra.name}</p><p className="mt-1 text-zinc-500">{extra.quantity} × {money(extra.unit_price)}</p></div><span>{money(extra.subtotal)}</span></div>)}<h3 className="mt-6 text-sm font-semibold">Observaciones del cliente</h3><p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600">{quote.observations || "Sin observaciones registradas."}</p></section>
        <section className="rounded-2xl border border-zinc-200 bg-white p-6"><h2 className="mb-5 text-lg font-semibold">Resumen económico</h2><dl className="space-y-4 text-sm">{[["Servicios", quote.services_subtotal], [quote.mobility_overridden ? "Movilidad acordada" : "Movilidad", quote.final_mobility_amount], ["Total", quote.total_amount], ["Adelanto requerido", quote.advance_amount], ["Saldo pendiente", quote.pending_balance]].map(([label, value]) => <div key={label} className="flex justify-between gap-4"><dt className="text-zinc-500">{label}</dt><dd className="font-semibold">{money(value)}</dd></div>)}</dl><p className="mt-5 text-xs leading-relaxed text-zinc-500">Importes registrados al emitir la cotización. La movilidad está incluida en el total.</p></section></div>
      <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6"><h2 className="mb-4 text-lg font-semibold">Pagos relacionados</h2>{quote.payments.length ? <ul className="divide-y divide-zinc-100">{quote.payments.map(payment => <li key={payment.payment_id} className="flex flex-wrap justify-between gap-3 py-3 text-sm"><span>{paymentLabels[payment.concept] ?? payment.concept}</span><span>{paymentLabels[payment.validation_status] ?? payment.validation_status}</span></li>)}</ul> : <p className="text-sm text-zinc-500">Todavía no hay pagos registrados.</p>}{quote.event_id && <p className="mt-4 break-all text-sm text-zinc-600">Evento asociado: {quote.event_id}</p>}<p className="mt-4 text-xs text-zinc-400">Enviada: {instant(quote.sent_at)} · Cliente: {quote.client.id}</p></section>
    </>}
  </>;
}
