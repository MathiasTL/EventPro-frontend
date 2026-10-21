import type { QueryClient, QueryKey } from "@tanstack/react-query";
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

/**
 * `setQueryData` does not stop a fetch already in flight: its response (older than the event) would overwrite
 * the patched data. Cancels such a fetch and returns whether one was cancelled, so the caller refetches afterwards.
 */
async function cancelInFlight(queryClient: QueryClient, key: QueryKey): Promise<boolean> {
  if (queryClient.isFetching({ queryKey: key, exact: true }) === 0) return false;
  await queryClient.cancelQueries({ queryKey: key, exact: true });
  return true;
}

async function patchConversation(queryClient: QueryClient, id: number, patch: ConversationPatch): Promise<void> {
  const currentUserId = getUser()?.id ?? null;

  for (const [key, cached] of queryClient.getQueriesData<ConversationListData>({ queryKey: conversationKeys.lists() })) {
    if (!cached) continue;
    const cancelled = await cancelInFlight(queryClient, key);
    const data = queryClient.getQueryData<ConversationListData>(key);
    if (!data) continue;
    const filters = (key[2] ?? {}) as ConversationFilters;
    const result = patchConversationList(data, filters, id, patch, currentUserId);
    if (result.kind === "patched") queryClient.setQueryData(key, result.data);
    if (cancelled || result.kind === "refetch") void queryClient.invalidateQueries({ queryKey: key, exact: true });
  }

  const detailKey = conversationKeys.detail(id);
  const detail = queryClient.getQueryData<Conversation>(detailKey);
  if (detail) {
    const cancelled = await cancelInFlight(queryClient, detailKey);
    const latest = queryClient.getQueryData<Conversation>(detailKey) ?? detail;
    const result = patchConversationDetail(latest, patch);
    queryClient.setQueryData(detailKey, result.data);
    if (cancelled || result.stale) void queryClient.invalidateQueries({ queryKey: detailKey, exact: true });
  }
}

async function patchThread(
  queryClient: QueryClient,
  conversationId: number,
  transform: (data: ThreadData) => { data: ThreadData; needsRefetch: boolean },
): Promise<void> {
  const key = messageKeys.thread(conversationId);
  if (!queryClient.getQueryData<ThreadData>(key)) return; // Thread never opened: the first load will fetch fresh data.
  const cancelled = await cancelInFlight(queryClient, key);
  const current = queryClient.getQueryData<ThreadData>(key);
  if (!current) return;
  const result = transform(current);
  queryClient.setQueryData(key, result.data);
  if (cancelled || result.needsRefetch) void queryClient.invalidateQueries({ queryKey: key, exact: true });
}

/** Async because in-flight fetches are cancelled first: callers must apply events one after another (see `useConversationStream`). */
export async function applyConversationEvent(queryClient: QueryClient, event: ConversationStreamEvent): Promise<void> {
  switch (event.name) {
    case "conversation.updated": {
      const { chatwoot_conversation_id: id, ...patch } = event.data;
      await patchConversation(queryClient, id, patch);
      return;
    }
    case "message.created": {
      const { chatwoot_conversation_id: id, message } = event.data;
      await patchThread(queryClient, id, data => insertMessage(data, message));
      return;
    }
    case "message.updated": {
      const { chatwoot_conversation_id: id, message } = event.data;
      await patchThread(queryClient, id, data => patchMessageDelivery(data, message));
      return;
    }
    case "handoff.requested": {
      const { chatwoot_conversation_id: id, handoff_reason, handed_off_at } = event.data;
      await patchConversation(queryClient, id, { handoff_reason, handed_off_at });
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
