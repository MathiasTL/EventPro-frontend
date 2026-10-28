"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { fetchPaymentEvidence } from "./api";
import { detectEvidenceKind, EVIDENCE_MIME, type EvidenceKind } from "./evidence-type";
import { paymentKeys } from "./queries";

async function loadEvidence(id: string): Promise<{ blob: Blob; kind: EvidenceKind }> {
  const raw = await fetchPaymentEvidence(id);
  const kind = await detectEvidenceKind(raw);
  // Re-wrap so the browser renders it with the real MIME instead of octet-stream.
  return { blob: new Blob([raw], { type: EVIDENCE_MIME[kind] }), kind };
}

/**
 * Loads a payment's evidence with the JWT, detects its real type and exposes it as a `blob:` URL.
 * The URL is revoked when the component unmounts or the evidence changes.
 */
export function usePaymentEvidence(paymentId: string, enabled = true) {
  const query = useQuery({
    queryKey: paymentKeys.evidence(paymentId),
    queryFn: () => loadEvidence(paymentId),
    enabled,
    staleTime: Infinity,
    gcTime: 5 * 60_000,
  });
  const evidence = query.data;
  const [created, setCreated] = useState<{ evidence: object; url: string } | null>(null);

  useEffect(() => {
    if (!evidence) return;
    const objectUrl = URL.createObjectURL(evidence.blob);
    // Object URLs are an external resource owned by this effect: create here, revoke in cleanup.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCreated({ evidence, url: objectUrl });
    return () => URL.revokeObjectURL(objectUrl);
  }, [evidence]);

  // Ignore a URL created for previous evidence (it is revoked on cleanup).
  const url = evidence && created?.evidence === evidence ? created.url : null;

  return {
    url,
    blob: evidence?.blob ?? null,
    kind: evidence?.kind ?? null,
    isLoading: query.isLoading || (!!evidence && !url),
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
