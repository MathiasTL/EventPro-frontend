import { apiFetch } from "@/shared/api/client";
import type { EventStatus } from "@/entities/event/types";

export type StartEventResult = {
  event_id: string;
  status: EventStatus;
  actual_start_time: string;
};

/** POST /events/{id}/start — US-17 parcial: solo exige saldo pre-show verificado. */
export function startEvent(eventId: string): Promise<StartEventResult> {
  return apiFetch<StartEventResult>(`/events/${eventId}/start`, { method: "POST", body: {} });
}
