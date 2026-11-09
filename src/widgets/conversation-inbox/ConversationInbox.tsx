"use client";

import { useEffect, useMemo, useRef, useState, type Ref } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { conversationListOptions } from "@/entities/conversation";
import type { ConversationStreamStatus } from "@/features/conversation-stream";
import { ApiRequestError } from "@/shared/api/client";
import { ConversationInboxView } from "./ConversationInboxView";
import { hasActiveFilters, initialFilterState, parseFilterParams, toApiFilters, withFilterParams, type InboxFilterState } from "./model";
import type { AssigneeOption } from "./ui/InboxToolbar";

const SEARCH_DEBOUNCE_MS = 300;

export type ConversationInboxProps = {
  /** Role of the signed-in user; the page reads it from the auth context. */
  role: string | null | undefined;
  /** Options for the SUPERADMIN assignee selector (the page loads them from `GET /users`). */
  assigneeOptions?: AssigneeOption[];
  /** Id of the signed-in user; rows held by them read as «Tú». */
  currentUserId: string;
  /** Ref for the inbox title (the page returns focus to it on phones). */
  headingRef?: Ref<HTMLHeadingElement>;
  selectedId?: number | null;
  /** Builds the link for a conversation row; the page owns the selection param and keeps the other params. */
  hrefFor: (conversationId: number) => string;
  /** Connection status of the stream, owned by the page. */
  streamStatus?: ConversationStreamStatus;
  /** Restarts the stream after it gave up (status `error`). */
  onStreamRetry?: () => void;
};

export function ConversationInbox({ role, assigneeOptions, currentUserId, headingRef, selectedId, hrefFor, streamStatus, onStreamRetry }: ConversationInboxProps) {
  const canPickAssignee = role === "SUPERADMIN";
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  // Filters start from the URL (reload / shared link); afterwards local state drives the UI so typing never waits on the router.
  const [state, setState] = useState<InboxFilterState>(() => parseFilterParams(searchParams ?? new URLSearchParams(), canPickAssignee));
  const [debouncedSearch, setDebouncedSearch] = useState(state.search);
  const latestParams = useRef(searchParams);
  useEffect(() => { latestParams.current = searchParams; }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(state.search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [state.search]);

  // Mirrors the committed filters (debounced search + the rest) into the URL with `replace`, so typing adds no history entries.
  // Only filter params are rewritten; the selection param and any other param come from the latest URL.
  const { scope, assignedUserId, includeResolved } = state;
  useEffect(() => {
    const current = new URLSearchParams(latestParams.current?.toString() ?? "");
    const next = withFilterParams(current, { search: debouncedSearch, scope, assignedUserId, includeResolved }, canPickAssignee);
    if (next.toString() === current.toString()) return;
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [debouncedSearch, scope, assignedUserId, includeResolved, canPickAssignee, pathname, router]);

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
      currentUserId={currentUserId}
      headingRef={headingRef}
      selectedId={selectedId}
      hrefFor={hrefFor}
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
