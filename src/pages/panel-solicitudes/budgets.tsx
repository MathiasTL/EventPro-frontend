"use client";

import { useEffect, useState } from "react";
import { listResources } from "@/entities/catalog/api";
import type { Resource } from "@/entities/catalog/types";
import { apiFetch } from "@/shared/api/client";
import { formatSoles } from "@/shared/lib/format";
import { Badge, Button, ErrorBanner, Field, Input, Select, Textarea } from "@/shared/ui";
import { ManualBookingFlow, type BookingInput } from "./bookings";

type Budget = {
  budget_id: string;
  generated_at: string;
  package_name: string;
  theme_name: string | null;
  duration_minutes: number;
  lines: { name: string; amount: string }[];
  services_subtotal: string;
  mobility_amount: string;
  total_amount: string;
  advance_amount: string;
  pending_balance: string;
  availability_status: "AVAILABLE" | "CONFLICT" | "REQUIRES_MANUAL_APPROVAL";
  simultaneous_count: number;
  pdf_base64: string;
};

const statuses = {
  AVAILABLE: "Disponible al consultar",
  CONFLICT: "Inventario insuficiente para esa fecha",
  REQUIRES_MANUAL_APPROVAL: "Requiere aprobación de sobrecupo",
};

export function BudgetProcess() {
  const [clientProvidesTransport, setClientProvidesTransport] = useState(true);
  const [packages, setPackages] = useState<Resource[]>([]);
  const [extras, setExtras] = useState<Resource[]>([]);
  const [packageId, setPackageId] = useState("");
  const [themeId, setThemeId] = useState("");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [preparedRequest, setPreparedRequest] = useState<BookingInput | null>(null);
  const selectedPackage = packages.find(item => item.id === packageId) ?? packages[0];

  useEffect(() => {
    let cancelled = false;
    Promise.all([listResources("packages"), listResources("extras")])
      .then(([p, e]) => { if (!cancelled) { setPackages(p.items.filter(item => item.is_active)); setExtras(e.items.filter(item => item.is_active)); } })
      .catch(caught => { if (!cancelled) setError(caught instanceof Error ? caught.message : "No se pudo cargar el catálogo."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function prepare(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPackage) return;
    const data = new FormData(event.currentTarget);
    setBusy(true); setError(null); setBudget(null);
    try {
      const body = {
        client_name: String(data.get("client_name")).trim(),
        address: String(data.get("address")).trim(),
        event_date: String(data.get("event_date")),
        start_time: String(data.get("start_time")),
        package_id: selectedPackage.id,
        theme_id: themeId || null,
        extra_ids: selectedExtras,
        client_provides_transport: clientProvidesTransport,
        manual_mobility_amount: clientProvidesTransport ? "0.00" : String(data.get("manual_mobility_amount")),
        mobility_override_reason: clientProvidesTransport ? null : String(data.get("mobility_override_reason")).trim(),
      };
      const result = await apiFetch<Budget>("/budgets/prepare", { method: "POST", body });
      setPreparedRequest({ ...body, phone: String(data.get("phone")).trim(), district: String(data.get("district")).trim() });
      setBudget(result);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "No se pudo preparar el presupuesto."); }
    finally { setBusy(false); }
  }

  function download() {
    if (!budget) return;
    const bytes = Uint8Array.from(atob(budget.pdf_base64), char => char.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    const link = document.createElement("a"); link.href = url; link.download = `EventPro-presupuesto-${budget.budget_id}.pdf`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <div className="space-y-6">
    <ol className="grid gap-3 text-sm sm:grid-cols-3" aria-label="Proceso de presupuesto">
      {["1. Solicitud y presupuesto", "2. Comprobante y validación", "3. Reserva y contrato PDF"].map((step, index) => <li key={step} className={`rounded-lg border px-4 py-3 ${index === 0 ? "border-violet-200 bg-violet-50 text-violet-800" : "border-zinc-200 text-zinc-500"}`}>{step}</li>)}
    </ol>
    <ErrorBanner message={error} />
    {loading ? <p role="status">Cargando catálogo…</p> : !packages.length ? <p>No hay paquetes activos disponibles. Crea uno en Paquetes y vuelve a abrir este módulo.</p> : <form onSubmit={prepare} onChange={() => setBudget(null)} className="space-y-5">
      <fieldset disabled={busy} className="grid gap-4 disabled:opacity-60 sm:grid-cols-2">
        <Field label="Nombre del cliente"><Input name="client_name" required minLength={2} maxLength={120} placeholder="Nombre y apellido" /></Field>
        <Field label="Teléfono del cliente"><Input name="phone" type="tel" required pattern="\+?[0-9]{9,15}" maxLength={16} placeholder="+519XXXXXXXX" /></Field>
        <Field label="Distrito"><Input name="district" required minLength={2} maxLength={80} placeholder="Distrito del evento" /></Field>
        <Field label="Dirección del evento"><Input name="address" required minLength={5} maxLength={250} placeholder="Dirección y distrito" /></Field>
        <Field label="Fecha del evento"><Input name="event_date" type="date" required /></Field>
        <Field label="Hora de inicio (Lima)"><Input name="start_time" type="time" required /></Field>
        <Field label="Paquete"><Select value={selectedPackage?.id ?? ""} onChange={event => { setPackageId(event.target.value); setThemeId(""); }}>{packages.map(item => <option key={item.id} value={item.id}>{item.name} · {formatSoles(item.base_price)}</option>)}</Select></Field>
        <Field label="Temática compatible"><Select value={themeId} onChange={event => setThemeId(event.target.value)}><option value="">Sin temática</option>{selectedPackage?.compatible_themes?.filter(item => item.is_active !== false).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></Field>
      </fieldset>
      <fieldset disabled={busy}><legend className="mb-2 text-sm font-medium">Extras</legend><div className="grid gap-2 sm:grid-cols-2">{extras.map(item => <label key={item.id} className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm"><input type="checkbox" checked={selectedExtras.includes(item.id)} onChange={event => setSelectedExtras(event.target.checked ? [...selectedExtras, item.id] : selectedExtras.filter(id => id !== item.id))} />{item.name} · {formatSoles(item.sale_price)}</label>)}</div></fieldset>
      <label className="flex items-start gap-2 rounded-lg bg-zinc-50 p-4 text-sm"><input className="mt-1" name="transport" type="checkbox" checked={clientProvidesTransport} onChange={event => setClientProvidesTransport(event.target.checked)} disabled={busy} /><span>El cliente proporcionará transporte de ida y vuelta para personal y equipos. La movilidad se exonera (S/ 0). Si no aporta transporte, registra la movilidad acordada y su motivo.</span></label>
      {!clientProvidesTransport && <div className="space-y-4"><Field label="Movilidad acordada (S/)"><Input name="manual_mobility_amount" type="number" min="0.01" step="0.01" required disabled={busy} /></Field><Field label="Motivo de tarifa manual de movilidad"><Textarea name="mobility_override_reason" required minLength={10} maxLength={500} disabled={busy} /></Field></div>}
      <Button type="submit" disabled={busy}>{busy ? "Consultando disponibilidad y generando PDF…" : "Generar presupuesto"}</Button>
    </form>}
    {budget && <section aria-live="polite" className="space-y-4 rounded-xl border border-violet-200 bg-violet-50/50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-lg font-semibold">Presupuesto generado</h3><Badge tone={budget.availability_status === "AVAILABLE" ? "success" : "warning"}>{statuses[budget.availability_status]}</Badge></div>
      <p className="text-sm text-zinc-600">{budget.package_name} · {budget.duration_minutes} minutos{budget.theme_name && ` · ${budget.theme_name}`}</p>
      <dl className="space-y-2 text-sm">{budget.lines.map((line, index) => <div key={index} className="flex justify-between gap-4"><dt>{line.name}</dt><dd>{formatSoles(line.amount)}</dd></div>)}{[["Subtotal servicios", budget.services_subtotal], ["Movilidad acordada", budget.mobility_amount], ["Total", budget.total_amount], ["Adelanto requerido", budget.advance_amount], ["Saldo previsto", budget.pending_balance]].map(([label, amount]) => <div key={label} className="flex justify-between gap-4 border-t border-violet-100 pt-2"><dt className="font-medium">{label}</dt><dd>{formatSoles(amount)}</dd></div>)}</dl>
      <p className="text-sm text-zinc-600">Este presupuesto no reserva la fecha ni acredita un pago. {budget.availability_status !== "AVAILABLE" ? "Resuelve el conflicto o el sobrecupo antes de confirmar el servicio." : "La disponibilidad se revalida al confirmar el adelanto."}</p>
      <Button onClick={download}>Descargar presupuesto PDF</Button>
      <p className="text-xs text-zinc-500">Referencia: {budget.budget_id}</p>
    </section>}
    <ManualBookingFlow key={budget?.budget_id ?? "recent"} request={budget ? preparedRequest : null} advance={budget?.advance_amount} canRegister={!!budget} />
  </div>;
}
