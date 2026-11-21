"use client";

import { useEffect, useState } from "react";
import { getFinancialCollections, getFinancialPnl } from "@/entities/financial/api";
import type { FinancialCollections, FinancialPnl, PeriodType } from "@/entities/financial/types";
import { FinancialCollectionsSummary } from "@/widgets/financial-collections-summary";
import { FinancialKpiSummary } from "@/widgets/financial-kpi-summary/FinancialKpiSummary";
import { limaToday } from "@/shared/lib/date";
import { formatSoles } from "@/shared/lib/format";
import { Button, ErrorBanner, Field, FilterBar, Input, LoadingState, Page, PageHeader, Panel, Select, Table } from "@/shared/ui";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function currentYearAndMonth(): [number, number] {
  const [year, month] = limaToday().split("-").map(Number);
  return [year, month];
}

export function FinanzasPage() {
  const [[todayYear, todayMonth]] = useState(currentYearAndMonth);
  const [periodType, setPeriodType] = useState<PeriodType>("MONTHLY");
  const [year, setYear] = useState(todayYear);
  const [month, setMonth] = useState(todayMonth);
  const [week, setWeek] = useState(1);
  const [pnl, setPnl] = useState<FinancialPnl | null>(null);
  const [collections, setCollections] = useState<FinancialCollections | null>(null);
  const [pnlLoading, setPnlLoading] = useState(true);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [pnlError, setPnlError] = useState<string | null>(null);
  const [collectionsError, setCollectionsError] = useState<string | null>(null);

  function query() {
    return { period_type: periodType, year, month: periodType === "MONTHLY" ? month : undefined, week: periodType === "WEEKLY" ? week : undefined };
  }

  function loadReports(selected: ReturnType<typeof query>, isCancelled: () => boolean) {
    getFinancialPnl(selected)
      .then(result => { if (!isCancelled()) { setPnl(result); setPnlError(null); } })
      .catch(caught => { if (!isCancelled()) setPnlError(caught instanceof Error ? caught.message : "No se pudo cargar el reporte financiero."); })
      .finally(() => { if (!isCancelled()) setPnlLoading(false); });

    getFinancialCollections(selected)
      .then(result => { if (!isCancelled()) { setCollections(result); setCollectionsError(null); } })
      .catch(caught => { if (!isCancelled()) setCollectionsError(caught instanceof Error ? caught.message : "No se pudo cargar el reporte de cobros."); })
      .finally(() => { if (!isCancelled()) setCollectionsLoading(false); });
  }

  // Carga inicial con los valores por defecto (mes actual); los filtros posteriores se aplican con el botón "Consultar".
  useEffect(() => {
    let cancelled = false;
    loadReports(query(), () => cancelled);
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pnlLoading || collectionsLoading) return;
    setPnlLoading(true);
    setCollectionsLoading(true);
    setPnlError(null);
    setCollectionsError(null);
    loadReports(query(), () => false);
  }

  return (
    <Page>
      <PageHeader title="Finanzas" description="Utilidad de los eventos liquidados y cobros del período." />

      <form onSubmit={submit}>
        <FilterBar>
        <Field label="Período">
          <Select value={periodType} onChange={event => setPeriodType(event.target.value as PeriodType)}>
            <option value="MONTHLY">Mensual</option>
            <option value="WEEKLY">Semanal (ISO)</option>
          </Select>
        </Field>
        <Field label="Año">
          <Input type="number" min={2000} max={9998} value={year} onChange={event => setYear(Number(event.target.value))} className="w-28" />
        </Field>
        {periodType === "MONTHLY" ? (
          <Field label="Mes">
            <Select value={month} onChange={event => setMonth(Number(event.target.value))} className="w-40">
              {MONTH_NAMES.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}
            </Select>
          </Field>
        ) : (
          <Field label="Semana ISO">
            <Input type="number" min={1} max={53} value={week} onChange={event => setWeek(Number(event.target.value))} className="w-24" />
          </Field>
        )}
        <Button type="submit" disabled={pnlLoading || collectionsLoading}>{pnlLoading || collectionsLoading ? "Consultando…" : "Consultar"}</Button>
        </FilterBar>
      </form>

      <ErrorBanner message={pnlError} />

      {pnlLoading ? (
        <LoadingState label="Calculando el reporte…" />
      ) : !pnlError && pnl && <FinancialKpiSummary pnl={pnl} />}

      {!pnlLoading && !pnlError && pnl && <Panel>
        <h2 className="mb-1 text-lg font-semibold text-ep-ink">Detalle de costos directos</h2>
        <p className="mb-4 text-sm text-ep-body">Período consultado: {pnl.period}</p>
        <Table head={["Concepto", "Importe"]}>
          <tr>
            <td className="px-4 py-3">Paquetes (costo fijo)</td>
            <td className="px-4 py-3">{formatSoles(pnl.direct_costs.fixed_packages_cost)}</td>
          </tr>
          <tr>
            <td className="px-4 py-3">Extras (costo fijo)</td>
            <td className="px-4 py-3">{formatSoles(pnl.direct_costs.fixed_extras_cost)}</td>
          </tr>
          <tr>
            <td className="px-4 py-3">Movilidad operativa</td>
            <td className="px-4 py-3">{formatSoles(pnl.direct_costs.mobility_operational_cost)}</td>
          </tr>
          <tr className="font-semibold">
            <td className="px-4 py-3">Total costos directos</td>
            <td className="px-4 py-3">{formatSoles(pnl.direct_costs.total_costs)}</td>
          </tr>
        </Table>
      </Panel>}

      <FinancialCollectionsSummary collections={collections} loading={collectionsLoading} error={collectionsError} />
    </Page>
  );
}
