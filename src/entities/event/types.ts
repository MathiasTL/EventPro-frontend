export type EventStatus =
  | "AWAITING_SIGNATURE"
  | "SCHEDULED"
  | "AWAITING_BALANCE"
  | "IN_PROGRESS"
  | "EXTENDED"
  | "SETTLED"
  | "CANCELLED";

export type EventCrew = {
  crew_id: string;
  leader_name: string;
};

/** Forma exacta de un ítem de GET /events/schedule (ver EventScheduleResponse en el backend). */
export type ScheduleEvent = {
  event_id: string;
  event_code: string;
  event_date: string;
  start_time: string;
  end_time: string;
  end_date: string;
  district: string;
  client_name: string;
  package_name: string;
  theme_name: string;
  crews: EventCrew[];
  client_observations: string | null;
  status: EventStatus;
  pending_balance_to_collect: number;
};
