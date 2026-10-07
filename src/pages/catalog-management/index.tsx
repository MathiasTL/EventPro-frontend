"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { listResources, setInventory, setThemes } from "@/entities/catalog/api";
import type { Resource, ResourceKind } from "@/entities/catalog/types";
import { ResourceTable } from "@/widgets/resource-table/ResourceTable";
import { Button, ErrorBanner, Field, Input, Modal } from "@/shared/ui";
import { OverbookedPayments } from "./payments";
import { BudgetProcess } from "./budgets";

const tabs: { key: ResourceKind | "payments" | "budgets"; label: string; description: string }[] = [
  { key: "budgets", label: "Solicitudes", description: "Solicitud, adelanto, reserva y contrato con cálculo y disponibilidad automáticos." },
  { key: "packages", label: "Paquetes", description: "Servicios, precios y recursos para cada evento." },
  { key: "themes", label: "Temáticas", description: "Ideas y estilos disponibles para personalizar los eventos." },
  { key: "extras", label: "Extras", description: "Complementos que amplían la experiencia del evento." },
  { key: "inventory-items", label: "Inventario", description: "Stock físico de decoración y toldos." },
  { key: "crews", label: "Elencos", description: "Equipos y responsables de los servicios." },
  { key: "payments", label: "Sobrecupo", description: "Decisiones pendientes de aprobación manual." },
];

export function CatalogManagementPage() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState<ResourceKind | "payments" | "budgets">("budgets");
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [linking, setLinking] = useState<Resource | null>(null);
  const request = useRef(0);
  const tab = tabs.find(tab => tab.key === active)!;
  const load = useCallback(async () => {
    if (active === "payments" || active === "budgets") return;
    const current = ++request.current;
    try { const result = await listResources(active); if (current === request.current) { setItems(result.items); setError(null); } }
    catch (caught) { if (current === request.current) setError(caught instanceof Error ? caught.message : "No se pudieron cargar los datos."); }
    finally { if (current === request.current) setLoading(false); }
  }, [active]);
  useEffect(() => {
    if (active === "payments" || active === "budgets") return;
    const current = ++request.current;
    let cancelled = false;
    listResources(active).then(result => { if (!cancelled && current === request.current) { setItems(result.items); setError(null); } }).catch(caught => { if (!cancelled && current === request.current) setError(caught instanceof Error ? caught.message : "No se pudieron cargar los datos."); }).finally(() => { if (!cancelled && current === request.current) setLoading(false); });
    return () => { cancelled = true; };
  }, [active]);

  if (user && !["ENCARGADO", "SUPERADMIN"].includes(user.role)) return <main className="p-10"><h1 className="text-xl font-semibold">Acceso restringido</h1><p className="my-4">Este panel requiere una cuenta de encargado o superadministrador.</p><Button onClick={logout}>Cerrar sesión</Button></main>;
  return <div className="min-h-screen bg-zinc-50 text-zinc-900">
    <header className="border-b border-zinc-200 bg-white"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-700 text-lg font-bold text-white">E</span><div><p className="text-lg font-bold tracking-tight">EventPro</p><p className="text-xs text-zinc-500">Administración de eventos</p></div></div><div className="flex items-center gap-4"><div className="text-right text-sm"><p className="font-medium">{user?.full_name}</p><p className="text-xs text-zinc-500">{user?.role === "SUPERADMIN" ? "Superadministrador" : "Encargado"}</p></div><Button variant="ghost" onClick={logout}>Salir</Button></div></div></header>
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><div className="mb-7"><p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-700">Panel de operaciones</p><h1 className="text-3xl font-bold tracking-tight">Gestión de eventos</h1><p className="mt-2 text-sm text-zinc-500">Cotiza servicios, valida adelantos y organiza los recursos de cada evento.</p></div>
      <nav aria-label="Módulos del catálogo" className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-1.5">{tabs.map(tab => <button key={tab.key} onClick={() => { if (active === tab.key) return; setActive(tab.key); setLoading(true); setSuccess(null); setError(null); }} aria-current={active === tab.key ? "page" : undefined} className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium ${active === tab.key ? "bg-violet-700 text-white" : "text-zinc-600 hover:bg-zinc-50"}`}>{tab.label}</button>)}</nav>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6"><div className="mb-6 flex items-center justify-between"><div><h2 className="text-xl font-semibold">{tab.label}</h2><p className="mt-1 text-sm text-zinc-500">{tab.description}</p></div>{active !== "payments" && active !== "budgets" && <Button variant="ghost" disabled={loading} onClick={load}>Actualizar</Button>}</div>
        {success && <p role="status" className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{success}</p>}
        {active === "budgets" ? <BudgetProcess /> : active === "payments" ? <OverbookedPayments onSuccess={setSuccess} /> : <><ErrorBanner message={error} />{loading ? <p role="status" className="py-12 text-center text-sm text-zinc-500">Cargando {tab.label.toLowerCase()}…</p> : !error && <ResourceTable key={active} kind={active} items={items} onReload={load} onSuccess={setSuccess} extraAction={active === "packages" ? item => <Button variant="ghost" onClick={() => setLinking(item)}>Vincular recursos</Button> : undefined} />}</>}
      </section><p className="mt-6 text-xs text-zinc-400">EventPro · Gestión del catálogo y control operativo</p>
    </main>{linking && <PackageLinks item={linking} onClose={() => setLinking(null)} onSaved={async () => { setLinking(null); await load(); setSuccess("Recursos del paquete actualizados."); }} />}
  </div>;
}

