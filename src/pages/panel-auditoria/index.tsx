import { ComingSoon } from "@/shared/ui";

export function AuditoriaPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-700">Panel de operaciones</p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Auditoría</h1>
        <p className="mt-2 text-sm text-zinc-500">Bitácora de acciones críticas del sistema.</p>
      </div>
      <ComingSoon
        title="Módulo en construcción"
        description="Aquí se mostrará la bitácora de auditoría (GET /audit-logs), de solo lectura."
      />
    </div>
  );
}
