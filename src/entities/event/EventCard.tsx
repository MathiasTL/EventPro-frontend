import type { ReactNode } from "react";
import { formatSoles } from "@/shared/lib/format";
import { Badge } from "@/shared/ui";
import type { EventStatus, ScheduleEvent } from "./types";

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  AWAITING_SIGNATURE: "Esperando firma",
  SCHEDULED: "Programado",
  AWAITING_BALANCE: "Esperando saldo",
  IN_PROGRESS: "En curso",
  EXTENDED: "Extendido",
  SETTLED: "Liquidado",
  CANCELLED: "Cancelado",
};

const EVENT_STATUS_TONES: Record<EventStatus, "neutral" | "success" | "warning" | "danger"> = {
  AWAITING_SIGNATURE: "neutral",
  SCHEDULED: "neutral",
  AWAITING_BALANCE: "warning",
  IN_PROGRESS: "success",
  EXTENDED: "warning",
  SETTLED: "success",
  CANCELLED: "danger",
};

export function EventCard({ event, children }: { event: ScheduleEvent; children?: ReactNode }) {
  const crossesMidnight = event.end_date !== event.event_date;
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs text-zinc-500">{event.event_code}</p>
          <h3 className="font-semibold text-zinc-900">{event.client_name}</h3>
          <p className="text-sm text-zinc-600">{event.package_name}{event.theme_name && ` · ${event.theme_name}`}</p>
        </div>
        <Badge tone={EVENT_STATUS_TONES[event.status]}>{EVENT_STATUS_LABELS[event.status]}</Badge>
      </div>
      <p className="text-sm text-zinc-600">
        {event.start_time}–{event.end_time}{crossesMidnight && " (+1 día)"} · {event.district}
      </p>
      {event.crews.length > 0 && (
        <p className="text-sm text-zinc-600">Elenco: {event.crews.map(crew => crew.leader_name).join(", ")}</p>
      )}
      <p className="text-sm font-medium text-zinc-700">Saldo pendiente: {formatSoles(event.pending_balance_to_collect)}</p>
      {children}
    </article>
  );
}
