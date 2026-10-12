import type { ReactNode } from "react";
import { EventCard } from "@/entities/event/EventCard";
import type { ScheduleEvent } from "@/entities/event/types";

/**
 * US-16: el encargado y el elenco deben ver las observaciones del cliente
 * (bailes prohibidos, momento del gorila, etc.) sin abrir el PDF del contrato.
 */
export function EventCardWithObservations({ event, children }: { event: ScheduleEvent; children?: ReactNode }) {
  return (
    <EventCard event={event}>
      {event.client_observations && (
        <div role="note" className="rounded-lg border border-amber-300 bg-amber-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Observaciones del cliente</p>
          <p className="mt-1 text-sm text-amber-900">{event.client_observations}</p>
        </div>
      )}
      {children}
    </EventCard>
  );
}
