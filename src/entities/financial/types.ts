export type PeriodType = "MONTHLY" | "WEEKLY";

export type FinancialDirectCosts = {
  fixed_packages_cost: number;
  fixed_extras_cost: number;
  mobility_operational_cost: number;
  total_costs: number;
};

/** Forma exacta de GET /reports/financial/pnl (ver FinancialPnlResponse en el backend). */
export type FinancialPnl = {
  period: string;
  total_events_settled: number;
  gross_revenue: number;
  direct_costs: FinancialDirectCosts;
  net_profit: number;
  profit_margin_percentage: number;
};
