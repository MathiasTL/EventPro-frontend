import Link from "next/link";
import { isConversationClosed, leadStatusMeta, UnreadBadge, type Conversation } from "@/entities/conversation";
import { initials } from "@/shared/lib/format";
import { formatRelative, handoffReasonLabels, holderKind, type HolderKind } from "../model";

type Props = {
  conversation: Conversation;
  currentUserId: string;
  selected: boolean;
  href: string;
};

/** The vertical credential band: width encodes urgency, the rotated label names the holder (colour is never alone). */
const bands: Record<HolderKind, { width: string; colors: string; label: string }> = {
  pending: { width: "w-12", colors: "bg-ep-signal text-ep-ink", label: "Derivada" },
  bot: { width: "w-6", colors: "bg-ep-cobalt text-white", label: "Bot" },
  mine: { width: "w-9", colors: "bg-ep-magenta text-white", label: "Tú" },
  other: { width: "w-9", colors: "bg-ep-ink text-ep-pass", label: "Enc" },
  free: { width: "w-9", colors: "bg-ep-line-strong text-ep-ink", label: "Libre" },
};

/** Mark grammar: outline at rest, filled when a person holds it, struck text when closed. */
const markStyles: Record<HolderKind, string> = {
  pending: "border-ep-signal bg-ep-signal",
  bot: "border-ep-mute",
  mine: "border-ep-magenta bg-ep-magenta",
  other: "border-ep-ink bg-ep-ink",
  free: "border-ep-mute",
};

export function ConversationRow({ conversation, currentUserId, selected, href }: Props) {
  const { client, unread_count: unread } = conversation;
  const kind = holderKind(conversation, currentUserId);
  const band = bands[kind];
  const closed = isConversationClosed(conversation);
  const name = client.name || client.phone;
  const holderName = conversation.assigned_user_name ?? "otro encargado";
  const bandLabel = kind === "other" ? (conversation.assigned_user_name ? initials(conversation.assigned_user_name) : band.label) : band.label;
  return (
    <li>
      <Link
        href={href}
        scroll={false}
        prefetch={false}
        aria-current={selected ? "true" : undefined}
        className={`flex min-h-[5.75rem] w-full border-b border-ep-line text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ep-magenta ${selected ? "bg-white ring-2 ring-inset ring-ep-ink" : "bg-ep-pass hover:bg-white"}`}
      >
        <span className={`ep-cond flex shrink-0 items-center justify-center text-[0.8125rem] ${band.width} ${band.colors}`}>
          <span aria-hidden={kind === "other"} className="[writing-mode:vertical-rl] rotate-180">{bandLabel}</span>
          {kind === "other" && <span className="sr-only">Atiende {holderName}</span>}
        </span>
        <span className="grid min-w-0 flex-1 grid-cols-[1fr_auto] content-start gap-x-2.5 gap-y-0.5 py-3 pl-3.5 pr-3.5">
          <span className={`ep-cond truncate text-[1.1875rem] leading-[1.1] ${unread > 0 ? "" : "font-bold"}`}>{name}</span>
          <time dateTime={conversation.last_message_at ?? undefined} className={`pt-0.5 text-right text-xs tabular-nums ${kind === "pending" ? "font-bold text-ep-ink" : "text-ep-mute"}`}>
            {formatRelative(conversation.last_message_at)}
          </time>
          <span className={`col-span-2 truncate text-[0.8125rem] ${unread > 0 ? "font-semibold text-ep-ink" : "text-ep-body"}`}>{conversation.last_message_preview ?? "Sin mensajes"}</span>
          {kind === "pending" && (
            <span className="col-span-2 mt-0.5 text-xs font-bold text-ep-ink">
              {conversation.handoff_reason ? handoffReasonLabels[conversation.handoff_reason] : "Pide atención de una persona"}
              {conversation.handed_off_at && <span className="font-medium tabular-nums"> · {formatRelative(conversation.handed_off_at)}</span>}
            </span>
          )}
          <span className="mt-0.5 flex items-center gap-1.5 text-xs text-ep-mute">
            <span aria-hidden="true" className={`h-[9px] w-[9px] shrink-0 rounded-[2px] border-[1.5px] ${markStyles[kind]}`} />
            <span className={closed ? "line-through decoration-[1.5px]" : undefined}>{leadStatusMeta[conversation.lead_status].label}</span>
            {closed && <span className="sr-only">(cerrada)</span>}
          </span>
          <span className="mt-0.5 self-center justify-self-end"><UnreadBadge count={unread} /></span>
        </span>
      </Link>
    </li>
  );
}
