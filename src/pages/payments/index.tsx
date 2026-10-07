"use client";

import { useState } from "react";

import {
  PaymentAuditBadge,
  PaymentConceptBadge,
  PaymentEvidenceViewer,
  PaymentStatusBadge,
  usePayment,
  usePayments,
} from "@/entities/payment";
import { AuditPaymentForm } from "@/features/audit-payment";
import { VerifyPaymentForm } from "@/features/verify-payment";
import { Button } from "@/shared/ui";
import type { PaymentAuditStatus, PaymentConcept, PaymentValidationStatus } from "@/shared/types";

const VALIDATION_OPTIONS: Array<PaymentValidationStatus | ""> = [
  "",
  "PENDING_VERIFICATION",
  "REQUIRES_MANUAL_APPROVAL",
  "VERIFIED",
  "REJECTED",
];

const CONCEPT_OPTIONS: Array<PaymentConcept | ""> = ["", "ADVANCE", "BALANCE", "EXTENSION"];
const AUDIT_OPTIONS: Array<PaymentAuditStatus | ""> = ["", "UNREVIEWED", "REVIEWED", "FLAGGED"];

function formatMoney(amount: number): string {
  return `S/ ${amount.toFixed(2)}`;
}

const SELECT_CLASS =
  "rounded border border-outline-variant bg-surface-bright px-2 py-1 font-body text-[14px] text-on-surface focus:border-primary focus:outline-none";

