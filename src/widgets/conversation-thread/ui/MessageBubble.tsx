import type { Message, UnsentMessage } from "@/entities/message";
import { RetryButton } from "@/features/send-message";
import { DEFAULT_FAILURE_REASON, formatTime, isOwnAuthor } from "../model";
import { DeliveryMark } from "./DeliveryMark";
import { MessageAttachment } from "./MessageAttachment";

/** `canRetry` is false while the composer is blocked: the backend only retries for the assignee with an open window. */
type Common = { conversationId: number; ownName: string | null; canRetry: boolean };

type Look = { side: "left" | "right"; bubble: string; label: string | null; onDark: boolean };

const looks = {
  client: { side: "left", bubble: "bg-white text-zinc-900 border border-zinc-200", onDark: false },
  bot: { side: "right", bubble: "bg-zinc-100 text-zinc-900 border border-zinc-200", onDark: false },
  other: { side: "right", bubble: "bg-violet-100 text-violet-950", onDark: false },
  own: { side: "right", bubble: "bg-violet-700 text-white", onDark: true },
} as const;

function lookFor(authorType: Message["author_type"], authorName: string | null, ownName: string | null): Look {
  if (authorType === "BOT") return { ...looks.bot, label: "Bot" };
  if (authorType === "AGENT") {
    return isOwnAuthor(authorName, ownName) ? { ...looks.own, label: null } : { ...looks.other, label: authorName ?? "Encargado" };
  }
  return { ...looks.client, label: null };
}

type BodyProps = {
  look: Look;
  time: string;
  children: React.ReactNode;
  status: React.ComponentProps<typeof DeliveryMark>["status"];
  failure: string | null;
  retry: React.ReactNode;
};

function Bubble({ look, time, children, status, failure, retry }: BodyProps) {
  const failed = status === "FAILED";
  return (
    <li className={`flex ${look.side === "right" ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[85%] flex-col gap-1 sm:max-w-[70%] ${look.side === "right" ? "items-end" : "items-start"}`}>
        <div className={`flex flex-col gap-1.5 rounded-2xl px-3 py-2 text-sm shadow-sm ${look.bubble} ${failed ? "ring-2 ring-red-400" : ""} ${look.side === "right" ? "rounded-br-md" : "rounded-bl-md"}`}>
          {look.label && <span className="text-xs font-semibold opacity-80">{look.label}</span>}
          {children}
          <span className="flex items-center justify-end gap-1.5 text-[11px] opacity-80">
            <time>{time}</time>
            {look.side === "right" && <DeliveryMark status={status} onDark={look.onDark} />}
          </span>
        </div>
        {failure !== null && (
          <p className="flex flex-wrap items-center justify-end gap-2 text-xs font-medium text-red-700">
            <span>{failure}</span>
            {retry}
          </p>
        )}
      </div>
    </li>
  );
}

export function MessageBubble({ message, conversationId, ownName, canRetry }: Common & { message: Message }) {
  if (message.direction === "ACTIVITY") {
    return (
      <li className="flex justify-center">
        <p className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">{message.content}</p>
      </li>
    );
  }
  const incoming = message.direction === "INCOMING" || message.author_type === "CLIENT";
  const look = incoming ? lookFor("CLIENT", null, ownName) : lookFor(message.author_type, message.author_name, ownName);
  const failed = message.delivery_status === "FAILED";
  return (
    <Bubble
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
