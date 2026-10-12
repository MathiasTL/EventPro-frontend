import { ComingSoon } from "@/shared/ui";

export function PagosPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-700">Panel de operaciones</p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Pagos</h1>
        <p className="mt-2 text-sm text-zinc-500">Verificación, auditoría y devoluciones de cobros.</p>
      </div>
      <ComingSoon
        title="Módulo en construcción"
        description="Aquí se gestionarán los pagos registrados (verificación, auditoría y reembolsos)."
      />
    </div>
  );
}
