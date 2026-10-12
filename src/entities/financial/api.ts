import { apiFetch } from "@/shared/api/client";
import type { FinancialPnl, PeriodType } from "./types";

export type FinancialPnlQuery = {
  period_type: PeriodType;
  year: number;
  month?: number;
  week?: number;
};

/** GET /reports/financial/pnl — US-21: consolida eventos SETTLED por mes o semana ISO. */
export function getFinancialPnl(query: FinancialPnlQuery): Promise<FinancialPnl> {
  const params = new URLSearchParams({ period_type: query.period_type, year: String(query.year) });
  if (query.period_type === "MONTHLY" && query.month) params.set("month", String(query.month));
  if (query.period_type === "WEEKLY" && query.week) params.set("week", String(query.week));
  return apiFetch<FinancialPnl>(`/reports/financial/pnl?${params.toString()}`);
}
