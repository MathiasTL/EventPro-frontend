"use client";

import { useEffect, useRef } from "react";
import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { conversationKeys, markConversationRead, type Conversation, type ConversationPage } from "@/entities/conversation";

/**
 * Marks a human thread as read once when it opens and again when unread messages arrive while it is open
 * (spec 09, 6.8). A failed call is not retried until the unread count changes, so a failing endpoint cannot loop.
 */
export function useMarkRead(conversationId: number, conversation: Conversation | undefined) {
  const queryClient = useQueryClient();
  const attempted = useRef<{ id: number; unread: number } | null>(null);
  const mutation = useMutation({
    mutationFn: () => markConversationRead(conversationId),
    onSuccess: () => {
      attempted.current = { id: conversationId, unread: 0 };
      queryClient.setQueryData<Conversation>(conversationKeys.detail(conversationId), current =>
        current ? { ...current, unread_count: 0 } : current,
      );
      queryClient.setQueriesData<InfiniteData<ConversationPage, number>>({ queryKey: conversationKeys.lists() }, data =>
        data
          ? {
              ...data,
              pages: data.pages.map(page => ({
                ...page,
                items: page.items.map(row => (row.chatwoot_conversation_id === conversationId ? { ...row, unread_count: 0 } : row)),
              })),
            }
          : data,
      );
    },
  });
  const { mutate } = mutation;

  const human = conversation?.mode === "HUMAN";
  const unread = conversation?.unread_count ?? 0;
  useEffect(() => {
    if (!human) return;
    const last = attempted.current;
    const opening = last?.id !== conversationId;
    if (!opening && (unread === 0 || last.unread === unread)) return;
    attempted.current = { id: conversationId, unread };
    mutate();
  }, [human, unread, conversationId, mutate]);
}
