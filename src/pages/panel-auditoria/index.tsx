"use client";

import { useEffect, useState } from "react";
import { listAuditLogs } from "@/entities/audit-log/api";
import type { AuditLog } from "@/entities/audit-log/types";
import { AuditLogTable } from "@/widgets/audit-log-table/AuditLogTable";
import { Button, EmptyState, ErrorBanner, Field, Input } from "@/shared/ui";

const PAGE_SIZE = 20;

type FilterDraft = {
  action: string;
  entityName: string;
  entityId: string;
  userId: string;
  fromDate: string;
  toDate: string;
};

const EMPTY_FILTERS: FilterDraft = { action: "", entityName: "", entityId: "", userId: "", fromDate: "", toDate: "" };

export function AuditoriaPage() {
  const [draft, setDraft] = useState<FilterDraft>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<FilterDraft>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listAuditLogs({
      action: applied.action.trim() || undefined,
      entity_name: applied.entityName.trim() || undefined,
      entity_id: applied.entityId.trim() || undefined,
      user_id: applied.userId.trim() || undefined,
      from_date: applied.fromDate || undefined,
      to_date: applied.toDate || undefined,
      page,
      page_size: PAGE_SIZE,
    })
      .then(result => { if (!cancelled) { setItems(result.items); setTotal(result.total); setError(null); } })
      .catch(caught => { if (!cancelled) setError(caught instanceof Error ? caught.message : "No se pudo cargar la bitácora."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [applied, page]);

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setApplied(draft);
    setPage(1);
  }

  function goToPage(next: number) {
    setLoading(true);
    setPage(next);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-700">Panel de operaciones</p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Auditoría</h1>
        <p className="mt-2 text-sm text-zinc-500">Bitácora de acciones críticas del sistema, de solo lectura.</p>
      </div>

      <form onSubmit={applyFilters} className="flex flex-wrap items-end gap-4 rounded-2xl border border-zinc-200 bg-white p-4">
        <Field label="Acción"><Input value={draft.action} onChange={event => setDraft({ ...draft, action: event.target.value })} placeholder="Ej. OVERRIDE_MOBILITY" className="w-48" /></Field>
        <Field label="Entidad"><Input value={draft.entityName} onChange={event => setDraft({ ...draft, entityName: event.target.value })} placeholder="Ej. events" className="w-36" /></Field>
        <Field label="ID de entidad"><Input value={draft.entityId} onChange={event => setDraft({ ...draft, entityId: event.target.value })} placeholder="UUID" className="w-48" /></Field>
        <Field label="Usuario"><Input value={draft.userId} onChange={event => setDraft({ ...draft, userId: event.target.value })} placeholder="UUID" className="w-48" /></Field>
        <Field label="Desde"><Input type="date" value={draft.fromDate} onChange={event => setDraft({ ...draft, fromDate: event.target.value })} /></Field>
        <Field label="Hasta"><Input type="date" value={draft.toDate} onChange={event => setDraft({ ...draft, toDate: event.target.value })} /></Field>
        <Button type="submit" disabled={loading}>{loading ? "Filtrando…" : "Filtrar"}</Button>
      </form>

      <ErrorBanner message={error} />

      {loading ? (
        <p role="status" className="py-12 text-center text-sm text-zinc-500">Cargando bitácora…</p>
      ) : !error && items.length === 0 ? (
        <EmptyState message="No hay registros de auditoría con estos filtros." />
      ) : !error && (
        <>
          <AuditLogTable logs={items} />
          {total > PAGE_SIZE && (
            <div className="flex items-center justify-end gap-3">
              <Button variant="ghost" disabled={page === 1} onClick={() => goToPage(page - 1)}>Anterior</Button>
              <span className="text-sm text-zinc-600">Página {page} de {Math.ceil(total / PAGE_SIZE)}</span>
              <Button variant="ghost" disabled={page * PAGE_SIZE >= total} onClick={() => goToPage(page + 1)}>Siguiente</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
