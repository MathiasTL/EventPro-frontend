"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { listResources, setInventory, setThemes } from "@/entities/catalog/api";
import type { Resource, ResourceKind } from "@/entities/catalog/types";
import { ResourceTable } from "@/widgets/resource-table/ResourceTable";
import { Button, ErrorBanner, Field, Input, LoadingState, Modal, Notice, Page, PageHeader, Panel } from "@/shared/ui";

const tabs: { key: ResourceKind; label: string; description: string }[] = [
  { key: "packages", label: "Paquetes", description: "Servicios, precios y recursos para cada evento." },
  { key: "themes", label: "Temáticas", description: "Ideas y estilos disponibles para personalizar los eventos." },
  { key: "extras", label: "Extras", description: "Complementos que amplían la experiencia del evento." },
  { key: "inventory-items", label: "Inventario", description: "Stock físico de decoración y toldos." },
  { key: "crews", label: "Elencos", description: "Equipos y responsables de los servicios." },
];

export function CatalogoPage() {
  const [active, setActive] = useState<ResourceKind>("packages");
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [linking, setLinking] = useState<Resource | null>(null);
  const request = useRef(0);
  const tab = tabs.find(tab => tab.key === active)!;
  const load = useCallback(async () => {
    const current = ++request.current;
    try { const result = await listResources(active); if (current === request.current) { setItems(result.items); setError(null); } }
    catch (caught) { if (current === request.current) setError(caught instanceof Error ? caught.message : "No se pudieron cargar los datos."); }
    finally { if (current === request.current) setLoading(false); }
  }, [active]);
  useEffect(() => {
    const current = ++request.current;
    let cancelled = false;
    listResources(active).then(result => { if (!cancelled && current === request.current) { setItems(result.items); setError(null); } }).catch(caught => { if (!cancelled && current === request.current) setError(caught instanceof Error ? caught.message : "No se pudieron cargar los datos."); }).finally(() => { if (!cancelled && current === request.current) setLoading(false); });
    return () => { cancelled = true; };
  }, [active]);

  return <Page>
    <PageHeader title="Catálogo" description="Administra paquetes, temáticas, extras, inventario y elencos." />
    <div role="tablist" aria-label="Módulos del catálogo" className="flex overflow-x-auto border-b border-ep-line">
      {tabs.map(item => {
        const selected = active === item.key;
        return (
          <button
            key={item.key}
            id={`catalog-tab-${item.key}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls="catalog-panel"
            onClick={() => { if (selected) return; setActive(item.key); setLoading(true); setSuccess(null); setError(null); }}
            className={`-mb-px min-h-11 shrink-0 border-b-2 px-3 text-sm whitespace-nowrap focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ep-magenta lg:min-h-10 ${selected ? "border-ep-ink font-bold text-ep-ink" : "border-transparent font-medium text-ep-mute hover:text-ep-ink"}`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
    <Panel id="catalog-panel" role="tabpanel" aria-labelledby={`catalog-tab-${active}`} className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="ep-cond text-xl text-ep-ink">{tab.label}</h2>
          <p className="mt-1 text-[0.8125rem] text-ep-body">{tab.description}</p>
        </div>
        <Button variant="ghost" disabled={loading} onClick={load}>Actualizar</Button>
      </div>
      {success && <Notice tone="success">{success}</Notice>}
      <ErrorBanner message={error} />
      {loading
        ? <LoadingState label={`Cargando ${tab.label.toLowerCase()}…`} />
        : !error && <ResourceTable key={active} kind={active} items={items} onReload={load} onSuccess={setSuccess} extraAction={active === "packages" ? item => <Button variant="ghost" onClick={() => setLinking(item)}>Vincular recursos</Button> : undefined} />}
    </Panel>
    {linking && <PackageLinks item={linking} onClose={() => setLinking(null)} onSaved={async () => { setLinking(null); await load(); setSuccess("Recursos del paquete actualizados."); }} />}
  </Page>;
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
  return <Modal open title={`Recursos de ${item.name}`} onClose={() => { if (!busy) onClose(); }}><form onSubmit={save} className="space-y-5"><ErrorBanner message={error} />{loading ? <LoadingState label="Cargando recursos…" /> : <><fieldset><legend className="mb-2 text-sm font-semibold text-ep-ink">Temáticas compatibles</legend>{themes.length === 0 && <p className="text-sm text-ep-mute">Crea una temática primero.</p>}<div className="max-h-32 space-y-2 overflow-y-auto">{themes.map(theme => <label key={theme.id} className="flex min-h-9 items-center gap-2 text-sm text-ep-body"><input type="checkbox" className="h-[1.125rem] w-[1.125rem] accent-ep-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ep-magenta" checked={selected.includes(theme.id)} onChange={e => setSelected(e.target.checked ? [...selected, theme.id] : selected.filter(id => id !== theme.id))} />{theme.name}</label>)}</div></fieldset><fieldset><legend className="mb-2 text-sm font-semibold text-ep-ink">Inventario por evento</legend><p className="mb-3 text-xs text-ep-mute">Usa 0 para quitar un ítem del paquete.</p><div className="max-h-48 space-y-3 overflow-y-auto">{inventory.map(row => <Field key={row.id} label={`${row.name} · Stock: ${row.total_stock}`}><Input type="number" min={0} step={1} value={quantities[row.id] ?? 0} onChange={e => setQuantities({ ...quantities, [row.id]: Number(e.target.value) })} /></Field>)}{inventory.length === 0 && <p className="text-sm text-ep-mute">Crea un ítem de inventario primero.</p>}</div></fieldset></>}<div className="flex justify-end gap-2"><Button type="button" variant="ghost" disabled={busy} onClick={onClose}>Cancelar</Button><Button disabled={busy || loading || (!!error && themes.length === 0)}>{busy ? "Guardando…" : "Guardar vínculos"}</Button></div></form></Modal>;
}
