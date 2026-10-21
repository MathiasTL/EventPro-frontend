import { apiFetch } from "@/shared/api/client";
import type { QuoteDetail, QuoteFilters, QuotePage } from "./types";

export function listQuotes(filters: QuoteFilters): Promise<QuotePage> {
  const params = new URLSearchParams();
  for (const [name, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") params.set(name, String(value));
  }
  return apiFetch<QuotePage>(`/quotes?${params.toString()}`);
}

export function getQuote(id: string): Promise<QuoteDetail> {
  return apiFetch<QuoteDetail>(`/quotes/${encodeURIComponent(id)}`);
}
