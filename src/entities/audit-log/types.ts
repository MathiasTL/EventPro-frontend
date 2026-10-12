/** Forma exacta de AuditLogReadResponse (GET /audit-logs). Solo lectura. */
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
