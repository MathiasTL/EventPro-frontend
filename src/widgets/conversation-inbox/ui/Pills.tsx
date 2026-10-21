import type { ReactNode } from "react";
import type { ConversationMode, LeadStatus } from "@/entities/conversation";
import { leadStatusMeta, type BadgeTone } from "../model";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-zinc-100 text-zinc-700",
  info: "bg-violet-50 text-violet-800",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
};

function Pill({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${tones[tone]}`}>{children}</span>;
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const { label, tone } = leadStatusMeta[status];
  return <Pill tone={tone}>{label}</Pill>;
}

export function ModeChip({ mode }: { mode: ConversationMode }) {
  return mode === "BOT"
    ? <span className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-600">Bot</span>
    : <span className="inline-flex items-center rounded-md bg-violet-700 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">Humano</span>;
}

export function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-violet-700 px-1.5 py-0.5 text-xs font-semibold text-white" aria-label={`${count} sin leer`}>
      {count > 99 ? "99+" : count}
    </span>
  );
}
