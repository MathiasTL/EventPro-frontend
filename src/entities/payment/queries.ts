import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { getPayment, listPayments } from "./api";
import type { PaymentFilters } from "./types";

export const paymentKeys = {
  all: ["payments"] as const,
  lists: () => [...paymentKeys.all, "list"] as const,
  list: (filters: PaymentFilters) => [...paymentKeys.lists(), filters] as const,
  detail: (id: string) => [...paymentKeys.all, "detail", id] as const,
  evidence: (id: string) => [...paymentKeys.all, "evidence", id] as const,
};

export const paymentListOptions = (filters: PaymentFilters = {}) =>
  queryOptions({
    queryKey: paymentKeys.list(filters),
    queryFn: () => listPayments(filters),
    placeholderData: keepPreviousData,
  });

export const paymentDetailOptions = (id: string) =>
  queryOptions({ queryKey: paymentKeys.detail(id), queryFn: () => getPayment(id) });
