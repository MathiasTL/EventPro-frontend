import { BudgetProcess } from "./budgets";

export function SolicitudesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-700">Panel de operaciones</p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Solicitudes</h1>
        <p className="mt-2 text-sm text-zinc-500">Solicitud, adelanto, reserva y contrato con cálculo y disponibilidad automáticos.</p>
      </div>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
        <BudgetProcess />
      </section>
    </div>
  );
}
