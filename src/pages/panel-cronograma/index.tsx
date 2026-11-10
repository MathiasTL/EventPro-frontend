import { Page, PageHeader } from "@/shared/ui";
import { ScheduleCalendar } from "@/widgets/schedule-calendar/ScheduleCalendar";

export function SchedulePage() {
  return (
    <Page>
      <PageHeader title="Cronograma" description="Agenda de eventos por día o semana, con las observaciones del cliente a la vista." />
      <ScheduleCalendar />
    </Page>
  );
}
