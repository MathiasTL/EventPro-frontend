import { ApiRequestError } from "@/shared/api/client";

export const MESSAGING_UNAVAILABLE = "La mensajería no está disponible temporalmente. Inténtalo de nuevo en unos minutos.";

/** Spanish message for a failed takeover, release or reassignment (spec 09, section 10). Never exposes server text. */
export function assignmentErrorMessage(error: unknown): string {
  if (!(error instanceof ApiRequestError)) return "No se pudo completar la acción. Inténtalo de nuevo.";
  switch (error.code) {
    case "conversation-taken-by-other":
      return "Otro encargado ya atiende esta conversación. Actualizamos los datos para que veas quién es.";
    case "conversation-not-taken":
      return "Esta conversación aún no tiene responsable. Tómala primero.";
    case "not-found":
      return "La conversación ya no existe.";
    case "messaging-gateway-unavailable":
      return MESSAGING_UNAVAILABLE;
    case "network-error":
      return error.message;
  }
  if (error.status === 503) return MESSAGING_UNAVAILABLE;
  if (error.status === 403) return "No tienes permiso para esta acción.";
  if (error.status === 409) return "La conversación cambió mientras la atendías. Actualizamos los datos.";
  return "No se pudo completar la acción. Inténtalo de nuevo.";
}

/** A 409 means the cached assignment is stale and must be refetched. */
export const isAssignmentConflict = (error: unknown) => error instanceof ApiRequestError && error.status === 409;
