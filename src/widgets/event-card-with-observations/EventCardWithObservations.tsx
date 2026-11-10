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
        <div role="note" className="rounded-lg border border-ep-signal-line bg-ep-signal-field p-3 text-ep-ink">
          <p className="text-xs font-semibold">Observaciones del cliente</p>
          <p className="mt-1 text-sm">{event.client_observations}</p>
        </div>
      )}
      {children}
    </EventCard>
  );
}
