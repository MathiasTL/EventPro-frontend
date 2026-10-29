"use client";

import { Suspense, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { listAuditLogs, type AuditLog } from "@/entities/audit-log";
import { parsePage } from "@/shared/lib/pagination";
import { Button, EmptyState, ErrorBanner, Field, Input, Modal, Table } from "@/shared/ui";
import { AdminPage, formatTimestamp, Pagination } from "@/shared/ui/admin";

const filters = ["action", "entity_name", "entity_id", "user_id", "from_date", "to_date"] as const;
const uuidPattern = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}";

export function AuditLogsPage() { return <Suspense fallback={<p className="p-8">Cargando auditoría…</p>}><AuditList /></Suspense>; }

function AuditList() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [selected, setSelected] = useState<AuditLog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const page = parsePage(params?.get("page"));
  const search = new URLSearchParams();
  for (const key of filters) { const value = params?.get(key); if (value) search.set(key, value); }
  search.set("page", String(page)); search.set("page_size", "20");
  const query = useQuery({ queryKey: ["audit-logs", search.toString()], queryFn: () => listAuditLogs(search.toString()), retry: false });
  return <AdminPage title="Bitácora de auditoría" description="Consulta las acciones registradas y los cambios realizados. Los registros son de solo lectura.">
    <form key={params?.toString()} className="grid items-end gap-4 rounded-xl border border-zinc-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3" onSubmit={event => {
      event.preventDefault(); const data = new FormData(event.currentTarget); const next = new URLSearchParams();
      for (const key of filters) { const value = String(data.get(key) ?? "").trim(); if (value) next.set(key, value); }
      if (next.get("from_date") && next.get("to_date") && next.get("from_date")! > next.get("to_date")!) { setError("La fecha inicial no puede ser posterior a la fecha final."); return; }
      setError(null); router.push(`${pathname}?${next}`);
    }}>
      <Field label="Acción"><Input name="action" maxLength={50} defaultValue={params?.get("action") ?? ""} placeholder="Código de acción" /></Field>
      <Field label="Entidad"><Input name="entity_name" maxLength={50} defaultValue={params?.get("entity_name") ?? ""} placeholder="Nombre de entidad" /></Field>
      <Field label="ID de entidad"><Input name="entity_id" pattern={uuidPattern} title="Identificador UUID" defaultValue={params?.get("entity_id") ?? ""} /></Field>
      <Field label="ID de usuario"><Input name="user_id" pattern={uuidPattern} title="Identificador UUID" defaultValue={params?.get("user_id") ?? ""} /></Field>
      <Field label="Desde"><Input name="from_date" type="date" defaultValue={params?.get("from_date") ?? ""} /></Field>
      <Field label="Hasta"><Input name="to_date" type="date" defaultValue={params?.get("to_date") ?? ""} /></Field>
      <div className="flex gap-2"><Button>Aplicar filtros</Button><Button type="button" variant="ghost" onClick={() => { setError(null); router.push(pathname!); }}>Limpiar</Button></div>
    </form>
    <ErrorBanner message={error} />
    {query.isPending ? <p role="status">Cargando registros…</p> : query.isError ? <div className="space-y-3"><ErrorBanner message={query.error.message} /><Button variant="ghost" onClick={() => query.refetch()}>Reintentar</Button></div> : <>
      {query.data.items.length ? <Table head={["Fecha (Lima)", "Acción", "Entidad", "Usuario", "Detalle"]}>{query.data.items.map(log => <tr key={log.id}><td className="px-4 py-3 whitespace-nowrap">{formatTimestamp(log.created_at)}</td><td className="px-4 py-3 font-medium">{log.action}</td><td className="px-4 py-3">{log.entity_name}<span className="block break-all text-xs text-zinc-500">{log.entity_id}</span></td><td className="px-4 py-3 break-all text-xs">{log.user_id ?? "Sistema / cliente"}</td><td className="px-4 py-3"><Button variant="ghost" onClick={() => setSelected(log)}>Ver cambios<span className="sr-only"> de {log.action}</span></Button></td></tr>)}</Table> : <EmptyState message="No hay registros que coincidan con los filtros." />}
      <Pagination page={page} total={query.data.total} pageSize={20} busy={query.isFetching} onPage={value => { search.set("page", String(value)); router.push(`${pathname}?${search}`); }} />
    </>}
    {selected && <Modal open title="Detalle de auditoría" onClose={() => setSelected(null)}><dl className="space-y-2 text-sm"><dt className="font-semibold">Acción</dt><dd>{selected.action}</dd><dt className="font-semibold">Registro</dt><dd className="break-all">{selected.id}</dd><dt className="font-semibold">Fecha (Lima)</dt><dd>{formatTimestamp(selected.created_at)}</dd></dl>{([["Valores anteriores", selected.old_values], ["Valores nuevos", selected.new_values]] as const).map(([label, values]) => <section key={label} className="mt-5"><h3 className="mb-2 font-semibold">{label}</h3><pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-zinc-50 p-3 text-xs">{values === null ? "Sin datos" : JSON.stringify(values, null, 2)}</pre></section>)}</Modal>}
  </AdminPage>;
}
