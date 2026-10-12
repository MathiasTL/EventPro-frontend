import { apiFetch } from "@/shared/api/client";
import type { EventStatus } from "@/entities/event/types";

export type SettleEventResult = {
  event_id: string;
  status: EventStatus;
};

/** POST /events/{id}/settle — US-18: liquida el evento con todos los cobros cubiertos. */
export function settleEvent(eventId: string): Promise<SettleEventResult> {
  return apiFetch<SettleEventResult>(`/events/${eventId}/settle`, { method: "POST", body: {} });
}
