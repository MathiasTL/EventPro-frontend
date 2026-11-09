import type { Message, UnsentMessage } from "@/entities/message";
import { RetryButton } from "@/features/send-message";
import { DEFAULT_FAILURE_REASON, formatTime, isOwnAuthor } from "../model";
import { DeliveryMark } from "./DeliveryMark";
import { MessageAttachment } from "./MessageAttachment";

/** `canRetry` is false while the composer is blocked: the backend only retries for the assignee with an open window. */
type Common = { conversationId: number; ownName: string | null; canRetry: boolean };

type Look = { side: "left" | "right"; bubble: string; labelTone: string; label: string | null; onDark: boolean };

const looks = {
  client: { side: "left", bubble: "bg-ep-pass text-ep-ink border border-ep-line", labelTone: "text-ep-body", onDark: false },
  bot: { side: "right", bubble: "bg-ep-cobalt-field text-ep-ink border border-ep-cobalt-line", labelTone: "text-ep-cobalt", onDark: false },
  other: { side: "right", bubble: "bg-ep-neutral-field text-ep-ink border border-ep-line-strong", labelTone: "text-ep-body", onDark: false },
  own: { side: "right", bubble: "bg-ep-magenta text-white border border-ep-magenta", labelTone: "text-white", onDark: true },
} as const;

function lookFor(authorType: Message["author_type"], authorName: string | null, ownName: string | null): Look {
  if (authorType === "BOT") return { ...looks.bot, label: "Bot" };
  if (authorType === "AGENT") {
    return isOwnAuthor(authorName, ownName) ? { ...looks.own, label: null } : { ...looks.other, label: authorName ?? "Encargado" };
  }
  return { ...looks.client, label: null };
}

type BodyProps = {
  /** Plays the entrance animation (live incoming messages only). */
  live?: boolean;
  look: Look;
  time: string;
  children: React.ReactNode;
  status: React.ComponentProps<typeof DeliveryMark>["status"];
  failure: string | null;
  retry: React.ReactNode;
};

function Bubble({ look, time, children, status, failure, retry, live = false }: BodyProps) {
  const failed = status === "FAILED";
  return (
    <li className={`flex ${live ? "chat-in" : ""} ${look.side === "right" ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[85%] flex-col gap-1 sm:max-w-[34rem] ${look.side === "right" ? "items-end" : "items-start"}`}>
        <div className={`flex flex-col gap-1.5 rounded-xl px-3 py-2 text-[0.90625rem] leading-[1.45] ${look.bubble} ${failed ? "outline-2 outline-offset-1 outline-ep-danger" : ""} ${look.side === "right" ? "rounded-tr-sm" : "rounded-tl-sm"}`}>
          {look.label && <span className={`ep-cond text-[0.6875rem] ${look.labelTone}`}>{look.label}</span>}
          {children}
          <span className={`flex items-center justify-end gap-1.5 text-[11px] tabular-nums ${look.onDark ? "text-white" : "text-ep-mute"}`}>
            <time>{time}</time>
            <DeliveryMark status={status} onDark={look.onDark} />
          </span>
        </div>
        {failure !== null && (
          <p className="flex flex-wrap items-center justify-end gap-2 text-xs font-semibold text-ep-danger">
            <span>{failure}</span>
            {retry}
          </p>
        )}
      </div>
    </li>
  );
}

export function MessageBubble({ message, conversationId, ownName, canRetry, live = false }: Common & { message: Message; live?: boolean }) {
  if (message.direction === "ACTIVITY") {
    return (
      <li className="flex justify-center">
        <p className="flex items-center gap-1.5 rounded-full border border-ep-line-strong bg-ep-pass px-3 py-1 text-xs font-semibold text-ep-ink">
          <span aria-hidden="true" className="h-[9px] w-[9px] shrink-0 rounded-[2px] border-[1.5px] border-ep-magenta bg-ep-magenta" />
          {message.content}
        </p>
      </li>
    );
  }
  const incoming = message.direction === "INCOMING" || message.author_type === "CLIENT";
  const look = incoming ? lookFor("CLIENT", null, ownName) : lookFor(message.author_type, message.author_name, ownName);
  const failed = message.delivery_status === "FAILED";
  return (
    <Bubble
      live={live && (incoming || message.author_type === "BOT")}
      look={look}
      time={formatTime(message.created_at)}
      status={incoming ? null : message.delivery_status}
      failure={failed ? `No se envió: ${message.failure_reason ?? DEFAULT_FAILURE_REASON}` : null}
      retry={canRetry && failed && message.retryable && message.outbox_id ? <RetryButton conversationId={conversationId} outboxId={message.outbox_id} /> : null}
    >
      {message.attachments.map(attachment => (
        <MessageAttachment key={attachment.id} conversationId={conversationId} attachment={attachment} />
      ))}
      {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
    </Bubble>
  );
}

/** Outbox row that has not reached the thread yet: pending («Enviando») or failed with «Reintentar». */
export function UnsentBubble({ row, conversationId, ownName, canRetry }: Common & { row: UnsentMessage }) {
  const look = lookFor(row.author_type, row.author_name, ownName);
  const failed = row.delivery_status === "FAILED";
  return (
    <Bubble
      look={look}
      time={formatTime(row.created_at)}
      status={failed ? "FAILED" : "QUEUED"}
      failure={failed ? `No se envió: ${row.failure_reason ?? DEFAULT_FAILURE_REASON}` : null}
      retry={canRetry && failed && row.retryable ? <RetryButton conversationId={conversationId} outboxId={row.outbox_id} /> : null}
    >
      {row.message_type === "DOCUMENT" && <p className="text-xs font-semibold opacity-80">Documento adjunto</p>}
      {row.content && <p className="whitespace-pre-wrap break-words">{row.content}</p>}
    </Bubble>
  );
}
