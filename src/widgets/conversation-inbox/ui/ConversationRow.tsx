import { LeadStatusBadge, ModeChip, UnreadBadge, type Conversation } from "@/entities/conversation";
import { initials } from "@/shared/lib/format";
import { formatRelative, handoffReasonLabels, isHandoffPending, responsibleLabel } from "../model";

type Props = {
  conversation: Conversation;
  selected: boolean;
  onSelect: (conversationId: number) => void;
};

export function ConversationRow({ conversation, selected, onSelect }: Props) {
  const { client, unread_count: unread } = conversation;
  const pending = isHandoffPending(conversation);
  const name = client.name || client.phone;
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(conversation.chatwoot_conversation_id)}
        aria-current={selected ? "true" : undefined}
        className={`flex w-full gap-3 border-l-4 px-4 py-3 text-left transition focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-violet-700 ${selected ? "border-violet-700 bg-violet-50" : "border-transparent hover:bg-zinc-50"}`}
      >
        <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-semibold text-zinc-700">{initials(name)}</span>
        <span className="min-w-0 flex-1 space-y-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className={`truncate text-sm text-zinc-900 ${unread > 0 ? "font-bold" : "font-semibold"}`}>{name}</span>
            <time dateTime={conversation.last_message_at ?? undefined} className="shrink-0 text-xs text-zinc-500">{formatRelative(conversation.last_message_at)}</time>
          </span>
          <span className="flex items-center justify-between gap-2">
            <span className={`truncate text-sm ${unread > 0 ? "text-zinc-800" : "text-zinc-500"}`}>{conversation.last_message_preview ?? "Sin mensajes"}</span>
            <UnreadBadge count={unread} />
          </span>
          {pending && (
            <span className="block rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-900">
              <strong className="font-semibold">Derivación pendiente.</strong>{" "}
              {conversation.handoff_reason ? handoffReasonLabels[conversation.handoff_reason] : "Pide atención de una persona"}
              {conversation.handed_off_at && <> · {formatRelative(conversation.handed_off_at)}</>}
            </span>
          )}
          <span className="flex flex-wrap items-center gap-1.5">
            <ModeChip mode={conversation.mode} />
            <LeadStatusBadge status={conversation.lead_status} />
            <span className="truncate text-xs text-zinc-500">{responsibleLabel(conversation)}</span>
          </span>
        </span>
      </button>
    </li>
  );
}
