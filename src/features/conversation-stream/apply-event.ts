import type { QueryClient } from "@tanstack/react-query";
import { conversationKeys } from "@/entities/conversation";
import type { Conversation, ConversationFilters } from "@/entities/conversation";
import { messageKeys } from "@/entities/message";
import { getUser } from "@/shared/lib/auth-storage";
import {
  patchConversationDetail,
  patchConversationList,
  type ConversationListData,
} from "./conversation-cache";
import { insertMessage, keepFirstPage, patchMessageDelivery, type ThreadData } from "./message-cache";
import type { ConversationPatch, ConversationStreamEvent } from "./types";

/** Applies one stream event to the TanStack Query cache. Cache misses invalidate instead of guessing. */

function patchConversation(queryClient: QueryClient, id: number, patch: ConversationPatch): void {
  const currentUserId = getUser()?.id ?? null;

  for (const [key, data] of queryClient.getQueriesData<ConversationListData>({ queryKey: conversationKeys.lists() })) {
    if (!data) continue;
    const filters = (key[2] ?? {}) as ConversationFilters;
    const result = patchConversationList(data, filters, id, patch, currentUserId);
    if (result.kind === "patched") queryClient.setQueryData(key, result.data);
    else if (result.kind === "refetch") void queryClient.invalidateQueries({ queryKey: key, exact: true });
  }

  const detailKey = conversationKeys.detail(id);
  const detail = queryClient.getQueryData<Conversation>(detailKey);
  if (detail) {
    const result = patchConversationDetail(detail, patch);
    queryClient.setQueryData(detailKey, result.data);
    if (result.stale) void queryClient.invalidateQueries({ queryKey: detailKey, exact: true });
  }
}

function patchThread(
  queryClient: QueryClient,
  conversationId: number,
  transform: (data: ThreadData) => { data: ThreadData; needsRefetch: boolean },
): void {
  const key = messageKeys.thread(conversationId);
  const current = queryClient.getQueryData<ThreadData>(key);
  if (!current) return; // Thread never opened: the first load will fetch fresh data.
  const result = transform(current);
  queryClient.setQueryData(key, result.data);
  if (result.needsRefetch) void queryClient.invalidateQueries({ queryKey: key, exact: true });
}

export function applyConversationEvent(queryClient: QueryClient, event: ConversationStreamEvent): void {
  switch (event.name) {
    case "conversation.updated": {
      const { chatwoot_conversation_id: id, ...patch } = event.data;
      patchConversation(queryClient, id, patch);
      return;
    }
    case "message.created": {
      const { chatwoot_conversation_id: id, message } = event.data;
      patchThread(queryClient, id, data => insertMessage(data, message));
      return;
    }
    case "message.updated": {
      const { chatwoot_conversation_id: id, message } = event.data;
      patchThread(queryClient, id, data => patchMessageDelivery(data, message));
      return;
    }
    case "handoff.requested": {
      const { chatwoot_conversation_id: id, handoff_reason, handed_off_at } = event.data;
      patchConversation(queryClient, id, { handoff_reason, handed_off_at });
      return;
    }
  }
}

/**
 * There is no replay buffer, so after any reconnect everything the stream could have delivered is
 * stale: refetch the inbox lists and the conversation details, and reload only the newest page of
 * each cached thread.
 */
export function resyncConversationCache(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
  void queryClient.invalidateQueries({ queryKey: conversationKeys.details() });

  const threads = queryClient.getQueriesData<ThreadData>({
    queryKey: messageKeys.all,
    predicate: query => query.queryKey.length === 2,
  });
  for (const [key, data] of threads) {
    if (data) queryClient.setQueryData(key, keepFirstPage(data));
    void queryClient.invalidateQueries({ queryKey: key, exact: true });
  }
}
