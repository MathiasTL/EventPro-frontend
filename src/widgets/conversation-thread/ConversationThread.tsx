"use client";

import { useMemo } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { conversationDetailOptions } from "@/entities/conversation";
import { messageThreadOptions } from "@/entities/message";
import { TakeoverButton } from "@/features/conversation-takeover";
import { MessageComposer } from "@/features/send-message";
import { ApiRequestError } from "@/shared/api/client";
import { getUser } from "@/shared/lib/auth-storage";
import { buildTimeline, composerBlock } from "./model";
import { MessageList } from "./ui/MessageList";
import { MessagesSkeleton, ThreadError, ThreadSkeleton, UnavailableBanner } from "./ui/ThreadStates";
import { ThreadHeader } from "./ui/ThreadHeader";
import { useMarkRead } from "./use-mark-read";

export type ConversationThreadProps = {
  conversationId: number;
  currentUserId: string;
  /** Role of the signed-in user (`ENCARGADO` or `SUPERADMIN`). */
  role: string | null | undefined;
  /** Display name used to style own messages; falls back to the session user and to the assignee name. */
  currentUserName?: string | null;
  /** Narrow screens: shows a back button in the header. */
  onBack?: () => void;
};

const isUnavailable = (error: unknown) =>
  error instanceof ApiRequestError && (error.status === 503 || error.code === "messaging-gateway-unavailable");

/** Remounts per conversation so the composer draft, scroll position and mark-as-read state never leak across threads. */
export function ConversationThread(props: ConversationThreadProps) {
  return <ThreadContent key={props.conversationId} {...props} />;
}

function ThreadContent({ conversationId, currentUserId, role, currentUserName, onBack }: ConversationThreadProps) {
  const detail = useQuery(conversationDetailOptions(conversationId));
  const thread = useInfiniteQuery(messageThreadOptions(conversationId));
  const conversation = detail.data;

  useMarkRead(conversationId, conversation);

  const entries = useMemo(() => buildTimeline(thread.data?.pages ?? []), [thread.data]);

  if (detail.isPending) return <ThreadSkeleton />;
  if (!conversation) {
    return (
      <ThreadError
        unavailable={isUnavailable(detail.error)}
        notFound={detail.error instanceof ApiRequestError && detail.error.status === 404}
        onRetry={() => void detail.refetch()}
        retrying={detail.isRefetching}
      />
    );
  }

  const unavailable = isUnavailable(detail.error) || isUnavailable(thread.error);
  const sessionUser = getUser();
  const assignedToMe = conversation.assigned_user_id === currentUserId;
  const ownName =
    currentUserName ?? (sessionUser?.id === currentUserId ? sessionUser.full_name : null) ?? (assignedToMe ? conversation.assigned_user_name : null);

  const block = composerBlock({ conversation, currentUserId, role, loading: thread.isPending, unavailable });

  return (
    <section aria-label={`Conversación con ${conversation.client.name || conversation.client.phone}`} className="flex h-full min-h-0 flex-col bg-white">
      <ThreadHeader conversation={conversation} currentUserId={currentUserId} role={role} onBack={onBack} />
      {unavailable && thread.data && <UnavailableBanner />}
      {thread.isPending ? (
        <MessagesSkeleton />
      ) : !thread.data ? (
        <ThreadError unavailable={isUnavailable(thread.error)} onRetry={() => void thread.refetch()} retrying={thread.isRefetching} />
      ) : (
        <MessageList
          conversationId={conversationId}
          ownName={ownName}
          entries={entries}
          hasOlder={thread.hasNextPage}
          loadingOlder={thread.isFetchingNextPage}
          olderError={thread.isFetchNextPageError}
          onLoadOlder={() => void thread.fetchNextPage()}
        />
      )}
      <MessageComposer
        conversationId={conversationId}
        authorName={ownName}
        blocked={
          block && {
            reason: block.reason,
            action: block.showTakeover ? <TakeoverButton conversation={conversation} currentUserId={currentUserId} role={role} /> : undefined,
          }
        }
      />
    </section>
  );
}
