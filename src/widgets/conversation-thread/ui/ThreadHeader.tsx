import { LeadStatusBadge, ModeChip, type Conversation } from "@/entities/conversation";
import { TakeoverActions } from "@/features/conversation-takeover";
import { initials } from "@/shared/lib/format";
import { formatDateTime } from "../model";

type Props = {
  conversation: Conversation;
  currentUserId: string;
  role: string | null | undefined;
  onBack?: () => void;
};

function WindowPill({ conversation }: { conversation: Conversation }) {
  if (conversation.service_window_open) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
        Ventana de 24 h abierta{conversation.service_window_expires_at ? ` hasta ${formatDateTime(conversation.service_window_expires_at)}` : ""}
      </span>
    );
  }
  return <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">Ventana de 24 h cerrada</span>;
}

function assigneeText(conversation: Conversation, currentUserId: string): string {
  if (conversation.mode === "BOT") return "Atiende el bot";
  if (conversation.assigned_user_id === null) return "Sin asignar";
  if (conversation.assigned_user_id === currentUserId) return "Atiendes tú";
  return `Atiende ${conversation.assigned_user_name ?? "otro encargado"}`;
}

export function ThreadHeader({ conversation, currentUserId, role, onBack }: Props) {
  const { client } = conversation;
  const name = client.name || client.phone;
  return (
    <header className="border-b border-zinc-200 bg-white px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {onBack && (
            <button type="button" onClick={onBack} aria-label="Volver a la lista de conversaciones" className="-ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-700 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-violet-700 lg:hidden">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          )}
          <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-semibold text-zinc-700">{initials(name)}</span>
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-zinc-900">{name}</h2>
            <p className="truncate text-sm text-zinc-500">{client.phone}</p>
          </div>
        </div>
        <TakeoverActions conversation={conversation} currentUserId={currentUserId} role={role} />
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <ModeChip mode={conversation.mode} />
        <LeadStatusBadge status={conversation.lead_status} />
        <span className="text-xs font-medium text-zinc-600">{assigneeText(conversation, currentUserId)}</span>
        <WindowPill conversation={conversation} />
      </div>
    </header>
  );
}
