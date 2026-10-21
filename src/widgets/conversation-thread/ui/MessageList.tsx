"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { Button } from "@/shared/ui";
import type { TimelineEntry } from "../model";
import { MessageBubble, UnsentBubble } from "./MessageBubble";

type Props = {
  conversationId: number;
  ownName: string | null;
  entries: TimelineEntry[];
  hasOlder: boolean;
  loadingOlder: boolean;
  olderError: boolean;
  onLoadOlder: () => void;
};

const NEAR_BOTTOM_PX = 120;

/**
 * Oldest first. Scrolling to the top loads older pages (IntersectionObserver, with a visible button as the
 * keyboard and fallback path). Prepending keeps the reading position; new messages follow the bottom only when
 * the reader was already there.
 */
export function MessageList({ conversationId, ownName, entries, hasOlder, loadingOlder, olderError, onLoadOlder }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const topSentinel = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);
  const previous = useRef<{ oldest: string | null; newest: string | null; height: number }>({ oldest: null, newest: null, height: 0 });
  const loadOlderRef = useRef(onLoadOlder);

  useEffect(() => {
    loadOlderRef.current = onLoadOlder;
  }, [onLoadOlder]);

  const firstMessage = entries.find(entry => entry.kind !== "day");
  const oldest = firstMessage?.key ?? null;
  const newest = entries.length > 0 ? entries[entries.length - 1].key : null;

  useLayoutEffect(() => {
    const element = container.current;
    if (!element || oldest === null) return;
    const before = previous.current;
    if (before.oldest === null) element.scrollTop = element.scrollHeight;
    else if (oldest !== before.oldest) element.scrollTop += element.scrollHeight - before.height;
    else if (newest !== before.newest && nearBottom.current) element.scrollTop = element.scrollHeight;
    previous.current = { oldest, newest, height: element.scrollHeight };
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
      className="min-h-0 flex-1 overflow-y-auto bg-zinc-50 px-4 py-4"
    >
      <div ref={topSentinel} aria-hidden="true" className="h-px" />
      {hasOlder && (
        <div className="mb-3 flex flex-col items-center gap-1">
          <Button variant="ghost" onClick={onLoadOlder} disabled={loadingOlder}>
            {loadingOlder ? "Cargando mensajes anteriores…" : "Cargar mensajes anteriores"}
          </Button>
          {olderError && <p role="alert" className="text-xs font-medium text-red-700">No se pudieron cargar los mensajes anteriores.</p>}
        </div>
      )}
      {entries.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-500">Todavía no hay mensajes en esta conversación.</p>
      ) : (
        <ol className="flex flex-col gap-2" aria-label="Mensajes de la conversación">
          {entries.map(entry => {
            if (entry.kind === "day") {
              return (
                <li key={entry.key} className="my-2 flex justify-center">
                  <span className="rounded-full bg-zinc-200 px-3 py-0.5 text-xs font-medium text-zinc-700">{entry.label}</span>
                </li>
              );
            }
            if (entry.kind === "unsent") return <UnsentBubble key={entry.key} row={entry.row} conversationId={conversationId} ownName={ownName} />;
            return <MessageBubble key={entry.key} message={entry.message} conversationId={conversationId} ownName={ownName} />;
          })}
        </ol>
      )}
    </div>
  );
}
