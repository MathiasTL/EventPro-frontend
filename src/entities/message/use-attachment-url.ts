"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { fetchAttachmentBlob } from "./api";
import { messageKeys } from "./queries";

/**
 * Loads an attachment with the JWT and exposes it as a `blob:` URL.
 * The URL is revoked when the component unmounts or the attachment changes.
 */
export function useAttachmentUrl(conversationId: number, attachmentId: number, enabled = true) {
  const query = useQuery({
    queryKey: messageKeys.attachment(conversationId, attachmentId),
    queryFn: () => fetchAttachmentBlob(conversationId, attachmentId),
    enabled,
    staleTime: Infinity,
    gcTime: 5 * 60_000,
  });
  const blob = query.data;
  const [created, setCreated] = useState<{ blob: Blob; url: string } | null>(null);

  useEffect(() => {
    if (!blob) return;
    const objectUrl = URL.createObjectURL(blob);
    // Object URLs are an external resource owned by this effect: create here, revoke in cleanup.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCreated({ blob, url: objectUrl });
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  // Ignore a URL created for a previous blob (it is revoked on cleanup).
  const url = blob && created?.blob === blob ? created.url : null;

  return { url, isLoading: query.isLoading, isError: query.isError, error: query.error, refetch: query.refetch };
}
