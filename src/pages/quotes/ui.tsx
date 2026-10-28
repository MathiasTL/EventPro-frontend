"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAuth } from "@/entities/auth/context";
import { quoteStatusLabels, type QuoteStatus } from "@/entities/quote/types";

export function QuoteShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return null; // RequireAuth in the panel layout guarantees a session.
  if (!["ENCARGADO", "SUPERADMIN"].includes(user.role)) return (
    <main className="p-8"><h1 className="text-2xl font-semibold">Acceso restringido</h1>
      <p className="my-4">Las cotizaciones requieren una cuenta de encargado o superadministrador.</p>
      <Link className="text-violet-700 underline" href="/agenda">Ir a mi agenda</Link>
    </main>
  );
  return <div className="flex-1 bg-zinc-50 text-zinc-900">
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
