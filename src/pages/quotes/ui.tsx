"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAuth } from "@/entities/auth/context";
import { Badge, Page } from "@/shared/ui";
import { quoteStatusLabels, type QuoteStatus } from "@/entities/quote/types";

export function QuoteShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return null; // RequireAuth in the panel layout guarantees a session.
  if (!["ENCARGADO", "SUPERADMIN"].includes(user.role)) return (
    <Page className="space-y-4"><h1 className="ep-cond text-3xl leading-none text-ep-ink sm:text-4xl">Acceso restringido</h1>
      <p className="text-sm text-ep-body">Las cotizaciones requieren una cuenta de encargado o superadministrador.</p>
      <Link className="inline-block text-sm font-medium text-ep-ink underline underline-offset-4 hover:text-ep-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ep-magenta" href="/agenda">Ir a mi agenda</Link>
    </Page>
  );
  return <Page>{children}</Page>;
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
