import { Button, EmptyState } from "@/shared/ui";
import type { ConversationStreamStatus } from "@/features/conversation-stream";

export function ListSkeleton() {
  return (
    <div role="status" aria-label="Cargando conversaciones" className="divide-y divide-zinc-100">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="flex animate-pulse gap-3 px-4 py-3 motion-reduce:animate-none">
          <div className="h-10 w-10 rounded-full bg-zinc-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/2 rounded bg-zinc-200" />
            <div className="h-3 w-4/5 rounded bg-zinc-100" />
            <div className="h-3 w-1/3 rounded bg-zinc-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function InboxEmpty({ filtered, onClear }: { filtered: boolean; onClear: () => void }) {
  if (!filtered) return <div className="p-4"><EmptyState message="No hay conversaciones." /></div>;
  return (
    <div className="space-y-3 p-4">
      <EmptyState message="Sin resultados para los filtros." />
      <div className="flex justify-center"><Button variant="ghost" onClick={onClear}>Limpiar filtros</Button></div>
    </div>
  );
}

export function InboxError({ unavailable, onRetry, retrying }: { unavailable: boolean; onRetry: () => void; retrying: boolean }) {
  return (
    <div role="alert" className="m-4 space-y-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <p>{unavailable ? "La mensajería no está disponible temporalmente." : "No se pudieron cargar las conversaciones."}</p>
      <Button variant="ghost" onClick={onRetry} disabled={retrying}>{retrying ? "Reintentando…" : "Reintentar"}</Button>
    </div>
  );
}

const streamLabels: Partial<Record<ConversationStreamStatus, string>> = {
  connecting: "Conectando…",
  reconnecting: "Reconectando…",
  closed: "Sin conexión en tiempo real",
  error: "No se pudo restablecer la conexión en tiempo real.",
};

/** The live region stays mounted so screen readers announce the change of state. */
export function StreamIndicator({ status, onRetry }: { status?: ConversationStreamStatus; onRetry?: () => void }) {
  const label = status ? streamLabels[status] : undefined;
  return (
    <div className={label ? "flex items-center justify-between gap-2 border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-900" : undefined}>
      <p aria-live="polite" role="status" className={label ? undefined : "sr-only"}>
        {label ?? ""}
      </p>
      {status === "error" && onRetry && (
        <button type="button" onClick={onRetry} className="rounded-md border border-amber-300 bg-white px-2 py-0.5 font-semibold text-amber-900 hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-amber-700">
          Reintentar
        </button>
      )}
    </div>
  );
}
