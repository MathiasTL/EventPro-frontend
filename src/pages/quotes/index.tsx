"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { listQuotes } from "@/entities/quote/api";
import { quoteStatusLabels, type QuoteFilters, type QuotePage, type QuoteStatus } from "@/entities/quote/types";
import { Button, EmptyState, ErrorBanner, Field, FilterBar, Input, LoadingState, PageHeader, Select, Table } from "@/shared/ui";
import { QuoteShell, QuoteStatusBadge, eventDate, instant, money } from "./ui";

const PAGE_SIZE = 20;

export function QuoteListPage() {
  return <QuoteShell><QuoteListContent /></QuoteShell>;
}

function QuoteListContent() {
  const [draft, setDraft] = useState<QuoteFilters>({ status: "", client_id: "", from_date: "", to_date: "" });
  const [filters, setFilters] = useState<QuoteFilters>({ page: 1, page_size: PAGE_SIZE });
  const [data, setData] = useState<QuotePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const dateRangeError = draft.from_date && draft.to_date && draft.from_date > draft.to_date
    ? "La fecha inicial no puede ser posterior a la final."
    : null;

  useEffect(() => {
    let cancelled = false;
    listQuotes(filters).then(result => {
      if (!cancelled) { setData(result); setError(null); }
    }).catch(caught => {
      if (!cancelled) { setError(caught instanceof Error ? caught.message : "No se pudieron cargar las cotizaciones."); setData(null); }
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [filters, refresh]);

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (dateRangeError) return;
    setLoading(true); setError(null); setFilters({ ...draft, page: 1, page_size: PAGE_SIZE });
  }

  function go(page: number) { setLoading(true); setFilters(current => ({ ...current, page })); }
  const page = data?.page ?? filters.page ?? 1;
  const pages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;

  const linkClass = "text-sm font-medium text-ep-ink underline underline-offset-4 hover:text-ep-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ep-magenta";

  return <>
    <PageHeader title="Cotizaciones" description="Consulta solicitudes, importes y vigencia de las cotizaciones." />
    <form onSubmit={apply}>
      <FilterBar>
        <Field label="Estado"><Select className="sm:w-56" value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value as QuoteStatus | "" })}><option value="">Todos los estados</option>{Object.entries(quoteStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></Field>
        <Field label="Cliente (identificador)"><Input className="sm:w-72" placeholder="UUID del cliente" value={draft.client_id} pattern="[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}" onChange={e => setDraft({ ...draft, client_id: e.target.value.trim() })} /></Field>
        <Field label="Evento desde"><Input type="date" value={draft.from_date} max={draft.to_date || undefined} onChange={e => setDraft({ ...draft, from_date: e.target.value })} /></Field>
        <Field label="Evento hasta"><Input type="date" value={draft.to_date} min={draft.from_date || undefined} onChange={e => setDraft({ ...draft, to_date: e.target.value })} /></Field>
        <Button disabled={loading || !!dateRangeError}>Filtrar</Button>
        <Button type="button" variant="ghost" disabled={loading} onClick={() => { setDraft({ status: "", client_id: "", from_date: "", to_date: "" }); setFilters({ page: 1, page_size: PAGE_SIZE }); setLoading(true); }}>Limpiar</Button>
        {dateRangeError && <p role="alert" className="w-full text-sm text-ep-danger">{dateRangeError}</p>}
      </FilterBar>
    </form>
    <ErrorBanner message={error} />
    {error && <div><Button variant="ghost" onClick={() => { setLoading(true); setRefresh(n => n + 1); }}>Reintentar</Button></div>}
    <section aria-label="Resultados de cotizaciones" aria-busy={loading} className="space-y-4">
      {loading ? <LoadingState label="Cargando cotizaciones…" /> : !error && data && <>
        {data.items.length === 0 ? <EmptyState message="No hay cotizaciones con estos filtros." /> : <Table head={["Cliente", "Evento", "Paquete", "Total", "Estado", "Vence (Lima)", "Detalle"]}>
          {data.items.map(quote => <tr key={quote.quote_id}>
            <td className="px-4 py-4"><p className="font-medium">{quote.client.full_name}</p><p className="mt-1 text-xs text-ep-mute">{quote.client.phone}</p></td>
            <td className="whitespace-nowrap px-4 py-4">{eventDate(quote.event_date)}</td>
            <td className="px-4 py-4">{quote.package_name}</td>
            <td className="whitespace-nowrap px-4 py-4 font-semibold">{money(quote.total_amount)}</td>
            <td className="px-4 py-4"><QuoteStatusBadge status={quote.status} /></td>
            <td className="whitespace-nowrap px-4 py-4 text-ep-mute">{instant(quote.expires_at)}</td>
            <td className="whitespace-nowrap px-4 py-4"><Link href={`/panel/quotes/${quote.quote_id}`} className={linkClass} aria-label={`Ver cotización de ${quote.client.full_name}`}>Ver detalle</Link></td>
          </tr>)}
        </Table>}
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm"><span className="text-ep-body tabular-nums">{data.total} resultados · Página {page} de {pages}</span><div className="flex gap-2"><Button variant="ghost" disabled={page <= 1} onClick={() => go(page - 1)}>Anterior</Button><Button variant="ghost" disabled={page >= pages} onClick={() => go(page + 1)}>Siguiente</Button></div></div>
      </>}
    </section>
  </>;
}
