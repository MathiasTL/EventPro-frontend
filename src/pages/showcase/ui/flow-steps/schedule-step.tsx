import { CalendarDays, ChartNoAxesCombined } from "lucide-react";

export function ScheduleStep() {
  return (
    <div className="flow-artifact flow-schedule-artifact">
      <div className="flow-artifact-bar"><span>Cronograma</span><span>Operación conectada</span></div>
      <div className="flow-schedule-body">
        <div className="flow-schedule-event"><CalendarDays aria-hidden="true" /><div><span>Evento programado</span><strong>Combo Full Fiesta (Hora Loca + DJ)</strong></div></div>
        <div className="flow-schedule-finance"><ChartNoAxesCombined aria-hidden="true" /><div><span>Vista financiera</span><strong>Adelanto registrado · S/ 100.00</strong></div></div>
      </div>
      <div className="flow-artifact-foot">La información sigue disponible para el equipo.</div>
    </div>
  );
}
