"use client";

import { useRef, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

import { listResources } from "@/entities/catalog/api";
import type { Resource } from "@/entities/catalog/types";
import { contractKeys } from "@/entities/contract/api";
import { createManualContract, type ManualContractResult } from "@/entities/contract/manual-api";
import { ApiRequestError } from "@/shared/api/client";
import { limaToday } from "@/shared/lib/date";
import { formatSoles } from "@/shared/lib/format";
import { Button, EmptyState, ErrorBanner, Field, Input, LoadingState, Notice, Page, PageHeader, Panel, Select, Textarea } from "@/shared/ui";
import { contractError, ContractStatusBadge } from "./ui";

type Attempt = { key: string; payload: string; evidence: File };
type ExtraQuantities = Record<string, string>;

const checkClass = "mt-0.5 size-4 shrink-0 accent-ep-magenta";
const linkClass = "text-sm font-semibold text-ep-ink underline underline-offset-4 hover:text-ep-magenta focus-visible:outline-2 focus-visible:outline-ep-magenta";

function readPayload(data: FormData, quantities: ExtraQuantities, issue: boolean) {
  const literal = (key: string) => String(data.get(key) ?? "");
  const text = (key: string) => literal(key).trim();
  const dni = text("dni");
  const ruc = text("ruc");
  const mobility = text("agreed_mobility_amount");
  const services = text("agreed_services_subtotal");
  return {
    client: {
      full_name: text("full_name"),
      phone: text("phone"),
      ...(dni ? { dni } : {}),
      ...(ruc ? { ruc } : {}),
    },
    event_date: text("event_date"),
    event_time: text("event_time"),
    location_address: text("location_address"),
    location_district: text("location_district"),
    package_id: text("package_id"),
    theme_id: text("theme_id") || null,
    extras: Object.entries(quantities).map(([extra_id, quantity]) => ({ extra_id, quantity: Number(quantity) })),
    client_provides_mobility: data.has("client_provides_mobility"),
    ...(mobility ? { agreed_mobility_amount: mobility, mobility_override_reason: text("mobility_override_reason") } : {}),
    ...(services ? { agreed_services_subtotal: services, agreed_services_reason: text("agreed_services_reason") } : {}),
    advance: {
      amount: text("advance_amount"),
      payment_method: text("payment_method"),
      transaction_reference: text("transaction_reference") || null,
    },
    client_observations: literal("client_observations") || null,
    custom_clauses: literal("custom_clauses") || null,
    issue_contract: issue,
  };
}

export function ManualContractPage() {
  const catalog = useQuery({
    queryKey: ["catalog", "manual-contract"],
    queryFn: async () => {
      const [packages, extras] = await Promise.all([listResources("packages"), listResources("extras")]);
      return { packages: packages.items.filter((item) => item.is_active), extras: extras.items.filter((item) => item.is_active) };
    },
  });
  return (
    <Page className="max-w-4xl">
      <Link href="/panel/contratos" className={linkClass}>Volver a contratos</Link>
      <PageHeader title="Nuevo contrato manual" />
      {catalog.isPending && <LoadingState label="Cargando catálogo…" />}
      {catalog.isError && (
        <div className="space-y-3">
          <ErrorBanner message={contractError(catalog.error)} />
          <Button type="button" variant="ghost" onClick={() => void catalog.refetch()}>Reintentar</Button>
        </div>
      )}
      {catalog.data && (
        catalog.data.packages.length
          ? <ManualContractForm packages={catalog.data.packages} extras={catalog.data.extras} />
          : <EmptyState message="El catálogo todavía no tiene paquetes activos." />
      )}
    </Page>
  );
}

function ManualContractForm({ packages, extras }: { packages: Resource[]; extras: Resource[] }) {
  const queryClient = useQueryClient();
  const attempt = useRef<Attempt | null>(null);
  const [packageId, setPackageId] = useState("");
  const [themeId, setThemeId] = useState("");
  const [quantities, setQuantities] = useState<ExtraQuantities>({});
  const [transport, setTransport] = useState(false);
  const [overrideServices, setOverrideServices] = useState(false);
  const [overrideMobility, setOverrideMobility] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ManualContractResult | null>(null);
  const themes = packages.find((item) => item.id === packageId)?.compatible_themes ?? [];
  const selectedExtras = extras.filter((item) => item.id in quantities);
  const availableExtras = extras.filter((item) => !(item.id in quantities));

  async function send(next: Attempt) {
    setBusy(true);
    setError(null);
    try {
      const saved = await createManualContract(next.payload, next.evidence, next.key);
      setResult(saved);
      attempt.current = null;
      void queryClient.invalidateQueries({ queryKey: contractKeys.all });
    } catch (error) {
      const unknownResult = !(error instanceof ApiRequestError) ||
        error.status === 0 || error.status >= 500 || error.code === "invalid-response";
      setUncertain(unknownResult);
      if (!unknownResult) attempt.current = null;
      setError(unknownResult
        ? "No se pudo confirmar el resultado. Reintenta el mismo envío para recuperar el contrato si se guardó."
        : contractError(error));
    } finally {
      setBusy(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || uncertain) return;
    const data = new FormData(event.currentTarget);
    const evidence = data.get("evidence");
    if (!(evidence instanceof File) || evidence.size === 0 || evidence.size > 5 * 1024 * 1024) {
      setError("Selecciona un comprobante de hasta 5 MiB.");
      return;
    }
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const issue = submitter instanceof HTMLButtonElement && submitter.value === "issue";
    const next = {
      key: crypto.randomUUID(),
      payload: JSON.stringify(readPayload(data, quantities, issue)),
      evidence,
    };
    attempt.current = next;
    void send(next);
  }

  function removeExtra(id: string) {
    setQuantities((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  if (result) return <ManualResult result={result} />;

  return (
    <form className="space-y-4" onSubmit={submit}>
      <fieldset className="space-y-4" disabled={busy || uncertain}>
        <Panel className="space-y-4">
          <h2 className="text-lg font-semibold text-ep-ink">Cliente y evento</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre completo"><Input name="full_name" required minLength={2} maxLength={120} autoComplete="off" /></Field>
            <Field label="Teléfono de WhatsApp"><Input name="phone" type="tel" required pattern="[+]?[0-9]{9,15}" maxLength={16} placeholder="+519XXXXXXXX" /></Field>
            <Field label="DNI (opcional)"><Input name="dni" inputMode="numeric" pattern="[0-9]{8}" maxLength={8} /></Field>
            <Field label="RUC (opcional)"><Input name="ruc" inputMode="numeric" pattern="[0-9]{11}" maxLength={11} /></Field>
            <Field label="Dirección"><Input name="location_address" required minLength={5} maxLength={250} /></Field>
            <Field label="Distrito"><Input name="location_district" required minLength={2} maxLength={80} /></Field>
            <Field label="Fecha del evento"><Input name="event_date" type="date" min={limaToday()} required /></Field>
            <Field label="Hora de inicio (Lima)"><Input name="event_time" type="time" required /></Field>
          </div>
        </Panel>
        <Panel className="space-y-4">
          <h2 className="text-lg font-semibold text-ep-ink">Servicios y movilidad</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Paquete">
              <Select name="package_id" value={packageId} onChange={(event) => { setPackageId(event.target.value); setThemeId(""); }} required>
                <option value="">Selecciona un paquete</option>
                {packages.map((item) => <option key={item.id} value={item.id}>{item.name} · {formatSoles(item.base_price)}</option>)}
              </Select>
            </Field>
            <Field label="Temática">
              <Select name="theme_id" value={themeId} onChange={(event) => setThemeId(event.target.value)} disabled={!themes.length}>
                <option value="">Sin temática</option>
                {themes.filter((item) => item.is_active !== false).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </Select>
            </Field>
            {availableExtras.length > 0 && selectedExtras.length < 30 && (
              <Field label="Agregar extra">
                <Select value="" onChange={(event) => { const id = event.target.value; if (id) setQuantities((current) => ({ ...current, [id]: "1" })); }}>
                  <option value="">Selecciona un extra</option>
                  {availableExtras.map((item) => <option value={item.id} key={item.id}>{item.name} · {formatSoles(item.sale_price)}</option>)}
                </Select>
              </Field>
            )}
          </div>
          {selectedExtras.length > 0 && (
            <ul aria-label="Extras seleccionados" className="space-y-2">
              {selectedExtras.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-ep-line p-3">
                  <label className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3 text-sm text-ep-ink">
                    <span>{item.name} · {formatSoles(item.sale_price)}</span>
                    <Input aria-label={`Cantidad de ${item.name}`} className="max-w-24" type="number" min={1} max={100} required value={quantities[item.id]} onChange={(event) => { const value = event.target.value; setQuantities((current) => ({ ...current, [item.id]: value })); }} />
                  </label>
                  <Button type="button" variant="ghost" aria-label={`Quitar ${item.name}`} onClick={() => removeExtra(item.id)}>Quitar</Button>
                </li>
              ))}
            </ul>
          )}
          <label className="flex items-start gap-2 text-sm text-ep-ink">
            <input type="checkbox" className={checkClass} checked={overrideServices} onChange={(event) => setOverrideServices(event.target.checked)} />
            Usar un subtotal acordado para los servicios
          </label>
          {overrideServices && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Subtotal acordado (S/)"><Input name="agreed_services_subtotal" type="number" min="0.01" step="0.01" max="99999999.99" required /></Field>
              <Field label="Motivo del subtotal acordado"><Input name="agreed_services_reason" required minLength={10} maxLength={500} /></Field>
            </div>
          )}
          <label className="flex items-start gap-2 text-sm text-ep-ink">
            <input name="client_provides_mobility" type="checkbox" className={checkClass} checked={transport} onChange={(event) => { setTransport(event.target.checked); setOverrideMobility(false); }} />
            El cliente proporciona el transporte
          </label>
          {!transport && (
            <>
              <label className="flex items-start gap-2 text-sm text-ep-ink">
                <input type="checkbox" className={checkClass} checked={overrideMobility} onChange={(event) => setOverrideMobility(event.target.checked)} />
                Usar un importe de movilidad acordado
              </label>
              {overrideMobility && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Movilidad acordada (S/)"><Input name="agreed_mobility_amount" type="number" min="0" step="0.01" max="99999999.99" required /></Field>
                  <Field label="Motivo del importe de movilidad"><Input name="mobility_override_reason" required minLength={10} maxLength={500} /></Field>
                </div>
              )}
            </>
          )}
        </Panel>
        <Panel className="space-y-4">
          <h2 className="text-lg font-semibold text-ep-ink">Adelanto verificado</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Medio de pago">
              <Select name="payment_method" required defaultValue="">
                <option value="">Selecciona un medio</option>
                <option value="YAPE">Yape</option>
                <option value="PLIN">Plin</option>
                <option value="BANK_TRANSFER">Transferencia</option>
                <option value="CASH">Efectivo</option>
              </Select>
            </Field>
            <Field label="Monto cobrado (S/)"><Input name="advance_amount" type="number" min="0.01" step="0.01" max="99999999.99" required /></Field>
            <Field label="Referencia de operación (opcional)"><Input name="transaction_reference" maxLength={100} /></Field>
            <Field label="Comprobante (imagen o PDF, hasta 5 MiB)">
              <Input name="evidence" type="file" accept="image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf" className="py-2" required />
            </Field>
          </div>
          <label className="flex items-start gap-2 text-sm text-ep-ink">
            <input type="checkbox" required className={checkClass} />
            Confirmo que revisé el comprobante y que el adelanto fue recibido.
          </label>
        </Panel>
        <Panel className="space-y-4">
          <h2 className="text-lg font-semibold text-ep-ink">Condiciones del contrato</h2>
          <Field label="Observaciones (opcional)"><Textarea name="client_observations" rows={3} maxLength={5000} /></Field>
          <Field label="Cláusulas particulares (opcional)"><Textarea name="custom_clauses" rows={4} maxLength={10000} /></Field>
        </Panel>
      </fieldset>
      <ErrorBanner message={error} />
      {busy && <LoadingState label="Guardando contrato…" />}
      {uncertain ? (
        <Button type="button" onClick={() => { if (attempt.current) void send(attempt.current); }} disabled={busy}>Reintentar el mismo envío</Button>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="ghost" value="draft" disabled={busy}>Guardar borrador</Button>
          <Button type="submit" value="issue" disabled={busy}>Emitir contrato</Button>
        </div>
      )}
    </form>
  );
}

function ManualResult({ result }: { result: ManualContractResult }) {
  const issued = result.contract_status === "ISSUED";
  return (
    <Panel className="space-y-4">
      <Notice tone="success">{issued ? "Contrato emitido. El enlace quedó en cola de envío." : "Borrador guardado."}</Notice>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-ep-ink">{result.contract_number}</h2>
        <ContractStatusBadge status={result.contract_status} />
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="text-ep-mute">Servicios</dt><dd className="font-medium text-ep-ink">{formatSoles(result.services_subtotal)}</dd></div>
        <div><dt className="text-ep-mute">Total</dt><dd className="font-medium text-ep-ink">{formatSoles(result.total_amount)}</dd></div>
        <div><dt className="text-ep-mute">Adelanto cobrado</dt><dd className="font-medium text-ep-ink">{formatSoles(result.advance_amount)}</dd></div>
        <div><dt className="text-ep-mute">Saldo pendiente</dt><dd className="font-medium text-ep-ink">{formatSoles(result.pending_balance)}</dd></div>
      </dl>
      <Link className={linkClass} href={`/panel/contratos/${result.contract_id}`}>Ver contrato</Link>
    </Panel>
  );
}
