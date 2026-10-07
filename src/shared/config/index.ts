export const LOGIN_URL = "/login";

/**
 * Número del chatbot de WhatsApp en formato internacional, sin «+» ni
 * espacios (ej. 51987654321). Mientras no esté definido, la landing
 * muestra el CTA de WhatsApp inerte en lugar de un enlace roto.
 */
export const WHATSAPP_NUMBER = (
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""
).replace(/\D/g, "");

const WHATSAPP_DEFAULT_MESSAGE = "Hola EventPro, quiero cotizar mi evento.";

export function buildWhatsAppUrl(
  message: string = WHATSAPP_DEFAULT_MESSAGE,
): string | null {
  if (!WHATSAPP_NUMBER) return null;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
