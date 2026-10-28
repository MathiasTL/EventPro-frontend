/** Dispara la descarga de un Blob ya en memoria, limpiando el object URL después. */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Decodifica un PDF en base64 (como lo devuelven /budgets/prepare y /manual-bookings/*) y lo descarga. */
export function downloadBase64Pdf(base64: string, filename: string): void {
  const bytes = Uint8Array.from(atob(base64), char => char.charCodeAt(0));
  triggerBlobDownload(new Blob([bytes], { type: "application/pdf" }), filename);
}
