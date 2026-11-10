import { Button } from "@/shared/ui";

export function ThreadSkeleton() {
  return (
    <div role="status" aria-label="Cargando la conversación" className="flex min-h-0 flex-1 flex-col">
      <div className="flex animate-pulse items-center gap-3 border-b border-ep-line bg-ep-pass px-4 py-3 motion-reduce:animate-none">
        <div className="h-10 w-10 rounded-sm bg-ep-neutral-field" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/3 rounded-sm bg-ep-neutral-field" />
          <div className="h-3 w-1/4 rounded-sm bg-ep-wash" />
        </div>
      </div>
      <MessagesSkeleton />
      <div className="border-t border-ep-line bg-ep-pass px-4 py-3">
        <div className="h-10 rounded-lg bg-ep-wash" aria-hidden="true" />
      </div>
    </div>
  );
}

export function MessagesSkeleton() {
  return (
    <div role="status" aria-label="Cargando mensajes" className="flex flex-1 animate-pulse flex-col gap-3 bg-ep-wash p-4 motion-reduce:animate-none">
      <div className="h-10 w-2/5 rounded-xl bg-ep-neutral-field" />
      <div className="ml-auto h-12 w-1/2 rounded-xl bg-ep-neutral-field" />
      <div className="h-8 w-1/3 rounded-xl bg-ep-neutral-field" />
      <div className="ml-auto h-10 w-2/5 rounded-xl bg-ep-neutral-field" />
    </div>
  );
}

type ErrorProps = {
  /** 503: the messaging service is down; no technical details are shown. */
  unavailable: boolean;
  notFound?: boolean;
  onRetry: () => void;
  retrying: boolean;
  /** Narrow screens: the header (and its back button) is not mounted, so the error offers its own way back to the list. */
  onBack?: () => void;
};

export function ThreadError({ unavailable, notFound = false, onRetry, retrying, onBack }: ErrorProps) {
  const message = notFound
    ? "La conversación no existe o ya no está disponible. Vuelve a la lista para elegir otra conversación."
    : unavailable
      ? "La mensajería no está disponible temporalmente."
      : "No se pudo cargar la conversación.";
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div role="alert" className="max-w-sm space-y-3 rounded-lg border border-ep-danger/40 bg-white p-4 text-sm text-ep-danger">
        <p>{message}</p>
        <div className="flex flex-wrap items-center gap-2">
          {!notFound && <Button variant="ghost" onClick={onRetry} disabled={retrying}>{retrying ? "Reintentando…" : "Reintentar"}</Button>}
          {onBack && <Button variant="ghost" onClick={onBack} className="min-h-11 lg:hidden">Volver a conversaciones</Button>}
        </div>
      </div>
    </div>
  );
}

/** Inline banner when the thread keeps what it already loaded but the messaging service is down. */
export function UnavailableBanner() {
  return (
    <p role="status" className="border-b border-ep-signal-line bg-ep-signal-field px-4 py-1.5 text-xs font-bold text-ep-ink">
      La mensajería no está disponible temporalmente.
    </p>
  );
}
