import { ComingSoon } from "@/shared/ui";

export function FinanzasPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-700">Panel de operaciones</p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Finanzas</h1>
        <p className="mt-2 text-sm text-zinc-500">Dashboard de utilidad y analítica financiera.</p>
      </div>
      <ComingSoon
        title="Módulo en construcción"
        description="Aquí se mostrará el dashboard de KPIs y la utilidad neta (GET /reports/financial/pnl)."
      />
    </div>
  );
}
