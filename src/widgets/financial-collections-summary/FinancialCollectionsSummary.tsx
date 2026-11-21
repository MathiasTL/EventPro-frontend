import type { FinancialCollections } from "@/entities/financial/types";
import { formatSoles } from "@/shared/lib/format";
import { ErrorBanner, LoadingState } from "@/shared/ui";

type Props = {
  collections: FinancialCollections | null;
  loading: boolean;
  error: string | null;
};

function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function FinancialCollectionsSummary({ collections, loading, error }: Props) {
  return (
    <section aria-labelledby="financial-collections-title" className="space-y-3">
      <div>
        <h2 id="financial-collections-title" className="text-lg font-semibold text-ep-ink">Cobros del período</h2>
        <p className="mt-1 max-w-3xl text-sm text-ep-body">Dinero que entró y saldos pendientes de los eventos del período. No reemplaza la utilidad, que solo cuenta eventos liquidados.</p>
      </div>

      <ErrorBanner message={error} />
      {loading ? <LoadingState label="Calculando los cobros…" /> : !error && collections && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="min-w-0 rounded-lg border border-ep-line bg-ep-pass p-4">
            <dl>
              <dt className="text-xs font-medium text-ep-mute">Cobrado</dt>
              <dd className="mt-1 break-words text-2xl font-bold tabular-nums text-ep-ink">{formatSoles(collections.collected.total)}</dd>
            </dl>
            <p className="mt-1 text-xs text-ep-mute">{countLabel(collections.collected.payments_count, "pago", "pagos")}</p>
            <dl className="mt-4 space-y-2 border-t border-ep-line pt-3 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-ep-body">Adelantos</dt><dd className="tabular-nums text-ep-ink">{formatSoles(collections.collected.advance)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-ep-body">Saldos</dt><dd className="tabular-nums text-ep-ink">{formatSoles(collections.collected.balance)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-ep-body">Horas extra</dt><dd className="tabular-nums text-ep-ink">{formatSoles(collections.collected.extension)}</dd></div>
            </dl>
          </div>

          <div className="min-w-0 rounded-lg border border-ep-line bg-ep-pass p-4">
            <dl>
              <dt className="text-xs font-medium text-ep-mute">Por verificar</dt>
              <dd className="mt-1 break-words text-2xl font-bold tabular-nums text-ep-ink">{formatSoles(collections.pending_verification.amount)}</dd>
            </dl>
            <p className="mt-1 text-xs text-ep-mute">{countLabel(collections.pending_verification.payments_count, "pago", "pagos")}</p>
          </div>

          <div className="min-w-0 rounded-lg border border-ep-line bg-ep-pass p-4">
            <dl>
              <dt className="text-xs font-medium text-ep-mute">Por cobrar</dt>
              <dd className="mt-1 break-words text-2xl font-bold tabular-nums text-ep-ink">{formatSoles(collections.receivable.amount)}</dd>
            </dl>
            <p className="mt-1 text-xs text-ep-mute">{countLabel(collections.receivable.events_count, "evento", "eventos")}</p>
          </div>

          <div className="min-w-0 rounded-lg border border-ep-line bg-ep-wash p-4">
            <h3 className="text-xs font-medium text-ep-mute">Reembolsos</h3>
            <dl className="mt-2 space-y-3 text-sm">
              <div><dt className="text-ep-body">Pendiente</dt><dd className="break-words font-semibold tabular-nums text-ep-ink">{formatSoles(collections.refunds.refund_pending)}</dd></div>
              <div><dt className="text-ep-body">Devuelto</dt><dd className="break-words font-semibold tabular-nums text-ep-ink">{formatSoles(collections.refunds.refunded)}</dd></div>
            </dl>
          </div>
        </div>
      )}
    </section>
  );
}
