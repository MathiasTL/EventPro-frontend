"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { applyConversationEvent, resyncConversationCache } from "./apply-event";
import { createConversationStreamConnection, type ConversationStreamConnection } from "./connection";
import type { ConversationStreamStatus, HandoffRequestedData } from "./types";

export type UseConversationStreamOptions = {
  /** Open the stream only while true (for example, once the role guard passed). */
  enabled: boolean;
  /** Called for every `handoff.requested` event, after the cache was updated. */
  onHandoffRequested?: (data: HandoffRequestedData) => void;
};

/**
 * Keeps the conversation caches in sync with the SSE stream and returns the connection status.
 *
 * Use it exactly once per tab, at page level (`pages/conversations`). Every call opens its own
 * `EventSource` with the session token, so mounting it in widgets would duplicate connections and
 * events. Widgets read the cache through the entity queries and receive the status as a prop.
 * `retry` restarts a stream that gave up (status `error`).
 */
export function useConversationStream({
  enabled,
  onHandoffRequested,
}: UseConversationStreamOptions): { status: ConversationStreamStatus; retry: () => void } {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ConversationStreamStatus>("closed");
  const handoffRef = useRef(onHandoffRequested);
  const connectionRef = useRef<ConversationStreamConnection | null>(null);

  useEffect(() => {
    handoffRef.current = onHandoffRequested;
  }, [onHandoffRequested]);

  useEffect(() => {
    if (!enabled) return;
    // Events and resyncs are applied strictly in arrival order: applying an event may await a cancellation.
    let queue: Promise<void> = Promise.resolve();
    const enqueue = (task: () => void | Promise<void>) => {
      queue = queue.then(task).catch(() => undefined);
    };
    const connection = createConversationStreamConnection({
      onStatusChange: setStatus,
      onResync: () => enqueue(() => resyncConversationCache(queryClient)),
      onEvent: event =>
        enqueue(async () => {
          await applyConversationEvent(queryClient, event);
          if (event.name === "handoff.requested") handoffRef.current?.(event.data);
        }),
    });
    connectionRef.current = connection;
    connection.start();
    return () => {
      connectionRef.current = null;
      connection.stop();
    };
  }, [enabled, queryClient]);

  const retry = useCallback(() => connectionRef.current?.retry(), []);

  return { status: enabled ? status : "closed", retry };
}
