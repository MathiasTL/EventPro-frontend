"use client";

import { useState, type ReactNode } from "react";
import { deactivateResource, saveResource } from "@/entities/catalog/api";
import type { Resource, ResourceKind } from "@/entities/catalog/types";
import { formatSoles } from "@/shared/lib/format";
import { Badge, Button, EmptyState, ErrorBanner, Field, Input, Modal, Select, Table, Textarea } from "@/shared/ui";

type FormField = { key: string; label: string; type?: "number" | "category" | "textarea"; min?: number; maxLength?: number };
const fields: Record<ResourceKind, FormField[]> = {
  packages: [{ key: "name", label: "Nombre", maxLength: 100 }, { key: "service_category", label: "Categoría", type: "category" }, { key: "base_price", label: "Precio de venta (S/)", type: "number", min: 0.01 }, { key: "direct_cost", label: "Costo directo (S/)", type: "number", min: 0 }, { key: "duration_minutes", label: "Duración (minutos)", type: "number", min: 1 }, { key: "description", label: "Descripción", type: "textarea" }],
  themes: [{ key: "name", label: "Nombre", maxLength: 80 }, { key: "description", label: "Descripción", type: "textarea" }],
  extras: [{ key: "name", label: "Nombre", maxLength: 100 }, { key: "sale_price", label: "Precio de venta (S/)", type: "number", min: 0 }, { key: "direct_cost", label: "Costo directo (S/)", type: "number", min: 0 }, { key: "description", label: "Descripción", type: "textarea" }],
  "inventory-items": [{ key: "name", label: "Nombre", maxLength: 100 }, { key: "service_category", label: "Categoría", type: "category" }, { key: "total_stock", label: "Stock total", type: "number", min: 0 }, { key: "description", label: "Descripción", type: "textarea" }],
  crews: [{ key: "leader_name", label: "Nombre del líder", maxLength: 120 }, { key: "phone", label: "Teléfono", maxLength: 20 }, { key: "service_category", label: "Categoría", type: "category" }],
};
export const categoryLabels = { SHOW: "Show", DJ: "DJ", DECORATION: "Decoración", TENTS: "Toldos" };

export function ResourceTable({ kind, items, onReload, onSuccess, extraAction }: { kind: ResourceKind; items: Resource[]; onReload: () => Promise<void>; onSuccess: (message: string) => void; extraAction?: (item: Resource) => ReactNode }) {
  const [editing, setEditing] = useState<Resource | null | undefined>(undefined);
  const [removing, setRemoving] = useState<Resource | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const visible = items.filter(item => `${item.name ?? item.leader_name} ${item.description ?? ""}`.toLowerCase().includes(query.toLowerCase()));

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(null);
    const data = new FormData(event.currentTarget);
    const body: Record<string, unknown> = {};
    fields[kind].forEach(field => { const value = String(data.get(field.key) ?? "").trim(); body[field.key] = field.type === "number" ? Number(value) : value || null; });
    try { await saveResource(kind, body, editing?.id); setEditing(undefined); await onReload(); onSuccess("Cambios guardados correctamente."); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "No se pudo guardar."); }
    finally { setBusy(false); }
  }
  async function deactivate() {
    if (!removing) return; setBusy(true); setError(null);
    try { await deactivateResource(kind, removing.id); setRemoving(null); await onReload(); onSuccess("Se realizó la baja del registro."); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "No se pudo dar de baja."); }
    finally { setBusy(false); }
  }
  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><Input aria-label="Buscar registros" placeholder="Buscar por nombre…" className="max-w-xs" value={query} onChange={e => setQuery(e.target.value)} /><Button onClick={() => { setError(null); setEditing(null); }}>+ Nuevo registro</Button></div>
    {visible.length === 0 ? <EmptyState message={query ? "No hay resultados para esta búsqueda." : "Todavía no hay registros. Crea el primero para empezar."} /> : <Table head={["Nombre", "Detalle", "Estado", "Acciones"]}>{visible.map(item => <tr key={item.id}>
      <td className="px-4 py-4"><p className="font-semibold text-zinc-900">{item.name ?? item.leader_name}</p><p className="mt-1 max-w-sm text-xs text-zinc-500">{item.description ?? (item.service_category ? categoryLabels[item.service_category] : "")}</p></td>
      <td className="px-4 py-4 text-zinc-600">{kind === "packages" ? <>{formatSoles(item.base_price)} · {item.duration_minutes} min<p className="mt-1 text-xs">{item.compatible_themes?.length ?? 0} temáticas · {item.inventory_items?.length ?? 0} ítems</p></> : kind === "extras" ? formatSoles(item.sale_price) : kind === "inventory-items" ? `${item.total_stock} unidades` : kind === "crews" ? item.phone : "Temática de evento"}</td>
      <td className="px-4 py-4"><Badge tone={item.is_active ? "success" : "neutral"}>{item.is_active ? "Activo" : "Inactivo"}</Badge></td>
      <td className="px-4 py-4"><div className="flex flex-wrap gap-2"><Button variant="ghost" onClick={() => { setError(null); setEditing(item); }}>Editar</Button>{extraAction?.(item)}{item.is_active && <Button variant="ghost" onClick={() => { setError(null); setRemoving(item); }}>Dar de baja</Button>}</div></td>
    </tr>)}</Table>}
    <Modal open={editing !== undefined} title={editing ? "Editar registro" : "Nuevo registro"} onClose={() => { if (!busy) setEditing(undefined); }}>
      <form onSubmit={save} className="space-y-4">{fields[kind].map(field => { const value = editing ? String((editing as unknown as Record<string, unknown>)[field.key] ?? "") : field.key === "duration_minutes" ? "60" : field.key === "direct_cost" || field.key === "total_stock" ? "0" : ""; return <Field key={field.key} label={field.label}>{field.type === "category" ? <Select name={field.key} defaultValue={value || (kind === "inventory-items" ? "DECORATION" : "SHOW")}>{Object.entries(categoryLabels).filter(([key]) => kind !== "inventory-items" || ["DECORATION", "TENTS"].includes(key)).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</Select> : field.type === "textarea" ? <Textarea name={field.key} defaultValue={value} rows={2} /> : <Input name={field.key} defaultValue={value} type={field.type ?? "text"} min={field.min} maxLength={field.maxLength} step={field.key.includes("price") || field.key === "direct_cost" ? "0.01" : "1"} required />}</Field>; })}<ErrorBanner message={error} /><div className="flex justify-end gap-2"><Button type="button" variant="ghost" disabled={busy} onClick={() => setEditing(undefined)}>Cancelar</Button><Button disabled={busy}>{busy ? "Guardando…" : "Guardar"}</Button></div></form>
    </Modal>
    <Modal open={!!removing} title="Confirmar baja" onClose={() => { if (!busy) setRemoving(null); }}><p className="mb-4 text-sm text-zinc-600">¿Dar de baja a <strong>{removing?.name ?? removing?.leader_name}</strong>? El registro se conserva en el sistema.</p><ErrorBanner message={error} /><div className="mt-4 flex justify-end gap-2"><Button variant="ghost" disabled={busy} onClick={() => setRemoving(null)}>Cancelar</Button><Button variant="danger" disabled={busy} onClick={deactivate}>{busy ? "Procesando…" : "Confirmar baja"}</Button></div></Modal>
  </div>;
}
