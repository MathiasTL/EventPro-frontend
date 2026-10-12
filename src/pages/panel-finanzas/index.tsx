"use client";

import { useEffect, useState } from "react";
import { getFinancialPnl } from "@/entities/financial/api";
import type { FinancialPnl, PeriodType } from "@/entities/financial/types";
import { FinancialKpiSummary } from "@/widgets/financial-kpi-summary/FinancialKpiSummary";
import { limaToday } from "@/shared/lib/date";
import { formatSoles } from "@/shared/lib/format";
import { Button, ErrorBanner, Field, Input, Select, Table } from "@/shared/ui";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function query() {
    return { period_type: periodType, year, month: periodType === "MONTHLY" ? month : undefined, week: periodType === "WEEKLY" ? week : undefined };
  }

  // Carga inicial con los valores por defecto (mes actual); los filtros posteriores se aplican con el botón "Consultar".
  useEffect(() => {
    let cancelled = false;
    getFinancialPnl(query())
      .then(result => { if (!cancelled) { setPnl(result); setError(null); } })
      .catch(caught => { if (!cancelled) setError(caught instanceof Error ? caught.message : "No se pudo cargar el reporte financiero."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    getFinancialPnl(query())
      .then(result => { setPnl(result); setError(null); })
      .catch(caught => setError(caught instanceof Error ? caught.message : "No se pudo cargar el reporte financiero."))
      .finally(() => setLoading(false));
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-700">Panel de operaciones</p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Finanzas</h1>
        <p className="mt-2 text-sm text-zinc-500">Ingresos, costos y utilidad neta de los eventos liquidados en el período.</p>
      </div>

      <form onSubmit={submit} className="flex flex-wrap items-end gap-4 rounded-2xl border border-zinc-200 bg-white p-4">
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
        <Button type="submit" disabled={loading}>{loading ? "Consultando…" : "Consultar"}</Button>
      </form>

      <ErrorBanner message={error} />

      {loading ? (
        <p role="status" className="py-12 text-center text-sm text-zinc-500">Calculando el reporte…</p>
      ) : !error && pnl && (
        <div className="space-y-6">
          <FinancialKpiSummary pnl={pnl} />
          <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-1 text-lg font-semibold text-zinc-900">Detalle de costos directos</h2>
            <p className="mb-4 text-sm text-zinc-500">Período consultado: {pnl.period}</p>
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
          </section>
        </div>
      )}
    </div>
  );
}
