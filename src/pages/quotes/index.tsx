"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { listQuotes } from "@/entities/quote/api";
import { quoteStatusLabels, type QuoteFilters, type QuotePage, type QuoteStatus } from "@/entities/quote/types";
import { Button, ErrorBanner, Field, Input } from "@/shared/ui";
import { QuoteShell, QuoteStatusBadge, eventDate, instant, money } from "./ui";

export function QuoteListPage() {
  const { user } = useAuth();
  const allowed = !!user && ["ENCARGADO", "SUPERADMIN"].includes(user.role);
  const [draft, setDraft] = useState<QuoteFilters>({ status: "", client_id: "", from_date: "", to_date: "" });
  const [filters, setFilters] = useState<QuoteFilters>({ page: 1, page_size: 20 });
  const [data, setData] = useState<QuotePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    listQuotes(filters).then(result => {
      if (!cancelled) { setData(result); setError(null); }
    }).catch(caught => {
      if (!cancelled) { setError(caught instanceof Error ? caught.message : "No se pudieron cargar las cotizaciones."); setData(null); }
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [allowed, filters, refresh]);

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft.from_date && draft.to_date && draft.from_date > draft.to_date) { setError("La fecha inicial no puede ser posterior a la final."); return; }
    setLoading(true); setError(null); setFilters({ ...draft, page: 1, page_size: 20 });
  }

  function go(page: number) { setLoading(true); setFilters(current => ({ ...current, page })); }
  const page = data?.page ?? filters.page ?? 1;
  const pages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;

  return <QuoteShell>
    <div className="mb-7"><p className="text-xs font-semibold uppercase tracking-widest text-violet-700">Gestión comercial</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Cotizaciones</h1><p className="mt-2 text-sm text-zinc-500">Consulta solicitudes, importes y vigencia de las cotizaciones.</p></div>
    <form onSubmit={apply} className="mb-6 grid gap-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-5">
      <Field label="Estado"><select className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value as QuoteStatus | "" })}><option value="">Todos los estados</option>{Object.entries(quoteStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
      <Field label="Cliente (identificador)"><Input placeholder="UUID del cliente" value={draft.client_id} pattern="[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}" onChange={e => setDraft({ ...draft, client_id: e.target.value.trim() })} /></Field>
      <Field label="Evento desde"><Input type="date" value={draft.from_date} max={draft.to_date || undefined} onChange={e => setDraft({ ...draft, from_date: e.target.value })} /></Field>
      <Field label="Evento hasta"><Input type="date" value={draft.to_date} min={draft.from_date || undefined} onChange={e => setDraft({ ...draft, to_date: e.target.value })} /></Field>
      <div className="flex items-end gap-2"><Button disabled={loading}>Filtrar</Button><Button type="button" variant="ghost" disabled={loading} onClick={() => { setDraft({ status: "", client_id: "", from_date: "", to_date: "" }); setFilters({ page: 1, page_size: 20 }); setLoading(true); }}>Limpiar</Button></div>
    </form>
    <ErrorBanner message={error} />
    {error && <Button variant="ghost" onClick={() => { setLoading(true); setRefresh(n => n + 1); }}>Reintentar</Button>}
    <section aria-label="Resultados de cotizaciones" aria-busy={loading} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {loading ? <p role="status" className="p-12 text-center text-sm text-zinc-500">Cargando cotizaciones…</p> : !error && data && <>
        {data.items.length === 0 ? <p role="status" className="p-12 text-center text-zinc-500">No hay cotizaciones con estos filtros.</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Cotizaciones encontradas</caption><thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500"><tr>{["Cliente", "Evento", "Paquete", "Total", "Estado", "Vence (Lima)", "Detalle"].map(label => <th key={label} scope="col" className="px-5 py-4">{label}</th>)}</tr></thead><tbody className="divide-y divide-zinc-100">{data.items.map(quote => <tr key={quote.quote_id} className="hover:bg-violet-50/30"><td className="px-5 py-4"><p className="font-medium">{quote.client.full_name}</p><p className="mt-1 text-xs text-zinc-500">{quote.client.phone}</p></td><td className="whitespace-nowrap px-5 py-4">{eventDate(quote.event_date)}</td><td className="px-5 py-4">{quote.package_name}</td><td className="whitespace-nowrap px-5 py-4 font-semibold">{money(quote.total_amount)}</td><td className="px-5 py-4"><QuoteStatusBadge status={quote.status} /></td><td className="whitespace-nowrap px-5 py-4 text-zinc-500">{instant(quote.expires_at)}</td><td className="px-5 py-4"><Link href={`/panel/quotes/${quote.quote_id}`} className="font-medium text-violet-700 hover:underline" aria-label={`Ver cotización de ${quote.client.full_name}`}>Ver detalle</Link></td></tr>)}</tbody></table></div>}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 px-5 py-4 text-sm"><span className="text-zinc-500">{data.total} resultados · Página {page} de {pages}</span><div className="flex gap-2"><Button variant="ghost" disabled={page <= 1} onClick={() => go(page - 1)}>Anterior</Button><Button variant="ghost" disabled={page >= pages} onClick={() => go(page + 1)}>Siguiente</Button></div></div>
      </>}
    </section>
  </QuoteShell>;
}
