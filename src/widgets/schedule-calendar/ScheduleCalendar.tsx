"use client";

import { useEffect, useMemo, useState } from "react";
import { getSchedule } from "@/entities/event/api";
import { EVENT_STATUS_LABELS } from "@/entities/event/EventCard";
import type { EventStatus, ScheduleEvent } from "@/entities/event/types";
import { Button, EmptyState, ErrorBanner, Select } from "@/shared/ui";
import { EventCardWithObservations } from "@/widgets/event-card-with-observations/EventCardWithObservations";
import { addDays, formatLongDate, formatShortDate, limaToday, startOfWeek } from "@/shared/lib/date";

type ViewMode = "day" | "week";

export function ScheduleCalendar() {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [anchorDate, setAnchorDate] = useState(limaToday);
  const [statusFilter, setStatusFilter] = useState<EventStatus | "">("");
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { fromDate, toDate } = useMemo(() => {
    if (viewMode === "day") return { fromDate: anchorDate, toDate: anchorDate };
    const monday = startOfWeek(anchorDate);
    return { fromDate: monday, toDate: addDays(monday, 6) };
  }, [viewMode, anchorDate]);

  useEffect(() => {
    let cancelled = false;
    getSchedule({ from_date: fromDate, to_date: toDate, status: statusFilter || undefined })
      .then(result => { if (!cancelled) { setEvents(result); setError(null); } })
      .catch(caught => { if (!cancelled) setError(caught instanceof Error ? caught.message : "No se pudo cargar el cronograma."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [fromDate, toDate, statusFilter]);

  function changeView(mode: ViewMode) { setLoading(true); setViewMode(mode); }
  function changeStatus(value: EventStatus | "") { setLoading(true); setStatusFilter(value); }
  function goToday() { setLoading(true); setAnchorDate(limaToday()); }
  function shift(amount: number) {
    setLoading(true);
    setAnchorDate(current => addDays(current, viewMode === "week" ? amount * 7 : amount));
  }

  const days = useMemo(() => {
    const dates: string[] = [];
    for (let cursor = fromDate; cursor <= toDate; cursor = addDays(cursor, 1)) dates.push(cursor);
    const byDate = new Map<string, ScheduleEvent[]>();
    for (const event of events) {
      const bucket = byDate.get(event.event_date) ?? [];
      bucket.push(event);
      byDate.set(event.event_date, bucket);
    }
    for (const bucket of byDate.values()) bucket.sort((a, b) => a.start_time.localeCompare(b.start_time));
    return dates.map(date => ({ date, items: byDate.get(date) ?? [] }));
  }, [fromDate, toDate, events]);

  const rangeLabel = viewMode === "day" ? formatLongDate(anchorDate) : `${formatShortDate(fromDate)} – ${formatShortDate(toDate)}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-3">
        <div className="flex items-center gap-1 rounded-lg border border-zinc-200 p-1">
          {(["day", "week"] as const).map(mode => (
            <button
              key={mode}
              type="button"
              onClick={() => changeView(mode)}
              aria-current={viewMode === mode ? "true" : undefined}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${viewMode === mode ? "bg-violet-700 text-white" : "text-zinc-600 hover:bg-zinc-100"}`}
            >
              {mode === "day" ? "Día" : "Semana"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => shift(-1)} aria-label="Periodo anterior">←</Button>
          <Button variant="ghost" onClick={goToday}>Hoy</Button>
          <Button variant="ghost" onClick={() => shift(1)} aria-label="Periodo siguiente">→</Button>
        </div>
        <p className="text-sm font-medium capitalize text-zinc-700">{rangeLabel}</p>
        <Select
          aria-label="Filtrar por estado"
          value={statusFilter}
          onChange={event => changeStatus(event.target.value as EventStatus | "")}
          className="w-auto"
        >
          <option value="">Todos los estados</option>
          {Object.entries(EVENT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
      </div>

      <ErrorBanner message={error} />
      {loading ? (
        <p role="status" className="py-12 text-center text-sm text-zinc-500">Cargando cronograma…</p>
      ) : !error && events.length === 0 ? (
        <EmptyState message="No hay eventos programados en este rango." />
      ) : !error && (
        <div className="space-y-6">
          {days.filter(day => viewMode === "day" || day.items.length > 0).map(day => (
            <section key={day.date} className="space-y-3">
              <h3 className="text-sm font-semibold capitalize text-zinc-700">{formatLongDate(day.date)}</h3>
              {day.items.length === 0 ? (
                <p className="text-sm text-zinc-400">Sin eventos este día.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {day.items.map(event => <EventCardWithObservations key={event.event_id} event={event} />)}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
