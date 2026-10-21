import { API_URL } from "@/shared/config/env";
import { refreshSession } from "@/shared/api/session";
import { getRefreshToken, getToken } from "@/shared/lib/auth-storage";
import { tokenSecondsLeft } from "@/shared/lib/jwt";
import {
  CONVERSATION_STREAM_EVENT_NAMES,
  type ConversationStreamEvent,
  type ConversationStreamEventName,
  type ConversationStreamStatus,
} from "./types";

/** Seconds of token life required to open a connection (spec 09, 12.4 rule 1). */
const MIN_TOKEN_LIFE_SECONDS = 120;
/** The connection is renewed this many seconds before the token expires (rule 2). */
const RENEW_BEFORE_EXPIRY_SECONDS = 60;
const BACKOFF_MIN_MS = 1_000;
const BACKOFF_MAX_MS = 30_000;

export type ConversationStreamConnectionOptions = {
  onEvent: (event: ConversationStreamEvent) => void;
  /** Called on every `open` after the first one: events may have been missed (no replay buffer). */
  onResync: () => void;
  onStatusChange: (status: ConversationStreamStatus) => void;
};

export type ConversationStreamConnection = {
  start: () => void;
  stop: () => void;
};

/** Exponential backoff from 1 s to 30 s with jitter (rule 3). */
export function backoffDelay(attempt: number, random: () => number = Math.random): number {
  const base = Math.min(BACKOFF_MAX_MS, BACKOFF_MIN_MS * 2 ** attempt);
  return Math.max(BACKOFF_MIN_MS, Math.round(base * (0.5 + random() * 0.5)));
}

function isEventName(name: string): name is ConversationStreamEventName {
  return (CONVERSATION_STREAM_EVENT_NAMES as readonly string[]).includes(name);
}

function parseEvent(name: string, raw: unknown): ConversationStreamEvent | null {
  if (!isEventName(name) || typeof raw !== "string") return null;
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return null;
    if (typeof (data as { chatwoot_conversation_id?: unknown }).chatwoot_conversation_id !== "number") return null;
    // The shape is defined by the backend contract (spec 09, section 8); only the envelope is checked.
    return { name, data } as ConversationStreamEvent;
  } catch {
    return null;
  }
}

/**
 * Owns the `EventSource` lifecycle: token checks, proactive renewal, reconnection with backoff and cleanup.
 * Plain TypeScript, not tied to React. Create one per tab (see `useConversationStream`).
 */
export function createConversationStreamConnection(
  options: ConversationStreamConnectionOptions,
): ConversationStreamConnection {
  let generation = 0;
  let source: EventSource | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let renewTimer: ReturnType<typeof setTimeout> | null = null;
  let attempt = 0;
  let hasOpened = false;
  let status: ConversationStreamStatus = "closed";

  const setStatus = (next: ConversationStreamStatus) => {
    if (status === next) return;
    status = next;
    options.onStatusChange(next);
  };

  const clearTimers = () => {
    if (retryTimer) clearTimeout(retryTimer);
    if (renewTimer) clearTimeout(renewTimer);
    retryTimer = null;
    renewTimer = null;
  };

  const closeSource = () => {
    if (!source) return;
    source.onopen = null;
    source.onerror = null;
    source.close();
    source = null;
  };

  const scheduleRetry = (gen: number) => {
    setStatus("reconnecting");
    const delay = backoffDelay(attempt);
    attempt += 1;
    retryTimer = setTimeout(() => void connect(gen, true, false), delay);
  };

  const scheduleRenewal = (gen: number, token: string) => {
    // onopen fires again on every browser auto-reconnect: drop the previous timer so none is orphaned.
    if (renewTimer) clearTimeout(renewTimer);
    const delayMs = Math.max(0, tokenSecondsLeft(token) - RENEW_BEFORE_EXPIRY_SECONDS) * 1000;
    renewTimer = setTimeout(() => {
      if (gen !== generation) return;
      closeSource();
      void connect(gen, true, true);
    }, delayMs);
  };

  const openSource = (gen: number, token: string) => {
    closeSource();
    const url = `${API_URL}/conversations/stream?access_token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    source = es;

    es.onopen = () => {
      if (gen !== generation || es !== source) return;
      attempt = 0;
      setStatus("open");
      scheduleRenewal(gen, token);
      if (hasOpened) options.onResync();
      hasOpened = true;
    };

    es.onerror = () => {
      if (gen !== generation || es !== source) return;
      if (es.readyState === EventSource.CLOSED) {
        // The HTTP status is hidden: assume the token was rejected, renew the session and reopen.
        closeSource();
        if (renewTimer) clearTimeout(renewTimer);
        scheduleRetry(gen);
      } else {
        // The browser is retrying on its own (`retry: 3000`).
        setStatus("reconnecting");
      }
    };

    for (const name of CONVERSATION_STREAM_EVENT_NAMES) {
      es.addEventListener(name, (message: Event) => {
        if (gen !== generation || es !== source) return;
        const event = parseEvent(name, (message as MessageEvent).data);
        if (event) options.onEvent(event);
      });
    }
  };

  /**
   * @param forceRefresh renew the session even when the token still has life left
   * @param quiet keep the current status while swapping connections (proactive renewal)
   */
  async function connect(gen: number, forceRefresh: boolean, quiet: boolean): Promise<void> {
    if (gen !== generation) return;
    if (!quiet) setStatus(hasOpened ? "reconnecting" : "connecting");

    let token = getToken();
    if (forceRefresh || tokenSecondsLeft(token) < MIN_TOKEN_LIFE_SECONDS) {
      try {
        token = await refreshSession();
      } catch {
        if (gen !== generation) return;
        if (!getRefreshToken()) {
          // The session cannot be renewed (cleared on 401/403): nothing to reconnect with.
          stop();
          return;
        }
        scheduleRetry(gen);
        return;
      }
    }
    if (gen !== generation) return;
    if (!token) {
      stop();
      return;
    }
    openSource(gen, token);
  }

  const onOnline = () => {
    if (status !== "reconnecting" || !retryTimer) return;
    clearTimeout(retryTimer);
    retryTimer = null;
    void connect(generation, true, false);
  };

  function start(): void {
    if (status !== "closed") return;
    generation += 1;
    attempt = 0;
    hasOpened = false;
    window.addEventListener("online", onOnline);
    void connect(generation, false, false);
  }

  function stop(): void {
    generation += 1;
    clearTimers();
    closeSource();
    window.removeEventListener("online", onOnline);
    setStatus("closed");
  }

  return { start, stop };
}
