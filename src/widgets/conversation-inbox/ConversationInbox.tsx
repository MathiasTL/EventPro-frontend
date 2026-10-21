"use client";

import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { conversationListOptions } from "@/entities/conversation";
import type { ConversationStreamStatus } from "@/features/conversation-stream";
import { ApiRequestError } from "@/shared/api/client";
import { ConversationInboxView } from "./ConversationInboxView";
import { hasActiveFilters, initialFilterState, toApiFilters, type InboxFilterState } from "./model";
import type { AssigneeOption } from "./ui/InboxToolbar";

const SEARCH_DEBOUNCE_MS = 300;

export type ConversationInboxProps = {
  /** Role of the signed-in user; the page reads it from the auth context. */
  role: string | null | undefined;
  /** Options for the SUPERADMIN assignee selector (the page loads them from `GET /users`). */
  assigneeOptions?: AssigneeOption[];
  selectedId?: number | null;
  onSelect: (conversationId: number) => void;
  /** Connection status of the stream, owned by the page. */
  streamStatus?: ConversationStreamStatus;
  /** Restarts the stream after it gave up (status `error`). */
  onStreamRetry?: () => void;
};

export function ConversationInbox({ role, assigneeOptions, selectedId, onSelect, streamStatus, onStreamRetry }: ConversationInboxProps) {
  const canPickAssignee = role === "SUPERADMIN";
  const [state, setState] = useState<InboxFilterState>(initialFilterState);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(state.search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [state.search]);

  const filters = useMemo(() => toApiFilters(state, debouncedSearch, canPickAssignee), [state, debouncedSearch, canPickAssignee]);
  const query = useInfiniteQuery({ ...conversationListOptions(filters), placeholderData: keepPreviousData });

  const conversations = useMemo(() => query.data?.pages.flatMap(page => page.items) ?? [], [query.data]);
  const error = query.isError
    ? { unavailable: query.error instanceof ApiRequestError && (query.error.status === 503 || query.error.code === "messaging-gateway-unavailable") }
    : null;

  return (
    <ConversationInboxView
      filterState={state}
      onFilterChange={patch => setState(current => ({ ...current, ...patch }))}
      onClearFilters={() => { setState(initialFilterState); setDebouncedSearch(""); }}
      assigneeOptions={canPickAssignee ? (assigneeOptions ?? []) : undefined}
      conversations={conversations}
      selectedId={selectedId}
      onSelect={onSelect}
      loading={query.isPending}
      error={error}
      onRetry={() => void query.refetch()}
      retrying={query.isRefetching}
      filtered={hasActiveFilters(filters) || state.search.trim().length > 0}
      hasNextPage={query.hasNextPage}
      loadingMore={query.isFetchingNextPage}
      onLoadMore={() => void query.fetchNextPage()}
      streamStatus={streamStatus}
      onStreamRetry={onStreamRetry}
    />
  );
}