function PackageLinks({ item, onClose, onSaved }: { item: Resource; onClose: () => void; onSaved: () => Promise<void> }) {
  const [themes, setThemeOptions] = useState<Resource[]>([]);
  const [inventory, setInventoryOptions] = useState<Resource[]>([]);
  const [selected, setSelected] = useState<string[]>(item.compatible_themes?.map(theme => theme.id) ?? []);
  const [quantities, setQuantities] = useState<Record<string, number>>(Object.fromEntries(item.inventory_items?.map(row => [row.inventory_item_id, row.quantity]) ?? []));
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { Promise.all([listResources("themes"), listResources("inventory-items")]).then(([t, i]) => { setThemeOptions(t.items.filter(row => row.is_active || item.compatible_themes?.some(theme => theme.id === row.id))); setInventoryOptions(i.items.filter(row => row.is_active || item.inventory_items?.some(entry => entry.inventory_item_id === row.id))); }).catch(caught => setError(caught instanceof Error ? caught.message : "No se pudieron cargar los recursos.")).finally(() => setLoading(false)); }, [item]);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(null);
    try { await setThemes(item.id, selected); await setInventory(item.id, Object.entries(quantities).filter(([, quantity]) => quantity > 0).map(([inventory_item_id, quantity]) => ({ inventory_item_id, quantity }))); await onSaved(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "No se pudieron guardar los recursos. Revisa los vínculos antes de reintentar."); }
    finally { setBusy(false); }
  }
  return <Modal open title={`Recursos de ${item.name}`} onClose={() => { if (!busy) onClose(); }}><form onSubmit={save} className="space-y-5"><ErrorBanner message={error} />{loading ? <p>Cargando recursos…</p> : <><fieldset><legend className="mb-2 text-sm font-semibold">Temáticas compatibles</legend>{themes.length === 0 && <p className="text-sm text-zinc-500">Crea una temática primero.</p>}<div className="max-h-32 space-y-2 overflow-y-auto">{themes.map(theme => <label key={theme.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selected.includes(theme.id)} onChange={e => setSelected(e.target.checked ? [...selected, theme.id] : selected.filter(id => id !== theme.id))} />{theme.name}</label>)}</div></fieldset><fieldset><legend className="mb-2 text-sm font-semibold">Inventario por evento</legend><p className="mb-3 text-xs text-zinc-500">Usa 0 para quitar un ítem del paquete.</p><div className="max-h-48 space-y-3 overflow-y-auto">{inventory.map(row => <Field key={row.id} label={`${row.name} · Stock: ${row.total_stock}`}><Input type="number" min={0} step={1} value={quantities[row.id] ?? 0} onChange={e => setQuantities({ ...quantities, [row.id]: Number(e.target.value) })} /></Field>)}{inventory.length === 0 && <p className="text-sm text-zinc-500">Crea un ítem de inventario primero.</p>}</div></fieldset></>}<div className="flex justify-end gap-2"><Button type="button" variant="ghost" disabled={busy} onClick={onClose}>Cancelar</Button><Button disabled={busy || loading || (!!error && themes.length === 0)}>{busy ? "Guardando…" : "Guardar vínculos"}</Button></div></form></Modal>;
}
