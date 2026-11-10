import { TrendingDown, TrendingUp } from "lucide-react";
import type { FinancialPnl } from "@/entities/financial/types";
import { formatSoles } from "@/shared/lib/format";

type KpiTone = "success" | "danger";

const TONE_TEXT: Record<KpiTone, string> = { success: "text-ep-success", danger: "text-ep-danger" };

export function FinancialKpiSummary({ pnl }: { pnl: FinancialPnl }) {
  // Zero profit is neither a gain nor a loss: no tone, no trend icon.
  const profitTone: KpiTone | undefined = pnl.net_profit > 0 ? "success" : pnl.net_profit < 0 ? "danger" : undefined;
  const cards: { label: string; value: string; tone?: KpiTone }[] = [
    { label: "Ingresos brutos", value: formatSoles(pnl.gross_revenue) },
    { label: "Costos directos", value: formatSoles(pnl.direct_costs.total_costs) },
    { label: "Utilidad neta", value: formatSoles(pnl.net_profit), tone: profitTone },
    { label: "Margen de utilidad", value: `${pnl.profit_margin_percentage.toFixed(1)}%`, tone: profitTone },
  ];
  const ToneIcon = profitTone === "success" ? TrendingUp : TrendingDown;

  return (
    <div className="space-y-3">
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(card => (
          <div key={card.label} className="rounded-lg border border-ep-line bg-ep-pass p-4">
            <dt className="text-xs font-medium text-ep-mute">{card.label}</dt>
            <dd className={`mt-1 flex items-center gap-2 text-2xl font-bold tabular-nums ${card.tone ? TONE_TEXT[card.tone] : "text-ep-ink"}`}>
              {card.tone && (
                <>
                  <ToneIcon size={18} strokeWidth={1.75} strokeLinecap="square" aria-hidden="true" className="shrink-0" />
                  <span className="sr-only">{card.tone === "success" ? "Positivo: " : "Negativo: "}</span>
                </>
              )}
              {card.value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-ep-mute">
        {pnl.total_events_settled === 0
          ? "No hay eventos liquidados en este período."
          : `Calculado sobre ${pnl.total_events_settled} evento${pnl.total_events_settled === 1 ? "" : "s"} liquidado${pnl.total_events_settled === 1 ? "" : "s"} (estado SETTLED).`}
      </p>
    </div>
  );
}
