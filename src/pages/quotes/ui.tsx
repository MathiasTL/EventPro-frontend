"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAuth } from "@/entities/auth/context";
import { Badge } from "@/shared/ui";
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

const QUOTE_STATUS_TONES: Record<QuoteStatus, "progress" | "success" | "warning" | "danger"> = {
  SENT: "progress",
  PAYMENT_STARTED: "warning",
  CONVERTED: "success",
  EXPIRED: "danger",
  CANCELLED: "danger",
};

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  return <Badge tone={QUOTE_STATUS_TONES[status]}>{quoteStatusLabels[status]}</Badge>;
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
