"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getQuote } from "@/entities/quote/api";
import type { QuoteDetail } from "@/entities/quote/types";
import { ApiRequestError } from "@/shared/api/client";
import { ChevronLeft } from "lucide-react";
import { Button, ErrorBanner, LoadingState, Panel } from "@/shared/ui";
import { PaymentStatusBadge } from "@/entities/payment/ui/PaymentBadges";
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

  const kv = (label: string, children: React.ReactNode) => <div><dt className="text-xs font-semibold text-ep-mute">{label}</dt><dd className="mt-1 text-sm font-medium text-ep-ink">{children}</dd></div>;

  return <>
    <Link href="/panel/quotes" className="inline-flex items-center gap-1 text-sm font-medium text-ep-ink underline underline-offset-4 hover:text-ep-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ep-magenta"><ChevronLeft aria-hidden="true" size={18} strokeWidth={1.75} strokeLinecap="square" />Volver a cotizaciones</Link>
    <h1 className="ep-cond text-3xl leading-none text-ep-ink sm:text-4xl">Detalle de cotización</h1>
    <ErrorBanner message={error} />
    {error && <div><Button variant="ghost" onClick={() => { setLoading(true); setRefresh(n => n + 1); }}>Reintentar</Button></div>}
    {loading ? <LoadingState label="Cargando detalle…" /> : quote && <>
      <Panel><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="ep-cond text-2xl leading-none text-ep-ink">{quote.client.full_name}</h2><p className="mt-2 text-sm text-ep-body tabular-nums">{quote.client.phone}</p><p className="mt-2 break-all text-xs text-ep-mute">Referencia: {quote.quote_id}</p></div><QuoteStatusBadge status={quote.status} /></div>
        <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 tabular-nums">
          {kv("Evento · hora Lima", `${eventDate(quote.event_date)} · ${quote.event_time.slice(0, 5)}`)}
          {kv("Lugar", <>{quote.location_address}<br />{quote.location_district}</>)}
          {kv("Origen", quote.source === "MANUAL" ? "Solicitud manual" : "WhatsApp")}
          {kv("Vencimiento · Lima", instant(quote.expires_at))}
        </dl></Panel>
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2"><h2 className="mb-5 text-base font-semibold text-ep-ink">Servicios cotizados</h2>
          <div className="flex justify-between gap-4 border-b border-ep-line pb-4 tabular-nums"><div><p className="font-medium text-ep-ink">{quote.package.name}</p><p className="mt-1 text-sm text-ep-mute">{quote.theme ? `Temática: ${quote.theme.name}` : "Sin temática"}</p></div><span className="text-sm text-ep-ink">{money(quote.package.base_price)}</span></div>
          {quote.extras.map(extra => <div key={extra.extra_id} className="flex justify-between gap-4 border-b border-ep-line py-4 text-sm tabular-nums"><div><p className="text-ep-ink">{extra.name}</p><p className="mt-1 text-ep-mute">{extra.quantity} × {money(extra.unit_price)}</p></div><span className="text-ep-ink">{money(extra.subtotal)}</span></div>)}
          <h3 className="mt-6 text-sm font-semibold text-ep-ink">Observaciones del cliente</h3><p className="mt-2 whitespace-pre-wrap text-sm text-ep-body">{quote.observations || "Sin observaciones registradas."}</p></Panel>
        <Panel><h2 className="mb-5 text-base font-semibold text-ep-ink">Resumen económico</h2>
          <dl className="space-y-4 text-sm tabular-nums">{[["Servicios", quote.services_subtotal], [quote.mobility_overridden ? "Movilidad acordada" : "Movilidad", quote.final_mobility_amount], ["Total", quote.total_amount], ["Adelanto requerido", quote.advance_amount], ["Saldo pendiente", quote.pending_balance]].map(([label, value]) => <div key={label} className="flex justify-between gap-4"><dt className="text-ep-mute">{label}</dt><dd className="font-semibold text-ep-ink">{money(value)}</dd></div>)}</dl>
          <p className="mt-5 text-xs leading-relaxed text-ep-mute">Importes registrados al emitir la cotización. La movilidad está incluida en el total.</p></Panel>
      </div>
      <Panel><h2 className="mb-4 text-base font-semibold text-ep-ink">Pagos relacionados</h2>
        {quote.payments.length ? <ul className="divide-y divide-ep-line">{quote.payments.map(payment => <li key={payment.payment_id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm text-ep-ink"><span>{paymentLabels[payment.concept] ?? payment.concept}</span><PaymentStatusBadge status={payment.validation_status} /></li>)}</ul> : <p className="text-sm text-ep-mute">Todavía no hay pagos registrados.</p>}
        {quote.event_id && <p className="mt-4 break-all text-sm text-ep-body">Evento asociado: {quote.event_id}</p>}
        <p className="mt-4 text-xs text-ep-mute tabular-nums">Enviada: {instant(quote.sent_at)} · Cliente: {quote.client.id}</p></Panel>
    </>}
  </>;
}
