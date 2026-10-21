export const MAX_TEXT_LENGTH = 4096;
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
/** JPEG, PNG, WebP and PDF (spec 09, D19). The server validates the content again. */
export const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

/** Returns a Spanish message when the file cannot be sent, or `null` when it can. */
export function validateAttachment(file: File): string | null {
  if (!ACCEPTED_FILE_TYPES.includes(file.type)) return "Solo se pueden enviar imágenes JPEG, PNG o WebP, o archivos PDF.";
  if (file.size > MAX_FILE_BYTES) return "El archivo no puede superar 5 MB.";
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
