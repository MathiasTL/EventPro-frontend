"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/shared/ui";
import type { TimelineEntry } from "../model";
import { MessageBubble, UnsentBubble } from "./MessageBubble";

type Props = {
  conversationId: number;
  ownName: string | null;
  /** Whether failed messages offer «Reintentar» (false while the composer is blocked). */
  canRetry: boolean;
  entries: TimelineEntry[];
  hasOlder: boolean;
  loadingOlder: boolean;
  olderError: boolean;
  onLoadOlder: () => void;
};

const NEAR_BOTTOM_PX = 120;
const PREVIEW_MAX = 80;

/** Last real message of the timeline (day separators and the user's pending rows are skipped). */
function lastMessageEntry(entries: TimelineEntry[]): Extract<TimelineEntry, { kind: "message" }> | null {
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const entry = entries[index];
    if (entry.kind === "message") return entry;
  }
  return null;
}

function announcementFor(entry: Extract<TimelineEntry, { kind: "message" }>): string {
  const { message } = entry;
  if (message.direction !== "INCOMING" || message.author_type !== "CLIENT") return "";
  const text = message.content.trim().replace(/\s+/g, " ");
  if (!text) return "Nuevo mensaje del cliente con un archivo adjunto";
  const preview = text.length > PREVIEW_MAX ? `${text.slice(0, PREVIEW_MAX)}…` : text;
  return `Nuevo mensaje del cliente: ${preview}`;
}

/**
 * Oldest first. Scrolling to the top loads older pages (IntersectionObserver, with a visible button as the
 * keyboard and fallback path). Prepending keeps the reading position; new messages follow the bottom only when
 * the reader was already there, except the user's own sends, which always scroll into view.
 */
export function MessageList({ conversationId, ownName, canRetry, entries, hasOlder, loadingOlder, olderError, onLoadOlder }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const topSentinel = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);
  const previous = useRef<{ oldest: string | null; newest: string | null; height: number }>({ oldest: null, newest: null, height: 0 });
  const loadOlderRef = useRef(onLoadOlder);

  // Announce only a genuinely new last message: the key seen at mount is the baseline (no replay on load),
  // prepending older pages never changes the last message, and own sends are outgoing or unsent rows.
  const lastMessage = lastMessageEntry(entries);
  const lastKey = lastMessage?.key ?? null;
  const [seenKey, setSeenKey] = useState(lastKey);
  // Entrance animation is only for messages that arrive live: entries after the newest *message* at mount
  // (unsent rows are skipped because their key changes once the send is confirmed). Initial and older pages never
  // animate. A thread with no message at mount (null baseline) animates every arrival. If the baseline message
  // ever disappears from the timeline, nothing animates rather than replaying the whole thread.
  const [baselineKey] = useState(() => lastMessageEntry(entries)?.key ?? null);
  const foundIndex = baselineKey === null ? -1 : entries.findIndex(entry => entry.key === baselineKey);
  const baselineIndex = baselineKey !== null && foundIndex === -1 ? Number.POSITIVE_INFINITY : foundIndex;
  const [announcement, setAnnouncement] = useState("");
  if (seenKey !== lastKey) {
    setSeenKey(lastKey);
    setAnnouncement(lastMessage ? announcementFor(lastMessage) : "");
  }

  useEffect(() => {
    loadOlderRef.current = onLoadOlder;
  }, [onLoadOlder]);

  const firstMessage = entries.find(entry => entry.kind !== "day");
  const oldest = firstMessage?.key ?? null;
  const newest = entries.length > 0 ? entries[entries.length - 1].key : null;
  // A new pending row at the end is the user's own send (only the composer creates them): always follow it.
  const ownSendAtEnd = entries.length > 0 && entries[entries.length - 1].kind === "unsent";

  useLayoutEffect(() => {
    const element = container.current;
    if (!element || oldest === null) return;
    const before = previous.current;
    if (before.oldest === null) element.scrollTop = element.scrollHeight;
    else if (oldest !== before.oldest) element.scrollTop += element.scrollHeight - before.height;
    else if (newest !== before.newest && (nearBottom.current || ownSendAtEnd)) element.scrollTop = element.scrollHeight;
    previous.current = { oldest, newest, height: element.scrollHeight };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `ownSendAtEnd` only matters when `newest` changes.
  }, [oldest, newest]);

  useEffect(() => {
    const target = topSentinel.current;
    const root = container.current;
    if (!target || !root || !hasOlder || loadingOlder || olderError) return;
    const observer = new IntersectionObserver(items => {
      if (items.some(item => item.isIntersecting)) loadOlderRef.current();
    }, { root, rootMargin: "120px 0px 0px 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasOlder, loadingOlder, olderError, oldest]);

  return (
    <div
      ref={container}
      onScroll={event => {
        const el = event.currentTarget;
        nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
      }}
      className="ep-scroll ep-fade-top min-h-0 flex-1 overflow-y-auto bg-ep-wash px-4 py-4 lg:px-7"
    >
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement && <span key={seenKey}>{announcement}</span>}
      </div>
      <div ref={topSentinel} aria-hidden="true" className="h-px" />
      {hasOlder && (
        <div className="mb-3 flex flex-col items-center gap-1">
          <Button variant="ghost" onClick={onLoadOlder} disabled={loadingOlder}>
            {loadingOlder ? "Cargando mensajes anteriores…" : "Cargar mensajes anteriores"}
          </Button>
          {olderError && <p role="alert" className="text-xs font-semibold text-ep-danger">No se pudieron cargar los mensajes anteriores.</p>}
        </div>
      )}
      {entries.length === 0 ? (
        <p className="py-10 text-center text-sm text-ep-mute">Todavía no hay mensajes en esta conversación.</p>
      ) : (
        <ol className="flex flex-col gap-2" aria-label="Mensajes de la conversación">
          {entries.map((entry, index) => {
            if (entry.kind === "day") {
              return (
                <li key={entry.key} className="ep-cond my-2 flex items-center gap-3 text-[0.6875rem] tracking-[0.12em] text-ep-mute before:h-px before:flex-1 before:bg-ep-line-strong after:h-px after:flex-1 after:bg-ep-line-strong">
                  {entry.label}
                </li>
              );
            }
            if (entry.kind === "unsent") return <UnsentBubble key={entry.key} row={entry.row} conversationId={conversationId} ownName={ownName} canRetry={canRetry} />;
            return <MessageBubble key={entry.key} message={entry.message} conversationId={conversationId} ownName={ownName} canRetry={canRetry} live={index > baselineIndex} />;
          })}
        </ol>
      )}
    </div>
  );
}
