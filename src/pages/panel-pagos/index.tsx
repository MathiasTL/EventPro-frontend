"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PAYMENT_AUDIT_STATUSES,
  PAYMENT_CONCEPTS,
  PAYMENT_VALIDATION_STATUSES,
  paymentListOptions,
  type PaymentAuditStatus,
  type PaymentConcept,
  type PaymentFilters,
  type PaymentRead,
  type PaymentValidationStatus,
} from "@/entities/payment";
import { PaymentDetailModal } from "@/widgets/payment-detail/PaymentDetailModal";
import { PaymentsTable } from "@/widgets/payments-table/PaymentsTable";
import { Button, EmptyState, ErrorBanner, Field, FilterBar, Input, LoadingState, Notice, Page, PageHeader, Select } from "@/shared/ui";

const PAGE_SIZE = 20;

const STATUS_LABELS: Record<PaymentValidationStatus, string> = {
  PENDING_VERIFICATION: "Pendiente de verificación",
  REQUIRES_MANUAL_APPROVAL: "Requiere aprobación manual",
  VERIFIED: "Verificado",
  REJECTED: "Rechazado",
  REFUND_PENDING: "Reembolso pendiente",
  REFUNDED: "Reembolsado",
};
const CONCEPT_LABELS: Record<PaymentConcept, string> = { ADVANCE: "Adelanto", BALANCE: "Saldo", EXTENSION: "Extensión" };
const AUDIT_LABELS: Record<PaymentAuditStatus, string> = { UNREVIEWED: "Sin revisar", REVIEWED: "Revisado", FLAGGED: "Observado" };

type FilterDraft = { status: string; concept: string; audit: string; quoteId: string; fromDate: string; toDate: string };
const EMPTY_FILTERS: FilterDraft = { status: "", concept: "", audit: "", quoteId: "", fromDate: "", toDate: "" };

function toQuery(filters: FilterDraft, page: number): PaymentFilters {
  return {
    validation_status: (filters.status || undefined) as PaymentValidationStatus | undefined,
    concept: (filters.concept || undefined) as PaymentConcept | undefined,
    audit_status: (filters.audit || undefined) as PaymentAuditStatus | undefined,
    quote_id: filters.quoteId.trim() || undefined,
    from_date: filters.fromDate || undefined,
    to_date: filters.toDate || undefined,
    page,
    page_size: PAGE_SIZE,
  };
}

export function PagosPage() {
  const [draft, setDraft] = useState<FilterDraft>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<FilterDraft>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<PaymentRead | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data, isPending, isFetching, error } = useQuery(paymentListOptions(toQuery(applied, page)));
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const errorMessage = error ? (error instanceof Error ? error.message : "No se pudieron cargar los pagos.") : null;

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApplied(draft);
    setPage(1);
  }

  return (
    <Page>
      <PageHeader title="Pagos" description="Verificación, auditoría y devoluciones de cobros." />

      <form onSubmit={applyFilters}>
        <FilterBar>
        <Field label="Estado de validación">
          <Select value={draft.status} onChange={event => setDraft({ ...draft, status: event.target.value })} className="w-56">
            <option value="">Todos</option>
            {PAYMENT_VALIDATION_STATUSES.map(value => <option key={value} value={value}>{STATUS_LABELS[value]}</option>)}
          </Select>
        </Field>
        <Field label="Concepto">
          <Select value={draft.concept} onChange={event => setDraft({ ...draft, concept: event.target.value })} className="w-36">
            <option value="">Todos</option>
            {PAYMENT_CONCEPTS.map(value => <option key={value} value={value}>{CONCEPT_LABELS[value]}</option>)}
          </Select>
        </Field>
        <Field label="Auditoría">
          <Select value={draft.audit} onChange={event => setDraft({ ...draft, audit: event.target.value })} className="w-36">
            <option value="">Todas</option>
            {PAYMENT_AUDIT_STATUSES.map(value => <option key={value} value={value}>{AUDIT_LABELS[value]}</option>)}
          </Select>
        </Field>
        <Field label="ID de cotización"><Input value={draft.quoteId} onChange={event => setDraft({ ...draft, quoteId: event.target.value })} placeholder="UUID" className="w-48" /></Field>
        <Field label="Desde"><Input type="date" value={draft.fromDate} onChange={event => setDraft({ ...draft, fromDate: event.target.value })} /></Field>
        <Field label="Hasta"><Input type="date" value={draft.toDate} onChange={event => setDraft({ ...draft, toDate: event.target.value })} /></Field>
        <Button type="submit" disabled={isFetching}>{isFetching ? "Filtrando…" : "Filtrar"}</Button>
        </FilterBar>
      </form>

      {success && <Notice tone="success">{success}</Notice>}
      <ErrorBanner message={errorMessage} />

      {isPending ? (
        <LoadingState label="Cargando pagos…" />
      ) : !error && items.length === 0 ? (
        <EmptyState message="No hay pagos con estos filtros." />
      ) : !error && (
        <>
          <PaymentsTable payments={items} onView={payment => { setSuccess(null); setSelected(payment); }} />
          {total > PAGE_SIZE && (
            <div className="flex items-center justify-end gap-3">
              <Button variant="ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</Button>
              <span className="text-sm text-ep-body">Página {page} de {Math.ceil(total / PAGE_SIZE)}</span>
              <Button variant="ghost" disabled={page * PAGE_SIZE >= total} onClick={() => setPage(page + 1)}>Siguiente</Button>
            </div>
          )}
        </>
      )}

      <PaymentDetailModal payment={selected} onClose={() => setSelected(null)} onDone={message => { setSuccess(message); setSelected(null); }} />
    </Page>
  );
}
