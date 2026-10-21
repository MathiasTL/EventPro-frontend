"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { conversationKeys, type Conversation } from "@/entities/conversation";
import { releaseConversation, takeoverConversation } from "./api";
import { isAssignmentConflict } from "./errors";

type Action = "takeover" | "release";

const actions: Record<Action, (conversationId: number) => Promise<Conversation>> = {
  takeover: takeoverConversation,
  release: releaseConversation,
};

/**
 * Takeover (also used for reassignment) and release share one cache policy: the response is the fresh
 * conversation row, so the detail is replaced and the lists are refetched (the row may leave or enter a filter).
 * On a 409 the detail and lists are refetched so the UI shows who holds the conversation now.
 */
export function useConversationAssignment(conversationId: number, action: Action) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => actions[action](conversationId),
    onSuccess: conversation => {
      queryClient.setQueryData(conversationKeys.detail(conversationId), conversation);
      void queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
    onError: error => {
      if (!isAssignmentConflict(error)) return;
      void queryClient.invalidateQueries({ queryKey: conversationKeys.detail(conversationId) });
      void queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}
