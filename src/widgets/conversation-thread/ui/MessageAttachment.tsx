"use client";

import { useAttachmentUrl, type MessageAttachment as Attachment } from "@/entities/message";

const unavailable = <p className="rounded-lg border border-dashed border-current/30 px-3 py-2 text-xs opacity-80">Adjunto no disponible</p>;

/**
 * Loads the attachment through the authenticated proxy (`blob:` URL, never a Chatwoot URL).
 * Images get a preview that opens full size; anything else is a document link.
 */
export function MessageAttachment({ conversationId, attachment }: { conversationId: number; attachment: Attachment }) {
  const { url, isLoading, isError } = useAttachmentUrl(conversationId, attachment.id);
  const isImage = attachment.file_type === "image" || (attachment.content_type?.startsWith("image/") ?? false);

  if (isError) return unavailable;
  if (isLoading || !url) {
    return (
      <div role="status" aria-label="Cargando adjunto" className={`animate-pulse rounded-lg bg-black/10 motion-reduce:animate-none ${isImage ? "h-40 w-56" : "h-9 w-44"}`} />
    );
  }
  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" aria-label="Abrir la imagen adjunta en una pestaña nueva" className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700">
        {/* A blob: URL cannot go through next/image. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="Imagen adjunta" className="max-h-72 max-w-full rounded-lg object-contain" />
      </a>
    );
  }
  const label = attachment.content_type === "application/pdf" ? "Documento PDF" : "Documento adjunto";
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" download className="inline-flex items-center gap-2 rounded-lg border border-current/30 px-3 py-2 text-sm font-medium underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5" />
      </svg>
      {label}
    </a>
  );
}
