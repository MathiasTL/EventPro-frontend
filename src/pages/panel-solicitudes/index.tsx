import { Page, PageHeader, Panel } from "@/shared/ui";
import { BudgetProcess } from "./budgets";

export function SolicitudesPage() {
  return (
    <Page>
      <PageHeader title="Solicitudes" description="Solicitud, adelanto, reserva y contrato con cálculo y disponibilidad automáticos." />
      <Panel>
        <BudgetProcess />
      </Panel>
    </Page>
  );
}
