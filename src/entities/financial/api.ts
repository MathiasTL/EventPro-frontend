import { apiFetch } from "@/shared/api/client";
import type { FinancialCollections, FinancialPnl, PeriodType } from "./types";

export type FinancialPnlQuery = {
  period_type: PeriodType;
  year: number;
  month?: number;
  week?: number;
};

function financialPeriodParams(query: FinancialPnlQuery): URLSearchParams {
  const params = new URLSearchParams({ period_type: query.period_type, year: String(query.year) });
  if (query.period_type === "MONTHLY" && query.month) params.set("month", String(query.month));
  if (query.period_type === "WEEKLY" && query.week) params.set("week", String(query.week));
  return params;
}

/** GET /reports/financial/pnl — US-21: consolida eventos SETTLED por mes o semana ISO. */
export function getFinancialPnl(query: FinancialPnlQuery): Promise<FinancialPnl> {
  return apiFetch<FinancialPnl>(`/reports/financial/pnl?${financialPeriodParams(query).toString()}`);
}

export function getFinancialCollections(query: FinancialPnlQuery): Promise<FinancialCollections> {
  return apiFetch<FinancialCollections>(`/reports/financial/collections?${financialPeriodParams(query).toString()}`);
}
