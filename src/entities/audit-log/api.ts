import { apiFetch } from "@/shared/api/client";
import type { PageResponse } from "@/shared/types/api";
import type { AuditLog } from "./types";

export type AuditLogFilters = {
  action?: string;
  entity_name?: string;
  entity_id?: string;
  user_id?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  page_size?: number;
};

/** GET /audit-logs — US-24: bitácora paginada, de solo lectura, del más reciente al más antiguo. */
export function listAuditLogs(filters: AuditLogFilters = {}): Promise<PageResponse<AuditLog>> {
  const params = new URLSearchParams();
  if (filters.action) params.set("action", filters.action);
  if (filters.entity_name) params.set("entity_name", filters.entity_name);
  if (filters.entity_id) params.set("entity_id", filters.entity_id);
  if (filters.user_id) params.set("user_id", filters.user_id);
  if (filters.from_date) params.set("from_date", filters.from_date);
  if (filters.to_date) params.set("to_date", filters.to_date);
  params.set("page", String(filters.page ?? 1));
  params.set("page_size", String(filters.page_size ?? 20));
  return apiFetch<PageResponse<AuditLog>>(`/audit-logs?${params.toString()}`);
}
