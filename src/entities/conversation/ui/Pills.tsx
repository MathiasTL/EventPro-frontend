import type { ReactNode } from "react";
import { leadStatusMeta, type BadgeTone } from "../lead-status";
import type { ConversationMode, LeadStatus } from "../types";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-ep-neutral-field text-ep-ink",
  info: "bg-ep-cobalt-field text-ep-cobalt",
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
    ? <span className="inline-flex items-center rounded-sm bg-ep-cobalt px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">Bot</span>
    : <span className="inline-flex items-center rounded-sm bg-ep-magenta px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">Humano</span>;
}

export function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="inline-flex min-w-5 items-center justify-center rounded-sm bg-ep-ink px-1.5 py-0.5 text-xs font-bold text-white tabular-nums">
      <span aria-hidden="true">{count > 99 ? "99+" : count}</span>
      <span className="sr-only">{`${count} sin leer`}</span>
    </span>
  );
}
