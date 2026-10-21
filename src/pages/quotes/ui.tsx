"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { quoteStatusLabels, type QuoteStatus } from "@/entities/quote/types";
import { Button } from "@/shared/ui";

export function QuoteShell({ children }: { children: ReactNode }) {
  const { user, ready, logout } = useAuth();
  if (!ready) return <p role="status" className="p-8">Cargando sesión…</p>;
  if (!user) return <main className="p-8"><h1 className="text-2xl font-semibold">Inicia sesión</h1><Link className="mt-4 inline-block text-violet-700 underline" href="/login">Ir al inicio de sesión</Link></main>;
  if (!["ENCARGADO", "SUPERADMIN"].includes(user.role)) return (
    <main className="p-8"><h1 className="text-2xl font-semibold">Acceso restringido</h1>
      <p className="my-4">Las cotizaciones requieren una cuenta de encargado o superadministrador.</p>
      <Link className="text-violet-700 underline" href="/agenda">Ir a mi agenda</Link>
    </main>
  );
  return <div className="min-h-screen bg-zinc-50 text-zinc-900">
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
        <Link href="/panel/catalog" className="text-xl font-bold text-violet-700">EventPro</Link>
        <nav aria-label="Panel administrativo" className="flex gap-6 text-sm">
          <Link href="/panel/catalog" className="hover:text-violet-700">Catálogo y solicitudes</Link>
          <Link href="/panel/quotes" className="font-semibold text-violet-700" aria-current="page">Cotizaciones</Link>
        </nav>
        <div className="flex items-center gap-3 text-sm"><span>{user.full_name}</span><Button variant="ghost" onClick={logout}>Salir</Button></div>
      </div>
    </header>
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
  </div>;
}

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  const color = status === "CONVERTED" ? "bg-emerald-50 text-emerald-800" : status === "EXPIRED" || status === "CANCELLED" ? "bg-zinc-100 text-zinc-700" : "bg-violet-50 text-violet-800";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${color}`}>{quoteStatusLabels[status]}</span>;
}

export function money(amount: string) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(Number(amount));
}

export function eventDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export function instant(value: string) {
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Lima" }).format(new Date(value));
}
