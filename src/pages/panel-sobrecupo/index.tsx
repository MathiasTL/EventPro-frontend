"use client";

import { useState } from "react";
import { OverbookedPayments } from "./payments";

export function SobrecupoPage() {
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-700">Panel de operaciones</p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Sobrecupo</h1>
        <p className="mt-2 text-sm text-zinc-500">Decisiones pendientes de aprobación manual.</p>
      </div>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
        {success && <p role="status" className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{success}</p>}
        <OverbookedPayments onSuccess={setSuccess} />
      </section>
    </div>
  );
}
