"use client";

import { useCallback, useEffect, useState } from "react";
import { getSchedule } from "@/entities/event/api";
import { EventCardWithObservations } from "@/widgets/event-card-with-observations/EventCardWithObservations";
import type { ScheduleEvent } from "@/entities/event/types";
import { RegisterExtensionForm } from "@/features/register-extension/RegisterExtensionForm";
import { SettleEventButton } from "@/features/settle-event/SettleEventButton";
import { StartEventButton } from "@/features/start-event/StartEventButton";
import { Button, EmptyState, ErrorBanner } from "@/shared/ui";
import { addDays, formatLongDate, limaToday } from "@/shared/lib/date";

const START_ALLOWED = new Set(["SCHEDULED", "AWAITING_BALANCE"]);
const OPERATING_STATES = new Set(["IN_PROGRESS", "EXTENDED"]);

export function OperatorAgenda() {
  const [day, setDay] = useState(limaToday);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await getSchedule({ from_date: day, to_date: day });
      setEvents(result);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo cargar la agenda.");
    } finally {
      setLoading(false);
    }
  }, [day]);

  useEffect(() => {
    let cancelled = false;
    getSchedule({ from_date: day, to_date: day })
      .then(result => { if (!cancelled) { setEvents(result); setError(null); } })
      .catch(caught => { if (!cancelled) setError(caught instanceof Error ? caught.message : "No se pudo cargar la agenda."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [day]);

  function shiftDay(amount: number) {
    setLoading(true);
    setNotice(null);
    setDay(current => addDays(current, amount));
  }

  function goToday() {
    setLoading(true);
    setNotice(null);
    setDay(limaToday());
  }

  async function refreshAfter(message: string) {
    setNotice(message);
    await load();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white p-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => shiftDay(-1)} aria-label="Día anterior">←</Button>
          <Button variant="ghost" onClick={goToday}>Hoy</Button>
          <Button variant="ghost" onClick={() => shiftDay(1)} aria-label="Día siguiente">→</Button>
        </div>
        <p className="w-full text-center text-sm font-medium capitalize text-zinc-700 sm:w-auto sm:text-right">{formatLongDate(day)}</p>
      </div>

      {notice && <p role="status" className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
      <ErrorBanner message={error} />

      {loading ? (
        <p role="status" className="py-12 text-center text-sm text-zinc-500">Cargando tu agenda…</p>
      ) : !error && events.length === 0 ? (
        <EmptyState message="No tienes eventos asignados este día." />
      ) : !error && (
        <div className="space-y-4">
          {events.map(event => (
            <EventCardWithObservations key={event.event_id} event={event}>
              {START_ALLOWED.has(event.status) && (
                <StartEventButton eventId={event.event_id} onStarted={() => refreshAfter("Show iniciado.")} />
              )}
              {OPERATING_STATES.has(event.status) && (
                <div className="flex flex-col gap-2">
                  <RegisterExtensionForm eventId={event.event_id} onRegistered={() => refreshAfter("Extensión registrada.")} />
                  <SettleEventButton eventId={event.event_id} onSettled={() => refreshAfter("Evento liquidado.")} />
                </div>
              )}
            </EventCardWithObservations>
          ))}
        </div>
      )}
    </div>
  );
}
