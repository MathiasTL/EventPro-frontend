"use client";

import { useState } from "react";
import type { AuditLog } from "@/entities/audit-log/types";
import { formatLimaDateTime } from "@/shared/lib/date";
import { Modal, Table } from "@/shared/ui";

export function AuditLogTable({ logs }: { logs: AuditLog[] }) {
  const [detail, setDetail] = useState<AuditLog | null>(null);

  return (
    <div className="space-y-4">
      <Table head={["Fecha", "Usuario", "Acción", "Entidad", "Detalle"]}>
        {logs.map(log => (
          <tr key={log.id}>
            <td className="px-4 py-4 text-sm text-ep-body">{formatLimaDateTime(log.created_at)}</td>
            <td className="px-4 py-4 font-mono text-xs text-ep-mute">{log.user_id ? log.user_id.slice(0, 8) : "Sistema"}</td>
            <td className="px-4 py-4 text-sm font-medium text-ep-ink">{log.action}</td>
            <td className="px-4 py-4 text-sm text-ep-body">{log.entity_name} <span className="font-mono text-xs text-ep-mute">{log.entity_id.slice(0, 8)}</span></td>
            <td className="px-4 py-4"><button type="button" onClick={() => setDetail(log)} className="text-sm font-medium text-ep-ink underline underline-offset-4 hover:text-ep-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ep-magenta">Ver valores</button></td>
          </tr>
        ))}
      </Table>
      <Modal open={!!detail} title="Detalle del registro" onClose={() => setDetail(null)}>
        {detail && (
          <div className="space-y-4 text-sm">
            <dl className="grid grid-cols-2 gap-2 text-xs text-ep-mute">
              <dt className="font-semibold">Acción</dt><dd>{detail.action}</dd>
              <dt className="font-semibold">Entidad</dt><dd>{detail.entity_name} · {detail.entity_id}</dd>
              <dt className="font-semibold">Usuario</dt><dd>{detail.user_id ?? "Sistema"}</dd>
              <dt className="font-semibold">Fecha</dt><dd>{formatLimaDateTime(detail.created_at)}</dd>
            </dl>
            <div>
              <p className="mb-1 text-xs font-semibold text-ep-mute">Valores anteriores</p>
              <pre className="max-h-48 overflow-auto rounded-lg border border-ep-line bg-ep-wash p-3 font-mono text-xs text-ep-ink">{detail.old_values ? JSON.stringify(detail.old_values, null, 2) : "—"}</pre>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-ep-mute">Valores nuevos</p>
              <pre className="max-h-48 overflow-auto rounded-lg border border-ep-line bg-ep-wash p-3 font-mono text-xs text-ep-ink">{detail.new_values ? JSON.stringify(detail.new_values, null, 2) : "—"}</pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
