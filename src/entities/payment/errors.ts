import { ApiRequestError } from "@/shared/api/client";

/** Spanish message for a failed verify, audit or refund call. Backend `detail` is shown only for 409/422 where it explains the cause. */
export function paymentActionErrorMessage(error: unknown): string {
  if (!(error instanceof ApiRequestError)) return "No se pudo completar la acción. Inténtalo de nuevo.";
  if (error.code === "network-error") return error.message;
  if (error.status === 404) return "El pago ya no existe. Actualiza la lista.";
  if (error.status === 403) return "No tienes permiso para esta acción.";
  if (error.status === 409) {
    if (error.code === "invalid-payment-state") return "El estado del pago cambió. Actualiza los datos y revisa si la acción sigue disponible.";
    if (error.code === "resource-in-use") return `Conflicto con otro registro: ${error.message}`;
    return error.message;
  }
  if (error.status === 422) return `Revisa los datos ingresados: ${error.message}`;
  return "No se pudo completar la acción. Inténtalo de nuevo.";
}
