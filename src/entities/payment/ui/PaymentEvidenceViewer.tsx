"use client";

import { Button } from "@/shared/ui";
import { triggerBlobDownload } from "@/shared/lib/download";
import { EVIDENCE_EXTENSION } from "../evidence-type";
import { usePaymentEvidence } from "../use-payment-evidence";

export function PaymentEvidenceViewer({ paymentId }: { paymentId: string }) {
  const { url, blob, kind, isLoading, isError, refetch } = usePaymentEvidence(paymentId);

  if (isLoading) {
    return <p className="rounded-lg border border-ep-line bg-ep-wash p-6 text-center text-sm text-ep-mute">Cargando comprobante…</p>;
  }

  if (isError || !url || !blob || !kind) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-ep-danger bg-ep-danger-field p-6 text-center">
        <p role="alert" className="text-sm text-ep-danger">No se pudo cargar el comprobante.</p>
        <Button variant="ghost" onClick={() => void refetch()}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-ep-line bg-ep-wash">
        {kind === "pdf" ? (
          <iframe src={url} title="Comprobante de pago" className="h-96 w-full" />
        ) : kind === "unknown" ? (
          <p className="p-6 text-center text-sm text-ep-mute">No se puede previsualizar este formato. Descárgalo para revisarlo.</p>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- blob: URL, next/image cannot optimize it
          <img src={url} alt="Comprobante de pago" className="mx-auto max-h-96 w-auto object-contain" />
        )}
      </div>
      <Button variant="ghost" onClick={() => triggerBlobDownload(blob, `comprobante-${paymentId}.${EVIDENCE_EXTENSION[kind]}`)}>
        Descargar comprobante
      </Button>
    </div>
  );
}
