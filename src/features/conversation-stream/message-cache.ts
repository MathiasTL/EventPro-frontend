import type { InfiniteData } from "@tanstack/react-query";
import type { Message, MessagePage, UnsentMessage } from "@/entities/message";
import type { MessageUpdatedData, StreamMessage } from "./types";

/** Pure cache transforms for a message thread (pages are newest first, `unsent` only on the first page). */

export type ThreadData = InfiniteData<MessagePage, number | undefined>;

export type ThreadPatchResult = {
  data: ThreadData;
  /** The cache could not be updated with certainty: the caller must refetch the thread. */
  needsRefetch: boolean;
};

const sameId = (a: Message["id"], b: Message["id"]) => String(a) === String(b);

function findMessage(data: ThreadData, id: Message["id"]): boolean {
  return data.pages.some(page => page.items.some(item => sameId(item.id, id)));
}

function mapPages(data: ThreadData, fn: (page: MessagePage, index: number) => MessagePage): ThreadData {
  return { ...data, pages: data.pages.map(fn) };
}

function findUnsent(data: ThreadData, outboxId: string | null): UnsentMessage | undefined {
  if (!outboxId) return undefined;
  return data.pages[0]?.unsent?.find(row => row.outbox_id === outboxId);
}

/**
 * `message.created`: upserts by id; an existing message keeps its cached delivery fields. A new message goes to the top of the first page and replaces the
 * unsent row with the same `outbox_id`. The event carries no `author_name`: it is taken from the unsent
 * row when there is one, otherwise an `AGENT` message asks for a refetch.
 */
export function insertMessage(data: ThreadData, message: StreamMessage): ThreadPatchResult {
  if (data.pages.length === 0) return { data, needsRefetch: true };

  if (findMessage(data, message.id)) {
    const merged = mapPages(data, page => ({
      ...page,
      items: page.items.map(item =>
        sameId(item.id, message.id)
          ? {
              ...item,
              ...message,
              author_name: message.author_name ?? item.author_name,
              // Keep the delivery state already cached: a late `message.created` (always SENT for outgoing) must not regress it.
              delivery_status: item.delivery_status,
              failure_reason: item.failure_reason,
              failure_code: item.failure_code,
              retryable: item.retryable,
            }
          : item,
      ),
    }));
    return { data: merged, needsRefetch: false };
  }

  const unsent = findUnsent(data, message.outbox_id);
  const authorName = message.author_name ?? unsent?.author_name ?? null;
  const entry: Message = { ...message, author_name: authorName };

  const next = mapPages(data, (page, index) => {
    if (index !== 0) return page;
    const remainingUnsent = page.unsent?.filter(row => row.outbox_id !== message.outbox_id);
    return {
      ...page,
      items: [entry, ...page.items],
      ...(page.unsent ? { unsent: remainingUnsent } : {}),
    };
  });
  return { data: next, needsRefetch: entry.author_type === "AGENT" && authorName === null };
}

/**
 * `message.updated`: patches the delivery fields of the message with that id. When the message is not
 * loaded, a `FAILED` update is applied to the unsent row with the same `outbox_id`; anything else
 * asks for a refetch.
 */
export function patchMessageDelivery(data: ThreadData, update: MessageUpdatedData["message"]): ThreadPatchResult {
  if (findMessage(data, update.id)) {
    const patched = mapPages(data, page => ({
      ...page,
      items: page.items.map(item =>
        sameId(item.id, update.id)
          ? {
              ...item,
              delivery_status: update.delivery_status,
              failure_reason: update.failure_reason,
              failure_code: update.failure_code,
              retryable: update.retryable,
              outbox_id: update.outbox_id ?? item.outbox_id,
            }
          : item,
      ),
    }));
    return { data: patched, needsRefetch: false };
  }

  const unsent = findUnsent(data, update.outbox_id);
  if (unsent && update.delivery_status === "FAILED") {
    const patched = mapPages(data, (page, index) =>
      index !== 0
        ? page
        : {
            ...page,
            unsent: page.unsent?.map(row =>
              row.outbox_id === update.outbox_id
                ? { ...row, delivery_status: "FAILED" as const, failure_reason: update.failure_reason, retryable: update.retryable }
                : row,
            ),
          },
    );
    return { data: patched, needsRefetch: false };
  }
  return { data, needsRefetch: true };
}

/** Keeps only the first (newest) page; used on resync so a refetch does not reload every older page. */
export function keepFirstPage(data: ThreadData): ThreadData {
  if (data.pages.length <= 1) return data;
  return { pages: data.pages.slice(0, 1), pageParams: data.pageParams.slice(0, 1) };
}
