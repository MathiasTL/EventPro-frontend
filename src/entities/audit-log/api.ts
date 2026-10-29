import { apiFetch } from "@/shared/api/client";
import type { PageResponse } from "@/shared/types/api";

export type AuditLog = {
  id: string;
  user_id: string | null;
  action: string;
  entity_name: string;
  entity_id: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  created_at: string;
};

export function listAuditLogs(params: string) {
  return apiFetch<PageResponse<AuditLog>>(`/audit-logs?${params}`);
}
