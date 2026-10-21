import { ApiRequestError } from "@/shared/api/client";

export const WINDOW_CLOSED_MESSAGE = "Han pasado más de 24 h; el cliente debe escribir primero.";
const UNAVAILABLE = "La mensajería no está disponible temporalmente. Inténtalo de nuevo en unos minutos.";
const GENERIC = "No se pudo enviar el mensaje. Inténtalo de nuevo.";

/**
 * Spanish message for a failed send or retry (spec 09, 6.4, 6.7 and section 10). Never exposes server text.
 * `retry` selects the wording that only makes sense when requeuing an existing message.
 */
export function sendErrorMessage(error: unknown, { retry = false }: { retry?: boolean } = {}): string {
  if (!(error instanceof ApiRequestError)) return GENERIC;
  switch (error.code) {
    case "conversation-not-taken":
      return "Toma la conversación para responder.";
    case "conversation-taken-by-other":
      return "Otro encargado atiende esta conversación. Actualizamos los datos.";
    case "invalid-outbox-state":
      return "Este mensaje ya no se puede reintentar.";
    case "service-window-closed":
      return WINDOW_CLOSED_MESSAGE;
    case "invalid-file":
      return "El archivo no es válido. Usa una imagen JPEG, PNG o WebP, o un PDF de hasta 5 MB.";
    case "validation-error":
      return "El mensaje no es válido. Revisa el texto o el archivo.";
    case "not-found":
      return retry ? "El mensaje ya no está disponible para reintentar." : "La conversación ya no existe.";
    case "messaging-gateway-unavailable":
      return UNAVAILABLE;
    case "network-error":
      // The request may have reached the server (there is no idempotency key), so the send is unconfirmed.
      return retry ? error.message : "No se pudo confirmar el envío. Revisa el hilo antes de volver a enviarlo.";
  }
  if (error.status === 503) return UNAVAILABLE;
  if (error.status === 403) return "No tienes permiso para esta acción.";
  return GENERIC;
}

/** Errors that mean the cached assignment or window is stale: refetch the conversation. */
/** The server may have queued the message even though the response never arrived. */
export const isNetworkError = (error: unknown) => error instanceof ApiRequestError && error.code === "network-error";

/** The outbox row changed state under us (already sent or retried): the thread must be reloaded. */
export const isInvalidOutboxState = (error: unknown) => error instanceof ApiRequestError && error.code === "invalid-outbox-state";

export function isStaleConversationError(error: unknown): boolean {
  if (!(error instanceof ApiRequestError)) return false;
  return error.status === 409 || error.code === "service-window-closed";
}
