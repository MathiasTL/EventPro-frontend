import { Button } from "@/shared/ui";

export function ThreadSkeleton() {
  return (
    <div role="status" aria-label="Cargando la conversación" className="flex min-h-0 flex-1 flex-col">
      <div className="flex animate-pulse items-center gap-3 border-b border-zinc-200 bg-white px-4 py-3 motion-reduce:animate-none">
        <div className="h-10 w-10 rounded-full bg-zinc-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/3 rounded bg-zinc-200" />
          <div className="h-3 w-1/4 rounded bg-zinc-100" />
        </div>
      </div>
      <MessagesSkeleton />
      <div className="border-t border-zinc-200 bg-white px-4 py-3">
        <div className="h-10 rounded-lg bg-zinc-100" aria-hidden="true" />
      </div>
    </div>
  );
}

export function MessagesSkeleton() {
  return (
    <div role="status" aria-label="Cargando mensajes" className="flex flex-1 animate-pulse flex-col gap-3 bg-zinc-50 p-4 motion-reduce:animate-none">
      <div className="h-10 w-2/5 rounded-2xl bg-zinc-200" />
      <div className="ml-auto h-12 w-1/2 rounded-2xl bg-zinc-200" />
      <div className="h-8 w-1/3 rounded-2xl bg-zinc-200" />
      <div className="ml-auto h-10 w-2/5 rounded-2xl bg-zinc-200" />
    </div>
  );
}

type ErrorProps = {
  /** 503: the messaging service is down; no technical details are shown. */
  unavailable: boolean;
  notFound?: boolean;
  onRetry: () => void;
  retrying: boolean;
};

export function ThreadError({ unavailable, notFound = false, onRetry, retrying }: ErrorProps) {
  const message = notFound
    ? "La conversación no existe o ya no está disponible."
    : unavailable
      ? "La mensajería no está disponible temporalmente."
      : "No se pudo cargar la conversación.";
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div role="alert" className="max-w-sm space-y-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <p>{message}</p>
        {!notFound && <Button variant="ghost" onClick={onRetry} disabled={retrying}>{retrying ? "Reintentando…" : "Reintentar"}</Button>}
      </div>
    </div>
  );
}

/** Inline banner when the thread keeps what it already loaded but the messaging service is down. */
export function UnavailableBanner() {
  return (
    <p role="status" className="border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-900">
      La mensajería no está disponible temporalmente.
    </p>
  );
}
