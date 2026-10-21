import type { InfiniteData } from "@tanstack/react-query";
import type { MessagePage, UnsentMessage } from "@/entities/message";

/** Pure transforms for the cached message thread (pages newest first; `unsent` only on the first page). */
export type ThreadData = InfiniteData<MessagePage, number | undefined>;

/**
 * Adds a `QUEUED` row after the `202`, keyed by the server `outbox_id`. The stream replaces it by that same id
 * when `message.created` arrives. If the stream was faster than the `202`, the message is already in the thread
 * and nothing is added.
 */
export function addQueuedRow(data: ThreadData, row: UnsentMessage): ThreadData {
  const first = data.pages[0];
  if (!first) return data;
  const known =
    first.unsent?.some(item => item.outbox_id === row.outbox_id) ||
    data.pages.some(page => page.items.some(item => item.outbox_id === row.outbox_id && item.author_type === row.author_type && item.delivery_status !== "FAILED"));
  if (known) return data;
  const pages = data.pages.map((page, index) => (index === 0 ? { ...page, unsent: [...(page.unsent ?? []), row] } : page));
  return { ...data, pages };
}

/**
 * After a retry is accepted: the unsent row (if any) goes back to `QUEUED`, and a failed thread message with
 * that `outbox_id` keeps its place but loses its button (the dispatcher creates a new message, 6.7 step 4).
 */
export function markRetried(data: ThreadData, outboxId: string): ThreadData {
  const pages = data.pages.map((page, index) => ({
    ...page,
    items: page.items.map(item => (item.outbox_id === outboxId ? { ...item, retryable: false } : item)),
    ...(index === 0 && page.unsent
      ? {
          unsent: page.unsent.map(row =>
            row.outbox_id === outboxId ? { ...row, delivery_status: "QUEUED" as const, failure_reason: null, retryable: false } : row,
          ),
        }
      : {}),
  }));
  return { ...data, pages };
}
