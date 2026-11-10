import { Button, EmptyState } from "@/shared/ui";
import type { ConversationStreamStatus } from "@/features/conversation-stream";

export function ListSkeleton() {
  return (
    <div role="status" aria-label="Cargando conversaciones" className="">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="flex min-h-[5.75rem] animate-pulse border-b border-ep-line motion-reduce:animate-none">
          <div className="w-5 shrink-0 bg-ep-neutral-field" />
          <div className="flex-1 space-y-2.5 px-3.5 py-4">
            <div className="h-4 w-1/2 rounded-sm bg-ep-neutral-field" />
            <div className="h-3 w-4/5 rounded-sm bg-ep-wash" />
            <div className="h-3 w-1/3 rounded-sm bg-ep-wash" />
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
    <div role="alert" className="m-4 space-y-3 rounded-lg border border-ep-danger/40 bg-white p-4 text-sm text-ep-danger">
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
    <div className={label ? "flex items-center justify-between gap-2 border-b border-ep-signal-line bg-ep-signal-field px-4 py-1.5 text-xs font-bold text-ep-ink" : undefined}>
      <p aria-live="polite" role="status" className={label ? undefined : "sr-only"}>
        {label ?? ""}
      </p>
      {status === "error" && onRetry && (
        <button type="button" onClick={onRetry} className="relative rounded-md border border-ep-ink bg-white px-2 py-0.5 font-semibold text-ep-ink hover:bg-ep-wash after:absolute after:-inset-x-1 after:-inset-y-3 after:content-[''] focus-visible:outline-2 focus-visible:outline-ep-magenta">
          Reintentar
        </button>
      )}
    </div>
  );
}
