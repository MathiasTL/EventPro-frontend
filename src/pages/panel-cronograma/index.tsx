import { ScheduleCalendar } from "@/widgets/schedule-calendar/ScheduleCalendar";

export function SchedulePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-700">Panel de operaciones</p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Cronograma</h1>
        <p className="mt-2 text-sm text-zinc-500">Agenda de eventos por día o semana, con las observaciones del cliente a la vista.</p>
      </div>
      <ScheduleCalendar />
    </div>
  );
}
