import type { FinancialPnl } from "@/entities/financial/types";
import { formatSoles } from "@/shared/lib/format";

export function FinancialKpiSummary({ pnl }: { pnl: FinancialPnl }) {
  const positive = pnl.net_profit >= 0;
  const cards: { label: string; value: string; tone?: "success" | "danger" }[] = [
    { label: "Ingresos brutos", value: formatSoles(pnl.gross_revenue) },
    { label: "Costos directos", value: formatSoles(pnl.direct_costs.total_costs) },
    { label: "Utilidad neta", value: formatSoles(pnl.net_profit), tone: positive ? "success" : "danger" },
    { label: "Margen de utilidad", value: `${pnl.profit_margin_percentage.toFixed(1)}%`, tone: positive ? "success" : "danger" },
  ];

  return (
    <div className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(card => (
          <div key={card.label} className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{card.label}</p>
            <p className={`mt-2 text-2xl font-bold ${card.tone === "success" ? "text-emerald-700" : card.tone === "danger" ? "text-red-700" : "text-zinc-900"}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
      <p className="text-xs text-zinc-500">
        {pnl.total_events_settled === 0
          ? "No hay eventos liquidados en este período."
          : `Calculado sobre ${pnl.total_events_settled} evento${pnl.total_events_settled === 1 ? "" : "s"} liquidado${pnl.total_events_settled === 1 ? "" : "s"} (estado SETTLED).`}
      </p>
    </div>
  );
}
