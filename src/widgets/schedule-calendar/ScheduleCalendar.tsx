"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getSchedule } from "@/entities/event/api";
import { EVENT_STATUS_LABELS } from "@/entities/event/EventCard";
import type { EventStatus, ScheduleEvent } from "@/entities/event/types";
import { Button, EmptyState, ErrorBanner, FilterBar, LoadingState, Select } from "@/shared/ui";
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
      <FilterBar className="!items-center">
        <div className="flex items-center gap-1 rounded-lg border border-ep-line p-1">
          {(["day", "week"] as const).map(mode => (
            <button
              key={mode}
              type="button"
              onClick={() => changeView(mode)}
              aria-current={viewMode === mode ? "true" : undefined}
              className={`min-h-11 rounded-md px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ep-magenta lg:min-h-8 ${viewMode === mode ? "bg-ep-ink text-ep-pass" : "text-ep-body hover:bg-ep-neutral-field hover:text-ep-ink"}`}
            >
              {mode === "day" ? "Día" : "Semana"}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" onClick={() => shift(-1)} aria-label="Periodo anterior" className="px-2.5">
            <ChevronLeft aria-hidden="true" size={18} strokeWidth={1.75} strokeLinecap="square" />
          </Button>
          <Button variant="ghost" onClick={goToday}>Hoy</Button>
          <Button variant="ghost" onClick={() => shift(1)} aria-label="Periodo siguiente" className="px-2.5">
            <ChevronRight aria-hidden="true" size={18} strokeWidth={1.75} strokeLinecap="square" />
          </Button>
          <p className="ml-2 text-sm font-semibold capitalize tabular-nums text-ep-ink">{rangeLabel}</p>
        </div>
        <div className="w-full sm:ml-auto sm:w-56">
          <Select
            aria-label="Filtrar por estado"
            value={statusFilter}
            onChange={event => changeStatus(event.target.value as EventStatus | "")}
          >
            <option value="">Todos los estados</option>
            {Object.entries(EVENT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </div>
      </FilterBar>

      <ErrorBanner message={error} />
      {loading ? (
        <LoadingState label="Cargando cronograma…" />
      ) : !error && events.length === 0 ? (
        <EmptyState message="No hay eventos programados en este rango." />
      ) : !error && (
        <div className="space-y-6">
          {days.filter(day => viewMode === "day" || day.items.length > 0).map(day => (
            <section key={day.date} className="space-y-3">
              <h3 className="border-b border-ep-line pb-2 text-sm font-semibold capitalize tabular-nums text-ep-ink">{formatLongDate(day.date)}</h3>
              {day.items.length === 0 ? (
                <p className="text-sm text-ep-mute">Sin eventos este día.</p>
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
