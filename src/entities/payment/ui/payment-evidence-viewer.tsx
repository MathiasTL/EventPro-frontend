"use client";

import { usePaymentEvidenceUrl } from "../model/use-payments";

export function PaymentEvidenceViewer({ paymentId }: { paymentId: string }) {
  const { url, isPending, isError, refetch } = usePaymentEvidenceUrl(paymentId);

  if (isPending) {
    return <p className="text-sm text-zinc-500">Cargando comprobante...</p>;
  }

  if (isError || !url) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-red-600">No se pudo cargar el comprobante.</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="text-sm font-medium text-zinc-900 underline dark:text-zinc-100"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800">
      {/* El backend sirve image/* o application/pdf con control de acceso. */}
      {url ? (
        <object data={url} type="image/jpeg" className="h-96 w-full bg-zinc-50 dark:bg-zinc-900">
          <iframe src={url} title="Comprobante de pago" className="h-96 w-full" />
        </object>
      ) : null}
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="block px-3 py-2 text-sm font-medium text-zinc-700 underline dark:text-zinc-300"
      >
        Abrir en pestaña nueva
      </a>
    </div>
  );
}
