"use client";

import { useQuery } from "@tanstack/react-query";

import { getPayment, getPaymentEvidenceBlob, listPayments } from "../api/payments-api";
import type { PaymentsQuery } from "@/shared/types";
import { useEffect, useMemo } from "react";

export function usePayments(query: PaymentsQuery) {
  return useQuery({
    queryKey: ["payments", query],
    queryFn: () => listPayments(query),
  });
}

export function usePayment(id: string | null) {
  return useQuery({
    queryKey: ["payments", id],
    queryFn: () => getPayment(id as string),
    enabled: id !== null,
  });
}

export function usePaymentEvidenceUrl(id: string | null) {
  const query = useQuery({
    queryKey: ["payments", id, "evidence"],
    queryFn: () => getPaymentEvidenceBlob(id as string),
    enabled: id !== null,
    staleTime: 5 * 60 * 1000,
  });

  const url = useMemo(
    () => (query.data ? URL.createObjectURL(query.data.blob) : null),
    [query.data],
  );

  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );

  return { ...query, url };
}
