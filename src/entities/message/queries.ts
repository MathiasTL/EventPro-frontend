import { infiniteQueryOptions } from "@tanstack/react-query";
import { listMessages } from "./api";

/** Cache keys; the stream feature (F2) updates the cache through these. */
export const messageKeys = {
  all: ["messages"] as const,
  thread: (conversationId: number) => [...messageKeys.all, conversationId] as const,
  attachment: (conversationId: number, attachmentId: number) =>
    [...messageKeys.all, conversationId, "attachment", attachmentId] as const,
};

/** Pages are newest first; the `before` cursor of the next page is the id of the last (oldest) item. */
export const messageThreadOptions = (conversationId: number) =>
  infiniteQueryOptions({
    queryKey: messageKeys.thread(conversationId),
    queryFn: ({ pageParam }) => listMessages(conversationId, pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: lastPage => {
      if (!lastPage.has_more) return undefined;
      const oldest = lastPage.items[lastPage.items.length - 1]?.id;
      return typeof oldest === "number" ? oldest : undefined;
    },
  });