export function PaymentsPage() {
  const [validationStatus, setValidationStatus] = useState<PaymentValidationStatus | "">("PENDING_VERIFICATION");
  const [concept, setConcept] = useState<PaymentConcept | "">("");
  const [auditStatus, setAuditStatus] = useState<PaymentAuditStatus | "">("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [action, setAction] = useState<"verify" | "audit" | null>(null);

  const paymentsQuery = usePayments({ validation_status: validationStatus, concept, audit_status: auditStatus, page, page_size: 20 });
  const detailQuery = usePayment(selectedId);
  const detail = detailQuery.data ?? null;
  const first = paymentsQuery.data?.items[0] ?? null;
  const focus = detail ?? null;

  return (
    <main className="mx-auto flex w-full max-w-[1720px] flex-1 flex-col gap-3 px-6 py-3">
      {/* Executive ribbon — pago en foco */}
      <section className="flex flex-col justify-between gap-3 rounded border border-outline-variant bg-surface-container-lowest p-4 shadow-sm xl:flex-row xl:items-center">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-secondary" />
            <h1 className="font-headline text-[24px] font-semibold tracking-tight">
              {focus ? `PAY-${focus.payment_id.slice(0, 8).toUpperCase()}` : "Bandeja de pagos"}{" "}
              <span className="font-normal text-outline-variant">|</span>{" "}
              <span className="text-[18px]">{focus ? focus.concept : "US-11 / US-12"}</span>
            </h1>
            {focus ? <PaymentStatusBadge status={focus.validation_status} /> : null}
          </div>
          <div className="flex flex-wrap items-center gap-5 border-outline-variant pt-1 text-on-surface-variant xl:border-t-0 xl:pt-0">
            <span className="flex items-center gap-1 font-label text-[11px]">
              <span className="material-symbols-outlined text-base text-outline">calendar_today</span>
              {focus ? new Date(focus.created_at).toLocaleDateString("es-PE") : `${paymentsQuery.data?.total ?? 0} en cola`}
            </span>
            <span className="flex items-center gap-1 font-label text-[11px]">
              <span className="material-symbols-outlined text-base text-outline">payments</span>
              {focus ? formatMoney(focus.amount) : "—"}
            </span>
            <span className="flex items-center gap-1 font-label text-[11px]">
              <span className="material-symbols-outlined text-base text-outline">chat</span>
              WhatsApp Business
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="font-label text-[10px] text-outline">
            ESTADO{" "}
            <select
              value={validationStatus}
              onChange={(e) => { setValidationStatus(e.target.value as PaymentValidationStatus | ""); setPage(1); }}
              className={SELECT_CLASS}
            >
              {VALIDATION_OPTIONS.map((o) => <option key={o || "all"} value={o}>{o || "Todos"}</option>)}
            </select>
          </label>
          <label className="font-label text-[10px] text-outline">
            CONCEPTO{" "}
            <select value={concept} onChange={(e) => { setConcept(e.target.value as PaymentConcept | ""); setPage(1); }} className={SELECT_CLASS}>
              {CONCEPT_OPTIONS.map((o) => <option key={o || "all"} value={o}>{o || "Todos"}</option>)}
            </select>
          </label>
          <label className="font-label text-[10px] text-outline">
            AUDITORÍA{" "}
            <select value={auditStatus} onChange={(e) => { setAuditStatus(e.target.value as PaymentAuditStatus | ""); setPage(1); }} className={SELECT_CLASS}>
              {AUDIT_OPTIONS.map((o) => <option key={o || "all"} value={o}>{o || "Todos"}</option>)}
            </select>
          </label>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
        {/* Columna 1 — cola + financiero */}
        <div className="flex flex-col gap-5">
          <div className="rounded border border-outline-variant bg-surface-container-lowest p-5">
            <div className="mb-4 flex items-center justify-between border-b border-outline-variant pb-2">
              <h2 className="flex items-center gap-1 font-headline text-[18px] font-semibold">
                <span className="material-symbols-outlined text-xl text-primary">receipt_long</span>
                Cola de verificación
              </h2>
              <span className="font-label text-[10px] text-outline">PEN (SOLES)</span>
            </div>
            {paymentsQuery.isPending ? <p className="text-sm text-outline">Cargando pagos...</p> : null}
            {paymentsQuery.isError ? (
              <div className="space-y-2">
                <p className="text-sm text-error">No se pudo cargar la bandeja.</p>
                <Button variant="outlined" type="button" onClick={() => void paymentsQuery.refetch()}>Reintentar</Button>
              </div>
            ) : null}
            {paymentsQuery.data && paymentsQuery.data.items.length === 0 ? (
              <p className="text-sm text-outline">No hay pagos para estos filtros.</p>
            ) : null}
            {paymentsQuery.data && paymentsQuery.data.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-outline-variant font-label text-[11px] text-on-surface-variant">
                      <th className="py-2">PAGO</th>
                      <th className="py-2 text-center">CONCEPTO</th>
                      <th className="py-2 text-right">MONTO</th>
                      <th className="py-2 text-right">ESTADO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container font-body text-[14px]">
                    {paymentsQuery.data.items.map((p) => (
                      <tr
                        key={p.payment_id}
                        onClick={() => { setSelectedId(p.payment_id); setAction(null); }}
                        className={`cursor-pointer ${selectedId === p.payment_id ? "bg-surface-container-low" : "hover:bg-surface-container-low"}`}
                      >
                        <td className="py-2 pr-2">
                          <div className="font-headline text-[15px] font-semibold">PAY-{p.payment_id.slice(0, 8).toUpperCase()}</div>
                          <div className="font-label text-[11px] text-outline">{new Date(p.created_at).toLocaleString("es-PE")}</div>
                        </td>
                        <td className="py-2 text-center"><PaymentConceptBadge concept={p.concept} /></td>
                        <td className="py-2 text-right font-label font-semibold">{formatMoney(p.amount)}</td>
                        <td className="py-2 text-right"><PaymentStatusBadge status={p.validation_status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            {paymentsQuery.data ? (
              <div className="mt-2 flex items-center gap-2 border-t border-dashed border-outline-variant pt-2 font-label text-[11px] text-on-surface-variant">
                <span>Página {paymentsQuery.data.page} — {paymentsQuery.data.total} pagos</span>
                <span className="ml-auto flex gap-2">
                  <Button variant="ghost" type="button" disabled={page <= 1} onClick={() => setPage((v) => Math.max(1, v - 1))}>Anterior</Button>
                  <Button variant="ghost" type="button" disabled={paymentsQuery.data.items.length < paymentsQuery.data.page_size} onClick={() => setPage((v) => v + 1)}>Siguiente</Button>
                </span>
              </div>
            ) : null}
          </div>

          <div className="rounded border border-outline-variant bg-surface-container-lowest p-5">
            <div className="mb-4 flex items-center justify-between border-b border-outline-variant pb-2">
              <h2 className="flex items-center gap-1 font-headline text-[18px] font-semibold">
                <span className="material-symbols-outlined text-xl text-primary">distance</span>
                Resumen del pago en foco
              </h2>
              {first?.audit_status ? <PaymentAuditBadge status={first.audit_status} /> : null}
            </div>
            {!focus ? (
              <p className="text-sm text-outline">Selecciona un pago de la cola para ver el consolidado.</p>
            ) : (
              <div className="space-y-2 font-label text-[11px]">
                <div className="flex justify-between text-on-surface-variant"><span>Monto del comprobante</span><span className="font-medium text-on-surface">{formatMoney(focus.amount)}</span></div>
                <div className="flex justify-between text-on-surface-variant"><span>Cotización</span><span className="font-medium text-on-surface">{focus.quote_id ?? "—"}</span></div>
                <div className="flex justify-between border-t border-outline-variant pt-2">
                  <span className="font-headline text-[15px] font-bold text-on-surface">TOTAL A VERIFICAR</span>
                  <span className="font-headline text-[24px] font-bold">{formatMoney(focus.amount)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Columna 2 — visor OCR + acciones */}
        <div className="flex flex-col gap-5">
          <div className="rounded border border-outline-variant bg-surface-container-lowest p-5">
            <div className="mb-4 flex items-center justify-between border-b border-outline-variant pb-2">
              <h2 className="flex items-center gap-1 font-headline text-[18px] font-semibold">
                <span className="material-symbols-outlined text-xl text-secondary">document_scanner</span>
                Validación OCR Voucher WhatsApp
              </h2>
              {focus ? <PaymentStatusBadge status={focus.validation_status} /> : null}
            </div>
            {!selectedId || !focus ? (
              <p className="text-sm text-outline">Elige un pago para ver el comprobante y cotejar parámetros.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                  <div className="rounded border border-outline-variant bg-surface-bright p-1 md:col-span-5">
                    <PaymentEvidenceViewer paymentId={selectedId} />
                  </div>
                  <div className="flex flex-col justify-between gap-2 md:col-span-7">
                    <span className="font-label text-[11px] text-outline">PARÁMETROS EXTRAÍDOS VS. SISTEMA</span>
                    {[
                      { k: "MONTO COMPROBANTE", v: formatMoney(focus.amount) },
                      { k: "NÚMERO DE OPERACIÓN", v: focus.transaction_reference ?? "—" },
                      { k: "CONCEPTO", v: focus.concept },
                      { k: "EVENTO", v: focus.event_id ?? "—" },
                    ].map((row) => (
                      <div key={row.k} className="flex items-center justify-between rounded border border-outline-variant bg-surface-bright p-2">
                        <div className="flex flex-col">
                          <span className="font-label text-[11px] text-outline">{row.k}</span>
                          <span className="font-label text-[11px] font-semibold">{row.v}</span>
                        </div>
                        <span className="material-symbols-outlined text-base text-on-tertiary-container">check_circle</span>
                      </div>
                    ))}
                    {focus.rejection_reason ? (
                      <p className="text-xs text-error">Motivo de rechazo: {focus.rejection_reason}</p>
                    ) : null}
                    {focus.audit_notes ? (
                      <p className="text-xs text-on-surface-variant">Notas de auditoría: {focus.audit_notes}</p>
                    ) : null}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-2 border-t border-outline-variant pt-4 sm:grid-cols-2">
                  <Button type="button" variant="primary" onClick={() => setAction("verify")}>
                    Aprobar / Rechazar
                  </Button>
                  <Button type="button" variant="outlined" onClick={() => setAction("audit")}>
                    Auditar cobro
                  </Button>
                </div>
                {action === "verify" ? (
                  <div className="mt-3 rounded border border-outline-variant bg-surface-bright p-3">
                    <VerifyPaymentForm paymentId={selectedId} onDone={() => setAction(null)} />
                  </div>
                ) : null}
                {action === "audit" ? (
                  <div className="mt-3 rounded border border-outline-variant bg-surface-bright p-3">
                    <AuditPaymentForm paymentId={selectedId} onDone={() => setAction(null)} />
                  </div>
                ) : null}
                {detailQuery.isPending ? <p className="mt-2 text-xs text-outline">Cargando detalle...</p> : null}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
