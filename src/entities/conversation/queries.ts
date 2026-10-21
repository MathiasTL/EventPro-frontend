import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { getConversation, listConversations } from "./api";
import type { ConversationFilters } from "./types";

/** Cache keys; the stream feature (F2) updates the cache through these. */
export const conversationKeys = {
  all: ["conversations"] as const,
  lists: () => [...conversationKeys.all, "list"] as const,
  list: (filters: ConversationFilters) => [...conversationKeys.lists(), filters] as const,
  details: () => [...conversationKeys.all, "detail"] as const,
  detail: (id: number) => [...conversationKeys.details(), id] as const,
};

export const conversationListOptions = (filters: ConversationFilters) =>
  infiniteQueryOptions({
    queryKey: conversationKeys.list(filters),
    queryFn: ({ pageParam }) => listConversations(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: lastPage => (lastPage.page * lastPage.page_size < lastPage.total ? lastPage.page + 1 : undefined),
  });

export const conversationDetailOptions = (id: number) =>
  queryOptions({ queryKey: conversationKeys.detail(id), queryFn: () => getConversation(id) });
