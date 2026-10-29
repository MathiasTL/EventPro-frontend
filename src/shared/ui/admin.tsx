"use client";

import type { ReactNode } from "react";
import { Button } from "@/shared/ui";

export function AdminPage({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6">
    <header><p className="text-xs font-semibold uppercase tracking-widest text-violet-700">Administración</p><h1 className="mt-2 text-3xl font-bold text-zinc-900">{title}</h1><p className="mt-2 text-sm text-zinc-600">{description}</p></header>
    {children}
  </main>;
}

export function Pagination({ page, total, pageSize, busy, onPage }: { page: number; total: number; pageSize: number; busy: boolean; onPage: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return <nav aria-label="Paginación" className="flex flex-wrap items-center justify-between gap-3 text-sm">
    <p role="status">{total} registros · Página {page} de {pages}</p><div className="flex gap-2"><Button variant="ghost" disabled={busy || page <= 1} onClick={() => onPage(page - 1)}>Anterior</Button><Button variant="ghost" disabled={busy || page >= pages} onClick={() => onPage(page + 1)}>Siguiente</Button></div>
  </nav>;
}

export function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Lima" }).format(new Date(value));
}
