export type EvidenceKind = "pdf" | "jpeg" | "png" | "webp" | "unknown";

export const EVIDENCE_MIME: Record<EvidenceKind, string> = {
  pdf: "application/pdf",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  unknown: "application/octet-stream",
};

export const EVIDENCE_EXTENSION: Record<EvidenceKind, string> = {
  pdf: "pdf",
  jpeg: "jpg",
  png: "png",
  webp: "webp",
  unknown: "bin",
};

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0) =>
  signature.every((value, index) => bytes[offset + index] === value);

/** The evidence endpoint always answers `application/octet-stream`, so the real type comes from the magic bytes. */
export async function detectEvidenceKind(blob: Blob): Promise<EvidenceKind> {
  const bytes = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46])) return "pdf"; // %PDF
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "jpeg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47])) return "png";
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) return "webp"; // RIFF....WEBP
  return "unknown";
}
