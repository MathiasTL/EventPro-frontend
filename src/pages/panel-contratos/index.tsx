"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { contractKeys, listContracts, type ContractFilters } from "@/entities/contract/api";
import { formatLimaDateTime } from "@/shared/lib/date";
import { Button, EmptyState, ErrorBanner, Field, FilterBar, LoadingState, Page, PageHeader, Select, Table } from "@/shared/ui";
import { contractError, contractStatuses, ContractStatusBadge } from "./ui";

export function ContractsPage() {
  const [filters, setFilters] = useState<ContractFilters>({ status: "", mode: "", page: 1 });
  const query = useQuery({ queryKey: contractKeys.list(filters), queryFn: () => listContracts(filters) });
  const page = query.data;

  function changePage(offset: number) {
    setFilters((current) => ({ ...current, page: current.page + offset }));
  }

  return (
    <Page>
      <PageHeader title="Contratos" actions={
        <Link href="/panel/contratos/nuevo" className="inline-flex min-h-11 items-center rounded-lg bg-ep-ink px-3.5 text-sm font-semibold text-white hover:bg-ep-ink-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ep-magenta">
          Nuevo contrato manual
        </Link>
      } />
      <FilterBar>
        <Field label="Estado">
          <Select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value as ContractFilters["status"], page: 1 })}>
            <option value="">Todos los estados</option>
            {Object.entries(contractStatuses).map(([status, item]) => <option key={status} value={status}>{item.label}</option>)}
          </Select>
        </Field>
        <Field label="Modo">
          <Select value={filters.mode} onChange={(event) => setFilters({ ...filters, mode: event.target.value as ContractFilters["mode"], page: 1 })}>
            <option value="">Todos los modos</option>
            <option value="manual">Manual</option>
            <option value="automatic">Automático</option>
          </Select>
        </Field>
      </FilterBar>
      {query.isPending && <LoadingState label="Cargando contratos…" />}
      {query.isError && (
        <div className="space-y-3">
          <ErrorBanner message={contractError(query.error)} />
          <Button type="button" variant="ghost" onClick={() => void query.refetch()}>Reintentar</Button>
        </div>
      )}
      {page && (
        <>
          {page.items.length ? (
            <Table head={["Contrato", "Estado", "Modo", "Registro (Lima)"]}>
              {page.items.map((contract) => (
                <tr key={contract.contract_id}>
                  <td className="px-4 py-3">
                    <Link href={`/panel/contratos/${contract.contract_id}`} className="whitespace-nowrap font-semibold underline underline-offset-4 hover:text-ep-magenta focus-visible:outline-2 focus-visible:outline-ep-magenta">
                      {contract.contract_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3"><ContractStatusBadge status={contract.status} /></td>
                  <td className="px-4 py-3">{contract.is_manual_mode ? "Manual" : "Automático"}</td>
                  <td className="whitespace-nowrap px-4 py-3">{formatLimaDateTime(contract.created_at)}</td>
                </tr>
              ))}
            </Table>
          ) : <EmptyState message="No hay contratos para estos filtros." />}
          {(filters.page > 1 || page.total > page.page_size) && (
            <nav aria-label="Paginación de contratos" className="flex flex-wrap items-center justify-end gap-3">
              <Button type="button" variant="ghost" disabled={filters.page <= 1 || query.isFetching} onClick={() => changePage(-1)}>Anterior</Button>
              <span className="text-sm text-ep-mute">Página {filters.page}</span>
              <Button type="button" variant="ghost" disabled={filters.page * page.page_size >= page.total || query.isFetching} onClick={() => changePage(1)}>Siguiente</Button>
            </nav>
          )}
        </>
      )}
    </Page>
  );
}
