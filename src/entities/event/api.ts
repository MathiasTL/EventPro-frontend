import { apiFetch } from "@/shared/api/client";
import type { EventStatus, ScheduleEvent } from "./types";

export type ScheduleFilters = {
  from_date?: string;
  to_date?: string;
  status?: EventStatus;
};

/** GET /events/schedule — filtros inclusivos por fecha y estado (Slice 1 del backend). */
export function getSchedule(filters: ScheduleFilters = {}): Promise<ScheduleEvent[]> {
  const params = new URLSearchParams();
  if (filters.from_date) params.set("from_date", filters.from_date);
  if (filters.to_date) params.set("to_date", filters.to_date);
  if (filters.status) params.set("status", filters.status);
  const query = params.toString();
  return apiFetch<ScheduleEvent[]>(`/events/schedule${query ? `?${query}` : ""}`);
}
