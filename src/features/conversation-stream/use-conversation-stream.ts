"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { applyConversationEvent, resyncConversationCache } from "./apply-event";
import { createConversationStreamConnection } from "./connection";
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
 */
export function useConversationStream({
  enabled,
  onHandoffRequested,
}: UseConversationStreamOptions): ConversationStreamStatus {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ConversationStreamStatus>("closed");
  const handoffRef = useRef(onHandoffRequested);

  useEffect(() => {
    handoffRef.current = onHandoffRequested;
  }, [onHandoffRequested]);

  useEffect(() => {
    if (!enabled) return;
    const connection = createConversationStreamConnection({
      onStatusChange: setStatus,
      onResync: () => resyncConversationCache(queryClient),
      onEvent: event => {
        applyConversationEvent(queryClient, event);
        if (event.name === "handoff.requested") handoffRef.current?.(event.data);
      },
    });
    connection.start();
    return () => connection.stop();
  }, [enabled, queryClient]);

  return enabled ? status : "closed";
}
