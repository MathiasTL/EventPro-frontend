"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { conversationKeys } from "@/entities/conversation";
import { messageKeys, type UnsentMessage } from "@/entities/message";
import { retryOutboxMessage, sendAttachmentMessage, sendTextMessage, type QueuedMessage } from "./api";
import { isInvalidOutboxState, isNetworkError, isStaleConversationError } from "./errors";
import { addQueuedRow, markRetried, type ThreadData } from "./thread-cache";

export type OutgoingMessage = { kind: "text"; content: string } | { kind: "attachment"; file: File; caption?: string };

function useRefetchOnStale(conversationId: number) {
  const queryClient = useQueryClient();
  return (error: unknown) => {
    if (!isStaleConversationError(error)) return;
    void queryClient.invalidateQueries({ queryKey: conversationKeys.detail(conversationId) });
    void queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
  };
}

/**
 * Sends a text or an attachment. The `202` only means «queued»: the row stays pending in `unsent` until the
 * stream delivers `message.created` with the same `outbox_id`. `authorName` labels the pending row.
 */
export function useSendMessage(conversationId: number, authorName: string | null) {
  const queryClient = useQueryClient();
  const refetchOnStale = useRefetchOnStale(conversationId);
  return useMutation({
    mutationFn: (message: OutgoingMessage) =>
      message.kind === "text"
        ? sendTextMessage(conversationId, message.content)
        : sendAttachmentMessage(conversationId, message.file, message.caption),
    onSuccess: (queued: QueuedMessage, message) => {
      const row: UnsentMessage = {
        outbox_id: queued.outbox_id,
        author_type: "AGENT",
        author_name: authorName,
        message_type: message.kind === "text" ? "TEXT" : "DOCUMENT",
        content: message.kind === "text" ? message.content : (message.caption?.trim() || message.file.name),
        delivery_status: "QUEUED",
        failure_reason: null,
        retryable: false,
        created_at: new Date().toISOString(),
      };
      queryClient.setQueryData<ThreadData>(messageKeys.thread(conversationId), data => (data ? addQueuedRow(data, row) : data));
    },
    onError: error => {
      refetchOnStale(error);
      // The send may have been enqueued even though the response was lost: show what the server actually has.
      if (isNetworkError(error)) void queryClient.invalidateQueries({ queryKey: messageKeys.thread(conversationId) });
    },
  });
}

/** Requeues the same outbox row of a failed message (`POST .../retry`), never a new send. */
export function useRetryMessage(conversationId: number) {
  const queryClient = useQueryClient();
  const refetchOnStale = useRefetchOnStale(conversationId);
  return useMutation({
    mutationFn: (outboxId: string) => retryOutboxMessage(conversationId, outboxId),
    onSuccess: (_queued, outboxId) => {
      queryClient.setQueryData<ThreadData>(messageKeys.thread(conversationId), data => (data ? markRetried(data, outboxId) : data));
    },
    onError: error => {
      refetchOnStale(error);
      if (isInvalidOutboxState(error)) void queryClient.invalidateQueries({ queryKey: messageKeys.thread(conversationId) });
    },
  });
}
